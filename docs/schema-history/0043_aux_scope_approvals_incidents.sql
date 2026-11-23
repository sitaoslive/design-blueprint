ALTER TABLE public.incidents ADD COLUMN IF NOT EXISTS created_by uuid DEFAULT auth.uid();

DROP POLICY IF EXISTS "appr read" ON public.approvals;
CREATE POLICY "appr read" ON public.approvals FOR SELECT TO authenticated
USING (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()));

DROP POLICY IF EXISTS "inc staff" ON public.incidents;
CREATE POLICY "inc staff" ON public.incidents FOR ALL TO authenticated
USING (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()))
WITH CHECK (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()));

CREATE POLICY "inc aux report" ON public.incidents FOR INSERT TO authenticated
WITH CHECK (public.is_aux_only(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "inc aux own" ON public.incidents FOR SELECT TO authenticated
USING (public.is_aux_only(auth.uid()) AND (created_by = auth.uid() OR assignee_staff IN (SELECT public.my_staff_ids()) OR (assignee_staff IS NULL AND owner IN (SELECT m.name FROM public.staff_members m WHERE m.user_id = auth.uid()))));

CREATE POLICY "inc aux update" ON public.incidents FOR UPDATE TO authenticated
USING (public.is_aux_only(auth.uid()) AND (created_by = auth.uid() OR assignee_staff IN (SELECT public.my_staff_ids()) OR (assignee_staff IS NULL AND owner IN (SELECT m.name FROM public.staff_members m WHERE m.user_id = auth.uid()))))
WITH CHECK (public.is_aux_only(auth.uid()) AND (created_by = auth.uid() OR assignee_staff IN (SELECT public.my_staff_ids()) OR (assignee_staff IS NULL AND owner IN (SELECT m.name FROM public.staff_members m WHERE m.user_id = auth.uid()))));