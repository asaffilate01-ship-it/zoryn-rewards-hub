
CREATE TABLE public.rewards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  cost_points integer NOT NULL CHECK (cost_points > 0),
  stock integer,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX rewards_merchant_active_idx ON public.rewards(merchant_id, active);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.rewards TO authenticated;
GRANT ALL ON public.rewards TO service_role;

ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rewards_read_active" ON public.rewards FOR SELECT TO authenticated
  USING (active = true OR public.is_merchant_member(merchant_id, auth.uid()));
CREATE POLICY "rewards_owner_write" ON public.rewards FOR ALL TO authenticated
  USING (public.is_merchant_member(merchant_id, auth.uid()))
  WITH CHECK (public.is_merchant_member(merchant_id, auth.uid()));

CREATE TABLE public.reward_redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reward_id uuid NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','used','refunded','expired')),
  transaction_id uuid REFERENCES public.transactions(id),
  used_at timestamptz,
  used_by uuid REFERENCES auth.users(id),
  reward_title text NOT NULL,
  cost_points integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reward_redemptions_user_idx ON public.reward_redemptions(user_id, created_at DESC);
CREATE INDEX reward_redemptions_merchant_idx ON public.reward_redemptions(merchant_id, status);

GRANT SELECT ON public.reward_redemptions TO authenticated;
GRANT ALL ON public.reward_redemptions TO service_role;

ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rr_owner_read" ON public.reward_redemptions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_merchant_member(merchant_id, auth.uid()));

CREATE OR REPLACE FUNCTION public.redeem_reward(
  _user_id uuid,
  _reward_id uuid,
  _idempotency_key text
) RETURNS TABLE(redemption_id uuid, code text, transaction_id uuid)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  r public.rewards;
  new_code text;
  txn_id uuid;
  new_id uuid;
BEGIN
  SELECT * INTO r FROM public.rewards WHERE id = _reward_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'reward_not_found'; END IF;
  IF NOT r.active THEN RAISE EXCEPTION 'reward_inactive'; END IF;
  IF r.stock IS NOT NULL AND r.stock <= 0 THEN RAISE EXCEPTION 'reward_out_of_stock'; END IF;

  txn_id := public.redeem_points(
    _user_id := _user_id,
    _amount := r.cost_points,
    _idempotency_key := _idempotency_key,
    _memo := 'Reward: ' || r.title,
    _merchant_id := r.merchant_id
  );

  IF r.stock IS NOT NULL THEN
    UPDATE public.rewards SET stock = stock - 1, updated_at = now() WHERE id = r.id;
  END IF;

  LOOP
    new_code := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.reward_redemptions WHERE code = new_code);
  END LOOP;

  INSERT INTO public.reward_redemptions(reward_id, user_id, merchant_id, code, transaction_id, reward_title, cost_points)
  VALUES (r.id, _user_id, r.merchant_id, new_code, txn_id, r.title, r.cost_points)
  RETURNING id INTO new_id;

  INSERT INTO public.notifications(user_id, kind, title, body, data)
  VALUES (_user_id, 'reward_redeemed', 'Belohnung eingelöst: ' || r.title,
          'Zeige den Code ' || new_code || ' im Geschäft.',
          jsonb_build_object('code', new_code, 'reward_id', r.id));

  RETURN QUERY SELECT new_id, new_code, txn_id;
END $$;

REVOKE ALL ON FUNCTION public.redeem_reward(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.redeem_reward(uuid, uuid, text) FROM anon;
REVOKE ALL ON FUNCTION public.redeem_reward(uuid, uuid, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.redeem_reward(uuid, uuid, text) TO service_role;

CREATE OR REPLACE FUNCTION public.use_reward_code(
  _merchant_id uuid,
  _code text,
  _staff_user_id uuid
) RETURNS TABLE(redemption_id uuid, reward_title text, customer_user_id uuid, cost_points integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  rr public.reward_redemptions;
BEGIN
  IF NOT public.is_merchant_member(_merchant_id, _staff_user_id) THEN
    RAISE EXCEPTION 'not_a_member';
  END IF;
  SELECT * INTO rr FROM public.reward_redemptions
    WHERE code = upper(trim(_code)) AND merchant_id = _merchant_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'code_not_found'; END IF;
  IF rr.status <> 'pending' THEN RAISE EXCEPTION 'code_already_%', rr.status; END IF;

  UPDATE public.reward_redemptions
    SET status = 'used', used_at = now(), used_by = _staff_user_id
    WHERE id = rr.id;

  INSERT INTO public.notifications(user_id, kind, title, body, data)
  VALUES (rr.user_id, 'reward_used', 'Belohnung eingelöst',
          rr.reward_title || ' wurde soeben verwendet.',
          jsonb_build_object('redemption_id', rr.id));

  RETURN QUERY SELECT rr.id, rr.reward_title, rr.user_id, rr.cost_points;
END $$;

REVOKE ALL ON FUNCTION public.use_reward_code(uuid, text, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.use_reward_code(uuid, text, uuid) FROM anon;
REVOKE ALL ON FUNCTION public.use_reward_code(uuid, text, uuid) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.use_reward_code(uuid, text, uuid) TO service_role;
