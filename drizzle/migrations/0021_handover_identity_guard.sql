CREATE OR REPLACE FUNCTION public.guard_handover_identity() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF auth.uid() IS NULL THEN RETURN NEW; END IF;
 IF TG_OP='UPDATE' AND OLD.kind='handover' AND NEW.kind<>'handover' THEN RAISE EXCEPTION 'No puedes cambiar el tipo de una entrega'; END IF;
 IF NEW.kind<>'handover' THEN RETURN NEW; END IF;
 IF NOT public.is_staff(auth.uid()) THEN RAISE EXCEPTION 'Solo el equipo puede enviar entregas'; END IF;
 IF TG_OP='INSERT' THEN
  IF coalesce(NEW.data->>'from','')='' OR coalesce(NEW.data->>'to','')='' OR NEW.data->>'from'=NEW.data->>'to' OR NOT EXISTS (SELECT 1 FROM public.staff_members m WHERE m.id=NEW.data->>'from' AND m.user_id=auth.uid()) OR NOT EXISTS (SELECT 1 FROM public.staff_members m WHERE m.id=NEW.data->>'to') THEN RAISE EXCEPTION 'La entrega debe salir de tu perfil hacia otra persona del equipo'; END IF;
  IF NEW.status<>'PENDIENTE_ACEPTACION' OR jsonb_typeof(NEW.data->'items') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'La entrega debe incluir sus pendientes y esperar aceptación'; END IF;
  IF jsonb_array_length(NEW.data->'items')=0 THEN RAISE EXCEPTION 'La entrega necesita al menos un pendiente'; END IF;
 ELSE
  IF NOT EXISTS (SELECT 1 FROM public.staff_members m WHERE m.id=OLD.data->>'to' AND m.user_id=auth.uid()) OR OLD.status<>'PENDIENTE_ACEPTACION' OR NEW.status NOT IN ('ACEPTADO','RECHAZADO') THEN RAISE EXCEPTION 'Solo quien recibe puede responder una entrega pendiente'; END IF;
  IF NEW.scope<>OLD.scope OR NEW.created_by IS DISTINCT FROM OLD.created_by OR NEW.owner_id IS DISTINCT FROM OLD.owner_id OR NEW.ref_id IS DISTINCT FROM OLD.ref_id OR NEW.title<>OLD.title OR NEW.detail<>OLD.detail OR (NEW.data-'status'-'answeredAt') IS DISTINCT FROM (OLD.data-'status'-'answeredAt') THEN RAISE EXCEPTION 'No puedes cambiar los pendientes ni participantes de una entrega'; END IF;
 END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION public.guard_handover_identity() FROM PUBLIC,anon;
CREATE TRIGGER records_handover_identity_guard BEFORE INSERT OR UPDATE ON public.records FOR EACH ROW EXECUTE FUNCTION public.guard_handover_identity();