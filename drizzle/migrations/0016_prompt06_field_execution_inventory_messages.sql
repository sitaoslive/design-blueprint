CREATE TABLE public.visit_executions (
  visit_id text PRIMARY KEY REFERENCES public.visits(id) ON DELETE CASCADE,
  state text NOT NULL DEFAULT 'ASSIGNED',
  version integer NOT NULL DEFAULT 1,
  prep_checked text[] NOT NULL DEFAULT '{}',
  reason text,
  stamps jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.visit_executions TO authenticated;
GRANT ALL ON public.visit_executions TO service_role;
ALTER TABLE public.visit_executions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exec read" ON public.visit_executions FOR SELECT TO authenticated
  USING (public.can_see_visit((SELECT v.staff_id FROM public.visits v WHERE v.id = visit_id)));
CREATE POLICY "exec insert" ON public.visit_executions FOR INSERT TO authenticated
  WITH CHECK (public.can_see_visit((SELECT v.staff_id FROM public.visits v WHERE v.id = visit_id)));
CREATE POLICY "exec update" ON public.visit_executions FOR UPDATE TO authenticated
  USING (public.can_see_visit((SELECT v.staff_id FROM public.visits v WHERE v.id = visit_id)));

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
  IF NEW.state = 'READY_TO_DEPART' THEN
    SELECT v.prep INTO prep FROM public.visits v WHERE v.id = NEW.visit_id;
    IF NOT (coalesce(prep,'{}') <@ NEW.prep_checked) THEN RAISE EXCEPTION 'Completa la preparación antes de salir'; END IF;
  END IF;
  NEW.stamps := OLD.stamps || jsonb_build_object(NEW.state, now());
  RETURN NEW;
END $$;
CREATE TRIGGER visit_executions_guard BEFORE INSERT OR UPDATE ON public.visit_executions FOR EACH ROW EXECUTE FUNCTION public.guard_visit_execution();

CREATE TABLE public.inventory_reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id text NOT NULL REFERENCES public.inventory_items(id),
  visit_id text REFERENCES public.visits(id) ON DELETE SET NULL,
  qty integer NOT NULL CHECK (qty > 0),
  status text NOT NULL DEFAULT 'reservado' CHECK (status IN ('reservado','consumido','liberado')),
  idempotency_key text NOT NULL UNIQUE,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.inventory_reservations TO authenticated;
GRANT ALL ON public.inventory_reservations TO service_role;
ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reservations read" ON public.inventory_reservations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE OR REPLACE FUNCTION public.reserve_supply(_item text, _visit text, _qty integer, _key text) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s integer; r integer; rid uuid;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT id INTO rid FROM public.inventory_reservations WHERE idempotency_key = _key;
  IF rid IS NOT NULL THEN RETURN rid; END IF;
  IF _qty IS NULL OR _qty <= 0 THEN RAISE EXCEPTION 'Cantidad inválida'; END IF;
  SELECT stock INTO s FROM public.inventory_items WHERE id = _item FOR UPDATE;
  IF s IS NULL THEN RAISE EXCEPTION 'Insumo no encontrado'; END IF;
  SELECT coalesce(sum(qty),0) INTO r FROM public.inventory_reservations WHERE item_id = _item AND status = 'reservado';
  IF s - r < _qty THEN RAISE EXCEPTION 'No hay existencias suficientes (disponibles %)', s - r; END IF;
  INSERT INTO public.inventory_reservations(item_id, visit_id, qty, idempotency_key, created_by) VALUES (_item, _visit, _qty, _key, auth.uid()) RETURNING id INTO rid;
  RETURN rid;
END $$;

CREATE OR REPLACE FUNCTION public.settle_reservation(_id uuid, _consume boolean) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE rec public.inventory_reservations%ROWTYPE;
BEGIN
  IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  SELECT * INTO rec FROM public.inventory_reservations WHERE id = _id FOR UPDATE;
  IF rec.id IS NULL THEN RAISE EXCEPTION 'Reserva no encontrada'; END IF;
  IF rec.status <> 'reservado' THEN RETURN rec.status; END IF;
  IF _consume THEN
    UPDATE public.inventory_items SET stock = stock - rec.qty WHERE id = rec.item_id AND stock >= rec.qty;
    IF NOT FOUND THEN RAISE EXCEPTION 'Existencias insuficientes para consumir'; END IF;
  END IF;
  UPDATE public.inventory_reservations SET status = CASE WHEN _consume THEN 'consumido' ELSE 'liberado' END, updated_at = now() WHERE id = _id;
  RETURN CASE WHEN _consume THEN 'consumido' ELSE 'liberado' END;
END $$;
REVOKE ALL ON FUNCTION public.reserve_supply(text, text, integer, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.settle_reservation(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reserve_supply(text, text, integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.settle_reservation(uuid, boolean) TO authenticated;

CREATE TABLE public.staff_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user uuid NOT NULL DEFAULT auth.uid(),
  from_name text NOT NULL DEFAULT '',
  to_staff text REFERENCES public.staff_members(id),
  visit_id text,
  body text NOT NULL CHECK (length(btrim(body)) > 0),
  urgent boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.staff_messages TO authenticated;
GRANT ALL ON public.staff_messages TO service_role;
ALTER TABLE public.staff_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "msgs read" ON public.staff_messages FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()) AND (to_staff IS NULL OR from_user = auth.uid() OR to_staff IN (SELECT public.my_staff_ids()) OR public.is_ops(auth.uid()) OR public.is_director(auth.uid())));
CREATE POLICY "msgs send" ON public.staff_messages FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()) AND from_user = auth.uid());
CREATE POLICY "msgs mark read" ON public.staff_messages FOR UPDATE TO authenticated
  USING (to_staff IN (SELECT public.my_staff_ids()));