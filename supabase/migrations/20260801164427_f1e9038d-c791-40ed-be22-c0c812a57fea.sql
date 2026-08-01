-- 1. Fix swapped arguments in merchant-membership access checks.
DROP POLICY IF EXISTS "rewards_read_active" ON public.rewards;
CREATE POLICY "rewards_read_active" ON public.rewards
FOR SELECT
USING (active = true OR public.is_merchant_member(auth.uid(), merchant_id));

DROP POLICY IF EXISTS "rewards_owner_write" ON public.rewards;
CREATE POLICY "rewards_owner_write" ON public.rewards
FOR ALL
USING (public.is_merchant_member(auth.uid(), merchant_id, 'manager'::merchant_member_role))
WITH CHECK (public.is_merchant_member(auth.uid(), merchant_id, 'manager'::merchant_member_role));

DROP POLICY IF EXISTS "rr_owner_read" ON public.reward_redemptions;
CREATE POLICY "rr_owner_read" ON public.reward_redemptions
FOR SELECT
USING (user_id = auth.uid() OR public.is_merchant_member(auth.uid(), merchant_id));

-- 2. Close PostGIS reference table exposure through the Data API.
REVOKE ALL ON TABLE public.spatial_ref_sys FROM anon, authenticated;