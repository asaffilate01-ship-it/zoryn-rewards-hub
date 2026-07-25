
-- Merchant members
CREATE TYPE public.merchant_member_role AS ENUM ('owner','manager','staff');

CREATE TABLE public.merchant_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.merchant_member_role NOT NULL DEFAULT 'staff',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (merchant_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_members TO authenticated;
GRANT ALL ON public.merchant_members TO service_role;

ALTER TABLE public.merchant_members ENABLE ROW LEVEL SECURITY;

-- Helper (security definer to avoid recursive RLS).
CREATE OR REPLACE FUNCTION public.is_merchant_member(_user_id uuid, _merchant_id uuid, _min_role public.merchant_member_role DEFAULT 'staff')
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.merchant_members mm
    WHERE mm.user_id = _user_id
      AND mm.merchant_id = _merchant_id
      AND CASE _min_role
        WHEN 'staff'   THEN true
        WHEN 'manager' THEN mm.role IN ('manager','owner')
        WHEN 'owner'   THEN mm.role = 'owner'
      END
  );
$$;

CREATE POLICY "merchant_members_select_own" ON public.merchant_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_merchant_member(auth.uid(), merchant_id, 'owner'));

CREATE POLICY "merchant_members_owner_manage" ON public.merchant_members
  FOR ALL TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id, 'owner'))
  WITH CHECK (public.is_merchant_member(auth.uid(), merchant_id, 'owner'));

CREATE POLICY "merchant_members_admin_all" ON public.merchant_members
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'ops_admin'))
  WITH CHECK (has_role(auth.uid(),'super_admin') OR has_role(auth.uid(),'ops_admin'));

CREATE TRIGGER trg_merchant_members_updated
  BEFORE UPDATE ON public.merchant_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Owners can edit their merchant.
CREATE POLICY "merchants_owner_update" ON public.merchants
  FOR UPDATE TO authenticated
  USING (public.is_merchant_member(auth.uid(), id, 'owner'))
  WITH CHECK (public.is_merchant_member(auth.uid(), id, 'owner'));

-- Merchant staff can view transactions involving their merchant.
CREATE POLICY "transactions_merchant_select" ON public.transactions
  FOR SELECT TO authenticated
  USING (merchant_id IS NOT NULL AND public.is_merchant_member(auth.uid(), merchant_id, 'staff'));

-- Self-serve merchant creation.
CREATE OR REPLACE FUNCTION public.create_merchant_with_owner(
  _slug text, _name text, _description text, _category text, _points_per_euro integer, _brand_color text
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_id uuid;
  uid uuid := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'authentication required'; END IF;
  IF _slug IS NULL OR length(_slug) < 3 THEN RAISE EXCEPTION 'slug too short'; END IF;
  IF _name IS NULL OR length(_name) < 2 THEN RAISE EXCEPTION 'name too short'; END IF;
  IF _points_per_euro IS NULL OR _points_per_euro < 1 OR _points_per_euro > 1000 THEN
    RAISE EXCEPTION 'points_per_euro out of range';
  END IF;

  INSERT INTO public.merchants (slug, name, description, category, points_per_euro, brand_color, is_active)
  VALUES (lower(_slug), _name, _description, _category, _points_per_euro, COALESCE(_brand_color,'#7c3aed'), true)
  RETURNING id INTO new_id;

  INSERT INTO public.merchant_members (merchant_id, user_id, role) VALUES (new_id, uid, 'owner');

  INSERT INTO public.user_roles (user_id, role)
  VALUES (uid, 'merchant')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN new_id;
END; $$;

REVOKE ALL ON FUNCTION public.create_merchant_with_owner(text,text,text,text,integer,text) FROM public;
GRANT EXECUTE ON FUNCTION public.create_merchant_with_owner(text,text,text,text,integer,text) TO authenticated;

-- Membership lookup (name only, no PII beyond first name + initial).
CREATE OR REPLACE FUNCTION public.lookup_customer_by_membership(_merchant_id uuid, _membership text)
RETURNS TABLE(user_id uuid, display_name text, membership_number text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_merchant_member(auth.uid(), _merchant_id, 'staff') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
  SELECT p.id,
         trim(concat(coalesce(p.first_name,''),' ',coalesce(left(p.last_name,1),''),'.')) AS display_name,
         p.membership_number
  FROM public.profiles p
  WHERE upper(p.membership_number) = upper(_membership)
  LIMIT 1;
END; $$;

REVOKE ALL ON FUNCTION public.lookup_customer_by_membership(uuid,text) FROM public;
GRANT EXECUTE ON FUNCTION public.lookup_customer_by_membership(uuid,text) TO authenticated;

-- Staff-driven earn: requires membership of the given merchant.
CREATE OR REPLACE FUNCTION public.merchant_earn_points(
  _merchant_id uuid, _customer_user_id uuid, _amount integer, _idempotency_key text, _memo text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE txn_id uuid;
BEGIN
  IF NOT public.is_merchant_member(auth.uid(), _merchant_id, 'staff') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  txn_id := public.earn_points(_customer_user_id, _merchant_id, _amount, _idempotency_key, _memo);
  RETURN txn_id;
END; $$;

REVOKE ALL ON FUNCTION public.merchant_earn_points(uuid,uuid,integer,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.merchant_earn_points(uuid,uuid,integer,text,text) TO authenticated;

-- Staff-driven redeem.
CREATE OR REPLACE FUNCTION public.merchant_redeem_points(
  _merchant_id uuid, _customer_user_id uuid, _amount integer, _idempotency_key text, _memo text DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE txn_id uuid;
BEGIN
  IF NOT public.is_merchant_member(auth.uid(), _merchant_id, 'staff') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  txn_id := public.redeem_points(_customer_user_id, _amount, _idempotency_key, _memo, _merchant_id);
  RETURN txn_id;
END; $$;

REVOKE ALL ON FUNCTION public.merchant_redeem_points(uuid,uuid,integer,text,text) FROM public;
GRANT EXECUTE ON FUNCTION public.merchant_redeem_points(uuid,uuid,integer,text,text) TO authenticated;
