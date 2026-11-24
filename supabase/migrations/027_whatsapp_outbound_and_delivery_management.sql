-- ==============================================================================
-- MIGRACIÓN 027: VET FREEDOM OS — WHATSAPP OUTBOUND & DELIVERY MANAGEMENT
-- Módulo: VET-CORE-03 | WhatsApp Outbound Safe Sender
-- Dirección Médica: Dr. Luis Eduardo Ríos
-- Dirección Estratégica: Alpha Vision Method
-- Plataforma: PostgreSQL 17 + Supabase
-- ==============================================================================

-- 1. Ampliación de columnas en public.outbound_dispatch_requests
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'conversation_id') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN conversation_id uuid REFERENCES public.conversations(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'pet_id') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'sender_phone_number_id') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN sender_phone_number_id text DEFAULT '109876543210987';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'message_category') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN message_category text DEFAULT 'UTILITY';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'message_purpose') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN message_purpose text DEFAULT 'OPERATIONAL_COMMUNICATION';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'business_entity_type') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN business_entity_type text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'business_entity_id') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN business_entity_id uuid;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'business_entity_version') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN business_entity_version integer DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'draft_state_version') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN draft_state_version integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'idempotency_key') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN idempotency_key text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'correlation_id') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN correlation_id text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'expires_at') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN expires_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'claimed_by') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN claimed_by text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'claimed_at') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN claimed_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'completed_at') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN completed_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'http_status') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN http_status integer;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'outbound_dispatch_requests' AND column_name = 'raw_provider_response') THEN
    ALTER TABLE public.outbound_dispatch_requests ADD COLUMN raw_provider_response jsonb;
  END IF;
END $$;

-- 2. Actualizar restricción de estados en public.outbound_dispatch_requests
ALTER TABLE public.outbound_dispatch_requests DROP CONSTRAINT IF EXISTS outbound_dispatch_requests_status_check;
ALTER TABLE public.outbound_dispatch_requests ADD CONSTRAINT outbound_dispatch_requests_status_check CHECK (
  status = ANY (ARRAY[
    'DRAFT'::text,
    'PENDING_APPROVAL'::text,
    'APPROVED'::text,
    'SCHEDULED'::text,
    'QUEUED'::text,
    'CLAIMED_BY_N8N'::text,
    'CLAIMED'::text,
    'SUBMITTING'::text,
    'DISPATCHED'::text,
    'PROVIDER_ACCEPTED'::text,
    'DELIVERED'::text,
    'READ'::text,
    'RECONCILIATION_REQUIRED'::text,
    'CANCELLED'::text,
    'CANCELLED_BEREAVEMENT'::text,
    'CANCELLED_OPT_OUT'::text,
    'EXPIRED'::text,
    'REJECTED'::text,
    'FAILED'::text
  ])
);

-- Índice único para idempotencia estricta por organización
CREATE UNIQUE INDEX IF NOT EXISTS idx_outbound_dispatch_idempotency_key
ON public.outbound_dispatch_requests (organization_id, idempotency_key)
WHERE idempotency_key IS NOT NULL;

-- 3. Nueva Tabla: public.whatsapp_conversation_windows (Ventana de 24 Horas)
CREATE TABLE IF NOT EXISTS public.whatsapp_conversation_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  recipient_phone text NOT NULL,
  last_user_message_at timestamptz NOT NULL,
  window_expires_at timestamptz NOT NULL,
  is_window_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_whatsapp_window_org_phone UNIQUE (organization_id, recipient_phone)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_windows_expires
ON public.whatsapp_conversation_windows (organization_id, recipient_phone, window_expires_at);

-- 4. Nueva Tabla: public.whatsapp_contact_suppressions (Supresiones de Contacto)
CREATE TABLE IF NOT EXISTS public.whatsapp_contact_suppressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  recipient_phone text NOT NULL,
  owner_id uuid REFERENCES public.owners(id) ON DELETE SET NULL,
  suppression_type text NOT NULL CHECK (suppression_type = ANY (ARRAY[
    'BEREAVEMENT'::text,
    'OPT_OUT_MARKETING'::text,
    'OPEN_COMPLAINT'::text,
    'CAREGIVER_REVOKED'::text,
    'ADMINISTRATIVE_BLOCK'::text
  ])),
  reason text NOT NULL,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_suppressions_lookup
ON public.whatsapp_contact_suppressions (organization_id, recipient_phone, suppression_type, is_active);

-- 5. Nueva Tabla: public.whatsapp_delivery_events (Webhooks de Entrega y Conciliación)
CREATE TABLE IF NOT EXISTS public.whatsapp_delivery_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  provider_message_id text NOT NULL,
  status text NOT NULL CHECK (status = ANY (ARRAY['sent'::text, 'delivered'::text, 'read'::text, 'failed'::text])),
  provider_timestamp timestamptz NOT NULL,
  error_code text,
  error_message text,
  raw_payload jsonb DEFAULT '{}'::jsonb,
  reconciled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_whatsapp_delivery_event UNIQUE (provider_message_id, status)
);

CREATE INDEX IF NOT EXISTS idx_whatsapp_delivery_prov_msg
ON public.whatsapp_delivery_events (provider_message_id, provider_timestamp);

-- 6.1 Actualizar restricción de categorías en message_templates
ALTER TABLE public.message_templates DROP CONSTRAINT IF EXISTS message_templates_category_check;
ALTER TABLE public.message_templates ADD CONSTRAINT message_templates_category_check CHECK (
  category = ANY (ARRAY[
    'APPOINTMENT_REMINDER'::text, 
    'VISIT_CONFIRMATION'::text, 
    'POST_VISIT_CARE'::text, 
    'BILLING'::text, 
    'MARKETING'::text, 
    'ALERT'::text,
    'UTILITY'::text,
    'AUTHENTICATION'::text
  ])
);
ALTER TABLE public.whatsapp_conversation_windows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_contact_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_delivery_events ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_conversation_windows' AND policyname = 'windows_org_isolation') THEN
    CREATE POLICY windows_org_isolation ON public.whatsapp_conversation_windows
      FOR ALL TO authenticated
      USING (organization_id = (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() LIMIT 1));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_contact_suppressions' AND policyname = 'suppressions_org_isolation') THEN
    CREATE POLICY suppressions_org_isolation ON public.whatsapp_contact_suppressions
      FOR ALL TO authenticated
      USING (organization_id = (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() LIMIT 1));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'whatsapp_delivery_events' AND policyname = 'delivery_events_org_isolation') THEN
    CREATE POLICY delivery_events_org_isolation ON public.whatsapp_delivery_events
      FOR ALL TO authenticated
      USING (organization_id = (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() LIMIT 1));
  END IF;
END $$;

-- 7. Catálogo Oficial de 20 Plantillas Meta WABA (TPL-01 a TPL-20)
INSERT INTO public.message_templates (
  organization_id, template_name, category, language, meta_template_id, body_template, parameter_definitions, is_approved_by_meta, is_active
) VALUES 
(
  '11111111-1111-1111-1111-111111111111',
  'vet_appointment_request_received',
  'UTILITY',
  'es_CO',
  'tpl_meta_01_req_rec',
  'Hola {{1}}, hemos recibido tu solicitud de visita veterinaria para {{2}}. Nuestro equipo de coordinación está validando la disponibilidad de ruta y te confirmaremos en breve.',
  '["owner_name", "pet_name"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_appointment_confirmed',
  'UTILITY',
  'es_CO',
  'tpl_meta_02_app_conf',
  '¡Hola {{1}}! Tu cita veterinaria a domicilio para {{2}} ha sido CONFIRMADA para el {{3}} en la franja {{4}}. Profesional asignado: {{5}}.',
  '["owner_name", "pet_name", "date", "time_window", "veterinarian_name"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_appointment_reminder_24h',
  'UTILITY',
  'es_CO',
  'tpl_meta_03_app_rem',
  'Hola {{1}}, te recordamos la visita veterinaria programada para {{2}} mañana {{3}} en la franja {{4}}. Por favor confirma que estarán en el domicilio.',
  '["owner_name", "pet_name", "date", "time_window"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_reschedule_proposed',
  'UTILITY',
  'es_CO',
  'tpl_meta_04_resched_prop',
  'Hola {{1}}, por optimización de ruta médica para {{2}} te proponemos reagendar la visita para el {{3}} a las {{4}}. Por favor respóndenos si aceptas esta propuesta.',
  '["owner_name", "pet_name", "proposed_date", "proposed_time"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_reschedule_confirmed',
  'UTILITY',
  'es_CO',
  'tpl_meta_05_resched_conf',
  'Confirmado {{1}}, la cita de {{2}} ha sido reprogramada con éxito para el {{3}} a las {{4}}.',
  '["owner_name", "pet_name", "new_date", "new_time"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_appointment_cancelled',
  'UTILITY',
  'es_CO',
  'tpl_meta_06_app_canc',
  'Hola {{1}}, te confirmamos que la cita de {{2}} prevista para el {{3}} ha sido cancelada satisfactoriamente según tu solicitud.',
  '["owner_name", "pet_name", "appointment_date"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_veterinarian_on_the_way',
  'UTILITY',
  'es_CO',
  'tpl_meta_07_on_the_way',
  '¡Hola {{1}}! {{2}} ya se encuentra en camino hacia tu domicilio para la atención de {{3}}. Tiempo estimado de llegada: {{4}} minutos.',
  '["owner_name", "veterinarian_name", "pet_name", "eta_minutes"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_delay_notice',
  'UTILITY',
  'es_CO',
  'tpl_meta_08_delay',
  'Hola {{1}}, debido a tráfico imprevisto en la ruta hacia tu zona, la llegada para atender a {{2}} tendrá un retraso aproximado de {{3}} minutos. Agradecemos tu paciencia.',
  '["owner_name", "pet_name", "delay_minutes"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_pending_appointment_followup',
  'UTILITY',
  'es_CO',
  'tpl_meta_09_pending_followup',
  'Hola {{1}}, notamos que tienes pendiente completar la información de la dirección para la visita de {{2}}. Por favor envíanos la ubicación o torre/apto.',
  '["owner_name", "pet_name"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_recurring_visit_reminder',
  'UTILITY',
  'es_CO',
  'tpl_meta_10_recurring',
  'Hola {{1}}, según el plan de cuidados periódicos de {{2}}, corresponde la sesión de {{3}} esta semana. ¿Coordinamos la visita para el {{4}}?',
  '["owner_name", "pet_name", "treatment_name", "suggested_date"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_preventive_care_due',
  'UTILITY',
  'es_CO',
  'tpl_meta_11_preventive',
  'Hola {{1}}, el registro clínico oficial indica que {{2}} tiene pendiente su refuerzo de {{3}}. Podemos agendar la aplicación domiciliaria esta semana.',
  '["owner_name", "pet_name", "vaccine_name"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_specialist_referral_options',
  'UTILITY',
  'es_CO',
  'tpl_meta_12_spec_options',
  'Hola {{1}}, para la interconsulta de {{2}} con especialista en {{3}}, tenemos disponibilidad con: 1) {{4}}, 2) {{5}}. ¿Cuál prefieres?',
  '["owner_name", "pet_name", "specialty", "option_1", "option_2"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_specialist_confirmed',
  'UTILITY',
  'es_CO',
  'tpl_meta_13_spec_conf',
  'Confirmada la consulta de especialista en {{1}} para {{2}} con {{3}} el {{4}} a las {{5}}.',
  '["specialty", "pet_name", "specialist_name", "date", "time"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_clinical_document_available',
  'UTILITY',
  'es_CO',
  'tpl_meta_14_doc_avail',
  'Hola {{1}}, el documento clínico ({{2}}) de {{3}} ya está disponible para descarga segura en el siguiente enlace temporal: {{4}}.',
  '["owner_name", "doc_type", "pet_name", "secure_url"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_post_visit_followup',
  'UTILITY',
  'es_CO',
  'tpl_meta_15_post_visit',
  'Hola {{1}}, esperamos que {{2}} se encuentre muy bien tras la visita de hoy. Recuerda seguir las indicaciones médicas entregadas.',
  '["owner_name", "pet_name"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_experience_survey',
  'UTILITY',
  'es_CO',
  'tpl_meta_16_survey',
  'Hola {{1}}, en Vet Life nos esforzamos por dar la mejor atención a {{2}}. Del 1 al 5, ¿cómo calificarías el servicio recibido hoy?',
  '["owner_name", "pet_name"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_review_request',
  'MARKETING',
  'es_CO',
  'tpl_meta_17_review',
  '¡Hola {{1}}! Nos alegra haber atendido a {{2}}. Si tienes un minuto, nos encantaría que nos dejaras tu reseña voluntaria en Google: {{3}}.',
  '["owner_name", "pet_name", "review_link"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_payment_pse_link',
  'UTILITY',
  'es_CO',
  'tpl_meta_18_payment',
  'Hola {{1}}, aquí tienes el enlace seguro para realizar el pago PSE por los servicios de {{2}} (Monto: COP ${{3}}): {{4}}.',
  '["owner_name", "pet_name", "amount_cop", "payment_url"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_human_agent_handoff_response',
  'UTILITY',
  'es_CO',
  'tpl_meta_19_human_resp',
  'Hola {{1}}, le habla {{2}} de Vet Life. Con respecto a su consulta sobre {{3}}: {{4}}.',
  '["owner_name", "staff_name", "pet_name", "response_snippet"]'::jsonb,
  true,
  true
),
(
  '11111111-1111-1111-1111-111111111111',
  'vet_administrative_notice',
  'UTILITY',
  'es_CO',
  'tpl_meta_20_admin_notice',
  'Aviso Vet Life para {{1}}: {{2}}.',
  '["owner_name", "notice_content"]'::jsonb,
  true,
  true
)
ON CONFLICT (organization_id, template_name, language) DO UPDATE 
SET 
  body_template = EXCLUDED.body_template,
  parameter_definitions = EXCLUDED.parameter_definitions,
  is_approved_by_meta = EXCLUDED.is_approved_by_meta,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- 8. RPC: update_whatsapp_conversation_window
CREATE OR REPLACE FUNCTION public.update_whatsapp_conversation_window(
  p_organization_id uuid,
  p_recipient_phone text,
  p_conversation_id uuid DEFAULT NULL,
  p_message_received_at timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expires_at timestamptz;
  v_rec record;
BEGIN
  v_expires_at := p_message_received_at + interval '24 hours';

  INSERT INTO public.whatsapp_conversation_windows (
    organization_id,
    conversation_id,
    recipient_phone,
    last_user_message_at,
    window_expires_at,
    is_window_open,
    updated_at
  ) VALUES (
    p_organization_id,
    p_conversation_id,
    p_recipient_phone,
    p_message_received_at,
    v_expires_at,
    true,
    now()
  )
  ON CONFLICT (organization_id, recipient_phone) DO UPDATE
  SET
    conversation_id = COALESCE(EXCLUDED.conversation_id, public.whatsapp_conversation_windows.conversation_id),
    last_user_message_at = EXCLUDED.last_user_message_at,
    window_expires_at = EXCLUDED.window_expires_at,
    is_window_open = true,
    updated_at = now()
  RETURNING * INTO v_rec;

  RETURN jsonb_build_object(
    'success', true,
    'recipient_phone', p_recipient_phone,
    'window_expires_at', v_rec.window_expires_at,
    'is_window_open', true
  );
END;
$$;

-- 9. RPC: claim_authorized_outbound_message (Control Atómico de Despacho)
CREATE OR REPLACE FUNCTION public.claim_authorized_outbound_message(
  p_request_id uuid,
  p_worker_id text DEFAULT 'n8n-worker-01'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req record;
  v_window record;
  v_suppression record;
  v_conv record;
  v_tpl record;
  v_tpl_name text := NULL;
  v_tpl_lang text := 'es_CO';
  v_is_within_window boolean := false;
  v_now timestamptz := now();
BEGIN
  -- 1. Bloqueo exclusivo a nivel de fila (FOR UPDATE)
  SELECT * INTO v_req FROM public.outbound_dispatch_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('is_authorized', false, 'error', 'REQUEST_NOT_FOUND');
  END IF;

  -- 2. Verificar estado válido para reclamo
  IF v_req.status NOT IN ('QUEUED', 'APPROVED', 'SCHEDULED') THEN
    RETURN jsonb_build_object(
      'is_authorized', false, 
      'error', 'INVALID_STATUS_FOR_CLAIM', 
      'current_status', v_req.status
    );
  END IF;

  -- 3. Verificar si está programado a futuro
  IF v_req.scheduled_for IS NOT NULL AND v_req.scheduled_for > v_now THEN
    RETURN jsonb_build_object(
      'is_authorized', false,
      'error', 'SCHEDULED_FOR_FUTURE',
      'scheduled_for', v_req.scheduled_for
    );
  END IF;

  -- 4. Verificar expiración
  IF v_req.expires_at IS NOT NULL AND v_req.expires_at < v_now THEN
    UPDATE public.outbound_dispatch_requests
    SET status = 'EXPIRED', updated_at = v_now
    WHERE id = p_request_id;

    RETURN jsonb_build_object('is_authorized', false, 'error', 'MESSAGE_REQUEST_EXPIRED');
  END IF;

  -- 5. Verificar lista de supresión (Duelo, Quejas Abiertas, Opt-Out)
  SELECT * INTO v_suppression 
  FROM public.whatsapp_contact_suppressions 
  WHERE organization_id = v_req.organization_id 
    AND recipient_phone = v_req.recipient_phone 
    AND is_active = true 
    AND (expires_at IS NULL OR expires_at > v_now)
  LIMIT 1;

  IF FOUND THEN
    -- Cancelación automática según tipo de supresión
    IF v_suppression.suppression_type = 'BEREAVEMENT' THEN
      UPDATE public.outbound_dispatch_requests
      SET status = 'CANCELLED_BEREAVEMENT', error_log = 'Blocked by bereavement protocol: ' || v_suppression.reason, updated_at = v_now
      WHERE id = p_request_id;
      RETURN jsonb_build_object('is_authorized', false, 'error', 'SUPPRESSED_BEREAVEMENT');
    ELSIF v_suppression.suppression_type = 'OPT_OUT_MARKETING' AND v_req.message_category = 'MARKETING' THEN
      UPDATE public.outbound_dispatch_requests
      SET status = 'CANCELLED_OPT_OUT', error_log = 'Blocked by customer marketing opt-out', updated_at = v_now
      WHERE id = p_request_id;
      RETURN jsonb_build_object('is_authorized', false, 'error', 'SUPPRESSED_MARKETING_OPT_OUT');
    ELSIF v_suppression.suppression_type = 'CAREGIVER_REVOKED' THEN
      UPDATE public.outbound_dispatch_requests
      SET status = 'CANCELLED', error_log = 'Caregiver authorization revoked', updated_at = v_now
      WHERE id = p_request_id;
      RETURN jsonb_build_object('is_authorized', false, 'error', 'SUPPRESSED_CAREGIVER_REVOKED');
    END IF;
  END IF;

  -- 6. Verificar propiedad de conversación y supresión de IA si humano tomó el control
  IF v_req.conversation_id IS NOT NULL THEN
    SELECT * INTO v_conv FROM public.conversations WHERE id = v_req.conversation_id;
    IF FOUND THEN
      -- Si el mensaje proviene de IA pero el bot fue bloqueado:
      IF v_conv.is_bot_locked AND (v_req.claimed_by = 'BOT' OR v_req.message_purpose = 'AI_AUTONOMOUS_REPLY') THEN
        UPDATE public.outbound_dispatch_requests
        SET status = 'CANCELLED', error_log = 'Suppressed due to human agent takeover', updated_at = v_now
        WHERE id = p_request_id;

        RETURN jsonb_build_object('is_authorized', false, 'error', 'SUPPRESSED_DUE_TO_HUMAN_TAKEOVER');
      END IF;

      -- Verificar si el borrador es obsoleto respecto a la versión actual de la conversación
      IF v_req.draft_state_version IS NOT NULL AND v_req.draft_state_version < v_conv.state_version THEN
        UPDATE public.outbound_dispatch_requests
        SET status = 'CANCELLED', error_log = 'Stale AI draft invalidated: state_version mismatch', updated_at = v_now
        WHERE id = p_request_id;

        RETURN jsonb_build_object('is_authorized', false, 'error', 'STALE_AI_DRAFT_INVALIDATED');
      END IF;
    END IF;
  END IF;

  -- 7. Verificar ventana de servicio de 24 horas
  SELECT * INTO v_window 
  FROM public.whatsapp_conversation_windows 
  WHERE organization_id = v_req.organization_id AND recipient_phone = v_req.recipient_phone;

  IF FOUND AND v_window.is_window_open AND v_window.window_expires_at > v_now THEN
    v_is_within_window := true;
  ELSE
    v_is_within_window := false;
  END IF;

  -- Si está fuera de la ventana de 24h, Meta EXIGE plantilla aprobada (HSM). Texto libre prohibido.
  IF NOT v_is_within_window AND v_req.template_id IS NULL AND (v_req.freeform_text IS NOT NULL AND v_req.freeform_text <> '') THEN
    RETURN jsonb_build_object(
      'is_authorized', false,
      'error', 'TEMPLATE_REQUIRED_OUTSIDE_24H_WINDOW',
      'message', 'Fuera de la ventana de 24 horas es obligatorio utilizar una plantilla oficial aprobada por Meta.'
    );
  END IF;

  -- 8. Validar plantilla si corresponde
  IF v_req.template_id IS NOT NULL THEN
    SELECT * INTO v_tpl FROM public.message_templates WHERE id = v_req.template_id;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('is_authorized', false, 'error', 'TEMPLATE_NOT_FOUND');
    END IF;

    IF NOT v_tpl.is_approved_by_meta THEN
      RETURN jsonb_build_object(
        'is_authorized', false, 
        'error', 'TEMPLATE_NOT_APPROVED_BY_META',
        'template_name', v_tpl.template_name
      );
    END IF;

    IF NOT v_tpl.is_active THEN
      RETURN jsonb_build_object('is_authorized', false, 'error', 'TEMPLATE_INACTIVE');
    END IF;

    v_tpl_name := v_tpl.template_name;
    v_tpl_lang := v_tpl.language;
  END IF;

  -- 9. Transición atómica a CLAIMED
  UPDATE public.outbound_dispatch_requests
  SET 
    status = 'CLAIMED',
    claimed_by = p_worker_id,
    claimed_at = v_now,
    dispatch_attempts = v_req.dispatch_attempts + 1,
    last_attempt_at = v_now,
    updated_at = v_now
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'is_authorized', true,
    'request_id', p_request_id,
    'organization_id', v_req.organization_id,
    'conversation_id', v_req.conversation_id,
    'recipient_phone', v_req.recipient_phone,
    'sender_phone_number_id', v_req.sender_phone_number_id,
    'is_within_24h_window', v_is_within_window,
    'use_template', (v_req.template_id IS NOT NULL),
    'template_name', v_tpl_name,
    'template_language', v_tpl_lang,
    'template_variables', v_req.template_variables,
    'freeform_text', v_req.freeform_text,
    'message_category', v_req.message_category,
    'message_purpose', v_req.message_purpose,
    'idempotency_key', v_req.idempotency_key,
    'correlation_id', v_req.correlation_id,
    'attempt_number', v_req.dispatch_attempts + 1
  );
END;
$$;

-- 10. RPC: record_provider_send_result (Registro Seguro de Aceptación o Incertidumbre)
CREATE OR REPLACE FUNCTION public.record_provider_send_result(
  p_request_id uuid,
  p_provider_message_id text,
  p_http_status integer,
  p_raw_response jsonb,
  p_is_uncertain boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req record;
  v_now timestamptz := now();
  v_new_status text;
  v_msg_id uuid;
BEGIN
  SELECT * INTO v_req FROM public.outbound_dispatch_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'REQUEST_NOT_FOUND');
  END IF;

  IF p_is_uncertain OR p_http_status = 504 OR p_http_status = 408 THEN
    -- Timeout o incertidumbre de red: NO REINTENTAR A CIEGAS -> RECONCILIATION_REQUIRED
    v_new_status := 'RECONCILIATION_REQUIRED';

    UPDATE public.outbound_dispatch_requests
    SET
      status = v_new_status,
      http_status = p_http_status,
      raw_provider_response = p_raw_response,
      error_log = 'Uncertain external send result: Provider timed out or returned ambiguous response. Awaiting delivery status reconciliation.',
      updated_at = v_now
    WHERE id = p_request_id;

    -- Emisión a outbox para observabilidad CORE-20
    INSERT INTO public.transactional_outbox (
      organization_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key, correlation_id, source_system, schema_version, status
    ) VALUES (
      v_req.organization_id, 'OUTBOUND_MESSAGE', p_request_id, 'message.reconciliation_required',
      jsonb_build_object('request_id', p_request_id, 'http_status', p_http_status, 'recipient_phone', v_req.recipient_phone),
      'recon-req-' || p_request_id || '-' || extract(epoch from v_now)::bigint,
      COALESCE(v_req.correlation_id::uuid, gen_random_uuid()),
      'SUPABASE_CORE', 1, 'PENDING'
    );

    RETURN jsonb_build_object(
      'success', true,
      'status', 'RECONCILIATION_REQUIRED',
      'request_id', p_request_id,
      'note', 'Marked for reconciliation. Blind retries suppressed.'
    );
  END IF;

  IF p_http_status >= 200 AND p_http_status < 300 THEN
    -- Meta aceptó el mensaje -> PROVIDER_ACCEPTED (No DELIVERED)
    v_new_status := 'PROVIDER_ACCEPTED';

    UPDATE public.outbound_dispatch_requests
    SET
      status = v_new_status,
      provider_message_id = p_provider_message_id,
      http_status = p_http_status,
      raw_provider_response = p_raw_response,
      completed_at = v_now,
      updated_at = v_now
    WHERE id = p_request_id;

    -- Registrar en public.messages si hay conversación vinculada
    IF v_req.conversation_id IS NOT NULL THEN
      INSERT INTO public.messages (
        conversation_id,
        direction,
        sender_type,
        external_message_id,
        message_type,
        content_text,
        delivery_status,
        raw_payload
      ) VALUES (
        v_req.conversation_id,
        'OUTBOUND',
        CASE WHEN v_req.claimed_by = 'BOT' THEN 'BOT_AI' ELSE 'STAFF_HUMAN' END,
        p_provider_message_id,
        'TEXT',
        COALESCE(v_req.freeform_text, 'Template: ' || p_provider_message_id),
        'SENT',
        p_raw_response
      ) RETURNING id INTO v_msg_id;
    END IF;

    -- Emisión a outbox
    INSERT INTO public.transactional_outbox (
      organization_id, aggregate_type, aggregate_id, event_type, payload, idempotency_key, correlation_id, source_system, schema_version, status
    ) VALUES (
      v_req.organization_id, 'OUTBOUND_MESSAGE', p_request_id, 'message.send_accepted',
      jsonb_build_object('request_id', p_request_id, 'provider_message_id', p_provider_message_id, 'status', 'PROVIDER_ACCEPTED'),
      'msg-acc-' || p_request_id || '-' || extract(epoch from v_now)::bigint,
      COALESCE(v_req.correlation_id::uuid, gen_random_uuid()),
      'SUPABASE_CORE', 1, 'PENDING'
    );

    RETURN jsonb_build_object(
      'success', true,
      'status', 'PROVIDER_ACCEPTED',
      'request_id', p_request_id,
      'provider_message_id', p_provider_message_id
    );
  ELSE
    -- Fallo definitivo de API (HTTP 4xx / 5xx)
    v_new_status := 'FAILED';

    UPDATE public.outbound_dispatch_requests
    SET
      status = v_new_status,
      http_status = p_http_status,
      raw_provider_response = p_raw_response,
      error_log = 'Provider rejected message: HTTP ' || p_http_status || ' - ' || (p_raw_response->>'error'),
      updated_at = v_now
    WHERE id = p_request_id;

    RETURN jsonb_build_object(
      'success', false,
      'status', 'FAILED',
      'request_id', p_request_id,
      'http_status', p_http_status
    );
  END IF;
END;
$$;

-- 11. RPC: process_whatsapp_delivery_status (Conciliación de Webhooks de Entrega)
CREATE OR REPLACE FUNCTION public.process_whatsapp_delivery_status(
  p_provider_message_id text,
  p_status text,
  p_provider_timestamp timestamptz DEFAULT now(),
  p_error_details jsonb DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req record;
  v_msg record;
  v_normalized_status text;
  v_current_delivery text;
BEGIN
  -- 1. Normalizar estado de proveedor
  v_normalized_status := lower(p_status);
  IF v_normalized_status NOT IN ('sent', 'delivered', 'read', 'failed') THEN
    RETURN jsonb_build_object('success', false, 'error', 'UNKNOWN_DELIVERY_STATUS');
  END IF;

  -- 2. Localizar solicitud vinculada
  SELECT * INTO v_req FROM public.outbound_dispatch_requests WHERE provider_message_id = p_provider_message_id LIMIT 1;

  -- 3. Inserción idempotente en public.whatsapp_delivery_events
  BEGIN
    INSERT INTO public.whatsapp_delivery_events (
      organization_id,
      provider_message_id,
      status,
      provider_timestamp,
      error_code,
      error_message,
      raw_payload,
      reconciled
    ) VALUES (
      COALESCE(v_req.organization_id, '11111111-1111-1111-1111-111111111111'::uuid),
      p_provider_message_id,
      v_normalized_status,
      p_provider_timestamp,
      p_error_details->>'code',
      p_error_details->>'title',
      p_error_details,
      true
    );
  EXCEPTION WHEN unique_violation THEN
    -- Evento ya registrado previamente (Idempotencia)
    RETURN jsonb_build_object('success', true, 'status', 'DUPLICATE_RECEIPT_IGNORED');
  END;

  -- 4. Actualizar public.messages respetando precedencia (READ > DELIVERED > SENT)
  SELECT * INTO v_msg FROM public.messages WHERE external_message_id = p_provider_message_id LIMIT 1;
  IF FOUND THEN
    v_current_delivery := v_msg.delivery_status;

    -- Manejo estricto de eventos fuera de orden: No degradar si ya está en estado más avanzado
    IF v_normalized_status = 'read' THEN
      UPDATE public.messages SET delivery_status = 'READ' WHERE id = v_msg.id;
    ELSIF v_normalized_status = 'delivered' AND v_current_delivery <> 'READ' THEN
      UPDATE public.messages SET delivery_status = 'DELIVERED' WHERE id = v_msg.id;
    ELSIF v_normalized_status = 'sent' AND v_current_delivery NOT IN ('DELIVERED', 'READ') THEN
      UPDATE public.messages SET delivery_status = 'SENT' WHERE id = v_msg.id;
    ELSIF v_normalized_status = 'failed' THEN
      UPDATE public.messages SET delivery_status = 'FAILED', error_code = p_error_details->>'code', error_message = p_error_details->>'title' WHERE id = v_msg.id;
    END IF;
  END IF;

  -- 5. Actualizar solicitud si estaba en RECONCILIATION_REQUIRED
  IF FOUND AND v_req.status = 'RECONCILIATION_REQUIRED' THEN
    UPDATE public.outbound_dispatch_requests
    SET status = upper(v_normalized_status), updated_at = now()
    WHERE id = v_req.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'provider_message_id', p_provider_message_id,
    'normalized_status', v_normalized_status,
    'reconciled', true
  );
END;
$$;

-- 12. RPC: cancel_obsolete_outbound_request (Cancelación Lógica de Mensajes Vencidos o Revocados)
CREATE OR REPLACE FUNCTION public.cancel_obsolete_outbound_request(
  p_request_id uuid,
  p_reason text DEFAULT 'Cita modificada o cancelada previamente'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_req record;
BEGIN
  SELECT * INTO v_req FROM public.outbound_dispatch_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'REQUEST_NOT_FOUND');
  END IF;

  -- Solo se pueden cancelar mensajes no despachados todavía a Meta
  IF v_req.status IN ('PROVIDER_ACCEPTED', 'DISPATCHED', 'DELIVERED', 'READ') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CANNOT_CANCEL_ALREADY_DISPATCHED_MESSAGE',
      'current_status', v_req.status
    );
  END IF;

  UPDATE public.outbound_dispatch_requests
  SET 
    status = 'CANCELLED',
    error_log = 'Cancelled by business logic: ' || p_reason,
    updated_at = now()
  WHERE id = p_request_id;

  RETURN jsonb_build_object(
    'success', true,
    'request_id', p_request_id,
    'status', 'CANCELLED',
    'reason', p_reason
  );
END;
$$;
