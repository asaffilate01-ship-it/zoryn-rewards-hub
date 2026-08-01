-- Helper: is the caller a member of this reward tenant?
CREATE OR REPLACE FUNCTION public.reward_is_tenant_member(_tenant_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.reward_tenant_members m
    WHERE m.tenant_id = _tenant_id AND m.user_id = _user_id
  );
$$;

REVOKE EXECUTE ON FUNCTION public.reward_is_tenant_member(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reward_is_tenant_member(uuid, uuid) TO authenticated, service_role;

-- 1) Merchant onboarding progress
CREATE TABLE public.reward_onboarding_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.reward_tenants(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES public.reward_merchants(id) ON DELETE CASCADE,
  step text NOT NULL,
  status text NOT NULL DEFAULT 'not_started',
  notes text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, merchant_id, step)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reward_onboarding_progress TO authenticated;
GRANT ALL ON public.reward_onboarding_progress TO service_role;
ALTER TABLE public.reward_onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding readable by tenant members and admins"
ON public.reward_onboarding_progress FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.reward_is_tenant_member(tenant_id, auth.uid()));

CREATE POLICY "onboarding writable by tenant members and admins"
ON public.reward_onboarding_progress FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.reward_is_tenant_member(tenant_id, auth.uid()))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.reward_is_tenant_member(tenant_id, auth.uid()));

CREATE POLICY "onboarding insertable by tenant members and admins"
ON public.reward_onboarding_progress FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.reward_is_tenant_member(tenant_id, auth.uid()));

-- 2) Gift cards
CREATE TABLE public.reward_gift_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.reward_tenants(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES public.reward_merchants(id) ON DELETE SET NULL,
  code text NOT NULL UNIQUE,
  initial_value_cents bigint NOT NULL CHECK (initial_value_cents >= 0),
  remaining_value_cents bigint NOT NULL CHECK (remaining_value_cents >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  issued_to_membership_id uuid REFERENCES public.reward_memberships(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reward_gift_cards TO authenticated;
GRANT ALL ON public.reward_gift_cards TO service_role;
ALTER TABLE public.reward_gift_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gift cards readable by tenant members and admins"
ON public.reward_gift_cards FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.reward_is_tenant_member(tenant_id, auth.uid()));

-- 3) Coupons
CREATE TABLE public.reward_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.reward_tenants(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES public.reward_merchants(id) ON DELETE SET NULL,
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  max_redemptions integer,
  redemption_count integer NOT NULL DEFAULT 0,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reward_coupons TO authenticated;
GRANT ALL ON public.reward_coupons TO service_role;
ALTER TABLE public.reward_coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons readable by tenant members and admins"
ON public.reward_coupons FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.reward_is_tenant_member(tenant_id, auth.uid()));

-- 4) Subscriptions / billing plans
CREATE TABLE public.reward_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.reward_tenants(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'starter',
  price_cents bigint NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  billing_interval text NOT NULL DEFAULT 'month',
  status text NOT NULL DEFAULT 'active',
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id)
);

GRANT SELECT ON public.reward_subscriptions TO authenticated;
GRANT ALL ON public.reward_subscriptions TO service_role;
ALTER TABLE public.reward_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscriptions readable by tenant members and admins"
ON public.reward_subscriptions FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.reward_is_tenant_member(tenant_id, auth.uid()));

-- updated_at triggers
CREATE OR REPLACE FUNCTION public.reward_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER reward_onboarding_progress_updated_at
BEFORE UPDATE ON public.reward_onboarding_progress
FOR EACH ROW EXECUTE FUNCTION public.reward_touch_updated_at();

CREATE TRIGGER reward_gift_cards_updated_at
BEFORE UPDATE ON public.reward_gift_cards
FOR EACH ROW EXECUTE FUNCTION public.reward_touch_updated_at();

CREATE TRIGGER reward_coupons_updated_at
BEFORE UPDATE ON public.reward_coupons
FOR EACH ROW EXECUTE FUNCTION public.reward_touch_updated_at();

CREATE TRIGGER reward_subscriptions_updated_at
BEFORE UPDATE ON public.reward_subscriptions
FOR EACH ROW EXECUTE FUNCTION public.reward_touch_updated_at();

CREATE INDEX idx_reward_onboarding_tenant ON public.reward_onboarding_progress(tenant_id);
CREATE INDEX idx_reward_gift_cards_tenant ON public.reward_gift_cards(tenant_id);
CREATE INDEX idx_reward_coupons_tenant ON public.reward_coupons(tenant_id);