CREATE OR REPLACE FUNCTION public.is_aux_only(_uid uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select public.has_role(_uid, 'auxiliar') and not public.has_any_role(_uid, array['veterinario','coordinador','recepcion','finanzas','administrador','luis','soporte','consultor']::public.app_role[])
$$;
CREATE OR REPLACE FUNCTION public.can_see_visit(_staff text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select public.is_staff(auth.uid()) and (not public.is_aux_only(auth.uid()) or exists (select 1 from public.staff_members m where m.id = _staff and m.user_id = auth.uid()))
$$;
DROP POLICY IF EXISTS "visits read" ON public.visits;
CREATE POLICY "visits read" ON public.visits FOR SELECT TO authenticated USING (public.can_see_visit(staff_id) OR public.owns_pet(pet_id));
DROP POLICY IF EXISTS "visits update" ON public.visits;
CREATE POLICY "visits update" ON public.visits FOR UPDATE TO authenticated USING (public.can_see_visit(staff_id) OR public.owns_pet(pet_id));