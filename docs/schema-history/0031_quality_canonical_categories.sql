CREATE OR REPLACE FUNCTION public.quality_checked_command(command jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid:=auth.uid(); p jsonb:=command->'payload'; act text:=command->>'action'; k text:=command->>'kind'; eid uuid; r public.quality_items; q jsonb; v jsonb; sv public.quality_items; inv public.quality_items;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
 IF jsonb_typeof(command) IS DISTINCT FROM 'object' OR jsonb_typeof(p) IS DISTINCT FROM 'object' OR length(command::text)>100000 OR length(COALESCE(command->>'idempotencyKey','')) NOT BETWEEN 8 AND 200 OR length(COALESCE(btrim(command->>'reason'),'')) NOT BETWEEN 3 AND 2000 OR jsonb_typeof(command->'expectedVersion') IS DISTINCT FROM 'number' OR COALESCE(command->>'expectedVersion','') !~ '^[0-9]+$' THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
 eid:=(command->>'entityId')::uuid;IF eid IS NULL THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
 IF COALESCE(act,'') NOT IN ('create','transition','clinical_review','feedback','consent','invite','respond') OR COALESCE(k,'') NOT IN ('complaints','surveys','education','improvements','standards','consent','invitation','response') THEN RAISE EXCEPTION 'INTEGRATION_UNAVAILABLE';END IF;
 IF act IN ('create','invite','respond') AND (command->>'expectedVersion')::integer<>0 THEN RAISE EXCEPTION 'STALE_DATA';END IF;
 IF act='create' THEN
  IF k='complaints' THEN
   IF COALESCE(p->>'category','') NOT IN ('Demora','Comunicación','Reprogramación','Cancelación','Cobro','Atención administrativa','Trato recibido','Documentación','Coordinación de especialista','Otro motivo') OR jsonb_typeof(p->'clinical') IS DISTINCT FROM 'boolean' OR length(COALESCE(p->>'description',''))>5000 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
  ELSIF k='surveys' THEN
   IF jsonb_typeof(p->'questions') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
   FOR q IN SELECT value FROM jsonb_array_elements(p->'questions') LOOP
    IF COALESCE(q->>'type','') NOT IN ('CSAT','NPS','TEXT','CHOICE') THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
    IF q->>'type'='CHOICE' THEN
     IF jsonb_typeof(q->'options') IS DISTINCT FROM 'array' OR jsonb_array_length(q->'options') NOT BETWEEN 2 AND 20 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
     FOR v IN SELECT value FROM jsonb_array_elements(q->'options') LOOP IF jsonb_typeof(v)<>'string' OR length(btrim(v#>>'{}'))<1 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;END LOOP;
     IF (SELECT count(DISTINCT x) FROM jsonb_array_elements(q->'options') x)<>jsonb_array_length(q->'options') THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
    END IF;
   END LOOP;
  ELSIF k='improvements' AND length(COALESCE(p->>'assignedTo',''))=0 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';
  ELSIF k='standards' AND length(COALESCE(btrim(p->>'body'),''))<10 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';
  END IF;
 END IF;
 IF act IN ('transition','feedback','clinical_review') THEN
  SELECT * INTO r FROM public.quality_items WHERE id=eid FOR UPDATE;
  IF r.id IS NULL OR k IS DISTINCT FROM r.kind THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
  IF r.kind='education' AND NOT public.is_director(uid) AND (r.assigned_user_id IS DISTINCT FROM uid OR NOT public.has_any_role(uid,ARRAY['luis','veterinario']::public.app_role[])) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
  IF act='feedback' AND r.state NOT IN ('RESOLUTION_PROPOSED','RESOLUTION_CONFIRMED','CLOSED') THEN RAISE EXCEPTION 'INVALID_STATE_TRANSITION';END IF;
  IF r.kind='complaints' AND act='transition' AND p->>'state' IN ('RESOLUTION_CONFIRMED','CLOSED') AND COALESCE((r.payload->>'clinical')::boolean,false) AND EXISTS(SELECT 1 FROM public.quality_audit a WHERE a.entity_id=eid AND a.action='transition' AND a.new_payload->>'state'='REOPENED' AND a.at>COALESCE((SELECT max(at) FROM public.quality_audit WHERE entity_id=eid AND action='clinical_review'),'-infinity'::timestamptz)) THEN RAISE EXCEPTION 'PROFESSIONAL_REVIEW_REQUIRED';END IF;
 END IF;
 IF act='respond' THEN
  SELECT * INTO inv FROM public.quality_items WHERE id=(p->>'invitationId')::uuid;
  SELECT * INTO sv FROM public.quality_items WHERE id=(inv.payload->>'surveyId')::uuid;
  IF inv.owner_id IS DISTINCT FROM uid THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
  IF jsonb_typeof(p->'answers') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
  IF EXISTS(SELECT 1 FROM jsonb_object_keys(p->'answers') a WHERE NOT EXISTS(SELECT 1 FROM jsonb_array_elements(sv.payload->'questions') q WHERE q->>'id'=a)) THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
 END IF;
 RETURN public.quality_command(command);
END;$$;