-- Ensure updated_at helper exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- BLOG POSTS
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  body_md TEXT NOT NULL,
  cover_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'Zoryn Team',
  tags TEXT[] NOT NULL DEFAULT '{}',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.blog_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.blog_posts TO authenticated;
GRANT ALL ON public.blog_posts TO service_role;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read published posts" ON public.blog_posts
  FOR SELECT TO anon, authenticated
  USING (published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "admins manage posts" ON public.blog_posts
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- COMPLAINTS
CREATE TABLE public.complaints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  membership_number TEXT,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.complaints TO anon, authenticated;
GRANT SELECT, UPDATE ON public.complaints TO authenticated;
GRANT ALL ON public.complaints TO service_role;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can submit" ON public.complaints
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admins read complaints" ON public.complaints
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update complaints" ON public.complaints
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER complaints_updated_at BEFORE UPDATE ON public.complaints
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Admin RPCs for complaints
CREATE OR REPLACE FUNCTION public.admin_list_complaints()
RETURNS SETOF public.complaints
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY SELECT * FROM public.complaints ORDER BY created_at DESC LIMIT 500;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_complaint(_id UUID, _status TEXT, _notes TEXT)
RETURNS public.complaints
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE r public.complaints;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  UPDATE public.complaints SET status = _status, admin_notes = _notes, updated_at = now()
  WHERE id = _id RETURNING * INTO r;
  RETURN r;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_complaints() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_update_complaint(UUID, TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_complaints() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_complaint(UUID, TEXT, TEXT) TO authenticated;

-- SEED BLOG POSTS
INSERT INTO public.blog_posts (slug, title, excerpt, body_md, author_name, tags, published_at) VALUES
('willkommen-bei-zoryn',
 'Willkommen bei Zoryn — Mehr als nur Punkte',
 'Warum wir Zoryn gebaut haben und was eine echte Wallet für dich verändert.',
 E'# Willkommen bei Zoryn\n\nZoryn ist die eine Wallet für alle deine Punkte, Cashback und Rewards.\n\n## Warum?\n\nWeil eine Karte pro Café, pro Bäcker, pro Shop einfach nicht mehr zeitgemäß ist. Wir bündeln alles an einem Ort — sicher, transparent, deutsch.\n\n## Was du bekommst\n\n- **Eine** Mitgliedsnummer für alle Partner\n- Transparentes Punkte-Ledger — jede Transaktion nachvollziehbar\n- Lokale Angebote in deiner Nähe\n- Freunde einladen und 500 Punkte kassieren\n\nLos geht''s auf dem [Home-Screen](/app).',
 'Zoryn Team', ARRAY['produkt','launch'], now() - interval '3 days'),
('wie-punkte-funktionieren',
 'Wie Punkte bei Zoryn funktionieren',
 'Das Double-Entry-Ledger hinter jeder Punktebuchung — einfach erklärt.',
 E'# Wie Punkte funktionieren\n\nJede Buchung in Zoryn läuft über ein **Double-Entry-Ledger**. Das ist derselbe Standard wie in der Buchhaltung.\n\n## Warum das wichtig ist\n\n- Keine "verschwundenen" Punkte\n- Jede Änderung ist nachvollziehbar\n- Wir können jederzeit die gesamte Punkte-Haftung berechnen\n\n## Der Kurs\n\n**100 Punkte = 1 €** — einfach und stabil.\n\n## Verfall\n\nPunkte, die du bei einem Partner sammelst, sind normalerweise 24 Monate gültig. Details siehst du im Wallet.',
 'Zoryn Team', ARRAY['produkt','erklaert'], now() - interval '2 days'),
('cafe-nord-success-story',
 'Wie Café Nord seine Stammkundschaft verdreifacht hat',
 'Ein Erfahrungsbericht aus Berlin-Mitte — mit echten Zahlen.',
 E'# Café Nord × Zoryn\n\nSeit dem Launch mit Zoryn hat Café Nord die Wiederkehrrate seiner Kund:innen fast **verdreifacht**.\n\n## Was sie tun\n\n- Bei jedem Kaffee: **2× Punkte** vor 10 Uhr\n- Freitags: **Free-Croissant-Reward** ab 500 Punkten\n- QR-Code an der Theke — kein App-Zwang für Neukund:innen\n\n## Zahlen nach 90 Tagen\n\n- +180 % wiederkehrende Kund:innen\n- Ø Bon +12 %\n- 4 Minuten Setup pro Woche im Merchant-Portal\n\n> "Zoryn ist das erste Loyalty-Tool, das meine Kundschaft wirklich nutzt." — Ana, Inhaberin',
 'Zoryn Team', ARRAY['case-study','merchant'], now() - interval '1 day');
