
-- ============ PostGIS + nearby ============
CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS location geography(Point, 4326);

CREATE INDEX IF NOT EXISTS merchants_location_gix ON public.merchants USING gist (location);

UPDATE public.merchants SET
  city = 'Berlin',
  address = CASE slug
    WHEN 'cafe-nord' THEN 'Kastanienallee 12, 10435 Berlin'
    WHEN 'kiez-kiosk' THEN 'Sonnenallee 88, 12045 Berlin'
    WHEN 'baeckerei-sonne' THEN 'Bergmannstr. 45, 10961 Berlin'
    WHEN 'zoryn-online' THEN 'Online'
    WHEN 'fahrradwerk-berlin' THEN 'Warschauer Str. 23, 10243 Berlin'
    ELSE address
  END,
  location = CASE slug
    WHEN 'cafe-nord' THEN ST_SetSRID(ST_MakePoint(13.4050, 52.5390), 4326)::geography
    WHEN 'kiez-kiosk' THEN ST_SetSRID(ST_MakePoint(13.4425, 52.4820), 4326)::geography
    WHEN 'baeckerei-sonne' THEN ST_SetSRID(ST_MakePoint(13.3960, 52.4890), 4326)::geography
    WHEN 'fahrradwerk-berlin' THEN ST_SetSRID(ST_MakePoint(13.4520, 52.5060), 4326)::geography
    ELSE location
  END;

CREATE OR REPLACE FUNCTION public.nearby_merchants(_lat double precision, _lng double precision, _radius_m integer DEFAULT 5000)
RETURNS TABLE (
  id uuid, slug text, name text, category text, brand_color text,
  points_per_euro integer, address text, city text,
  latitude double precision, longitude double precision, distance_m double precision
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT m.id, m.slug, m.name, m.category, m.brand_color, m.points_per_euro,
         m.address, m.city,
         ST_Y(m.location::geometry) as latitude,
         ST_X(m.location::geometry) as longitude,
         ST_Distance(m.location, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography) as distance_m
  FROM public.merchants m
  WHERE m.is_active = true
    AND m.location IS NOT NULL
    AND ST_DWithin(m.location, ST_SetSRID(ST_MakePoint(_lng, _lat), 4326)::geography, _radius_m)
  ORDER BY distance_m ASC
  LIMIT 50;
$$;

-- ============ Offers / Campaigns ============
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  reward_multiplier numeric(4,2) NOT NULL DEFAULT 1.0 CHECK (reward_multiplier > 0 AND reward_multiplier <= 20),
  bonus_points integer NOT NULL DEFAULT 0 CHECK (bonus_points >= 0),
  min_spend_cents integer NOT NULL DEFAULT 0 CHECK (min_spend_cents >= 0),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.offers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT ALL ON public.offers TO service_role;

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "offers_public_read_active" ON public.offers FOR SELECT
  USING (is_active = true AND (ends_at IS NULL OR ends_at > now()));

CREATE POLICY "offers_merchant_manage" ON public.offers FOR ALL TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id, 'manager'))
  WITH CHECK (public.is_merchant_member(auth.uid(), merchant_id, 'manager'));

CREATE TRIGGER offers_set_updated_at BEFORE UPDATE ON public.offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.offers (merchant_id, title, description, reward_multiplier, bonus_points, ends_at)
SELECT id,
  CASE slug
    WHEN 'cafe-nord' THEN 'Happy Hour: 3× Punkte'
    WHEN 'kiez-kiosk' THEN 'Wochenend-Bonus: 2× Punkte'
    WHEN 'baeckerei-sonne' THEN 'Frühstücks-Bonus'
    WHEN 'zoryn-online' THEN 'Online-Launch: 5× Punkte'
    WHEN 'fahrradwerk-berlin' THEN 'Wartung mit Bonus'
    ELSE 'Willkommensbonus'
  END,
  'Nur für kurze Zeit — sammle extra Zoryn-Punkte.',
  CASE slug
    WHEN 'cafe-nord' THEN 3.0
    WHEN 'kiez-kiosk' THEN 2.0
    WHEN 'zoryn-online' THEN 5.0
    ELSE 2.0
  END,
  CASE slug WHEN 'baeckerei-sonne' THEN 50 WHEN 'fahrradwerk-berlin' THEN 200 ELSE 0 END,
  now() + interval '30 days'
FROM public.merchants
WHERE is_active = true
ON CONFLICT DO NOTHING;

-- ============ Earn Challenges (QR flow) ============
CREATE TABLE IF NOT EXISTS public.earn_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  merchant_id uuid NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  issued_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  memo text,
  expires_at timestamptz NOT NULL,
  claimed_at timestamptz,
  claimed_by uuid REFERENCES auth.users(id),
  transaction_id uuid REFERENCES public.transactions(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.earn_challenges TO authenticated;
GRANT ALL ON public.earn_challenges TO service_role;

ALTER TABLE public.earn_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "earn_ch_read_by_merchant" ON public.earn_challenges FOR SELECT TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id, 'staff') OR claimed_by = auth.uid());

CREATE POLICY "earn_ch_insert_by_merchant" ON public.earn_challenges FOR INSERT TO authenticated
  WITH CHECK (public.is_merchant_member(auth.uid(), merchant_id, 'staff') AND issued_by = auth.uid());

CREATE INDEX IF NOT EXISTS earn_challenges_code_idx ON public.earn_challenges(code);
CREATE INDEX IF NOT EXISTS earn_challenges_merchant_idx ON public.earn_challenges(merchant_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.claim_earn_challenge(_code text, _user_id uuid)
RETURNS TABLE (transaction_id uuid, points_awarded integer, merchant_name text, offer_title text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  ch record;
  merchant_row record;
  best_offer record;
  base_points integer;
  bonus integer := 0;
  multiplier numeric := 1.0;
  final_points integer;
  txn_id uuid;
  idem text;
BEGIN
  SELECT * INTO ch FROM public.earn_challenges WHERE code = upper(_code);
  IF ch IS NULL THEN RAISE EXCEPTION 'code_not_found'; END IF;
  IF ch.claimed_at IS NOT NULL THEN RAISE EXCEPTION 'already_claimed'; END IF;
  IF ch.expires_at < now() THEN RAISE EXCEPTION 'expired'; END IF;

  SELECT * INTO merchant_row FROM public.merchants WHERE id = ch.merchant_id;
  base_points := (ch.amount_cents * merchant_row.points_per_euro) / 100;

  SELECT * INTO best_offer FROM public.offers
   WHERE merchant_id = ch.merchant_id AND is_active = true
     AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now())
     AND ch.amount_cents >= min_spend_cents
   ORDER BY reward_multiplier DESC, bonus_points DESC LIMIT 1;

  IF best_offer IS NOT NULL THEN
    multiplier := best_offer.reward_multiplier;
    bonus := best_offer.bonus_points;
  END IF;

  final_points := GREATEST(1, (base_points * multiplier)::integer + bonus);
  idem := 'ch:' || ch.id::text;

  txn_id := public.earn_points(
    _user_id, ch.merchant_id, final_points, idem,
    COALESCE(ch.memo, 'QR-Earn ' || (ch.amount_cents::numeric/100)::text || ' EUR')
  );

  UPDATE public.earn_challenges
     SET claimed_at = now(), claimed_by = _user_id, transaction_id = txn_id
   WHERE id = ch.id;

  RETURN QUERY SELECT txn_id, final_points, merchant_row.name,
    COALESCE(best_offer.title, NULL::text);
END; $$;

-- ============ Notifications ============
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_read_own" ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS notifications_user_idx ON public.notifications(user_id, created_at DESC);

-- ============ Missing points claims ============
CREATE TABLE IF NOT EXISTS public.missing_points_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  merchant_id uuid REFERENCES public.merchants(id) ON DELETE SET NULL,
  merchant_name text,
  purchase_date date NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  reference text,
  notes text,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new','under_review','approved','declined','closed')),
  resolution_txn_id uuid REFERENCES public.transactions(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.missing_points_claims TO authenticated;
GRANT ALL ON public.missing_points_claims TO service_role;

ALTER TABLE public.missing_points_claims ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mpc_read_own_or_admin" ON public.missing_points_claims FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "mpc_insert_own" ON public.missing_points_claims FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "mpc_admin_manage" ON public.missing_points_claims FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER mpc_set_updated_at BEFORE UPDATE ON public.missing_points_claims
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ Platform admin overview ============
CREATE OR REPLACE FUNCTION public.platform_admin_overview()
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE result jsonb;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  SELECT jsonb_build_object(
    'total_users', (SELECT count(*) FROM public.profiles),
    'active_merchants', (SELECT count(*) FROM public.merchants WHERE is_active),
    'active_offers', (SELECT count(*) FROM public.offers WHERE is_active AND (ends_at IS NULL OR ends_at > now())),
    'transactions_30d', (SELECT count(*) FROM public.transactions WHERE created_at > now() - interval '30 days'),
    'points_issued_30d', (
      SELECT COALESCE(SUM(le.amount_points),0)
        FROM public.ledger_entries le
        JOIN public.accounts a ON a.id = le.account_id
       WHERE a.kind = 'user_wallet' AND le.direction = 'credit'
         AND le.created_at > now() - interval '30 days'
    ),
    'points_redeemed_30d', (
      SELECT COALESCE(SUM(le.amount_points),0)
        FROM public.ledger_entries le
        JOIN public.accounts a ON a.id = le.account_id
       WHERE a.kind = 'user_wallet' AND le.direction = 'debit'
         AND le.created_at > now() - interval '30 days'
    ),
    'total_liability_points', (
      SELECT COALESCE(SUM(balance_points),0)
        FROM public.account_balances WHERE kind = 'user_wallet'
    ),
    'open_claims', (SELECT count(*) FROM public.missing_points_claims WHERE status IN ('new','under_review'))
  ) INTO result;
  RETURN result;
END; $$;
