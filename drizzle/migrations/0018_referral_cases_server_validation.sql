CREATE TABLE public.referral_cases (
  referral_id text PRIMARY KEY REFERENCES public.referrals(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'PROPOSED',
  version integer NOT NULL DEFAULT 1,
  offers jsonb NOT NULL DEFAULT '[]'::jsonb,
  choice text,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_by uuid DEFAULT auth.uid(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.referral_cases TO authenticated;
GRANT ALL ON public.referral_cases TO service_role;
ALTER TABLE public.referral_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rc read" ON public.referral_cases FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()));
CREATE POLICY "rc insert" ON public.referral_cases FOR INSERT TO authenticated WITH CHECK (public.is_ops(auth.uid()) OR public.is_clinical(auth.uid()));
CREATE POLICY "rc update" ON public.referral_cases FOR UPDATE TO authenticated USING (public.is_ops(auth.uid()) OR public.is_clinical(auth.uid())) WITH CHECK (public.is_ops(auth.uid()) OR public.is_clinical(auth.uid()));

CREATE TABLE public.referral_choices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id text NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  offer_id text NOT NULL,
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.referral_choices TO authenticated;
GRANT ALL ON public.referral_choices TO service_role;
ALTER TABLE public.referral_choices ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.offer_is_live(_ref text, _offer text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.referral_cases c, jsonb_array_elements(c.offers) o
    WHERE c.referral_id = _ref AND c.state IN ('AWAITING_CUSTOMER_SELECTION','OPTIONS_SENT_TO_CUSTOMER')
      AND o->>'id' = _offer AND (o->>'expiresAt')::timestamptz > now() AND ((o->>'date') || 'T' || (o->>'time'))::timestamp > now())
$$;
CREATE OR REPLACE FUNCTION public.owns_referral(_ref text) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.referrals r JOIN public.pets p ON p.id = r.pet_id OR (r.pet_id IS NULL AND p.name = r.pet) WHERE r.id = _ref AND p.owner_id = auth.uid())
$$;
REVOKE EXECUTE ON FUNCTION public.offer_is_live(text,text), public.owns_referral(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.offer_is_live(text,text), public.owns_referral(text) TO authenticated;

CREATE POLICY "rch read" ON public.referral_choices FOR SELECT TO authenticated USING (owner_id = auth.uid() OR (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid())));
CREATE POLICY "rch insert" ON public.referral_choices FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.owns_referral(referral_id) AND public.offer_is_live(referral_id, offer_id));

CREATE OR REPLACE FUNCTION public.my_referral_offers() RETURNS TABLE(referral_id text, pet text, specialty text, offers jsonb, chosen text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.id, r.pet, r.specialty,
    COALESCE((SELECT jsonb_agg(o) FROM jsonb_array_elements(c.offers) o WHERE (o->>'expiresAt')::timestamptz > now()), '[]'::jsonb),
    (SELECT ch.offer_id FROM public.referral_choices ch WHERE ch.referral_id = r.id AND ch.owner_id = auth.uid() ORDER BY ch.created_at DESC LIMIT 1)
  FROM public.referral_cases c JOIN public.referrals r ON r.id = c.referral_id
  WHERE c.state IN ('AWAITING_CUSTOMER_SELECTION','OPTIONS_SENT_TO_CUSTOMER','SLOT_SELECTED','PENDING_EXTERNAL_CONFIRMATION') AND public.owns_referral(r.id)
$$;
REVOKE EXECUTE ON FUNCTION public.my_referral_offers() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.my_referral_offers() TO authenticated;

CREATE OR REPLACE FUNCTION public.guard_referral_case() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE prev text; ok boolean := false; clin boolean := public.is_clinical(auth.uid()); ops boolean := public.is_ops(auth.uid()); note text;
BEGIN
  prev := CASE WHEN TG_OP = 'INSERT' THEN 'PROPOSED' ELSE OLD.state END;
  IF TG_OP = 'INSERT' THEN IF NEW.version <> 1 THEN RAISE EXCEPTION 'Versión inicial inválida'; END IF;
  ELSIF NEW.version <> OLD.version + 1 THEN RAISE EXCEPTION 'La remisión cambió; recarga antes de continuar'; END IF;
  note := NULLIF(trim(COALESCE(NEW.history->-1->>'note','')), '');
  IF prev = NEW.state THEN
    IF NEW.state IN ('OPTIONS_PREPARED','AVAILABILITY_RECEIVED') AND ops THEN ok := true; END IF;
    IF TG_OP = 'INSERT' AND NEW.state = 'PROPOSED' THEN ok := true; END IF;
  ELSE
    ok := CASE NEW.state
      WHEN 'PENDING_CLINICAL_APPROVAL' THEN prev = 'PROPOSED' AND (clin OR ops)
      WHEN 'APPROVED' THEN prev IN ('PROPOSED','PENDING_CLINICAL_APPROVAL') AND clin
      WHEN 'SPECIALIST_CONTACT_PENDING' THEN prev IN ('APPROVED','PENDING_COORDINATION') AND ops
      WHEN 'AVAILABILITY_REQUESTED' THEN prev IN ('SPECIALIST_CONTACT_PENDING','RESCHEDULE_REQUESTED') AND ops
      WHEN 'AVAILABILITY_RECEIVED' THEN prev = 'AVAILABILITY_REQUESTED' AND ops
      WHEN 'OPTIONS_PREPARED' THEN prev = 'AVAILABILITY_RECEIVED' AND ops
      WHEN 'AWAITING_CUSTOMER_SELECTION' THEN prev = 'OPTIONS_PREPARED' AND ops
      WHEN 'SLOT_SELECTED' THEN prev IN ('AWAITING_CUSTOMER_SELECTION','OPTIONS_SENT_TO_CUSTOMER') AND ops
      WHEN 'PENDING_EXTERNAL_CONFIRMATION' THEN prev = 'SLOT_SELECTED' AND ops
      WHEN 'APPOINTMENT_CONFIRMED' THEN prev = 'PENDING_EXTERNAL_CONFIRMATION' AND ops
      WHEN 'RESCHEDULE_REQUESTED' THEN prev IN ('APPOINTMENT_CONFIRMED','APPOINTMENT_PENDING') AND ops
      WHEN 'ATTENDANCE_RECORDED' THEN prev IN ('APPOINTMENT_CONFIRMED','APPOINTMENT_PENDING') AND ops
      WHEN 'REPORT_PENDING' THEN prev = 'ATTENDANCE_RECORDED' AND ops
      WHEN 'REPORT_RECEIVED' THEN prev IN ('REPORT_PENDING','ATTENDANCE_RECORDED') AND ops
      WHEN 'PROFESSIONAL_REVIEW_PENDING' THEN prev = 'REPORT_RECEIVED' AND (ops OR clin)
      WHEN 'FOLLOW_UP_SCHEDULED' THEN prev = 'PROFESSIONAL_REVIEW_PENDING' AND clin
      WHEN 'REFERRAL_CLOSED' THEN prev = 'FOLLOW_UP_SCHEDULED' AND (ops OR clin)
      WHEN 'CANCELLED' THEN prev NOT IN ('REFERRAL_CLOSED','CANCELLED','ATTENDANCE_RECORDED','REPORT_PENDING','REPORT_RECEIVED','PROFESSIONAL_REVIEW_PENDING','FOLLOW_UP_SCHEDULED') AND (ops OR clin)
      ELSE false END;
    IF NOT ok AND NEW.state IN ('APPROVED','FOLLOW_UP_SCHEDULED') AND NOT clin THEN RAISE EXCEPTION 'Solo un profesional clínico autorizado puede hacerlo'; END IF;
  END IF;
  IF NOT ok THEN RAISE EXCEPTION 'Paso no permitido: % → %', prev, NEW.state; END IF;
  IF prev <> NEW.state AND NEW.state IN ('APPOINTMENT_CONFIRMED','ATTENDANCE_RECORDED','FOLLOW_UP_SCHEDULED','RESCHEDULE_REQUESTED','CANCELLED') AND note IS NULL THEN
    RAISE EXCEPTION 'Registra la evidencia o el motivo'; END IF;
  IF NEW.state IN ('OPTIONS_PREPARED','AWAITING_CUSTOMER_SELECTION') AND prev <> NEW.state AND NOT EXISTS (
    SELECT 1 FROM jsonb_array_elements(NEW.offers) o WHERE (o->>'expiresAt')::timestamptz > now()) THEN
    RAISE EXCEPTION 'Agrega al menos un horario vigente'; END IF;
  IF NEW.state = 'SLOT_SELECTED' AND prev <> 'SLOT_SELECTED' AND NOT (
    EXISTS (SELECT 1 FROM public.referral_choices ch WHERE ch.referral_id = NEW.referral_id AND ch.offer_id = NEW.choice)
    AND EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.offers) o WHERE o->>'id' = NEW.choice AND (o->>'expiresAt')::timestamptz > now())) THEN
    RAISE EXCEPTION 'La opción elegida no existe, no la eligió el cliente o ya venció'; END IF;
  NEW.updated_by := auth.uid(); NEW.updated_at := now();
  RETURN NEW;
END $$;
CREATE TRIGGER guard_referral_case BEFORE INSERT OR UPDATE ON public.referral_cases FOR EACH ROW EXECUTE FUNCTION public.guard_referral_case();

CREATE TABLE public.referral_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id text REFERENCES public.referrals(id) ON DELETE CASCADE,
  pet_id text REFERENCES public.pets(id),
  title text NOT NULL,
  due_at timestamptz NOT NULL,
  assignee text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pendiente',
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.referral_reminders TO authenticated;
GRANT ALL ON public.referral_reminders TO service_role;
ALTER TABLE public.referral_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rr all" ON public.referral_reminders FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()));

CREATE UNIQUE INDEX records_idempotency_key_uniq ON public.records ((data->>'idempotencyKey')) WHERE data ? 'idempotencyKey';