CREATE OR REPLACE FUNCTION public.guard_visit_execution() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE ok boolean; prep text[];
BEGIN
  NEW.updated_by := auth.uid(); NEW.updated_at := now();
  IF TG_OP = 'INSERT' THEN
    IF NEW.state NOT IN ('ASSIGNED','PREPARING') THEN RAISE EXCEPTION 'La ejecución debe empezar asignada o en preparación'; END IF;
    NEW.version := 1; NEW.stamps := jsonb_build_object(NEW.state, now()); RETURN NEW;
  END IF;
  IF NEW.state = OLD.state THEN
    IF NEW.version <> OLD.version THEN RAISE EXCEPTION 'Versión inválida'; END IF;
    NEW.stamps := OLD.stamps; RETURN NEW;
  END IF;
  IF NEW.version <> OLD.version + 1 THEN RAISE EXCEPTION 'La visita cambió mientras la tenías abierta'; END IF;
  ok := (OLD.state, NEW.state) IN (
    ('ASSIGNED','PREPARING'),('PREPARING','READY_TO_DEPART'),('READY_TO_DEPART','EN_ROUTE'),('ASSIGNED','EN_ROUTE'),
    ('EN_ROUTE','ARRIVED'),('ARRIVED','IN_SERVICE'),('IN_SERVICE','SERVICE_FINISHED'),('SERVICE_FINISHED','ADMINISTRATIVE_REVIEW'),
    ('ADMINISTRATIVE_REVIEW','ADMINISTRATIVELY_COMPLETED'),
    ('ASSIGNED','INCIDENT_REPORTED'),('PREPARING','INCIDENT_REPORTED'),('READY_TO_DEPART','INCIDENT_REPORTED'),('EN_ROUTE','INCIDENT_REPORTED'),('ARRIVED','INCIDENT_REPORTED'),('IN_SERVICE','INCIDENT_REPORTED'),
    ('ASSIGNED','NOT_PERFORMED'),('PREPARING','NOT_PERFORMED'),('READY_TO_DEPART','NOT_PERFORMED'),('EN_ROUTE','NOT_PERFORMED'),('ARRIVED','NOT_PERFORMED'),('INCIDENT_REPORTED','NOT_PERFORMED'));
  IF NOT ok THEN RAISE EXCEPTION 'Paso no permitido: % → %', OLD.state, NEW.state; END IF;
  IF NEW.state IN ('IN_SERVICE','SERVICE_FINISHED','ADMINISTRATIVE_REVIEW') AND (NOT public.is_clinical(auth.uid())) THEN
    RAISE EXCEPTION 'Solo un veterinario puede realizar este paso'; END IF;
  IF NEW.state = 'ADMINISTRATIVELY_COMPLETED' AND NOT (public.is_ops(auth.uid()) OR public.is_director(auth.uid())) THEN
    RAISE EXCEPTION 'Solo Coordinación o Dirección verifican el cierre'; END IF;
  IF NEW.state = 'NOT_PERFORMED' AND NOT (public.is_clinical(auth.uid()) OR public.is_ops(auth.uid())) THEN
    RAISE EXCEPTION 'No tienes permiso para marcar no realizada'; END IF;
  IF NEW.state IN ('NOT_PERFORMED','INCIDENT_REPORTED') AND coalesce(btrim(NEW.reason),'') = '' THEN RAISE EXCEPTION 'Indica el motivo'; END IF;
  IF NEW.state IN ('READY_TO_DEPART','EN_ROUTE') AND OLD.state <> 'READY_TO_DEPART' THEN
    SELECT v.prep INTO prep FROM public.visits v WHERE v.id = NEW.visit_id;
    IF NOT (coalesce(prep,'{}') <@ NEW.prep_checked) THEN RAISE EXCEPTION 'Completa la preparación antes de salir'; END IF;
  END IF;
  NEW.stamps := OLD.stamps || jsonb_build_object(NEW.state, now());
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.guard_field_collection() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.kind = 'cobro_campo' AND NEW.status <> 'informado' THEN RAISE EXCEPTION 'Un cobro de campo se registra como informado'; END IF;
    RETURN NEW;
  END IF;
  IF OLD.kind <> 'cobro_campo' THEN RETURN NEW; END IF;
  IF NEW.kind <> OLD.kind OR NEW.data IS DISTINCT FROM OLD.data OR NEW.ref_id IS DISTINCT FROM OLD.ref_id OR NEW.title <> OLD.title OR NEW.detail <> OLD.detail THEN
    RAISE EXCEPTION 'Un cobro informado no se puede modificar'; END IF;
  IF NEW.status <> OLD.status THEN
    IF OLD.status <> 'informado' OR NEW.status NOT IN ('verificado','rechazado') THEN RAISE EXCEPTION 'Cambio de estado de cobro no permitido'; END IF;
    IF NOT public.has_any_role(auth.uid(), array['finanzas','luis','administrador']::public.app_role[]) THEN RAISE EXCEPTION 'Solo Finanzas o Dirección verifican cobros'; END IF;
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS records_field_collection_guard ON public.records;
CREATE TRIGGER records_field_collection_guard BEFORE INSERT OR UPDATE ON public.records FOR EACH ROW EXECUTE FUNCTION public.guard_field_collection();