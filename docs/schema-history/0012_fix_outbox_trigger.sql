CREATE OR REPLACE FUNCTION public.outbox_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t text; e text; p jsonb := '{}'::jsonb; n jsonb; o jsonb;
BEGIN
  n := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
  o := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
  e := coalesce(n->>'id', o->>'id');
  IF TG_TABLE_NAME = 'pets' THEN
    IF TG_OP = 'INSERT' THEN t := 'pet.created'; p := jsonb_build_object('species', n->>'species'); END IF;
  ELSIF TG_TABLE_NAME = 'profiles' THEN
    IF TG_OP = 'INSERT' THEN t := 'owner.created'; END IF;
  ELSIF TG_TABLE_NAME = 'pet_caregivers' THEN
    t := CASE TG_OP WHEN 'INSERT' THEN 'caregiver.authorized' WHEN 'DELETE' THEN 'caregiver.revoked' END;
    p := jsonb_build_object('pet_id', coalesce(n->>'pet_id', o->>'pet_id'));
  ELSIF TG_TABLE_NAME = 'referrals' THEN
    IF TG_OP = 'INSERT' THEN t := 'referral.created';
    ELSIF (n->>'status') IS DISTINCT FROM (o->>'status') AND n->>'status' = 'agendada' THEN t := 'referral.approved'; END IF;
  ELSIF TG_TABLE_NAME = 'tasks' THEN
    IF TG_OP = 'INSERT' THEN t := 'task.created';
    ELSIF (n->>'done')::boolean AND NOT (o->>'done')::boolean THEN t := 'task.completed'; END IF;
  ELSIF TG_TABLE_NAME = 'simulations' THEN
    IF (n->>'status') IS DISTINCT FROM (o->>'status') AND n->>'status' = 'aprobado' THEN t := 'simulation.approved'; END IF;
  ELSIF TG_TABLE_NAME = 'visits' THEN
    p := jsonb_build_object('status', n->>'status', 'step', n->>'step');
    IF TG_OP = 'INSERT' THEN
      t := CASE n->>'status' WHEN 'pendiente_okvet' THEN 'appointment.pending_okvet' WHEN 'confirmada' THEN 'appointment.confirmed' ELSE 'appointment.requested' END;
    ELSIF (n->>'step') IS DISTINCT FROM (o->>'step') AND n->>'step' = 'en_desplazamiento' THEN t := 'visit.started';
    ELSIF (n->>'status') IS DISTINCT FROM (o->>'status') THEN
      t := CASE n->>'status' WHEN 'pendiente_okvet' THEN 'appointment.pending_okvet' WHEN 'confirmada' THEN 'appointment.confirmed' WHEN 'cancelada' THEN 'appointment.cancelled' WHEN 'finalizada' THEN 'visit.completed' WHEN 'pendiente' THEN 'appointment.reschedule_requested' ELSE NULL END;
    END IF;
  END IF;
  IF t IS NOT NULL THEN
    PERFORM public.emit_event(t, e, p, t || ':' || e || ':' || txid_current()::text);
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
REVOKE EXECUTE ON FUNCTION public.outbox_trigger() FROM PUBLIC, anon, authenticated;