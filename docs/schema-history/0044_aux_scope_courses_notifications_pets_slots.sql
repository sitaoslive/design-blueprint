DROP POLICY IF EXISTS "courses staff" ON public.courses;
CREATE POLICY "courses staff" ON public.courses FOR ALL TO authenticated
USING (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()));

DROP POLICY IF EXISTS "notif insert" ON public.notifications;
CREATE POLICY "notif insert" ON public.notifications FOR INSERT TO authenticated
WITH CHECK (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()));

DROP POLICY IF EXISTS "notif update" ON public.notifications;
CREATE POLICY "notif update" ON public.notifications FOR UPDATE TO authenticated
USING (user_id = auth.uid() OR (user_id IS NULL AND public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid())));

DROP POLICY IF EXISTS "pets insert" ON public.pets;
CREATE POLICY "pets insert" ON public.pets FOR INSERT TO authenticated
WITH CHECK (owner_id = auth.uid() OR (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid())));

DROP POLICY IF EXISTS "slots own" ON public.specialist_slots;
CREATE POLICY "slots own" ON public.specialist_slots FOR ALL TO authenticated
USING (user_id = auth.uid() OR (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid())))
WITH CHECK (user_id = auth.uid() AND (public.has_role(auth.uid(), 'especialista') OR public.is_staff(auth.uid())));
CREATE POLICY "slots aux read" ON public.specialist_slots FOR SELECT TO authenticated
USING (public.is_aux_only(auth.uid()));