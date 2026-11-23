CREATE TABLE public.records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  scope text NOT NULL DEFAULT 'staff' CHECK (scope IN ('staff','director','client')),
  ref_id text,
  owner_id uuid,
  title text NOT NULL,
  detail text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'abierto',
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX records_kind_idx ON public.records(kind, ref_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.records TO authenticated;
GRANT ALL ON public.records TO service_role;
ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rec read" ON public.records FOR SELECT TO authenticated USING (
  (scope = 'client' AND owner_id = auth.uid())
  OR (scope IN ('staff','client') AND public.is_staff(auth.uid()))
  OR (scope = 'director' AND public.is_director(auth.uid())));
CREATE POLICY "rec insert" ON public.records FOR INSERT TO authenticated WITH CHECK (
  created_by = auth.uid() AND (
  (scope = 'client' AND (owner_id = auth.uid() OR public.is_ops(auth.uid())))
  OR (scope = 'staff' AND public.is_staff(auth.uid()))
  OR (scope = 'director' AND public.is_director(auth.uid()))));
CREATE POLICY "rec update" ON public.records FOR UPDATE TO authenticated USING (
  (scope IN ('staff','client') AND public.is_staff(auth.uid()))
  OR (scope = 'director' AND public.is_director(auth.uid())))
  WITH CHECK ((scope IN ('staff','client') AND public.is_staff(auth.uid())) OR (scope = 'director' AND public.is_director(auth.uid())));
CREATE POLICY "rec delete" ON public.records FOR DELETE TO authenticated USING (public.is_director(auth.uid()));

DROP POLICY IF EXISTS "own settings" ON public.client_settings;
CREATE POLICY "settings read" ON public.client_settings FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_ops(auth.uid()));
CREATE POLICY "settings insert" ON public.client_settings FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "settings update" ON public.client_settings FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "req staff" ON public.service_requests;
CREATE POLICY "req ops" ON public.service_requests FOR ALL TO authenticated USING (public.is_ops(auth.uid())) WITH CHECK (public.is_ops(auth.uid()));

DROP POLICY IF EXISTS "pay update" ON public.payments;
CREATE POLICY "pay update" ON public.payments FOR UPDATE TO authenticated USING (public.has_any_role(auth.uid(), ARRAY['finanzas','administrador','luis']::public.app_role[]));
CREATE POLICY "pay staff insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (public.is_clinical(auth.uid()) AND status = 'pendiente');