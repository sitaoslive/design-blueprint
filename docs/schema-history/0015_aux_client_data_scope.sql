DROP POLICY "Cliente ve sus memorias no sensibles" ON public.customer_memory;
CREATE POLICY "Cliente ve sus memorias no sensibles" ON public.customer_memory FOR SELECT TO authenticated
  USING (client_id = auth.uid() OR public.is_ops(auth.uid()) OR public.is_director(auth.uid())
    OR (sensitivity = 'normal' AND public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid())));

DROP POLICY "pc read" ON public.pet_caregivers;
CREATE POLICY "pc read" ON public.pet_caregivers FOR SELECT TO authenticated
  USING (caregiver_id = auth.uid() OR public.owns_pet(pet_id) OR (public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR public.aux_sees_pet(pet_id))));

DROP POLICY "ref read" ON public.referrals;
CREATE POLICY "ref read" ON public.referrals FOR SELECT TO authenticated
  USING (public.owns_pet(pet_id) OR (public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR public.aux_sees_pet(pet_id))));

DROP POLICY "rep read" ON public.specialist_reports;
CREATE POLICY "rep read" ON public.specialist_reports FOR SELECT TO authenticated
  USING (author = auth.uid() OR (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid())));

DROP POLICY "rec read" ON public.records;
CREATE POLICY "rec read" ON public.records FOR SELECT TO authenticated
  USING ((scope = 'client' AND owner_id = auth.uid())
    OR (scope = 'staff' AND public.is_staff(auth.uid()))
    OR (scope = 'client' AND public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()))
    OR (scope = 'director' AND public.is_director(auth.uid())));

DROP POLICY "wait staff" ON public.waitlist;
CREATE POLICY "wait staff" ON public.waitlist FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()));