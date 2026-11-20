-- Event outbox
CREATE TABLE public.event_outbox (
  event_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  schema_version int NOT NULL DEFAULT 1,
  organization_id text NOT NULL DEFAULT 'vetlife',
  entity_id text,
  actor_id uuid DEFAULT auth.uid(),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  causation_id uuid,
  idempotency_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pendiente',
  attempt_count int NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT, UPDATE ON public.event_outbox TO authenticated;
GRANT ALL ON public.event_outbox TO service_role;
ALTER TABLE public.event_outbox ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Dirección y operaciones ven eventos" ON public.event_outbox FOR SELECT TO authenticated USING (public.is_director(auth.uid()) OR public.is_ops(auth.uid()));
CREATE POLICY "Dirección gestiona eventos" ON public.event_outbox FOR UPDATE TO authenticated USING (public.is_director(auth.uid())) WITH CHECK (public.is_director(auth.uid()));

CREATE OR REPLACE FUNCTION public.emit_event(_type text, _entity text, _payload jsonb, _key text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  INSERT INTO public.event_outbox(event_type, entity_id, payload, idempotency_key)
  VALUES (_type, _entity, _payload, _key) ON CONFLICT (idempotency_key) DO NOTHING;
$$;
REVOKE EXECUTE ON FUNCTION public.emit_event(text,text,jsonb,text) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.outbox_trigger() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE t text; e text; p jsonb := '{}'::jsonb;
BEGIN
  IF TG_TABLE_NAME = 'pets' AND TG_OP = 'INSERT' THEN t := 'pet.created'; e := NEW.id; p := jsonb_build_object('species', NEW.species);
  ELSIF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' THEN t := 'owner.created'; e := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'pet_caregivers' AND TG_OP = 'INSERT' THEN t := 'caregiver.authorized'; e := NEW.id::text; p := jsonb_build_object('pet_id', NEW.pet_id);
  ELSIF TG_TABLE_NAME = 'pet_caregivers' AND TG_OP = 'DELETE' THEN t := 'caregiver.revoked'; e := OLD.id::text; p := jsonb_build_object('pet_id', OLD.pet_id);
  ELSIF TG_TABLE_NAME = 'referrals' AND TG_OP = 'INSERT' THEN t := 'referral.created'; e := NEW.id;
  ELSIF TG_TABLE_NAME = 'referrals' AND NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'agendada' THEN t := 'referral.approved'; e := NEW.id;
  ELSIF TG_TABLE_NAME = 'tasks' AND TG_OP = 'INSERT' THEN t := 'task.created'; e := NEW.id;
  ELSIF TG_TABLE_NAME = 'tasks' AND NEW.done AND NOT OLD.done THEN t := 'task.completed'; e := NEW.id;
  ELSIF TG_TABLE_NAME = 'simulations' AND NEW.status IS DISTINCT FROM OLD.status AND NEW.status = 'aprobado' THEN t := 'simulation.approved'; e := NEW.id::text;
  ELSIF TG_TABLE_NAME = 'visits' THEN
    e := NEW.id; p := jsonb_build_object('status', NEW.status, 'step', NEW.step);
    IF TG_OP = 'INSERT' THEN t := CASE NEW.status WHEN 'pendiente_okvet' THEN 'appointment.pending_okvet' WHEN 'confirmada' THEN 'appointment.confirmed' ELSE 'appointment.requested' END;
    ELSIF NEW.step IS DISTINCT FROM OLD.step AND NEW.step = 'en_desplazamiento' THEN t := 'visit.started';
    ELSIF NEW.status IS DISTINCT FROM OLD.status THEN t := CASE NEW.status WHEN 'pendiente_okvet' THEN 'appointment.pending_okvet' WHEN 'confirmada' THEN 'appointment.confirmed' WHEN 'cancelada' THEN 'appointment.cancelled' WHEN 'finalizada' THEN 'visit.completed' WHEN 'pendiente' THEN 'appointment.reschedule_requested' ELSE NULL END;
    END IF;
  END IF;
  IF t IS NOT NULL THEN
    PERFORM public.emit_event(t, e, p, t || ':' || e || ':' || txid_current()::text);
  END IF;
  RETURN COALESCE(NEW, OLD);
END $$;
REVOKE EXECUTE ON FUNCTION public.outbox_trigger() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER outbox_pets AFTER INSERT ON public.pets FOR EACH ROW EXECUTE FUNCTION public.outbox_trigger();
CREATE TRIGGER outbox_profiles AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.outbox_trigger();
CREATE TRIGGER outbox_caregivers AFTER INSERT OR DELETE ON public.pet_caregivers FOR EACH ROW EXECUTE FUNCTION public.outbox_trigger();
CREATE TRIGGER outbox_referrals AFTER INSERT OR UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION public.outbox_trigger();
CREATE TRIGGER outbox_tasks AFTER INSERT OR UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.outbox_trigger();
CREATE TRIGGER outbox_simulations AFTER UPDATE ON public.simulations FOR EACH ROW EXECUTE FUNCTION public.outbox_trigger();
CREATE TRIGGER outbox_visits AFTER INSERT OR UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.outbox_trigger();

-- Visit state machine + OKVET evidence
ALTER TABLE public.visits ADD COLUMN okvet_ref text;
ALTER TABLE public.visits ADD COLUMN version int NOT NULL DEFAULT 1;

CREATE OR REPLACE FUNCTION public.guard_visit_transition() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE allowed text[];
BEGIN
  IF NEW.status = 'confirmada' AND (TG_OP = 'INSERT' OR OLD.status <> 'confirmada') AND coalesce(trim(NEW.okvet_ref), '') = '' THEN
    RAISE EXCEPTION 'No se puede confirmar sin la referencia oficial de OKVET';
  END IF;
  IF TG_OP = 'UPDATE' THEN
    IF NEW.status <> OLD.status THEN
      allowed := CASE OLD.status
        WHEN 'pendiente' THEN ARRAY['revision','pendiente_okvet','confirmada','cancelada']
        WHEN 'revision' THEN ARRAY['pendiente','pendiente_okvet','confirmada','cancelada']
        WHEN 'pendiente_okvet' THEN ARRAY['pendiente','revision','confirmada','cancelada']
        WHEN 'confirmada' THEN ARRAY['pendiente','revision','pendiente_okvet','por_iniciar','en_curso','cancelada']
        WHEN 'por_iniciar' THEN ARRAY['pendiente','en_curso','cancelada']
        WHEN 'en_curso' THEN ARRAY['finalizada']
        ELSE ARRAY[]::text[] END;
      IF NOT NEW.status = ANY(allowed) THEN
        RAISE EXCEPTION 'Cambio de estado no permitido: % → %', OLD.status, NEW.status;
      END IF;
    END IF;
    NEW.version := OLD.version + 1;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER visits_state_guard BEFORE INSERT OR UPDATE ON public.visits FOR EACH ROW EXECUTE FUNCTION public.guard_visit_transition();

-- Feature flags
CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  label text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  requires_integration boolean NOT NULL DEFAULT false,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.feature_flags TO authenticated;
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Usuarios ven flags" ON public.feature_flags FOR SELECT TO authenticated USING (true);
CREATE POLICY "Dirección cambia flags" ON public.feature_flags FOR UPDATE TO authenticated USING (public.is_director(auth.uid())) WITH CHECK (public.is_director(auth.uid()));
CREATE OR REPLACE FUNCTION public.guard_feature_flag() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.enabled AND NEW.requires_integration THEN RAISE EXCEPTION 'Este módulo requiere una integración verificada'; END IF;
  NEW.updated_by := auth.uid(); NEW.updated_at := now(); RETURN NEW;
END $$;
CREATE TRIGGER feature_flags_guard BEFORE UPDATE ON public.feature_flags FOR EACH ROW EXECUTE FUNCTION public.guard_feature_flag();
INSERT INTO public.feature_flags(key,label,enabled,requires_integration) VALUES
('client_portal_enabled','Portal de clientes',true,false),
('whatsapp_ai_enabled','IA por WhatsApp',false,true),
('calendar_sync_enabled','Sincronización de calendario',false,true),
('quick_booking_enabled','Cita rápida',true,false),
('route_optimization_enabled','Optimización de rutas',false,true),
('schedule_simulator_enabled','Simulador de agenda',true,false),
('specialist_portal_enabled','Portal de especialistas',true,false),
('online_payments_enabled','Pagos en línea',false,true),
('ai_assistant_actions_enabled','Acciones del asistente IA',false,true),
('external_notifications_enabled','Notificaciones externas',false,true),
('n8n_dispatch_enabled','Envío de eventos a n8n',false,true);

-- Customer experience memory
CREATE TABLE public.customer_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL,
  pet_id text REFERENCES public.pets(id),
  kind text NOT NULL DEFAULT 'preferencia',
  content text NOT NULL,
  source text NOT NULL DEFAULT 'cliente',
  author uuid DEFAULT auth.uid(),
  validation text NOT NULL DEFAULT 'sin_validar',
  sensitivity text NOT NULL DEFAULT 'normal',
  consent text,
  last_confirmed_at timestamptz,
  valid_until date,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_memory TO authenticated;
GRANT ALL ON public.customer_memory TO service_role;
ALTER TABLE public.customer_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cliente ve sus memorias no sensibles" ON public.customer_memory FOR SELECT TO authenticated USING (client_id = auth.uid() OR public.is_ops(auth.uid()) OR public.is_director(auth.uid()) OR (sensitivity = 'normal' AND public.is_staff(auth.uid())));
CREATE POLICY "Cliente y operaciones registran" ON public.customer_memory FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid() OR public.is_ops(auth.uid()) OR public.is_director(auth.uid()));
CREATE POLICY "Cliente corrige, operaciones validan" ON public.customer_memory FOR UPDATE TO authenticated USING (client_id = auth.uid() OR public.is_ops(auth.uid()) OR public.is_director(auth.uid()));
CREATE POLICY "Cliente y dirección eliminan" ON public.customer_memory FOR DELETE TO authenticated USING (client_id = auth.uid() OR public.is_director(auth.uid()));
CREATE OR REPLACE FUNCTION public.guard_memory() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.validation = 'validada' AND NOT (public.is_ops(auth.uid()) OR public.is_director(auth.uid())) THEN
    RAISE EXCEPTION 'Solo el equipo puede validar una memoria';
  END IF;
  IF NEW.validation = 'validada' THEN NEW.last_confirmed_at := now(); END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER customer_memory_guard BEFORE INSERT OR UPDATE ON public.customer_memory FOR EACH ROW EXECUTE FUNCTION public.guard_memory();

-- Private documents storage policies (bucket created separately)
CREATE POLICY "Dueño sube a su carpeta" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documentos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Dueño o equipo leen" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'documentos' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_ops(auth.uid()) OR public.is_director(auth.uid()) OR public.is_clinical(auth.uid())));
CREATE POLICY "Dueño o dirección eliminan" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'documentos' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_director(auth.uid())));