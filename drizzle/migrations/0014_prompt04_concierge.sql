CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel text NOT NULL DEFAULT 'whatsapp',
  contact_name text NOT NULL,
  contact_phone text NOT NULL,
  owner_id uuid,
  verified boolean NOT NULL DEFAULT false,
  pet_id text REFERENCES public.pets(id),
  status text NOT NULL DEFAULT 'NEW',
  control_mode text NOT NULL DEFAULT 'ai' CHECK (control_mode IN ('ai','human')),
  assigned_user_id uuid,
  priority text NOT NULL DEFAULT 'normal',
  sensitive boolean NOT NULL DEFAULT false,
  synthetic boolean NOT NULL DEFAULT true,
  last_inbound_at timestamptz,
  last_human_response_at timestamptz,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  version int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conversations_last_idx ON public.conversations(last_message_at DESC);
GRANT SELECT, INSERT, UPDATE ON public.conversations TO authenticated;
GRANT ALL ON public.conversations TO service_role;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipo de atención gestiona conversaciones" ON public.conversations FOR ALL TO authenticated USING (public.is_ops(auth.uid()) OR public.is_director(auth.uid())) WITH CHECK (public.is_ops(auth.uid()) OR public.is_director(auth.uid()));

CREATE TABLE public.conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction text NOT NULL CHECK (direction IN ('in','out')),
  sender text NOT NULL CHECK (sender IN ('cliente','ia','humano','sistema')),
  body text NOT NULL,
  intents text[] NOT NULL DEFAULT '{}',
  delivery_status text NOT NULL DEFAULT 'registrado',
  provider_message_id text UNIQUE,
  idempotency_key text UNIQUE,
  attachment_path text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX conversation_messages_conv_idx ON public.conversation_messages(conversation_id, created_at);
GRANT SELECT, INSERT ON public.conversation_messages TO authenticated;
GRANT ALL ON public.conversation_messages TO service_role;
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipo de atención lee mensajes" ON public.conversation_messages FOR SELECT TO authenticated USING (public.is_ops(auth.uid()) OR public.is_director(auth.uid()));
CREATE POLICY "Equipo de atención registra mensajes" ON public.conversation_messages FOR INSERT TO authenticated WITH CHECK (public.is_ops(auth.uid()) OR public.is_director(auth.uid()));

CREATE TABLE public.conversation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  kind text NOT NULL,
  detail text NOT NULL DEFAULT '',
  actor uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.conversation_events TO authenticated;
GRANT ALL ON public.conversation_events TO service_role;
ALTER TABLE public.conversation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipo de atención ve eventos" ON public.conversation_events FOR SELECT TO authenticated USING (public.is_ops(auth.uid()) OR public.is_director(auth.uid()));
CREATE POLICY "Equipo de atención registra eventos" ON public.conversation_events FOR INSERT TO authenticated WITH CHECK (public.is_ops(auth.uid()) OR public.is_director(auth.uid()));

CREATE TABLE public.knowledge_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  source text NOT NULL DEFAULT 'Dirección',
  status text NOT NULL DEFAULT 'borrador' CHECK (status IN ('borrador','aprobado','retirado')),
  version int NOT NULL DEFAULT 1,
  valid_until date,
  approved_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.knowledge_articles TO authenticated;
GRANT ALL ON public.knowledge_articles TO service_role;
ALTER TABLE public.knowledge_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Equipo lee conocimiento" ON public.knowledge_articles FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Dirección edita conocimiento" ON public.knowledge_articles FOR ALL TO authenticated USING (public.is_director(auth.uid())) WITH CHECK (public.is_director(auth.uid()));

CREATE TABLE public.message_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'UTILITY' CHECK (category IN ('UTILITY','MARKETING','AUTHENTICATION')),
  body text NOT NULL,
  status text NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','READY_FOR_REVIEW','SUBMITTED','APPROVED','REJECTED','PAUSED','DISABLED')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.message_templates TO authenticated;
GRANT ALL ON public.message_templates TO service_role;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Atención lee plantillas" ON public.message_templates FOR SELECT TO authenticated USING (public.is_ops(auth.uid()) OR public.is_director(auth.uid()));
CREATE POLICY "Dirección edita plantillas" ON public.message_templates FOR ALL TO authenticated USING (public.is_director(auth.uid())) WITH CHECK (public.is_director(auth.uid()));
-- Only Meta can approve: the app may never set SUBMITTED/APPROVED/REJECTED itself.
CREATE OR REPLACE FUNCTION public.guard_template() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('SUBMITTED','APPROVED','REJECTED') AND (TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status) AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Ese estado solo lo asigna Meta al revisar la plantilla';
  END IF;
  NEW.updated_at := now(); RETURN NEW;
END $$;
CREATE TRIGGER message_templates_guard BEFORE INSERT OR UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.guard_template();

CREATE TABLE public.communication_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL UNIQUE,
  reason text NOT NULL DEFAULT 'opt-out',
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.communication_suppressions TO authenticated;
GRANT ALL ON public.communication_suppressions TO service_role;
ALTER TABLE public.communication_suppressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Atención gestiona bajas" ON public.communication_suppressions FOR ALL TO authenticated USING (public.is_ops(auth.uid()) OR public.is_director(auth.uid())) WITH CHECK (public.is_ops(auth.uid()) OR public.is_director(auth.uid()));

CREATE TABLE public.outbound_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  template_id uuid REFERENCES public.message_templates(id),
  body text NOT NULL,
  sender text NOT NULL DEFAULT 'humano' CHECK (sender IN ('ia','humano','sistema')),
  status text NOT NULL DEFAULT 'QUEUED',
  error text,
  idempotency_key text NOT NULL UNIQUE,
  conversation_version int,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.outbound_messages TO authenticated;
GRANT ALL ON public.outbound_messages TO service_role;
ALTER TABLE public.outbound_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Atención gestiona salida" ON public.outbound_messages FOR ALL TO authenticated USING (public.is_ops(auth.uid()) OR public.is_director(auth.uid())) WITH CHECK (public.is_ops(auth.uid()) OR public.is_director(auth.uid()));

-- Messaging policy: AI never writes after human takeover; outbound is checked against suppressions,
-- template approval and the global real-send switch (off by default).
CREATE OR REPLACE FUNCTION public.guard_conversation_message() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.conversations;
BEGIN
  SELECT * INTO c FROM public.conversations WHERE id = NEW.conversation_id FOR UPDATE;
  IF NEW.sender = 'ia' AND c.control_mode = 'human' THEN RAISE EXCEPTION 'La conversación está en control humano: la IA no puede responder'; END IF;
  UPDATE public.conversations SET last_message_at = now(),
    last_inbound_at = CASE WHEN NEW.direction = 'in' THEN now() ELSE last_inbound_at END,
    last_human_response_at = CASE WHEN NEW.sender = 'humano' THEN now() ELSE last_human_response_at END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.guard_conversation_message() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER conversation_messages_guard BEFORE INSERT ON public.conversation_messages FOR EACH ROW EXECUTE FUNCTION public.guard_conversation_message();

CREATE OR REPLACE FUNCTION public.guard_outbound() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE c public.conversations; tpl text; live boolean;
BEGIN
  SELECT * INTO c FROM public.conversations WHERE id = NEW.conversation_id FOR UPDATE;
  IF NEW.sender = 'ia' AND c.control_mode = 'human' THEN NEW.status := 'CANCELLED'; NEW.error := 'Control humano activo'; RETURN NEW; END IF;
  IF NEW.conversation_version IS NOT NULL AND NEW.conversation_version <> c.version THEN NEW.status := 'CANCELLED'; NEW.error := 'La conversación cambió antes del envío'; RETURN NEW; END IF;
  IF EXISTS (SELECT 1 FROM public.communication_suppressions s WHERE s.phone = c.contact_phone) THEN NEW.status := 'SUPPRESSED'; NEW.error := 'El contacto pidió no recibir mensajes'; RETURN NEW; END IF;
  IF NEW.template_id IS NOT NULL THEN
    SELECT status INTO tpl FROM public.message_templates WHERE id = NEW.template_id;
    IF tpl <> 'APPROVED' THEN NEW.status := 'FAILED'; NEW.error := 'Plantilla no aprobada por Meta'; RETURN NEW; END IF;
  ELSIF c.last_inbound_at IS NULL OR c.last_inbound_at < now() - interval '24 hours' THEN
    NEW.status := 'FAILED'; NEW.error := 'Fuera de la ventana de 24 horas: requiere plantilla aprobada'; RETURN NEW;
  END IF;
  SELECT coalesce((SELECT enabled FROM public.feature_flags WHERE key = 'external_notifications_enabled'), false) INTO live;
  IF NOT live THEN NEW.status := 'QUEUED'; NEW.error := 'Envío real desactivado: no se envió a WhatsApp'; END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.guard_outbound() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER outbound_messages_guard BEFORE INSERT ON public.outbound_messages FOR EACH ROW EXECUTE FUNCTION public.guard_outbound();

CREATE OR REPLACE FUNCTION public.guard_conversation() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE allowed text[];
BEGIN
  IF NEW.status <> OLD.status THEN
    allowed := CASE OLD.status
      WHEN 'NEW' THEN ARRAY['IDENTIFICATION_REQUIRED','AI_ACTIVE','HUMAN_ACTIVE','WAITING_TEAM','PENDING_CLINICAL_ESCALATION','CLOSED']
      WHEN 'IDENTIFICATION_REQUIRED' THEN ARRAY['AI_ACTIVE','HUMAN_ACTIVE','WAITING_CUSTOMER','WAITING_TEAM','CLOSED']
      WHEN 'AI_ACTIVE' THEN ARRAY['WAITING_CUSTOMER','WAITING_TEAM','HUMAN_ACTIVE','PENDING_COORDINATION','PENDING_CLINICAL_ESCALATION','RESOLVED','ERROR']
      WHEN 'WAITING_CUSTOMER' THEN ARRAY['AI_ACTIVE','HUMAN_ACTIVE','WAITING_TEAM','RESOLVED','CLOSED']
      WHEN 'WAITING_TEAM' THEN ARRAY['HUMAN_ACTIVE','PENDING_COORDINATION','PENDING_CLINICAL_ESCALATION','RESOLVED']
      WHEN 'HUMAN_ACTIVE' THEN ARRAY['WAITING_CUSTOMER','PENDING_COORDINATION','PENDING_CLINICAL_ESCALATION','FOLLOW_UP_SCHEDULED','AI_ACTIVE','RESOLVED']
      WHEN 'PENDING_COORDINATION' THEN ARRAY['HUMAN_ACTIVE','WAITING_CUSTOMER','FOLLOW_UP_SCHEDULED','RESOLVED']
      WHEN 'PENDING_CLINICAL_ESCALATION' THEN ARRAY['HUMAN_ACTIVE','FOLLOW_UP_SCHEDULED','RESOLVED']
      WHEN 'FOLLOW_UP_SCHEDULED' THEN ARRAY['HUMAN_ACTIVE','WAITING_CUSTOMER','RESOLVED']
      WHEN 'RESOLVED' THEN ARRAY['CLOSED','WAITING_TEAM']
      WHEN 'CLOSED' THEN ARRAY['WAITING_TEAM']
      WHEN 'ERROR' THEN ARRAY['HUMAN_ACTIVE','WAITING_TEAM']
      ELSE ARRAY[]::text[] END;
    IF NOT NEW.status = ANY(allowed) THEN RAISE EXCEPTION 'Cambio de estado de conversación no permitido: % → %', OLD.status, NEW.status; END IF;
    IF NEW.status = 'CLOSED' THEN NEW.closed_at := now(); END IF;
  END IF;
  IF NEW.control_mode = 'human' AND NEW.status = 'AI_ACTIVE' THEN RAISE EXCEPTION 'Para devolver a IA primero cambia el control a IA'; END IF;
  NEW.version := OLD.version + 1;
  RETURN NEW;
END $$;
CREATE TRIGGER conversations_guard BEFORE UPDATE ON public.conversations FOR EACH ROW EXECUTE FUNCTION public.guard_conversation();

-- Seed: synthetic conversations (DESIGN mode), approved knowledge, templates as drafts.
INSERT INTO public.conversations(id, contact_name, contact_phone, pet_id, status, control_mode, priority, last_inbound_at, last_message_at) VALUES
('11111111-0000-4000-8000-000000000001','Andrea Gómez','573005551201','luna','AI_ACTIVE','ai','normal', now() - interval '20 minutes', now() - interval '20 minutes'),
('11111111-0000-4000-8000-000000000002','Carlos Pérez','573105558844',NULL,'PENDING_CLINICAL_ESCALATION','human','alta', now() - interval '45 minutes', now() - interval '44 minutes'),
('11111111-0000-4000-8000-000000000003','Marta Ruiz','573155550021',NULL,'WAITING_TEAM','ai','normal', now() - interval '3 hours', now() - interval '3 hours');
INSERT INTO public.conversation_messages(conversation_id, direction, sender, body, intents, created_at) VALUES
('11111111-0000-4000-8000-000000000001','in','cliente','Hola, quiero una cita para Luna mañana y también saber cuánto cuesta','{NEW_APPOINTMENT,PRICE_INQUIRY}', now() - interval '21 minutes'),
('11111111-0000-4000-8000-000000000001','out','ia','Con gusto registro la solicitud de cita para Luna. Nuestro equipo confirmará el horario cuando esté validado. No tengo esa información confirmada. Voy a pasarte con nuestro equipo.','{}', now() - interval '20 minutes'),
('11111111-0000-4000-8000-000000000002','in','cliente','Mi perro no quiere comer desde ayer y está decaído','{CLINICAL_QUESTION}', now() - interval '45 minutes'),
('11111111-0000-4000-8000-000000000002','out','sistema','Consulta clínica detectada: transferida a coordinación.','{}', now() - interval '44 minutes'),
('11111111-0000-4000-8000-000000000003','in','cliente','Necesito reprogramar la cita del jueves','{RESCHEDULE_REQUEST}', now() - interval '3 hours');
INSERT INTO public.knowledge_articles(title, category, content, status) VALUES
('Servicios a domicilio','servicios','Ofrecemos consulta general, control preventivo, vacunación, controles recurrentes, curaciones y toma de muestras a domicilio.','aprobado'),
('Zonas de cobertura','zonas','Atendemos en Bogotá: Zona Norte, Zona Centro y Zona Sur. Confirmamos la dirección exacta al registrar la solicitud.','aprobado'),
('Horario de atención','horarios','Atendemos de lunes a sábado de 7:00 a. m. a 7:00 p. m.','aprobado'),
('Tarifas','tarifas','Pendiente: Dirección debe registrar y aprobar las tarifas vigentes.','borrador'),
('Formas de pago','pagos','Pendiente: Dirección debe confirmar las formas de pago.','borrador');
INSERT INTO public.message_templates(name, label, body) VALUES
('bienvenida','Bienvenida','¡Hola {{1}}! Bienvenido a Vet Life 🐾 ¿En qué podemos ayudarte con tu mascota?'),
('datos_faltantes','Datos faltantes','Hola {{1}}, para completar la solicitud de {{2}} necesitamos {{3}}.'),
('solicitud_recibida','Solicitud recibida','Hola {{1}}, recibimos tu solicitud para {{2}}. Te confirmaremos el horario cuando esté validado.'),
('confirmacion_cita','Confirmación de cita','Hola {{1}}, la cita de {{2}} para {{3}} quedó confirmada el {{4}} a las {{5}}.'),
('recordatorio_cita','Recordatorio de cita','Hola {{1}}, te recordamos la visita de {{2}} el {{3}} a las {{4}}.'),
('preparacion_visita','Preparación de visita','Hola {{1}}, para la visita de {{2}} te pedimos {{3}}.'),
('aviso_desplazamiento','Aviso de desplazamiento','Hola {{1}}, {{2}} va en camino para atender a {{3}}.'),
('aviso_retraso','Aviso de retraso','Hola {{1}}, tendremos un retraso de {{2}} en la visita de {{3}}. Disculpa la molestia.'),
('cambio_profesional','Cambio de profesional','Hola {{1}}, la visita de {{2}} la atenderá {{3}}.'),
('reprogramacion','Reprogramación','Hola {{1}}, la cita de {{2}} se movió al {{3}} a las {{4}}.'),
('cancelacion','Cancelación','Hola {{1}}, la cita de {{2}} del {{3}} quedó cancelada.'),
('solicitud_respuesta','Solicitud de respuesta','Hola {{1}}, ¿nos confirmas {{2}} para seguir con la solicitud de {{3}}?'),
('seguimiento_posterior','Seguimiento posterior','Hola {{1}}, ¿cómo sigue {{2}} después de la visita?'),
('compromiso_pendiente','Compromiso pendiente','Hola {{1}}, seguimos pendientes de {{2}}. Te escribimos apenas esté listo.'),
('documento_disponible','Documento disponible','Hola {{1}}, ya está disponible {{2}} de {{3}} en tu portal Vet Life.'),
('pago_pendiente','Pago pendiente','Hola {{1}}, tienes pendiente el pago de {{2}} por {{3}}.'),
('confirmacion_pago','Confirmación de pago','Hola {{1}}, confirmamos el pago de {{2}}. ¡Gracias!'),
('recordatorio_preventivo','Recordatorio preventivo','Hola {{1}}, a {{2}} le corresponde {{3}}. ¿Quieres que registremos la solicitud?'),
('remision_especialista','Remisión a especialista','Hola {{1}}, el equipo recomienda una valoración de {{2}} para {{3}}.'),
('opciones_especialista','Opciones de especialista','Hola {{1}}, estas son las opciones de especialista para {{2}}: {{3}}.'),
('confirmacion_especialista','Confirmación de especialista','Hola {{1}}, la cita de {{2}} con {{3}} quedó para el {{4}}.'),
('informe_pendiente','Informe pendiente','Hola {{1}}, estamos esperando el informe de {{2}}. Te avisamos al recibirlo.'),
('satisfaccion','Satisfacción','Hola {{1}}, ¿cómo te pareció la atención de {{2}}? Responde de 1 a 5.'),
('resena_voluntaria','Reseña voluntaria','Hola {{1}}, si quieres, puedes contarnos tu experiencia aquí: {{2}}'),
('seguimiento_queja','Seguimiento de queja','Hola {{1}}, seguimos revisando tu caso {{2}}. Te escribimos con la solución.');
UPDATE public.message_templates SET category = 'MARKETING' WHERE name IN ('resena_voluntaria','recordatorio_preventivo');