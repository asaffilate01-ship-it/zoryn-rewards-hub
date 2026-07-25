-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM (
  'consumer', 'family_admin', 'family_member', 'premium',
  'merchant_owner', 'merchant_admin', 'finance_manager', 'marketing_manager',
  'location_manager', 'cashier', 'analyst',
  'super_admin', 'ops_admin', 'support', 'merchant_support',
  'finance_admin', 'fraud_analyst', 'compliance_officer',
  'campaign_admin', 'affiliate_manager', 'auditor'
);

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  country TEXT DEFAULT 'DE',
  preferred_language TEXT NOT NULL DEFAULT 'de',
  phone TEXT,
  date_of_birth DATE,
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  membership_number TEXT UNIQUE NOT NULL DEFAULT ('ZRN-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 10))),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

CREATE INDEX profiles_membership_idx ON public.profiles(membership_number);

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE INDEX user_roles_user_idx ON public.user_roles(user_id);

-- has_role helper (SECURITY DEFINER, avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "user_roles_admin_all" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'ops_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'ops_admin'));

-- ============ updated_at trigger ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Auto profile + default consumer role on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, preferred_language)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'de')
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'consumer');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();