DROP POLICY IF EXISTS "anyone can submit" ON public.complaints;
CREATE POLICY "anyone can submit" ON public.complaints
FOR INSERT TO anon, authenticated
WITH CHECK (
  (submitted_by IS NULL OR submitted_by = auth.uid())
  AND status = 'open'
  AND admin_notes IS NULL
  AND length(name) BETWEEN 1 AND 200
  AND length(email) BETWEEN 3 AND 320
  AND length(subject) BETWEEN 1 AND 300
  AND length(message) BETWEEN 1 AND 5000
);