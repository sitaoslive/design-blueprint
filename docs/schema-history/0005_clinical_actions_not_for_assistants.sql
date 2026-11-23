CREATE OR REPLACE FUNCTION public.is_clinical(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select public.has_any_role(_uid, array['veterinario','luis','administrador']::public.app_role[])
$$;
CREATE OR REPLACE FUNCTION public.can_refer(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select public.has_any_role(_uid, array['veterinario','coordinador','recepcion','luis','administrador']::public.app_role[])
$$;
DROP POLICY IF EXISTS "treat staff" ON public.treatments;
CREATE POLICY "treat read" ON public.treatments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "treat clinical write" ON public.treatments FOR ALL TO authenticated USING (public.is_clinical(auth.uid())) WITH CHECK (public.is_clinical(auth.uid()));
DROP POLICY IF EXISTS "ref write" ON public.referrals;
CREATE POLICY "ref write" ON public.referrals FOR ALL TO authenticated USING (public.can_refer(auth.uid())) WITH CHECK (public.can_refer(auth.uid()));