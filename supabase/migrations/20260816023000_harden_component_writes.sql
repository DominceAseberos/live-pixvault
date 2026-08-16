-- Public clients may read the component catalog but may not mutate it directly.
DROP POLICY IF EXISTS "Public components can be inserted by anon" ON public.components;
DROP POLICY IF EXISTS "Public can insert components" ON public.components;

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.components FROM anon, authenticated;
GRANT SELECT ON TABLE public.components TO anon, authenticated;

-- Writes are performed only by trusted server-side code using the service role.
