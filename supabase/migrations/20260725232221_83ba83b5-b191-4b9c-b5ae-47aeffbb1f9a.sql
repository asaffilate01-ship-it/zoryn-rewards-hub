
-- Merchant analytics: 30-day daily series
CREATE OR REPLACE FUNCTION public.merchant_analytics_series(_merchant_id uuid)
RETURNS TABLE(day date, earned bigint, redeemed bigint, txn_count bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_merchant_member(_merchant_id, auth.uid()) AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
  WITH days AS (
    SELECT (current_date - i)::date AS day FROM generate_series(0, 29) i
  ),
  earn AS (
    SELECT date_trunc('day', t.created_at)::date AS d, COALESCE(SUM(le.amount),0) AS amt, COUNT(DISTINCT t.id) AS cnt
    FROM public.transactions t
    JOIN public.ledger_entries le ON le.transaction_id = t.id AND le.direction = 'credit'
    JOIN public.accounts a ON a.id = le.account_id AND a.kind = 'consumer'
    WHERE t.merchant_id = _merchant_id AND t.kind = 'earn' AND t.created_at >= current_date - INTERVAL '30 days'
    GROUP BY 1
  ),
  redeem AS (
    SELECT date_trunc('day', t.created_at)::date AS d, COALESCE(SUM(le.amount),0) AS amt, COUNT(DISTINCT t.id) AS cnt
    FROM public.transactions t
    JOIN public.ledger_entries le ON le.transaction_id = t.id AND le.direction = 'debit'
    JOIN public.accounts a ON a.id = le.account_id AND a.kind = 'consumer'
    WHERE t.merchant_id = _merchant_id AND t.kind = 'redeem' AND t.created_at >= current_date - INTERVAL '30 days'
    GROUP BY 1
  )
  SELECT d.day,
         COALESCE(e.amt,0)::bigint AS earned,
         COALESCE(r.amt,0)::bigint AS redeemed,
         (COALESCE(e.cnt,0) + COALESCE(r.cnt,0))::bigint AS txn_count
  FROM days d
  LEFT JOIN earn e ON e.d = d.day
  LEFT JOIN redeem r ON r.d = d.day
  ORDER BY d.day;
END;
$$;

GRANT EXECUTE ON FUNCTION public.merchant_analytics_series(uuid) TO authenticated;

-- Merchant top customers (30d)
CREATE OR REPLACE FUNCTION public.merchant_top_customers(_merchant_id uuid, _limit int DEFAULT 10)
RETURNS TABLE(user_id uuid, display_name text, earned bigint, redeemed bigint, visits bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.is_merchant_member(_merchant_id, auth.uid()) AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
  SELECT a.user_id,
         COALESCE(p.display_name, 'Gast') AS display_name,
         COALESCE(SUM(CASE WHEN le.direction='credit' AND t.kind='earn' THEN le.amount ELSE 0 END),0)::bigint AS earned,
         COALESCE(SUM(CASE WHEN le.direction='debit' AND t.kind='redeem' THEN le.amount ELSE 0 END),0)::bigint AS redeemed,
         COUNT(DISTINCT t.id)::bigint AS visits
  FROM public.transactions t
  JOIN public.ledger_entries le ON le.transaction_id = t.id
  JOIN public.accounts a ON a.id = le.account_id AND a.kind='consumer'
  LEFT JOIN public.profiles p ON p.id = a.user_id
  WHERE t.merchant_id = _merchant_id
    AND t.created_at >= current_date - INTERVAL '30 days'
  GROUP BY a.user_id, p.display_name
  ORDER BY (COALESCE(SUM(CASE WHEN le.direction='credit' AND t.kind='earn' THEN le.amount ELSE 0 END),0)
          + COALESCE(SUM(CASE WHEN le.direction='debit' AND t.kind='redeem' THEN le.amount ELSE 0 END),0)) DESC
  LIMIT _limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.merchant_top_customers(uuid,int) TO authenticated;

-- Admin platform 30d timeseries + top merchants
CREATE OR REPLACE FUNCTION public.admin_platform_series()
RETURNS TABLE(day date, earned bigint, redeemed bigint, new_users bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  WITH days AS (SELECT (current_date - i)::date AS day FROM generate_series(0, 29) i),
  earn AS (
    SELECT date_trunc('day', t.created_at)::date AS d, COALESCE(SUM(le.amount),0) AS amt
    FROM public.transactions t
    JOIN public.ledger_entries le ON le.transaction_id = t.id AND le.direction='credit'
    JOIN public.accounts a ON a.id = le.account_id AND a.kind='consumer'
    WHERE t.kind='earn' AND t.created_at >= current_date - INTERVAL '30 days' GROUP BY 1
  ),
  redeem AS (
    SELECT date_trunc('day', t.created_at)::date AS d, COALESCE(SUM(le.amount),0) AS amt
    FROM public.transactions t
    JOIN public.ledger_entries le ON le.transaction_id = t.id AND le.direction='debit'
    JOIN public.accounts a ON a.id = le.account_id AND a.kind='consumer'
    WHERE t.kind='redeem' AND t.created_at >= current_date - INTERVAL '30 days' GROUP BY 1
  ),
  users AS (
    SELECT date_trunc('day', created_at)::date AS d, COUNT(*)::bigint AS c
    FROM public.profiles
    WHERE created_at >= current_date - INTERVAL '30 days' GROUP BY 1
  )
  SELECT d.day,
    COALESCE(e.amt,0)::bigint,
    COALESCE(r.amt,0)::bigint,
    COALESCE(u.c,0)::bigint
  FROM days d
  LEFT JOIN earn e ON e.d=d.day
  LEFT JOIN redeem r ON r.d=d.day
  LEFT JOIN users u ON u.d=d.day
  ORDER BY d.day;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_platform_series() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_top_merchants(_limit int DEFAULT 10)
RETURNS TABLE(merchant_id uuid, name text, slug text, earned bigint, redeemed bigint, txns bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  RETURN QUERY
  SELECT m.id, m.name, m.slug,
    COALESCE(SUM(CASE WHEN le.direction='credit' AND t.kind='earn' THEN le.amount ELSE 0 END),0)::bigint,
    COALESCE(SUM(CASE WHEN le.direction='debit' AND t.kind='redeem' THEN le.amount ELSE 0 END),0)::bigint,
    COUNT(DISTINCT t.id)::bigint
  FROM public.merchants m
  LEFT JOIN public.transactions t ON t.merchant_id = m.id AND t.created_at >= current_date - INTERVAL '30 days'
  LEFT JOIN public.ledger_entries le ON le.transaction_id = t.id
  LEFT JOIN public.accounts a ON a.id = le.account_id AND a.kind='consumer'
  GROUP BY m.id
  ORDER BY 4 DESC NULLS LAST
  LIMIT _limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_top_merchants(int) TO authenticated;

-- Global search across merchants, offers, rewards (public-friendly)
CREATE OR REPLACE FUNCTION public.global_search(_q text, _limit int DEFAULT 8)
RETURNS TABLE(kind text, id uuid, title text, subtitle text, slug text, image_url text, score real)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE q text := lower(coalesce(_q,''));
BEGIN
  IF length(q) < 2 THEN RETURN; END IF;
  RETURN QUERY
  (
    SELECT 'merchant'::text, m.id, m.name, COALESCE(m.category, m.city, '')::text, m.slug, NULL::text,
      (similarity(lower(m.name), q) + CASE WHEN lower(m.name) LIKE '%'||q||'%' THEN 0.3 ELSE 0 END)::real AS score
    FROM public.merchants m
    WHERE m.is_active AND (lower(m.name) LIKE '%'||q||'%' OR lower(coalesce(m.category,'')) LIKE '%'||q||'%' OR lower(coalesce(m.city,'')) LIKE '%'||q||'%')
    ORDER BY score DESC LIMIT _limit
  )
  UNION ALL
  (
    SELECT 'offer'::text, o.id, o.title, COALESCE(o.description,'')::text, m.slug, NULL::text,
      (CASE WHEN lower(o.title) LIKE '%'||q||'%' THEN 0.8 ELSE 0.4 END)::real
    FROM public.offers o JOIN public.merchants m ON m.id = o.merchant_id
    WHERE o.is_active AND (lower(o.title) LIKE '%'||q||'%' OR lower(coalesce(o.description,'')) LIKE '%'||q||'%')
    LIMIT _limit
  )
  UNION ALL
  (
    SELECT 'reward'::text, r.id, r.title, COALESCE(r.description,'')::text, m.slug, r.image_url,
      (CASE WHEN lower(r.title) LIKE '%'||q||'%' THEN 0.8 ELSE 0.4 END)::real
    FROM public.rewards r JOIN public.merchants m ON m.id = r.merchant_id
    WHERE r.is_active AND (lower(r.title) LIKE '%'||q||'%' OR lower(coalesce(r.description,'')) LIKE '%'||q||'%')
    LIMIT _limit
  )
  ORDER BY score DESC
  LIMIT _limit * 2;
END;
$$;

GRANT EXECUTE ON FUNCTION public.global_search(text,int) TO authenticated, anon;

-- pg_trgm needed for similarity()
CREATE EXTENSION IF NOT EXISTS pg_trgm;
