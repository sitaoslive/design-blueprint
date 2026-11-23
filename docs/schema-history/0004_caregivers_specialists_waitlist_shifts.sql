CREATE TABLE public.pet_caregivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id text NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  caregiver_id uuid NOT NULL,
  caregiver_name text NOT NULL DEFAULT '',
  tasks text NOT NULL DEFAULT '',
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pet_id, caregiver_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pet_caregivers TO authenticated;
GRANT ALL ON public.pet_caregivers TO service_role;
ALTER TABLE public.pet_caregivers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pc read" ON public.pet_caregivers FOR SELECT TO authenticated USING (caregiver_id = auth.uid() OR public.owns_pet(pet_id) OR public.is_staff(auth.uid()));
CREATE POLICY "pc owner write" ON public.pet_caregivers FOR INSERT TO authenticated WITH CHECK (public.owns_pet(pet_id));
CREATE POLICY "pc owner delete" ON public.pet_caregivers FOR DELETE TO authenticated USING (public.owns_pet(pet_id));
CREATE POLICY "pc owner update" ON public.pet_caregivers FOR UPDATE TO authenticated USING (public.owns_pet(pet_id));

CREATE OR REPLACE FUNCTION public.is_caregiver_of(_pet text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.pet_caregivers WHERE pet_id = _pet AND caregiver_id = auth.uid())
$$;
CREATE POLICY "pets caregiver read" ON public.pets FOR SELECT TO authenticated USING (public.is_caregiver_of(id));
CREATE POLICY "visits caregiver read" ON public.visits FOR SELECT TO authenticated USING (public.is_caregiver_of(pet_id));

ALTER TABLE public.specialists ADD COLUMN IF NOT EXISTS user_id uuid;
CREATE OR REPLACE FUNCTION public.my_specialist_name() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT name FROM public.specialists WHERE user_id = auth.uid() LIMIT 1
$$;
CREATE POLICY "ref specialist read" ON public.referrals FOR SELECT TO authenticated USING (specialist IS NOT NULL AND specialist = public.my_specialist_name());
CREATE POLICY "ref specialist update" ON public.referrals FOR UPDATE TO authenticated USING (specialist IS NOT NULL AND specialist = public.my_specialist_name());

CREATE TABLE public.specialist_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  day text NOT NULL,
  time text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.specialist_slots TO authenticated;
GRANT ALL ON public.specialist_slots TO service_role;
ALTER TABLE public.specialist_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "slots own" ON public.specialist_slots FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid())) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.specialist_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id text REFERENCES public.referrals(id) ON DELETE SET NULL,
  author uuid NOT NULL DEFAULT auth.uid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.specialist_reports TO authenticated;
GRANT ALL ON public.specialist_reports TO service_role;
ALTER TABLE public.specialist_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rep read" ON public.specialist_reports FOR SELECT TO authenticated USING (author = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "rep insert" ON public.specialist_reports FOR INSERT TO authenticated WITH CHECK (author = auth.uid());

CREATE TABLE public.waitlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client text NOT NULL,
  pet text NOT NULL DEFAULT '',
  service text NOT NULL DEFAULT 'Consulta general',
  zone text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'esperando',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.waitlist TO authenticated;
GRANT ALL ON public.waitlist TO service_role;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wait staff" ON public.waitlist FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.shifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id text REFERENCES public.staff_members(id) ON DELETE CASCADE,
  day text NOT NULL,
  start_time text NOT NULL DEFAULT '08:00',
  end_time text NOT NULL DEFAULT '17:00',
  kind text NOT NULL DEFAULT 'turno',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
GRANT ALL ON public.shifts TO service_role;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shifts read" ON public.shifts FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "shifts write" ON public.shifts FOR ALL TO authenticated USING (public.is_ops(auth.uid())) WITH CHECK (public.is_ops(auth.uid()));

INSERT INTO public.waitlist (client, pet, service, zone, note) VALUES
 ('Carolina Pérez', 'Max', 'Vacunación', 'Zona Norte', 'Prefiere mañanas'),
 ('Andrés Gómez', 'Mia', 'Control preventivo', 'Zona Sur', 'Cualquier día');
INSERT INTO public.shifts (staff_id, day, start_time, end_time, kind)
 SELECT id, 'Lunes', '08:00', '16:00', 'turno' FROM public.staff_members;