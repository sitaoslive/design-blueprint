CREATE TABLE public.staff_locations (
  user_id uuid PRIMARY KEY DEFAULT auth.uid(),
  staff_id text NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
  visit_id text NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  lat double precision NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng double precision NOT NULL CHECK (lng BETWEEN -180 AND 180),
  accuracy real,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_locations TO authenticated;
GRANT ALL ON public.staff_locations TO service_role;
ALTER TABLE public.staff_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "loc read" ON public.staff_locations FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_ops(auth.uid()));
CREATE POLICY "loc insert own" ON public.staff_locations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND staff_id IN (SELECT public.my_staff_ids()) AND public.can_access_field_visit(visit_id));
CREATE POLICY "loc update own" ON public.staff_locations FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid() AND staff_id IN (SELECT public.my_staff_ids()) AND public.can_access_field_visit(visit_id));
CREATE POLICY "loc delete own" ON public.staff_locations FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE OR REPLACE FUNCTION public.touch_staff_location() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at := now(); RETURN NEW; END $$;
CREATE TRIGGER staff_locations_touch BEFORE INSERT OR UPDATE ON public.staff_locations FOR EACH ROW EXECUTE FUNCTION public.touch_staff_location();

CREATE OR REPLACE FUNCTION public.notify_new_request() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notifications(id, user_id, title, body, read)
  SELECT 'req-' || NEW.id || '-' || r.user_id, r.user_id,
         'Nueva solicitud: ' || NEW.client || ' · ' || NEW.pet,
         left(NEW.message, 160) || ' (' || NEW.channel || ')', false
  FROM (SELECT DISTINCT user_id FROM public.user_roles WHERE role IN ('luis','administrador')) r
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.notify_new_request() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER service_requests_notify AFTER INSERT ON public.service_requests FOR EACH ROW EXECUTE FUNCTION public.notify_new_request();