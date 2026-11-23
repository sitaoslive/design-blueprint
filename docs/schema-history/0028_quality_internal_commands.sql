CREATE FUNCTION public.quality_command(command jsonb) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid:=auth.uid(); act text:=command->>'action'; k text:=command->>'kind'; eid uuid:=(command->>'entityId')::uuid; ik text:=command->>'idempotencyKey'; why text:=btrim(command->>'reason'); p jsonb:=COALESCE(command->'payload','{}'::jsonb); r public.quality_items; prior public.quality_audit; inv public.quality_items; sv public.quality_items; nextp jsonb; target text:=p->>'state'; nv integer; owner uuid; assigned uuid; result jsonb; graph jsonb; q jsonb; v jsonb; minimum integer; maximum integer; reviewer boolean;
BEGIN
 IF uid IS NULL THEN RAISE EXCEPTION 'UNAUTHORIZED'; END IF;
 IF eid IS NULL OR length(COALESCE(ik,''))<8 OR length(COALESCE(why,''))<3 OR jsonb_typeof(p)<>'object' THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(uid::text||ik,0));
 SELECT * INTO prior FROM public.quality_audit WHERE actor_id=uid AND request_key=ik;
 IF FOUND THEN IF prior.request_hash<>md5(command::text) THEN RAISE EXCEPTION 'DUPLICATE_EVENT'; END IF; RETURN prior.result; END IF;
 SELECT * INTO r FROM public.quality_items WHERE id=eid FOR UPDATE;
 IF act='create' THEN
  IF r.id IS NOT NULL THEN RAISE EXCEPTION 'DUPLICATE_EVENT'; END IF;
  IF k='complaints' THEN
   IF NOT public.is_ops(uid) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
   owner:=(p->>'customerId')::uuid;
   IF NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=owner) OR length(COALESCE(btrim(p->>'description'),''))<10 OR length(COALESCE(btrim(p->>'sourceReference'),''))<1 OR (p->>'dueAt')::timestamptz IS NULL THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
   IF COALESCE(p->>'petId','')<>'' AND NOT EXISTS(SELECT 1 FROM public.pets WHERE id=p->>'petId' AND owner_id=owner) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
   IF COALESCE(p->>'visitId','')<>'' AND NOT EXISTS(SELECT 1 FROM public.visits WHERE id=p->>'visitId' AND pet_id=p->>'petId') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
   target:='NEW';p:=p||jsonb_build_object('plan','','evidence','','customerConfirmation','UNKNOWN','professionalReviewed',false,'solutionImplemented',false,'events','[]'::jsonb,'createdAt',now());
  ELSE
   IF NOT public.is_director(uid) OR k NOT IN ('surveys','education','improvements','standards') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
   IF length(COALESCE(btrim(p->>'title'),''))<3 THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
   target:=CASE WHEN k='improvements' THEN 'IDEA' ELSE 'DRAFT' END;
   p:=p||jsonb_build_object('approvedBy','','reviewer','','reviewedAt','');
   IF k='surveys' THEN
    IF jsonb_typeof(p->'questions') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'questions') NOT BETWEEN 1 AND 20 THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
    IF (SELECT count(DISTINCT x->>'id') FROM jsonb_array_elements(p->'questions') x)<>jsonb_array_length(p->'questions') THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
    FOR q IN SELECT value FROM jsonb_array_elements(p->'questions') LOOP
     IF length(COALESCE(q->>'id',''))<1 OR length(COALESCE(btrim(q->>'label'),''))<3 OR q->>'type' NOT IN ('CSAT','NPS','TEXT','CHOICE') OR jsonb_typeof(q->'required') IS DISTINCT FROM 'boolean' THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
     IF q->>'type'='CHOICE' AND (jsonb_typeof(q->'options') IS DISTINCT FROM 'array' OR jsonb_array_length(q->'options')<2) THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
    END LOOP;
   END IF;
   IF k='education' AND (length(COALESCE(btrim(p->>'body'),''))<10 OR length(COALESCE(btrim(p->>'source'),''))<1 OR jsonb_typeof(p->'clinical') IS DISTINCT FROM 'boolean') THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
   IF k='improvements' AND (length(COALESCE(btrim(p->>'hypothesis'),''))<3 OR length(COALESCE(btrim(p->>'evidence'),''))<3 OR (p->>'dueAt')::timestamptz IS NULL) THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
  END IF;
  IF COALESCE(p->>'assignedTo','')<>'' THEN SELECT user_id INTO assigned FROM public.staff_members WHERE id=p->>'assignedTo';IF assigned IS NULL THEN RAISE EXCEPTION 'DATA_INCOMPLETE: responsable sin cuenta vinculada';END IF; END IF;
  nv:=1;nextp:=p||jsonb_build_object('id',eid,'version',1,'state',target,'updatedAt',now());
  INSERT INTO public.quality_items(id,kind,payload,state,owner_id,assigned_user_id,created_by) VALUES(eid,k,nextp,target,owner,assigned,uid);
 ELSIF act='consent' THEN
  IF NOT public.has_any_role(uid,ARRAY['cliente']::public.app_role[]) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF COALESCE(p->>'purpose','') NOT IN ('operational','appointment','administrative','followup','education','promotion','review','referral','testimonial') OR COALESCE(p->>'channel','') NOT IN ('portal','whatsapp','email','sms','public') OR COALESCE(p->>'status','') NOT IN ('GRANTED','REVOKED') OR length(COALESCE(btrim(p->>'source'),''))<3 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(uid::text||(p->>'purpose')||(p->>'channel'),0));
  SELECT * INTO r FROM public.quality_items WHERE kind='consent' AND owner_id=uid AND payload->>'purpose'=p->>'purpose' AND payload->>'channel'=p->>'channel' ORDER BY version DESC LIMIT 1 FOR UPDATE;
  IF COALESCE(r.version,0)<>COALESCE((command->>'expectedVersion')::integer,-1) THEN RAISE EXCEPTION 'STALE_DATA'; END IF;
  IF r.id IS NOT NULL THEN eid:=r.id; END IF;
  k:='consent';target:=p->>'status';nv:=COALESCE(r.version,0)+1;nextp:=p||jsonb_build_object('id',eid,'version',nv,'customerId',uid,'actorId',uid,'at',now());
  IF r.id IS NULL THEN INSERT INTO public.quality_items(id,kind,payload,state,owner_id,created_by) VALUES(eid,k,nextp,target,uid,uid); ELSE UPDATE public.quality_items SET payload=nextp,state=target,version=nv,updated_at=now() WHERE id=eid; END IF;
 ELSIF act='invite' THEN
  IF NOT public.is_director(uid) THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  SELECT * INTO sv FROM public.quality_items WHERE id=(p->>'surveyId')::uuid AND kind='surveys' FOR UPDATE;
  IF sv.id IS NULL OR sv.state<>'PUBLISHED' THEN RAISE EXCEPTION 'NOT_AUTHORIZED';END IF;
  owner:=(p->>'customerId')::uuid;
  IF NOT EXISTS(SELECT 1 FROM public.visits vi JOIN public.pets pe ON pe.id=vi.pet_id WHERE vi.id=p->>'eventId' AND pe.owner_id=owner AND vi.status='finalizada') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF (p->>'expiresAt')::timestamptz IS NULL OR (p->>'expiresAt')::timestamptz<=now() OR (p->>'expiresAt')::timestamptz>now()+interval '90 days' THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
  IF EXISTS(SELECT 1 FROM public.quality_items WHERE kind='invitation' AND owner_id=owner AND payload->>'surveyId'=sv.id::text AND payload->>'eventId'=p->>'eventId') THEN RAISE EXCEPTION 'DUPLICATE_EVENT'; END IF;
  k:='invitation';target:='OPEN';nv:=1;nextp:=p||jsonb_build_object('id',eid,'version',1,'surveyVersion',sv.payload->'version');
  INSERT INTO public.quality_items(id,kind,payload,state,owner_id,created_by) VALUES(eid,k,nextp,target,owner,uid);
 ELSIF act='respond' THEN
  SELECT * INTO inv FROM public.quality_items WHERE id=(p->>'invitationId')::uuid AND kind='invitation' FOR UPDATE;
  IF inv.id IS NULL OR inv.owner_id<>uid OR NOT public.has_any_role(uid,ARRAY['cliente']::public.app_role[]) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
  IF inv.state<>'OPEN' THEN RAISE EXCEPTION 'DUPLICATE_EVENT'; END IF;
  IF (inv.payload->>'expiresAt')::timestamptz<=now() THEN RAISE EXCEPTION 'STALE_DATA'; END IF;
  SELECT * INTO sv FROM public.quality_items WHERE id=(inv.payload->>'surveyId')::uuid AND kind='surveys' FOR UPDATE;
  IF sv.state<>'PUBLISHED' OR sv.payload->>'version'<>inv.payload->>'surveyVersion' THEN RAISE EXCEPTION 'STALE_DATA'; END IF;
  IF jsonb_typeof(p->'answers') IS DISTINCT FROM 'object' THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
  FOR q IN SELECT value FROM jsonb_array_elements(sv.payload->'questions') LOOP
   v:=p->'answers'->(q->>'id');
   IF v IS NULL OR v='""'::jsonb OR v='null'::jsonb THEN IF (q->>'required')::boolean THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF; CONTINUE; END IF;
   IF q->>'type' IN ('CSAT','NPS') THEN
    minimum:=CASE WHEN q->>'type'='CSAT' THEN 1 ELSE 0 END; maximum:=CASE WHEN q->>'type'='CSAT' THEN 5 ELSE 10 END;
    IF jsonb_typeof(v)<>'number' OR (v::text)::numeric<>trunc((v::text)::numeric) OR (v::text)::numeric<minimum OR (v::text)::numeric>maximum THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
   ELSIF q->>'type'='CHOICE' THEN IF NOT (q->'options' @> jsonb_build_array(v)) THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
   ELSIF q->>'type'='TEXT' AND (jsonb_typeof(v)<>'string' OR length(v::text)>5002) THEN RAISE EXCEPTION 'DATA_INCOMPLETE'; END IF;
  END LOOP;
  k:='response';target:='SUBMITTED';nv:=1;nextp:=jsonb_build_object('id',eid,'surveyId',sv.id,'surveyVersion',sv.payload->'version','customerId',uid,'eventId',inv.payload->>'eventId','at',now(),'answers',p->'answers');
  INSERT INTO public.quality_items(id,kind,payload,state,owner_id,created_by) VALUES(eid,k,nextp,target,uid,uid);
  UPDATE public.quality_items SET state='ANSWERED',version=version+1,updated_at=now() WHERE id=inv.id;
 ELSE
  IF r.id IS NULL THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF r.version<>COALESCE((command->>'expectedVersion')::integer,-1) THEN RAISE EXCEPTION 'STALE_DATA';END IF;
  k:=r.kind;assigned:=r.assigned_user_id;nextp:=r.payload;nv:=r.version+1;
  IF act='clinical_review' THEN
   IF k<>'complaints' OR NOT public.has_any_role(uid,ARRAY['luis','veterinario']::public.app_role[]) OR (NOT public.is_director(uid) AND assigned IS DISTINCT FROM uid) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
   IF length(COALESCE(btrim(p->>'evidence'),''))<3 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
   target:=r.state;nextp:=nextp||jsonb_build_object('professionalReviewed',true,'reviewedBy',uid,'reviewEvidence',p->>'evidence');
  ELSIF act='feedback' THEN
   IF k<>'complaints' OR r.owner_id IS DISTINCT FROM uid OR NOT public.has_any_role(uid,ARRAY['cliente']::public.app_role[]) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
   IF COALESCE(p->>'customerConfirmation','') NOT IN ('CONFIRMED','DECLINED') THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
   target:=r.state;nextp:=nextp||jsonb_build_object('customerConfirmation',p->>'customerConfirmation');
  ELSIF act='transition' THEN
   IF k='complaints' THEN
    IF NOT public.is_ops(uid) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
    graph:='{"NEW":["ACKNOWLEDGED","ESCALATED"],"ACKNOWLEDGED":["UNDER_REVIEW","ASSIGNED","ESCALATED"],"UNDER_REVIEW":["ASSIGNED","ACTION_PLAN_PENDING","ESCALATED"],"ASSIGNED":["ACTION_PLAN_PENDING","IN_PROGRESS","ESCALATED"],"ACTION_PLAN_PENDING":["IN_PROGRESS","ESCALATED"],"IN_PROGRESS":["WAITING_CUSTOMER","WAITING_INTERNAL_TEAM","WAITING_EXTERNAL_PARTY","RESOLUTION_PROPOSED","ESCALATED"],"WAITING_CUSTOMER":["IN_PROGRESS","RESOLUTION_PROPOSED","ESCALATED"],"WAITING_INTERNAL_TEAM":["IN_PROGRESS","ESCALATED"],"WAITING_EXTERNAL_PARTY":["IN_PROGRESS","ESCALATED"],"RESOLUTION_PROPOSED":["IN_PROGRESS","RESOLUTION_CONFIRMED","ESCALATED"],"RESOLUTION_CONFIRMED":["CLOSED","REOPENED"],"CLOSED":["REOPENED"],"REOPENED":["UNDER_REVIEW","ASSIGNED","ESCALATED"],"ESCALATED":["UNDER_REVIEW","ASSIGNED","IN_PROGRESS"]}'::jsonb;
    nextp:=nextp||jsonb_build_object('plan',COALESCE(p->>'plan',nextp->>'plan'),'evidence',COALESCE(p->>'evidence',nextp->>'evidence'),'solutionImplemented',COALESCE((p->>'solutionImplemented')::boolean,(nextp->>'solutionImplemented')::boolean));
    IF p ? 'assignedTo' THEN SELECT user_id INTO assigned FROM public.staff_members WHERE id=p->>'assignedTo';IF assigned IS NULL THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;nextp:=nextp||jsonb_build_object('assignedTo',p->>'assignedTo');END IF;
    IF target IN ('ASSIGNED','IN_PROGRESS') AND assigned IS NULL THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
    IF target='IN_PROGRESS' AND length(COALESCE(btrim(nextp->>'plan'),''))<3 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
    IF target IN ('RESOLUTION_CONFIRMED','CLOSED') THEN
     IF NOT public.is_director(uid) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
     IF NOT COALESCE((nextp->>'solutionImplemented')::boolean,false) OR length(COALESCE(btrim(nextp->>'evidence'),''))<3 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
     IF COALESCE((r.payload->>'clinical')::boolean,false) AND NOT COALESCE((r.payload->>'professionalReviewed')::boolean,false) THEN RAISE EXCEPTION 'PROFESSIONAL_REVIEW_REQUIRED';END IF;
    END IF;
    nextp:=nextp||jsonb_build_object('events',COALESCE(r.payload->'events','[]'::jsonb)||jsonb_build_array(jsonb_build_object('id',eid::text||':'||nv,'at',now(),'actorId',uid,'from',r.state,'to',target,'reason',why,'evidence',nextp->>'evidence','version',nv)));
   ELSIF k='surveys' THEN
    IF NOT public.is_director(uid) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
    graph:='{"DRAFT":["APPROVED"],"APPROVED":["PUBLISHED","ARCHIVED"],"PUBLISHED":["ARCHIVED"]}'::jsonb;
    IF target='APPROVED' THEN nextp:=nextp||jsonb_build_object('approvedBy',uid);END IF;
    IF target='PUBLISHED' AND COALESCE(nextp->>'approvedBy','')='' THEN RAISE EXCEPTION 'NOT_AUTHORIZED';END IF;
   ELSIF k='education' THEN
    reviewer:=public.has_any_role(uid,ARRAY['luis','veterinario']::public.app_role[]);
    IF NOT public.is_director(uid) AND NOT (reviewer AND assigned=uid) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
    graph:='{"DRAFT":["PENDING_PROFESSIONAL_REVIEW","APPROVED"],"PENDING_PROFESSIONAL_REVIEW":["APPROVED"],"APPROVED":["PUBLISHED","ARCHIVED"],"PUBLISHED":["OUTDATED","ARCHIVED"]}'::jsonb;
    IF target='PENDING_PROFESSIONAL_REVIEW' THEN assigned:=(p->>'reviewerId')::uuid;IF assigned IS NULL OR NOT public.has_any_role(assigned,ARRAY['luis','veterinario']::public.app_role[]) THEN RAISE EXCEPTION 'PROFESSIONAL_REVIEW_REQUIRED';END IF;END IF;
    IF target='APPROVED' THEN
     IF COALESCE((nextp->>'clinical')::boolean,false) AND NOT reviewer THEN RAISE EXCEPTION 'PROFESSIONAL_REVIEW_REQUIRED';END IF;
     IF (p->>'validUntil')::timestamptz IS NULL OR (p->>'validUntil')::timestamptz<=now() THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
     nextp:=nextp||jsonb_build_object('reviewer',uid,'reviewedAt',now(),'validUntil',p->>'validUntil');
    END IF;
    IF target='PUBLISHED' AND (NOT public.is_director(uid) OR COALESCE(nextp->>'reviewer','')='' OR (nextp->>'validUntil')::timestamptz<=now()) THEN RAISE EXCEPTION 'NOT_AUTHORIZED';END IF;
   ELSIF k='improvements' THEN
    IF NOT public.is_ops(uid) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
    graph:='{"IDEA":["UNDER_REVIEW"],"UNDER_REVIEW":["APPROVED","IDEA"],"APPROVED":["IMPLEMENTATION_PENDING"],"IMPLEMENTATION_PENDING":["IN_PROGRESS"],"IN_PROGRESS":["VALIDATION_PENDING"],"VALIDATION_PENDING":["EFFECTIVE","INEFFECTIVE"],"EFFECTIVE":["CLOSED"],"INEFFECTIVE":["UNDER_REVIEW","CLOSED"]}'::jsonb;
    nextp:=nextp||jsonb_build_object('implementationEvidence',COALESCE(p->>'implementationEvidence',nextp->>'implementationEvidence'),'measuredAfter',COALESCE(p->>'measuredAfter',nextp->>'measuredAfter'));
    IF target IN ('APPROVED','EFFECTIVE','INEFFECTIVE','CLOSED') AND NOT public.is_director(uid) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;
    IF target='APPROVED' THEN nextp:=nextp||jsonb_build_object('approvedBy',uid);END IF;
    IF target IN ('VALIDATION_PENDING','EFFECTIVE','INEFFECTIVE','CLOSED') AND length(COALESCE(btrim(nextp->>'implementationEvidence'),''))<3 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
    IF target IN ('EFFECTIVE','INEFFECTIVE','CLOSED') AND length(COALESCE(btrim(nextp->>'measuredAfter'),''))<3 THEN RAISE EXCEPTION 'DATA_INCOMPLETE';END IF;
   ELSIF k='standards' THEN
    IF NOT public.is_director(uid) THEN RAISE EXCEPTION 'FORBIDDEN';END IF;graph:='{"DRAFT":["APPROVED"],"APPROVED":["ARCHIVED"]}'::jsonb;nextp:=nextp||jsonb_build_object('approvedBy',uid);
   ELSE RAISE EXCEPTION 'INTEGRATION_UNAVAILABLE'; END IF;
   IF target IS NULL OR NOT COALESCE((graph->r.state) ? target,false) THEN RAISE EXCEPTION 'INVALID_STATE_TRANSITION'; END IF;
  ELSE RAISE EXCEPTION 'INTEGRATION_UNAVAILABLE';END IF;
  nextp:=nextp||jsonb_build_object('state',target,'updatedAt',now());
  IF k NOT IN ('surveys','education') THEN nextp:=nextp||jsonb_build_object('version',nv);END IF;
  UPDATE public.quality_items SET payload=nextp,state=target,version=nv,assigned_user_id=assigned,updated_at=now() WHERE id=eid;
 END IF;
 result:=jsonb_build_object('id',eid,'kind',k,'version',nv,'state',target,'payload',nextp,'authoritative',true,'externalSent',false);
 INSERT INTO public.quality_audit(entity_id,actor_id,action,reason,old_version,new_version,old_payload,new_payload,request_key,request_hash,result) VALUES(eid,uid,act,why,COALESCE(r.version,0),nv,r.payload,nextp,ik,md5(command::text),result);
 RETURN result;
END;$$;
REVOKE ALL ON FUNCTION public.quality_command(jsonb) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.quality_command(jsonb) TO authenticated;