
-- Referral code on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id);

CREATE OR REPLACE FUNCTION public.gen_referral_code() RETURNS text
LANGUAGE plpgsql AS $$
DECLARE code text;
BEGIN
  LOOP
    code := upper(substr(replace(encode(gen_random_bytes(6),'base64'),'/',''),1,8));
    code := regexp_replace(code,'[^A-Z0-9]','X','g');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
  END LOOP;
  RETURN code;
END $$;

UPDATE public.profiles SET referral_code = public.gen_referral_code() WHERE referral_code IS NULL;

CREATE OR REPLACE FUNCTION public.set_referral_code() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN NEW.referral_code := public.gen_referral_code(); END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS profiles_set_referral_code ON public.profiles;
CREATE TRIGGER profiles_set_referral_code BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_referral_code();

-- Apply a referral: awards 500 pts to both users, one-shot per user
CREATE OR REPLACE FUNCTION public.apply_referral(_user_id uuid, _code text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE inviter_id uuid; txn1 uuid; txn2 uuid;
BEGIN
  IF (SELECT referred_by FROM profiles WHERE id = _user_id) IS NOT NULL THEN
    RAISE EXCEPTION 'referral already applied';
  END IF;
  SELECT id INTO inviter_id FROM profiles WHERE referral_code = upper(_code) AND id <> _user_id;
  IF inviter_id IS NULL THEN RAISE EXCEPTION 'invalid referral code'; END IF;

  UPDATE profiles SET referred_by = inviter_id WHERE id = _user_id;

  txn1 := public.earn_points(_user_id, NULL, 500, 'ref-new-'||_user_id::text, 'Willkommensbonus');
  txn2 := public.earn_points(inviter_id, NULL, 500, 'ref-inv-'||_user_id::text, 'Empfehlungsbonus');

  INSERT INTO notifications(user_id, kind, title, body)
  VALUES
    (_user_id,'referral','Willkommen bei Zoryn','Du hast 500 Punkte durch eine Empfehlung erhalten.'),
    (inviter_id,'referral','Empfehlung eingelöst','Eine Person hat deinen Code eingelöst — 500 Punkte für dich.');

  RETURN jsonb_build_object('ok',true,'points',500);
END $$;

REVOKE ALL ON FUNCTION public.apply_referral(uuid, text) FROM public, anon, authenticated;

-- Admin: resolve missing points claim (approve → post earn, reject → mark rejected)
CREATE OR REPLACE FUNCTION public.admin_resolve_claim(
  _claim_id uuid, _approve boolean, _points integer DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.missing_points_claims; txn uuid; pts integer;
BEGIN
  IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO c FROM missing_points_claims WHERE id = _claim_id FOR UPDATE;
  IF c IS NULL THEN RAISE EXCEPTION 'not found'; END IF;
  IF c.status <> 'open' THEN RAISE EXCEPTION 'already resolved'; END IF;

  IF _approve THEN
    pts := COALESCE(_points, GREATEST((c.amount_cents/100)*10, 10));
    txn := public.earn_points(c.user_id, c.merchant_id, pts, 'claim-'||c.id::text, 'Nachträgliche Gutschrift');
    UPDATE missing_points_claims SET status='approved', resolution_txn_id=txn, updated_at=now() WHERE id=_claim_id;
    INSERT INTO notifications(user_id, kind, title, body)
    VALUES (c.user_id,'claim','Antrag genehmigt', pts||' Punkte wurden gutgeschrieben.');
  ELSE
    UPDATE missing_points_claims SET status='rejected', updated_at=now() WHERE id=_claim_id;
    INSERT INTO notifications(user_id, kind, title, body)
    VALUES (c.user_id,'claim','Antrag abgelehnt','Bitte kontaktiere den Support für Details.');
  END IF;

  RETURN jsonb_build_object('ok', true);
END $$;

REVOKE ALL ON FUNCTION public.admin_resolve_claim(uuid, boolean, integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_resolve_claim(uuid, boolean, integer) TO authenticated;

-- Admin: toggle merchant active status
CREATE OR REPLACE FUNCTION public.admin_set_merchant_active(_merchant_id uuid, _active boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  UPDATE merchants SET is_active = _active, updated_at = now() WHERE id = _merchant_id;
END $$;

REVOKE ALL ON FUNCTION public.admin_set_merchant_active(uuid, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_merchant_active(uuid, boolean) TO authenticated;

-- Admin: list all merchants (bypasses filter to include inactive)
CREATE OR REPLACE FUNCTION public.admin_list_merchants()
RETURNS SETOF public.merchants LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY SELECT * FROM merchants ORDER BY created_at DESC;
END $$;

REVOKE ALL ON FUNCTION public.admin_list_merchants() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_merchants() TO authenticated;
