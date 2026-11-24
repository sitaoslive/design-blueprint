-- supabase/migrations/025_whatsapp_inbound_and_conversations.sql
-- ==============================================================================
-- VET FREEDOM OS — MIGRACIÓN 025
-- Procesamiento de Entrada de WhatsApp, Deduplicación, Enrutamiento y Bloqueo de Bot
-- Dirección Médica: Dr. Luis Eduardo Ríos
-- Dirección Estratégica: Alpha Vision Method
-- Fecha: 21 de Noviembre de 2026
-- ==============================================================================

-- 1. ÍNDICES DE RENDIMIENTO Y DEDUPLICACIÓN
-- Índice parcial único para deduplicación estricta por external_message_id (wamid)
CREATE UNIQUE INDEX IF NOT EXISTS idx_messages_external_id_unique 
ON public.messages (external_message_id) 
WHERE external_message_id IS NOT NULL;

-- Índices para búsqueda rápida de propietarios por teléfono
CREATE INDEX IF NOT EXISTS idx_owners_primary_phone 
ON public.owners (primary_phone);

CREATE INDEX IF NOT EXISTS idx_owners_secondary_phone 
ON public.owners (secondary_phone) 
WHERE secondary_phone IS NOT NULL;

-- Índice para búsqueda de conversaciones por teléfono y canal
CREATE INDEX IF NOT EXISTS idx_conversations_channel_phone 
ON public.conversations (organization_id, channel, sender_phone);

-- 2. FUNCIÓN ATÓMICA DE INGESTIÓN DE MENSAJES DE WHATSAPP
CREATE OR REPLACE FUNCTION public.ingest_whatsapp_inbound_message(p_payload jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id uuid;
    v_provider_msg_id text;
    v_raw_phone text;
    v_clean_phone text;
    v_national_phone text;
    v_sender_name text;
    v_msg_type text;
    v_content_text text;
    v_media_url text;
    v_raw_payload jsonb;
    v_sent_at timestamptz;
    
    v_existing_msg_id uuid;
    v_existing_conv_id uuid;
    v_owner_id uuid := NULL;
    v_owner_name text := NULL;
    v_pets_json jsonb := '[]'::jsonb;
    v_conversation_id uuid;
    v_is_bot_locked boolean := false;
    v_conv_status text := 'AI_HANDLING';
    v_message_id uuid;
    
    v_is_emergency boolean := false;
    v_detected_intent text := 'GENERAL_INQUIRY';
    v_triage_level text := 'ROUTINE';
    v_routing_target text := 'AI_ASSISTANT_PIPELINE';
    v_priority text := 'MEDIUM';
    v_escalation_reason text := NULL;
    
    v_lower_text text;
    v_outbox_event_id uuid;
    v_correlation_id uuid;
BEGIN
    -- Extracción y saneamiento de parámetros
    v_org_id := COALESCE(
        (p_payload->>'organization_id')::uuid,
        '11111111-1111-1111-1111-111111111111'::uuid
    );
    v_provider_msg_id := NULLIF(trim(p_payload->>'provider_message_id'), '');
    v_raw_phone := COALESCE(p_payload->>'sender_phone', '');
    v_sender_name := NULLIF(trim(p_payload->>'sender_name'), '');
    v_msg_type := UPPER(COALESCE(p_payload->>'message_type', 'TEXT'));
    v_content_text := COALESCE(p_payload->>'content_text', '');
    v_media_url := NULLIF(trim(p_payload->>'media_url'), '');
    v_raw_payload := COALESCE(p_payload->'raw_payload', p_payload);
    v_sent_at := COALESCE((p_payload->>'sent_at')::timestamptz, clock_timestamp());
    v_correlation_id := COALESCE((p_payload->>'correlation_id')::uuid, gen_random_uuid());

    -- Validación de tipo de mensaje canónico
    IF v_msg_type NOT IN ('TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'LOCATION', 'TEMPLATE', 'INTERACTIVE_BUTTON', 'INTERACTIVE_LIST') THEN
        v_msg_type := 'TEXT';
    END IF;

    -- Paso A: Deduplicación estricta por external_message_id (wamid)
    IF v_provider_msg_id IS NOT NULL THEN
        SELECT id, conversation_id INTO v_existing_msg_id, v_existing_conv_id
        FROM public.messages
        WHERE external_message_id = v_provider_msg_id
        LIMIT 1;

        IF v_existing_msg_id IS NOT NULL THEN
            RETURN jsonb_build_object(
                'status', 'DUPLICATE_IGNORED',
                'is_duplicate', true,
                'message_id', v_existing_msg_id,
                'conversation_id', v_existing_conv_id,
                'provider_message_id', v_provider_msg_id,
                'note_es', 'Mensaje ya procesado anteriormente. Deduplicación exitosa.'
            );
        END IF;
    END IF;

    -- Paso B: Normalización de número telefónico (E.164 Colombia +57)
    v_clean_phone := regexp_replace(v_raw_phone, '[^0-9+]', '', 'g');
    IF NOT (v_clean_phone LIKE '+%') THEN
        IF v_clean_phone LIKE '57%' THEN
            v_clean_phone := '+' || v_clean_phone;
        ELSE
            v_clean_phone := '+57' || v_clean_phone;
        END IF;
    END IF;

    -- Formato nacional sin código de país (10 dígitos)
    IF v_clean_phone LIKE '+57%' THEN
        v_national_phone := substring(v_clean_phone from 4);
    ELSE
        v_national_phone := v_clean_phone;
    END IF;

    -- Paso C: Identificación de Propietario / Tutor (public.owners)
    SELECT id, trim(first_name || ' ' || last_name)
    INTO v_owner_id, v_owner_name
    FROM public.owners
    WHERE organization_id = v_org_id
      AND (
          primary_phone = v_clean_phone 
          OR primary_phone = v_national_phone
          OR secondary_phone = v_clean_phone 
          OR secondary_phone = v_national_phone
      )
      AND status != 'INACTIVE'
    ORDER BY created_at DESC
    LIMIT 1;

    -- Si se identifica propietario, buscar sus mascotas activas
    IF v_owner_id IS NOT NULL THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'name', name,
                'species', species,
                'breed', breed,
                'status', status
            )
        )
        INTO v_pets_json
        FROM public.pets
        WHERE primary_owner_id = v_owner_id
          AND status = 'ACTIVE';

        IF v_pets_json IS NULL THEN
            v_pets_json := '[]'::jsonb;
        END IF;
    END IF;

    -- Paso D: Detección de Intención Clínica y Triage de Emergencias
    v_lower_text := LOWER(COALESCE(v_content_text, ''));
    
    IF v_lower_text ~* '(urgente|emergencia|convulsio|intoxicad|envenen|sangre|hemorrag|atropellad|asfixi|no respira|dificultad para respirar|inconsciente|ahogando)' THEN
        v_is_emergency := true;
        v_detected_intent := 'EMERGENCY_TRIAGE';
        v_triage_level := 'EMERGENCY_IMMEDIATE';
        v_priority := 'CRITICAL';
        v_escalation_reason := 'CLINICAL_EMERGENCY_DETECTED';
    ELSIF v_lower_text ~* '(cita|agendar|consulta|visita|domicilio|disponibilidad|programar)' THEN
        v_detected_intent := 'APPOINTMENT_REQUEST';
        v_triage_level := 'SCHEDULE_REQUEST';
        v_priority := 'HIGH';
    ELSIF v_lower_text ~* '(cancelar|reprogramar|aplazar|cambiar fecha|cambiar hora)' THEN
        v_detected_intent := 'APPOINTMENT_MODIFICATION';
        v_triage_level := 'MODIFICATION_REQUEST';
        v_priority := 'HIGH';
    ELSIF v_lower_text ~* '(precio|costo|cuanto vale|tarifa|pago|nequi|daviplata|bancolombia|transferencia)' THEN
        v_detected_intent := 'FINANCIAL_QUERY';
        v_triage_level := 'BILLING';
        v_priority := 'MEDIUM';
    ELSIF v_lower_text ~* '(vacuna|desparasita|control|seguimiento|post-operatorio|postoperatorio)' THEN
        v_detected_intent := 'PREVENTIVE_OR_FOLLOWUP';
        v_triage_level := 'CLINICAL_FOLLOWUP';
        v_priority := 'MEDIUM';
    END IF;

    -- Paso E: Búsqueda o Creación de la Conversación
    SELECT id, is_bot_locked, status
    INTO v_conversation_id, v_is_bot_locked, v_conv_status
    FROM public.conversations
    WHERE organization_id = v_org_id
      AND channel = 'WHATSAPP'
      AND external_conversation_id = v_clean_phone
    LIMIT 1;

    IF v_conversation_id IS NOT NULL THEN
        -- Actualizar conversación existente
        UPDATE public.conversations
        SET 
            last_message_at = clock_timestamp(),
            window_expires_at = clock_timestamp() + interval '24 hours',
            owner_id = COALESCE(v_owner_id, conversations.owner_id),
            sender_name = COALESCE(v_sender_name, conversations.sender_name),
            ai_intent = v_detected_intent,
            status = CASE 
                WHEN v_is_emergency THEN 'WAITING_HUMAN'
                WHEN conversations.is_bot_locked THEN 'WAITING_HUMAN'
                ELSE conversations.status
            END,
            updated_at = clock_timestamp()
        WHERE id = v_conversation_id;
    ELSE
        -- Insertar nueva conversación
        INSERT INTO public.conversations (
            organization_id,
            owner_id,
            channel,
            external_conversation_id,
            sender_phone,
            sender_name,
            status,
            last_message_at,
            window_expires_at,
            is_bot_locked,
            ai_intent,
            metadata
        ) VALUES (
            v_org_id,
            v_owner_id,
            'WHATSAPP',
            v_clean_phone,
            v_clean_phone,
            COALESCE(v_sender_name, 'Propietario WhatsApp'),
            CASE WHEN v_is_emergency THEN 'WAITING_HUMAN' ELSE 'AI_HANDLING' END,
            clock_timestamp(),
            clock_timestamp() + interval '24 hours',
            false,
            v_detected_intent,
            jsonb_build_object(
                'channel_provider', 'whatsapp_cloud_api',
                'created_by', 'VET-CORE-02',
                'initial_phone', v_raw_phone
            )
        )
        RETURNING id, is_bot_locked, status INTO v_conversation_id, v_is_bot_locked, v_conv_status;
    END IF;

    -- Paso F: Determinación de Enrutamiento y Respeto a Bot-Lock
    IF v_is_bot_locked THEN
        v_routing_target := 'HUMAN_SUPPORT_QUEUE';
        v_escalation_reason := 'BOT_LOCKED_BY_AGENT';
        v_priority := CASE WHEN v_is_emergency THEN 'CRITICAL' ELSE 'HIGH' END;
    ELSIF v_is_emergency THEN
        v_routing_target := 'CLINICAL_EMERGENCY_QUEUE';
        v_escalation_reason := 'CLINICAL_EMERGENCY_DETECTED';
        v_priority := 'CRITICAL';
        -- Forzar bloqueo de bot para emergencias médicas
        UPDATE public.conversations
        SET is_bot_locked = true, status = 'WAITING_HUMAN'
        WHERE id = v_conversation_id;
        v_is_bot_locked := true;
    ELSIF v_detected_intent = 'APPOINTMENT_MODIFICATION' THEN
        v_routing_target := 'HUMAN_SUPPORT_QUEUE';
        v_escalation_reason := 'MODIFICATION_REQUEST';
        v_priority := 'HIGH';
    ELSE
        v_routing_target := 'AI_ASSISTANT_PIPELINE';
    END IF;

    -- Paso G: Inserción del Mensaje en public.messages
    INSERT INTO public.messages (
        conversation_id,
        direction,
        sender_type,
        external_message_id,
        message_type,
        content_text,
        media_url,
        delivery_status,
        raw_payload,
        sent_at,
        created_at
    ) VALUES (
        v_conversation_id,
        'INBOUND',
        'CLIENT',
        v_provider_msg_id,
        v_msg_type,
        v_content_text,
        v_media_url,
        'RECEIVED',
        v_raw_payload,
        v_sent_at,
        clock_timestamp()
    )
    RETURNING id INTO v_message_id;

    -- Paso H: Emisión al transactional_outbox para desacoplamiento (CORE-01)
    INSERT INTO public.transactional_outbox (
        organization_id,
        aggregate_type,
        aggregate_id,
        event_type,
        payload,
        idempotency_key,
        status,
        retry_count,
        max_retries,
        schema_version,
        correlation_id,
        source_system
    ) VALUES (
        v_org_id,
        'CONVERSATION',
        v_conversation_id,
        CASE 
            WHEN v_is_emergency THEN 'CLINICAL_EMERGENCY_DETECTED'
            WHEN v_is_bot_locked THEN 'WHATSAPP_HUMAN_MESSAGE_RECEIVED'
            ELSE 'WHATSAPP_MESSAGE_RECEIVED'
        END,
        jsonb_build_object(
            'message_id', v_message_id,
            'conversation_id', v_conversation_id,
            'provider_message_id', v_provider_msg_id,
            'sender_phone', v_clean_phone,
            'sender_name', COALESCE(v_sender_name, v_owner_name, 'Propietario WhatsApp'),
            'owner_id', v_owner_id,
            'owner_name', v_owner_name,
            'associated_pets', v_pets_json,
            'message_type', v_msg_type,
            'content_text', v_content_text,
            'media_url', v_media_url,
            'detected_intent', v_detected_intent,
            'triage_level', v_triage_level,
            'routing_target', v_routing_target,
            'priority', v_priority,
            'is_bot_locked', v_is_bot_locked,
            'is_emergency', v_is_emergency,
            'escalation_reason', v_escalation_reason
        ),
        'outbox-wamid-' || COALESCE(v_provider_msg_id, v_message_id::text),
        'PENDING',
        0,
        5,
        1,
        v_correlation_id,
        'VET-CORE-02'
    )
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING id INTO v_outbox_event_id;

    -- Respuesta estructurada
    RETURN jsonb_build_object(
        'status', 'INGESTED',
        'is_duplicate', false,
        'message_id', v_message_id,
        'conversation_id', v_conversation_id,
        'provider_message_id', v_provider_msg_id,
        'sender_phone', v_clean_phone,
        'sender_name', COALESCE(v_sender_name, v_owner_name, 'Propietario WhatsApp'),
        'owner_id', v_owner_id,
        'owner_name', v_owner_name,
        'associated_pets', v_pets_json,
        'pets_count', jsonb_array_length(v_pets_json),
        'message_type', v_msg_type,
        'content_text', v_content_text,
        'detected_intent', v_detected_intent,
        'triage_level', v_triage_level,
        'routing_target', v_routing_target,
        'priority', v_priority,
        'is_bot_locked', v_is_bot_locked,
        'is_emergency', v_is_emergency,
        'escalation_reason', v_escalation_reason,
        'outbox_event_id', v_outbox_event_id,
        'correlation_id', v_correlation_id,
        'ingested_at', clock_timestamp()
    );
END;
$$;

-- 3. FUNCIÓN PARA CONTROL DE BLOQUEO DE BOT (BOT-LOCK)
CREATE OR REPLACE FUNCTION public.set_conversation_bot_lock(
    p_conversation_id uuid,
    p_locked boolean,
    p_reason text DEFAULT 'MANUAL_OVERRIDE_BY_STAFF'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_updated_conv record;
BEGIN
    UPDATE public.conversations
    SET 
        is_bot_locked = p_locked,
        status = CASE 
            WHEN p_locked THEN 'WAITING_HUMAN' 
            ELSE 'AI_HANDLING' 
        END,
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{bot_lock_audit}',
            jsonb_build_object(
                'locked', p_locked,
                'reason', p_reason,
                'changed_at', clock_timestamp()
            )
        ),
        updated_at = clock_timestamp()
    WHERE id = p_conversation_id
    RETURNING id, organization_id, sender_phone, is_bot_locked, status, updated_at
    INTO v_updated_conv;

    IF v_updated_conv.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'CONVERSATION_NOT_FOUND',
            'conversation_id', p_conversation_id
        );
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'conversation_id', v_updated_conv.id,
        'organization_id', v_updated_conv.organization_id,
        'sender_phone', v_updated_conv.sender_phone,
        'is_bot_locked', v_updated_conv.is_bot_locked,
        'status', v_updated_conv.status,
        'reason', p_reason,
        'updated_at', v_updated_conv.updated_at
    );
END;
$$;

-- 4. FUNCIÓN PARA OBTENER EL CONTEXTO COMPLETO DE CONVERSACIÓN
CREATE OR REPLACE FUNCTION public.get_conversation_context(p_conversation_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_conv record;
    v_owner record;
    v_pets jsonb;
    v_recent_messages jsonb;
BEGIN
    SELECT * INTO v_conv
    FROM public.conversations
    WHERE id = p_conversation_id;

    IF v_conv.id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'CONVERSATION_NOT_FOUND');
    END IF;

    -- Propietario si existe
    IF v_conv.owner_id IS NOT NULL THEN
        SELECT id, first_name, last_name, primary_phone, email, is_vip, status
        INTO v_owner
        FROM public.owners
        WHERE id = v_conv.owner_id;

        -- Mascotas
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'name', name,
                'species', species,
                'breed', breed,
                'birth_date', birth_date,
                'temperament', temperament,
                'status', status
            )
        )
        INTO v_pets
        FROM public.pets
        WHERE primary_owner_id = v_conv.owner_id;
    END IF;

    -- Últimos 10 mensajes
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'direction', direction,
            'sender_type', sender_type,
            'message_type', message_type,
            'content_text', content_text,
            'delivery_status', delivery_status,
            'sent_at', sent_at
        ) ORDER BY sent_at ASC
    )
    INTO v_recent_messages
    FROM (
        SELECT id, direction, sender_type, message_type, content_text, delivery_status, sent_at
        FROM public.messages
        WHERE conversation_id = p_conversation_id
        ORDER BY sent_at DESC
        LIMIT 10
    ) sub;

    RETURN jsonb_build_object(
        'success', true,
        'conversation', jsonb_build_object(
            'id', v_conv.id,
            'organization_id', v_conv.organization_id,
            'channel', v_conv.channel,
            'sender_phone', v_conv.sender_phone,
            'sender_name', v_conv.sender_name,
            'status', v_conv.status,
            'is_bot_locked', v_conv.is_bot_locked,
            'ai_intent', v_conv.ai_intent,
            'last_message_at', v_conv.last_message_at,
            'window_expires_at', v_conv.window_expires_at
        ),
        'owner', CASE WHEN v_owner.id IS NOT NULL THEN jsonb_build_object(
            'id', v_owner.id,
            'name', trim(v_owner.first_name || ' ' || v_owner.last_name),
            'phone', v_owner.primary_phone,
            'is_vip', v_owner.is_vip
        ) ELSE NULL END,
        'pets', COALESCE(v_pets, '[]'::jsonb),
        'recent_messages', COALESCE(v_recent_messages, '[]'::jsonb)
    );
END;
$$;

-- 5. PERMISOS
GRANT EXECUTE ON FUNCTION public.ingest_whatsapp_inbound_message(jsonb) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.set_conversation_bot_lock(uuid, boolean, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_conversation_context(uuid) TO authenticated, service_role;
