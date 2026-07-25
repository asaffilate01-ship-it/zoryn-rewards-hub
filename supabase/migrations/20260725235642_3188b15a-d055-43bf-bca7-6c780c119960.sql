CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  threshold_points INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.badges TO authenticated, anon;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges readable" ON public.badges FOR SELECT USING (true);
CREATE POLICY "admins manage badges" ON public.badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
GRANT SELECT ON public.user_badges TO authenticated;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own badges" ON public.user_badges FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "admins read all badges" ON public.user_badges FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL REFERENCES public.merchants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  multiplier NUMERIC(4,2) NOT NULL DEFAULT 1.5 CHECK (multiplier > 0 AND multiplier <= 10),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_campaigns_merchant ON public.campaigns(merchant_id);
CREATE INDEX idx_campaigns_active ON public.campaigns(active, starts_at, ends_at);
GRANT SELECT ON public.campaigns TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "campaigns readable" ON public.campaigns FOR SELECT USING (
  active AND starts_at <= now() AND (ends_at IS NULL OR ends_at > now())
);
CREATE POLICY "merchant members manage own campaigns" ON public.campaigns FOR ALL TO authenticated
  USING (public.is_merchant_member(auth.uid(), merchant_id))
  WITH CHECK (public.is_merchant_member(auth.uid(), merchant_id));

CREATE TRIGGER trg_campaigns_updated
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.award_badges_for_user(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  lifetime_earned BIGINT;
  awarded_count INTEGER := 0;
BEGIN
  SELECT COALESCE(SUM(amount_points), 0) INTO lifetime_earned
    FROM public.transactions t
    JOIN public.accounts a ON a.id = t.credit_account_id
    WHERE a.owner_user_id = _user_id
      AND a.kind = 'user_wallet'
      AND t.reason = 'earn';

  INSERT INTO public.user_badges (user_id, badge_id)
  SELECT _user_id, b.id
    FROM public.badges b
    WHERE b.threshold_points <= lifetime_earned
      AND NOT EXISTS (
        SELECT 1 FROM public.user_badges ub
        WHERE ub.user_id = _user_id AND ub.badge_id = b.id
      );
  GET DIAGNOSTICS awarded_count = ROW_COUNT;
  RETURN awarded_count;
END;
$$;

INSERT INTO public.badges (code, name, description, icon, threshold_points, sort_order) VALUES
  ('starter',  'Erste Punkte', 'Deine ersten Zoryn Punkte gesammelt.',      '✨',      1, 10),
  ('bronze',   'Bronze',       '1.000 Punkte gesammelt.',                   '🥉',   1000, 20),
  ('silver',   'Silber',       '5.000 Punkte gesammelt.',                   '🥈',   5000, 30),
  ('gold',     'Gold',         '20.000 Punkte gesammelt.',                  '🥇',  20000, 40),
  ('platinum', 'Platin',       '50.000 Punkte gesammelt.',                  '💎',  50000, 50),
  ('diamond',  'Diamant',      '100.000 Punkte gesammelt — Zoryn Legende.', '👑', 100000, 60);