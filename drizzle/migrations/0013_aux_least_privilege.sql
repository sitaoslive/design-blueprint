CREATE OR REPLACE FUNCTION public.my_staff_ids() RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id FROM public.staff_members WHERE user_id = auth.uid();
$$;
CREATE OR REPLACE FUNCTION public.aux_sees_pet(_pet text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.visits v WHERE v.pet_id = _pet AND v.staff_id IN (SELECT public.my_staff_ids()));
$$;
REVOKE EXECUTE ON FUNCTION public.my_staff_ids() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.aux_sees_pet(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_staff_ids() TO authenticated;
GRANT EXECUTE ON FUNCTION public.aux_sees_pet(text) TO authenticated;

DROP POLICY "tasks staff" ON public.tasks;
CREATE POLICY "tasks staff" ON public.tasks FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR staff_id IN (SELECT public.my_staff_ids())))
  WITH CHECK (public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR staff_id IN (SELECT public.my_staff_ids())));

DROP POLICY "pets read" ON public.pets;
CREATE POLICY "pets read" ON public.pets FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR (public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR public.aux_sees_pet(id))));
DROP POLICY "pets update" ON public.pets;
CREATE POLICY "pets update" ON public.pets FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid())));

DROP POLICY "treat read" ON public.treatments;
CREATE POLICY "treat read" ON public.treatments FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR EXISTS (SELECT 1 FROM public.pets p WHERE p.name = treatments.pet AND public.aux_sees_pet(p.id))));