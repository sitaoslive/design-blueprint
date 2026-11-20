CREATE OR REPLACE FUNCTION public.aux_record_visible(_creator uuid, _kind text, _data jsonb) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT _creator=auth.uid() OR (_kind='handover' AND (_data->>'to' IN (SELECT public.my_staff_ids()) OR _data->>'from' IN (SELECT public.my_staff_ids()))) $$;
REVOKE ALL ON FUNCTION public.aux_record_visible(uuid,text,jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.aux_record_visible(uuid,text,jsonb) TO authenticated,service_role;
DROP POLICY IF EXISTS "rec read" ON public.records;
CREATE POLICY "rec read" ON public.records FOR SELECT TO authenticated USING ((scope='client' AND owner_id=auth.uid()) OR (scope='staff' AND public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR public.aux_record_visible(created_by,kind,data))) OR (scope='client' AND public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid())) OR (scope='director' AND public.is_director(auth.uid())));
DROP POLICY IF EXISTS "rec update" ON public.records;
CREATE POLICY "rec update" ON public.records FOR UPDATE TO authenticated USING ((scope IN ('staff','client') AND public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR (scope='staff' AND public.aux_record_visible(created_by,kind,data)))) OR (scope='director' AND public.is_director(auth.uid()))) WITH CHECK ((scope IN ('staff','client') AND public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR (scope='staff' AND public.aux_record_visible(created_by,kind,data)))) OR (scope='director' AND public.is_director(auth.uid())));
CREATE OR REPLACE FUNCTION public.guard_aux_record() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF NOT public.is_aux_only(auth.uid()) THEN RETURN NEW; END IF;
 IF NEW.scope<>'staff' OR NEW.kind NOT IN ('nota_campo','checklist','borrador_tarea','cobro_campo','handover','cierre_jornada','solicitud_ayuda','mensaje') THEN RAISE EXCEPTION 'Este registro no pertenece a las funciones del auxiliar'; END IF;
 IF NEW.kind IN ('nota_campo','checklist','borrador_tarea','cobro_campo') AND NEW.ref_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.visits v WHERE v.id=NEW.ref_id AND v.staff_id IN (SELECT public.my_staff_ids())) THEN RAISE EXCEPTION 'Solo puedes registrar acciones de tus visitas'; END IF;
 IF TG_OP='UPDATE' AND (NEW.kind<>OLD.kind OR NEW.scope<>OLD.scope OR NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.owner_id IS DISTINCT FROM OLD.owner_id OR NEW.ref_id IS DISTINCT FROM OLD.ref_id) THEN RAISE EXCEPTION 'No puedes cambiar la identidad ni el alcance del registro'; END IF;
 IF NEW.kind='handover' THEN
  IF TG_OP='INSERT' AND (NEW.data->>'from' NOT IN (SELECT public.my_staff_ids()) OR NEW.status<>'PENDIENTE_ACEPTACION') THEN RAISE EXCEPTION 'La entrega debe salir de tu perfil y esperar aceptación'; END IF;
  IF TG_OP='UPDATE' AND (OLD.data->>'to' NOT IN (SELECT public.my_staff_ids()) OR OLD.status<>'PENDIENTE_ACEPTACION' OR NEW.status NOT IN ('ACEPTADO','RECHAZADO') OR (NEW.data - 'status' - 'answeredAt') IS DISTINCT FROM (OLD.data - 'status' - 'answeredAt') OR NEW.title<>OLD.title OR NEW.detail<>OLD.detail) THEN RAISE EXCEPTION 'Solo quien recibe puede responder sin cambiar los pendientes'; END IF;
 END IF;
 RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.guard_aux_record() FROM PUBLIC,anon;
CREATE TRIGGER records_aux_guard BEFORE INSERT OR UPDATE ON public.records FOR EACH ROW EXECUTE FUNCTION public.guard_aux_record();
CREATE OR REPLACE FUNCTION public.guard_aux_visit() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF NOT public.is_aux_only(auth.uid()) THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' THEN
  IF NOT (public.owns_pet(NEW.pet_id) AND NEW.status='pendiente' AND NEW.staff_id IS NULL AND NEW.step='programada') THEN RAISE EXCEPTION 'Un auxiliar no puede crear citas operativas'; END IF;
 ELSE
  IF NEW.staff_id IS DISTINCT FROM OLD.staff_id OR NEW.pet_id IS DISTINCT FROM OLD.pet_id OR NEW.service<>OLD.service OR NEW.date<>OLD.date OR NEW.time<>OLD.time OR NEW.zone<>OLD.zone OR NEW.address<>OLD.address OR NEW.okvet_ref IS DISTINCT FROM OLD.okvet_ref OR NEW.prep IS DISTINCT FROM OLD.prep THEN RAISE EXCEPTION 'Solo Coordinación puede cambiar la asignación o preparación requerida'; END IF;
  IF NEW.step IS DISTINCT FROM OLD.step AND NEW.step NOT IN ('en_desplazamiento','llegada') THEN RAISE EXCEPTION 'Un auxiliar no puede registrar atención clínica'; END IF;
  IF NEW.status IS DISTINCT FROM OLD.status AND NEW.status<>'en_curso' THEN RAISE EXCEPTION 'Un auxiliar no puede confirmar ni cerrar una cita'; END IF;
 END IF;
 RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.guard_aux_visit() FROM PUBLIC,anon;
CREATE TRIGGER visits_aux_guard BEFORE INSERT OR UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.guard_aux_visit();
DROP POLICY IF EXISTS "inv staff" ON public.inventory_items;
CREATE POLICY "inventory staff read" ON public.inventory_items FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "inventory authorized write" ON public.inventory_items FOR ALL TO authenticated USING (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid())) WITH CHECK (public.is_staff(auth.uid()) AND NOT public.is_aux_only(auth.uid()));
DROP POLICY IF EXISTS "reservations read" ON public.inventory_reservations;
CREATE POLICY "reservations read" ON public.inventory_reservations FOR SELECT TO authenticated USING (public.is_staff(auth.uid()) AND (NOT public.is_aux_only(auth.uid()) OR EXISTS (SELECT 1 FROM public.visits v WHERE v.id=visit_id AND v.staff_id IN (SELECT public.my_staff_ids()))));
CREATE OR REPLACE FUNCTION public.reserve_supply(_item text,_visit text,_qty integer,_key text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE s integer;r integer;rid uuid;existing public.inventory_reservations%ROWTYPE;expiry text; BEGIN
 IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'No autorizado'; END IF;
 IF NOT EXISTS (SELECT 1 FROM public.visits v WHERE v.id=_visit AND public.can_see_visit(v.staff_id) AND v.status NOT IN ('cancelada','finalizada')) THEN RAISE EXCEPTION 'No puedes apartar insumos para esta visita'; END IF;
 IF _qty IS NULL OR _qty<=0 OR coalesce(btrim(_key),'')='' THEN RAISE EXCEPTION 'Cantidad o clave inválida'; END IF;
 SELECT stock,expires INTO s,expiry FROM public.inventory_items WHERE id=_item FOR UPDATE;
 IF s IS NULL THEN RAISE EXCEPTION 'Insumo no encontrado'; END IF;
 IF expiry ~ '^\d{4}-\d{2}-\d{2}$' AND expiry::date<current_date THEN RAISE EXCEPTION 'No puedes apartar un lote vencido'; END IF;
 SELECT * INTO existing FROM public.inventory_reservations WHERE idempotency_key=_key;
 IF existing.id IS NOT NULL THEN IF existing.item_id<>_item OR existing.visit_id IS DISTINCT FROM _visit OR existing.qty<>_qty THEN RAISE EXCEPTION 'La clave ya corresponde a otra reserva'; END IF; RETURN existing.id; END IF;
 SELECT coalesce(sum(qty),0) INTO r FROM public.inventory_reservations WHERE item_id=_item AND status='reservado';
 IF s-r<_qty THEN RAISE EXCEPTION 'No hay existencias suficientes (disponibles %)',s-r; END IF;
 INSERT INTO public.inventory_reservations(item_id,visit_id,qty,idempotency_key,created_by) VALUES (_item,_visit,_qty,_key,auth.uid()) RETURNING id INTO rid; RETURN rid; END $$;
CREATE OR REPLACE FUNCTION public.settle_reservation(_id uuid,_consume boolean) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE rec public.inventory_reservations%ROWTYPE; BEGIN
 IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'No autorizado'; END IF;
 SELECT * INTO rec FROM public.inventory_reservations WHERE id=_id FOR UPDATE;
 IF rec.id IS NULL THEN RAISE EXCEPTION 'Reserva no encontrada'; END IF;
 IF public.is_aux_only(auth.uid()) AND NOT EXISTS (SELECT 1 FROM public.visits v WHERE v.id=rec.visit_id AND v.staff_id IN (SELECT public.my_staff_ids())) THEN RAISE EXCEPTION 'Solo puedes gestionar insumos de tus visitas'; END IF;
 IF rec.status<>'reservado' THEN RETURN rec.status; END IF;
 IF _consume THEN UPDATE public.inventory_items SET stock=stock-rec.qty WHERE id=rec.item_id AND stock>=rec.qty; IF NOT FOUND THEN RAISE EXCEPTION 'Existencias insuficientes para consumir'; END IF; END IF;
 UPDATE public.inventory_reservations SET status=CASE WHEN _consume THEN 'consumido' ELSE 'liberado' END,updated_at=now() WHERE id=_id; RETURN CASE WHEN _consume THEN 'consumido' ELSE 'liberado' END; END $$;
REVOKE ALL ON FUNCTION public.reserve_supply(text,text,integer,text),public.settle_reservation(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.reserve_supply(text,text,integer,text),public.settle_reservation(uuid,boolean) TO authenticated;
CREATE OR REPLACE FUNCTION public.inventory_availability() RETURNS TABLE(item_id text,reserved bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT i.id,coalesce(sum(r.qty) FILTER (WHERE r.status='reservado'),0) FROM public.inventory_items i LEFT JOIN public.inventory_reservations r ON r.item_id=i.id WHERE public.is_staff(auth.uid()) GROUP BY i.id $$;
REVOKE ALL ON FUNCTION public.inventory_availability() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.inventory_availability() TO authenticated,service_role;
CREATE OR REPLACE FUNCTION public.guard_message_receipt() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN IF (to_jsonb(NEW)-'read_at') IS DISTINCT FROM (to_jsonb(OLD)-'read_at') THEN RAISE EXCEPTION 'Solo puedes marcar la lectura del mensaje'; END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.guard_message_receipt() FROM PUBLIC,anon;
CREATE TRIGGER staff_messages_receipt_guard BEFORE UPDATE ON public.staff_messages FOR EACH ROW EXECUTE FUNCTION public.guard_message_receipt();