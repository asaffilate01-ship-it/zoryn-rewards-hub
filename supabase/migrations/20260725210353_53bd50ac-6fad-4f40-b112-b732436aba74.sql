-- 1. Merchant funding wallets (prepaid balance in cents, 1 point = 1 cent)
CREATE TABLE public.merchant_funding_wallets (
  merchant_id uuid PRIMARY KEY REFERENCES public.merchants(id) ON DELETE CASCADE,
  balance_cents bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.merchant_funding_wallets TO authenticated;
GRANT ALL ON public.merchant_funding_wallets TO service_role;
ALTER TABLE public.merchant_funding_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wallet_view_member" ON public.merchant_funding_wallets FOR SELECT
  TO authenticated USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.merchant_funding_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('deposit','debit_issued','credit_reversal','settlement')),
  amount_cents bigint NOT NULL,
  memo text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.merchant_funding_ledger TO authenticated;
GRANT ALL ON public.merchant_funding_ledger TO service_role;
ALTER TABLE public.merchant_funding_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "funding_ledger_view" ON public.merchant_funding_ledger FOR SELECT
  TO authenticated USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX merchant_funding_ledger_merchant_idx ON public.merchant_funding_ledger(merchant_id, created_at DESC);

-- 2. Settlement periods (one per merchant per month)
CREATE TABLE public.settlement_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  points_issued bigint NOT NULL DEFAULT 0,
  points_redeemed bigint NOT NULL DEFAULT 0,
  net_liability_cents bigint NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','paid')),
  closed_at timestamptz,
  closed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, period_start)
);
GRANT SELECT ON public.settlement_periods TO authenticated;
GRANT ALL ON public.settlement_periods TO service_role;
ALTER TABLE public.settlement_periods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settlements_view" ON public.settlement_periods FOR SELECT
  TO authenticated USING (public.is_merchant_member(auth.uid(), merchant_id) OR public.has_role(auth.uid(), 'admin'));
CREATE INDEX settlement_periods_merchant_idx ON public.settlement_periods(merchant_id, period_start DESC);

-- 3. Audit log (append-only)
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_view_admin" ON public.audit_log FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX audit_log_created_idx ON public.audit_log(created_at DESC);
CREATE INDEX audit_log_entity_idx ON public.audit_log(entity_type, entity_id);

-- Append-only guard
CREATE OR REPLACE FUNCTION public.audit_log_no_mutate()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only';
END; $$;
CREATE TRIGGER audit_log_no_update BEFORE UPDATE OR DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.audit_log_no_mutate();

-- Helper: write audit entry
CREATE OR REPLACE FUNCTION public.write_audit(_action text, _entity_type text, _entity_id uuid, _details jsonb DEFAULT '{}'::jsonb)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.audit_log (actor_user_id, action, entity_type, entity_id, details)
  VALUES (auth.uid(), _action, _entity_type, _entity_id, COALESCE(_details, '{}'::jsonb));
$$;
REVOKE ALL ON FUNCTION public.write_audit(text, text, uuid, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.write_audit(text, text, uuid, jsonb) TO service_role;

-- Auto-create funding wallet when merchant is created
CREATE OR REPLACE FUNCTION public.ensure_merchant_funding_wallet()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.merchant_funding_wallets (merchant_id) VALUES (NEW.id)
    ON CONFLICT (merchant_id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER merchants_funding_wallet AFTER INSERT ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.ensure_merchant_funding_wallet();

-- Backfill wallets for existing merchants
INSERT INTO public.merchant_funding_wallets (merchant_id)
  SELECT id FROM public.merchants ON CONFLICT DO NOTHING;

-- 4. Deposit funds RPC (owner only)
CREATE OR REPLACE FUNCTION public.merchant_deposit_funds(
  _merchant_id uuid, _amount_cents bigint, _memo text DEFAULT ''
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.merchant_members
    WHERE merchant_id = _merchant_id AND user_id = _uid AND role IN ('owner','manager'))
  THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _amount_cents <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;

  INSERT INTO public.merchant_funding_wallets (merchant_id, balance_cents)
    VALUES (_merchant_id, _amount_cents)
    ON CONFLICT (merchant_id) DO UPDATE
    SET balance_cents = merchant_funding_wallets.balance_cents + EXCLUDED.balance_cents,
        updated_at = now();

  INSERT INTO public.merchant_funding_ledger (merchant_id, kind, amount_cents, memo, created_by)
    VALUES (_merchant_id, 'deposit', _amount_cents, COALESCE(NULLIF(_memo, ''), 'Guthaben aufgeladen'), _uid)
    RETURNING id INTO _id;

  PERFORM public.write_audit('funding_deposit', 'merchant', _merchant_id,
    jsonb_build_object('amount_cents', _amount_cents));
  RETURN _id;
END; $$;
REVOKE ALL ON FUNCTION public.merchant_deposit_funds(uuid, bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merchant_deposit_funds(uuid, bigint, text) TO authenticated;

-- 5. List funding data for a merchant
CREATE OR REPLACE FUNCTION public.merchant_funding_overview(_merchant_id uuid)
RETURNS TABLE (balance_cents bigint, ledger jsonb)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT (public.is_merchant_member(_uid, _merchant_id) OR public.has_role(_uid, 'admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY SELECT
    COALESCE((SELECT w.balance_cents FROM public.merchant_funding_wallets w WHERE w.merchant_id = _merchant_id), 0),
    COALESCE((SELECT jsonb_agg(row_to_json(l) ORDER BY l.created_at DESC)
      FROM (SELECT id, kind, amount_cents, memo, created_at
            FROM public.merchant_funding_ledger
            WHERE merchant_id = _merchant_id
            ORDER BY created_at DESC LIMIT 50) l), '[]'::jsonb);
END; $$;
REVOKE ALL ON FUNCTION public.merchant_funding_overview(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.merchant_funding_overview(uuid) TO authenticated;

-- 6. Compute + upsert settlement for a given month
CREATE OR REPLACE FUNCTION public.compute_settlement(_merchant_id uuid, _period_start date)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _period_end date := (date_trunc('month', _period_start) + interval '1 month - 1 day')::date;
  _issued bigint;
  _redeemed bigint;
  _net bigint;
  _id uuid;
BEGIN
  IF NOT (public.is_merchant_member(_uid, _merchant_id) OR public.has_role(_uid, 'admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT
    COALESCE(SUM(CASE WHEN t.kind = 'earn' THEN le.amount_points ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN t.kind = 'redeem' THEN le.amount_points ELSE 0 END), 0)
  INTO _issued, _redeemed
  FROM public.transactions t
  JOIN public.ledger_entries le ON le.transaction_id = t.id
  JOIN public.accounts a ON a.id = le.account_id AND a.kind = 'user_wallet'
  WHERE t.merchant_id = _merchant_id
    AND t.created_at::date BETWEEN _period_start AND _period_end
    AND le.direction = CASE WHEN t.kind = 'earn' THEN 'credit' ELSE 'debit' END;

  _net := _issued - _redeemed;

  INSERT INTO public.settlement_periods (merchant_id, period_start, period_end, points_issued, points_redeemed, net_liability_cents)
    VALUES (_merchant_id, _period_start, _period_end, _issued, _redeemed, _net)
    ON CONFLICT (merchant_id, period_start) DO UPDATE
    SET points_issued = EXCLUDED.points_issued,
        points_redeemed = EXCLUDED.points_redeemed,
        net_liability_cents = EXCLUDED.net_liability_cents
    WHERE settlement_periods.status = 'open'
    RETURNING id INTO _id;

  IF _id IS NULL THEN
    SELECT id INTO _id FROM public.settlement_periods
      WHERE merchant_id = _merchant_id AND period_start = _period_start;
  END IF;
  RETURN _id;
END; $$;
REVOKE ALL ON FUNCTION public.compute_settlement(uuid, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.compute_settlement(uuid, date) TO authenticated;

-- 7. Close settlement (admin only)
CREATE OR REPLACE FUNCTION public.admin_close_settlement(_settlement_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(_uid, 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE public.settlement_periods
    SET status = 'closed', closed_at = now(), closed_by = _uid
    WHERE id = _settlement_id AND status = 'open';
  PERFORM public.write_audit('settlement_closed', 'settlement', _settlement_id, '{}'::jsonb);
END; $$;
REVOKE ALL ON FUNCTION public.admin_close_settlement(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_close_settlement(uuid) TO authenticated;

-- 8. List settlements for a merchant
CREATE OR REPLACE FUNCTION public.list_settlements(_merchant_id uuid)
RETURNS SETOF public.settlement_periods
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT (public.is_merchant_member(_uid, _merchant_id) OR public.has_role(_uid, 'admin')) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY SELECT * FROM public.settlement_periods
    WHERE merchant_id = _merchant_id
    ORDER BY period_start DESC LIMIT 24;
END; $$;
REVOKE ALL ON FUNCTION public.list_settlements(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_settlements(uuid) TO authenticated;

-- 9. Admin audit list
CREATE OR REPLACE FUNCTION public.admin_recent_audit(_limit int DEFAULT 100)
RETURNS SETOF public.audit_log
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT * FROM public.audit_log ORDER BY created_at DESC LIMIT LEAST(_limit, 500);
END; $$;
REVOKE ALL ON FUNCTION public.admin_recent_audit(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_recent_audit(int) TO authenticated;