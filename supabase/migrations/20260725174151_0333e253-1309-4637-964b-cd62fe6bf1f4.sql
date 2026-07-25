-- ============ ENUMS ============
CREATE TYPE public.account_kind AS ENUM ('user_wallet', 'merchant_liability', 'system_issuance', 'system_expense');
CREATE TYPE public.transaction_kind AS ENUM ('earn', 'redeem', 'adjust', 'transfer', 'expire');
CREATE TYPE public.entry_direction AS ENUM ('debit', 'credit');

-- ============ MERCHANTS ============
CREATE TABLE public.merchants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text,
  logo_url text,
  brand_color text,
  points_per_euro integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.merchants TO anon, authenticated;
GRANT ALL ON public.merchants TO service_role;

ALTER TABLE public.merchants ENABLE ROW LEVEL SECURITY;

CREATE POLICY merchants_public_read ON public.merchants
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY merchants_admin_all ON public.merchants
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_admin'));

CREATE TRIGGER merchants_set_updated_at
  BEFORE UPDATE ON public.merchants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ACCOUNTS ============
CREATE TABLE public.accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.account_kind NOT NULL,
  owner_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE CASCADE,
  label text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Uniqueness: one wallet per user; one liability per merchant; one system-issuance/expense globally.
CREATE UNIQUE INDEX accounts_user_wallet_uniq
  ON public.accounts (owner_user_id)
  WHERE kind = 'user_wallet';
CREATE UNIQUE INDEX accounts_merchant_liability_uniq
  ON public.accounts (merchant_id)
  WHERE kind = 'merchant_liability';
CREATE UNIQUE INDEX accounts_system_singleton_uniq
  ON public.accounts (kind)
  WHERE kind IN ('system_issuance', 'system_expense');

GRANT SELECT ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY accounts_select_own ON public.accounts
  FOR SELECT TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY accounts_admin_all ON public.accounts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_admin'));

-- ============ TRANSACTIONS ============
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind public.transaction_kind NOT NULL,
  actor_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE SET NULL,
  memo text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX transactions_actor_created_idx
  ON public.transactions (actor_user_id, created_at DESC);

GRANT SELECT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY transactions_select_own ON public.transactions
  FOR SELECT TO authenticated
  USING (actor_user_id = auth.uid());

CREATE POLICY transactions_admin_all ON public.transactions
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_admin'));

-- ============ LEDGER ENTRIES ============
CREATE TABLE public.ledger_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id uuid NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  direction public.entry_direction NOT NULL,
  amount_points integer NOT NULL CHECK (amount_points > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ledger_entries_account_idx ON public.ledger_entries (account_id, created_at DESC);
CREATE INDEX ledger_entries_txn_idx ON public.ledger_entries (transaction_id);

GRANT SELECT ON public.ledger_entries TO authenticated;
GRANT ALL ON public.ledger_entries TO service_role;

ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY ledger_entries_select_own ON public.ledger_entries
  FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.accounts a
    WHERE a.id = ledger_entries.account_id
      AND a.owner_user_id = auth.uid()
  ));

CREATE POLICY ledger_entries_admin_all ON public.ledger_entries
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_admin'))
  WITH CHECK (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ops_admin'));

-- ============ BALANCES VIEW ============
CREATE VIEW public.account_balances
WITH (security_invoker = true) AS
SELECT
  a.id AS account_id,
  a.kind,
  a.owner_user_id,
  a.merchant_id,
  COALESCE(SUM(CASE WHEN le.direction = 'credit' THEN le.amount_points ELSE -le.amount_points END), 0)::bigint AS balance_points
FROM public.accounts a
LEFT JOIN public.ledger_entries le ON le.account_id = a.id
GROUP BY a.id, a.kind, a.owner_user_id, a.merchant_id;

GRANT SELECT ON public.account_balances TO authenticated;

-- ============ HELPERS ============

-- Ensure the caller's wallet exists (idempotent).
CREATE OR REPLACE FUNCTION public.ensure_user_wallet(_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  wallet_id uuid;
BEGIN
  SELECT id INTO wallet_id FROM public.accounts
   WHERE kind = 'user_wallet' AND owner_user_id = _user_id;
  IF wallet_id IS NULL THEN
    INSERT INTO public.accounts (kind, owner_user_id, label)
    VALUES ('user_wallet', _user_id, 'Zoryn Wallet')
    RETURNING id INTO wallet_id;
  END IF;
  RETURN wallet_id;
END;
$$;

-- Backfill wallets for any existing profiles.
INSERT INTO public.accounts (kind, owner_user_id, label)
SELECT 'user_wallet', p.id, 'Zoryn Wallet'
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.accounts a
   WHERE a.kind = 'user_wallet' AND a.owner_user_id = p.id
);

-- Wallet auto-provision when a new profile is created.
CREATE OR REPLACE FUNCTION public.handle_new_profile_wallet()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.ensure_user_wallet(NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile_wallet();

-- Balance helper.
CREATE OR REPLACE FUNCTION public.get_wallet_balance(_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(balance_points, 0)::bigint
  FROM public.account_balances
  WHERE kind = 'user_wallet' AND owner_user_id = _user_id;
$$;

-- ============ EARN ============
CREATE OR REPLACE FUNCTION public.earn_points(
  _user_id uuid,
  _merchant_id uuid,
  _amount integer,
  _idempotency_key text,
  _memo text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_txn uuid;
  txn_id uuid;
  wallet_id uuid;
  issuance_id uuid;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  -- Idempotency short-circuit.
  IF _idempotency_key IS NOT NULL THEN
    SELECT id INTO existing_txn FROM public.transactions WHERE idempotency_key = _idempotency_key;
    IF existing_txn IS NOT NULL THEN
      RETURN existing_txn;
    END IF;
  END IF;

  wallet_id := public.ensure_user_wallet(_user_id);
  SELECT id INTO issuance_id FROM public.accounts WHERE kind = 'system_issuance';

  INSERT INTO public.transactions (kind, actor_user_id, merchant_id, memo, idempotency_key)
  VALUES ('earn', _user_id, _merchant_id, _memo, _idempotency_key)
  RETURNING id INTO txn_id;

  INSERT INTO public.ledger_entries (transaction_id, account_id, direction, amount_points)
  VALUES
    (txn_id, issuance_id, 'debit', _amount),
    (txn_id, wallet_id,  'credit', _amount);

  RETURN txn_id;
END;
$$;

-- ============ REDEEM ============
CREATE OR REPLACE FUNCTION public.redeem_points(
  _user_id uuid,
  _amount integer,
  _idempotency_key text,
  _memo text DEFAULT NULL,
  _merchant_id uuid DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_txn uuid;
  txn_id uuid;
  wallet_id uuid;
  expense_id uuid;
  current_balance bigint;
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'amount must be positive';
  END IF;

  IF _idempotency_key IS NOT NULL THEN
    SELECT id INTO existing_txn FROM public.transactions WHERE idempotency_key = _idempotency_key;
    IF existing_txn IS NOT NULL THEN
      RETURN existing_txn;
    END IF;
  END IF;

  wallet_id := public.ensure_user_wallet(_user_id);
  SELECT id INTO expense_id FROM public.accounts WHERE kind = 'system_expense';

  SELECT COALESCE(balance_points, 0) INTO current_balance
  FROM public.account_balances WHERE account_id = wallet_id;

  IF current_balance < _amount THEN
    RAISE EXCEPTION 'insufficient balance: have %, need %', current_balance, _amount USING ERRCODE = 'P0002';
  END IF;

  INSERT INTO public.transactions (kind, actor_user_id, merchant_id, memo, idempotency_key)
  VALUES ('redeem', _user_id, _merchant_id, _memo, _idempotency_key)
  RETURNING id INTO txn_id;

  INSERT INTO public.ledger_entries (transaction_id, account_id, direction, amount_points)
  VALUES
    (txn_id, wallet_id,  'debit', _amount),
    (txn_id, expense_id, 'credit', _amount);

  RETURN txn_id;
END;
$$;

-- ============ SEED SYSTEM ACCOUNTS ============
INSERT INTO public.accounts (kind, label) VALUES
  ('system_issuance', 'System · Issuance'),
  ('system_expense',  'System · Redemption')
ON CONFLICT DO NOTHING;

-- ============ SEED MERCHANTS ============
INSERT INTO public.merchants (slug, name, description, category, brand_color, points_per_euro) VALUES
  ('cafe-nord',        'Café Nord',         'Röstkaffee & Frühstück im Kiez.',              'Café',       '#8B5CF6', 150),
  ('kiez-kiosk',       'Kiez Kiosk',        'Getränke, Snacks & mehr – rund um die Uhr.',   'Kiosk',      '#22D3EE', 100),
  ('baeckerei-sonne',  'Bäckerei Sonne',    'Handwerksbrot und Feingebäck seit 1998.',      'Bäckerei',   '#F59E0B', 120),
  ('zoryn-online',     'Zoryn Online',      'Digitaler Shop mit exklusiven Rewards.',       'Online',     '#6366F1', 200),
  ('fahrradwerk-berlin','Fahrradwerk Berlin','Reparatur, Zubehör & Custom Bikes.',           'Mobilität',  '#10B981', 80)
ON CONFLICT (slug) DO NOTHING;
