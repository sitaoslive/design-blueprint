-- Políticas RLS para conversation_handoffs
DROP POLICY IF EXISTS p_handoffs_select ON public.conversation_handoffs;
CREATE POLICY p_handoffs_select ON public.conversation_handoffs
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() AND is_active = true));

DROP POLICY IF EXISTS p_handoffs_all ON public.conversation_handoffs;
CREATE POLICY p_handoffs_all ON public.conversation_handoffs
  FOR ALL TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() AND is_active = true))
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() AND is_active = true));

-- Políticas RLS para conversation_state_transitions
DROP POLICY IF EXISTS p_state_transitions_select ON public.conversation_state_transitions;
CREATE POLICY p_state_transitions_select ON public.conversation_state_transitions
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() AND is_active = true));

-- Políticas RLS para conversation_internal_notes
DROP POLICY IF EXISTS p_internal_notes_select ON public.conversation_internal_notes;
CREATE POLICY p_internal_notes_select ON public.conversation_internal_notes
  FOR SELECT TO authenticated
  USING (organization_id IN (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() AND is_active = true));

DROP POLICY IF EXISTS p_internal_notes_insert ON public.conversation_internal_notes;
CREATE POLICY p_internal_notes_insert ON public.conversation_internal_notes
  FOR INSERT TO authenticated
  WITH CHECK (organization_id IN (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() AND is_active = true));

-- 6. PROCEDIMIENTOS ALMACENADOS ATÓMICOS PROTEGIDOS

-- 6.1 RPC: request_human_handoff
CREATE OR REPLACE FUNCTION public.request_human_handoff(
  p_conversation_id uuid,
  p_reason text,
  p_priority text DEFAULT 'STANDARD',
  p_team text DEFAULT 'RECEPCION',
  p_role text DEFAULT 'RECEPTION',
  p_summary text DEFAULT 'Solicitud de asistencia humana'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv record;
  v_new_version integer;
  v_handoff_id uuid;
  v_sla_minutes integer;
  v_expires_at timestamptz;
  v_role_enum public.app_role_type;
BEGIN
  -- Validar conversación
  SELECT * INTO v_conv FROM public.conversations WHERE id = p_conversation_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'CONVERSATION_NOT_FOUND');
  END IF;

  v_new_version := v_conv.state_version + 1;
  v_sla_minutes := CASE 
    WHEN p_priority = 'CRITICAL' THEN 5
    WHEN p_priority = 'HIGH' THEN 15
    ELSE 30
  END;
  v_expires_at := now() + (v_sla_minutes || ' minutes')::interval;

  -- Convertir rol texto a enum seguro
  BEGIN
    v_role_enum := p_role::public.app_role_type;
  EXCEPTION WHEN OTHERS THEN
    v_role_enum := 'COORDINATOR'::public.app_role_type;
  END;

  -- Actualizar conversación: BLOQUEO INMEDIATO DE IA
  UPDATE public.conversations
  SET 
    status = 'HANDOFF_PENDING_ASSIGNMENT',
    is_bot_locked = true,
    human_takeover_at = now(),
    state_version = v_new_version,
    assigned_team = p_team,
    assigned_role = p_role,
    handoff_priority = p_priority,
    escalation_deadline_at = v_expires_at,
    updated_at = now(),
    metadata = jsonb_set(
      metadata, 
      '{last_escalation}', 
      jsonb_build_object(
        'reason', p_reason,
        'priority', p_priority,
        'team', p_team,
        'requested_at', now(),
        'state_version', v_new_version
      )
    )
  WHERE id = p_conversation_id;

  -- Insertar registro de handoff
  INSERT INTO public.conversation_handoffs (
    organization_id,
    conversation_id,
    customer_id,
    handoff_reason,
    priority,
    requested_team,
    requested_role,
    status,
    state_version,
    expires_at,
    summary,
    metadata
  ) VALUES (
    v_conv.organization_id,
    p_conversation_id,
    v_conv.owner_id,
    p_reason,
    p_priority,
    p_team,
    v_role_enum,
    'PENDING_ASSIGNMENT',
    v_new_version,
    v_expires_at,
    p_summary,
    jsonb_build_object('sla_minutes', v_sla_minutes, 'client_phone', v_conv.sender_phone)
  ) RETURNING id INTO v_handoff_id;

  -- Registrar auditoría de transición
  INSERT INTO public.conversation_state_transitions (
    organization_id,
    conversation_id,
    handoff_id,
    previous_state,
    new_state,
    state_version,
    actor_type,
    actor_id,
    reason
  ) VALUES (
    v_conv.organization_id,
    p_conversation_id,
    v_handoff_id,
    v_conv.status,
    'HANDOFF_PENDING_ASSIGNMENT',
    v_new_version,
    'SYSTEM',
    'VET-CORE-02-OR-AI',
    p_reason
  );

  -- Emitir evento al outbox
  INSERT INTO public.transactional_outbox (
    organization_id,
    event_type,
    payload,
    status
  ) VALUES (
    v_conv.organization_id,
    'conversation.handoff_requested',
    jsonb_build_object(
      'handoff_id', v_handoff_id,
      'conversation_id', p_conversation_id,
      'reason', p_reason,
      'priority', p_priority,
      'team', p_team,
      'state_version', v_new_version,
      'expires_at', v_expires_at
    ),
    'PENDING'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'HANDOFF_PENDING_ASSIGNMENT',
    'handoff_id', v_handoff_id,
    'conversation_id', p_conversation_id,
    'state_version', v_new_version,
    'is_bot_locked', true,
    'expires_at', v_expires_at
  );
END;
$$;

-- 6.2 RPC: claim_handoff_assignment & accept_handoff (Control Atómico Anti-Carrera)
CREATE OR REPLACE FUNCTION public.claim_and_accept_handoff(
  p_handoff_id uuid,
  p_agent_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_handoff record;
  v_conv record;
  v_new_version integer;
BEGIN
  -- Bloqueo atómico a nivel de fila (FOR UPDATE)
  SELECT * INTO v_handoff FROM public.conversation_handoffs WHERE id = p_handoff_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'HANDOFF_NOT_FOUND');
  END IF;

  -- Comprobar si ya fue asignado/aceptado por otro operador
  IF v_handoff.status = 'ACCEPTED' AND v_handoff.assigned_user_id IS NOT NULL AND v_handoff.assigned_user_id <> p_agent_user_id THEN
    RETURN jsonb_build_object(
      'success', false, 
      'status', 'ALREADY_ASSIGNED', 
      'assigned_to', v_handoff.assigned_user_id,
      'accepted_at', v_handoff.accepted_at,
      'message', 'El caso ya fue aceptado por otro operador.'
    );
  END IF;

  -- Bloquear conversación vinculada
  SELECT * INTO v_conv FROM public.conversations WHERE id = v_handoff.conversation_id FOR UPDATE;
  v_new_version := v_conv.state_version + 1;

  -- Actualizar handoff
  UPDATE public.conversation_handoffs
  SET 
    assigned_user_id = p_agent_user_id,
    status = 'ACCEPTED',
    assigned_at = COALESCE(assigned_at, now()),
    accepted_at = now(),
    state_version = v_new_version,
    updated_at = now()
  WHERE id = p_handoff_id;

  -- Actualizar conversación
  UPDATE public.conversations
  SET 
    assigned_agent_id = p_agent_user_id,
    status = 'HUMAN_ASSIGNED',
    is_bot_locked = true,
    human_takeover_at = COALESCE(human_takeover_at, now()),
    state_version = v_new_version,
    updated_at = now()
  WHERE id = v_handoff.conversation_id;

  -- Registrar auditoría
  INSERT INTO public.conversation_state_transitions (
    organization_id,
    conversation_id,
    handoff_id,
    previous_state,
    new_state,
    state_version,
    actor_type,
    actor_id,
    reason
  ) VALUES (
    v_handoff.organization_id,
    v_handoff.conversation_id,
    p_handoff_id,
    v_conv.status,
    'HUMAN_ASSIGNED',
    v_new_version,
    'STAFF',
    p_agent_user_id::text,
    'HANDOFF_ACCEPTED_BY_AGENT'
  );

  -- Emisión a Outbox
  INSERT INTO public.transactional_outbox (
    organization_id,
    event_type,
    payload,
    status
  ) VALUES (
    v_handoff.organization_id,
    'conversation.handoff_accepted',
    jsonb_build_object(
      'handoff_id', p_handoff_id,
      'conversation_id', v_handoff.conversation_id,
      'agent_user_id', p_agent_user_id,
      'state_version', v_new_version,
      'accepted_at', now()
    ),
    'PENDING'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'HUMAN_ASSIGNED',
    'handoff_id', p_handoff_id,
    'conversation_id', v_handoff.conversation_id,
    'assigned_agent_id', p_agent_user_id,
    'state_version', v_new_version,
    'is_bot_locked', true,
    'accepted_at', now()
  );
END;
$$;

-- 6.3 RPC: verify_outbound_permission (Guardia Crítico de Supresión de IA)
CREATE OR REPLACE FUNCTION public.verify_outbound_permission(
  p_conversation_id uuid,
  p_sender_type text,
  p_draft_version integer DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv record;
BEGIN
  SELECT * INTO v_conv FROM public.conversations WHERE id = p_conversation_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'CONVERSATION_NOT_FOUND');
  END IF;

  -- 1. Si el emisor es BOT / IA:
  IF p_sender_type IN ('BOT', 'AI') THEN
    -- Rechazo si el bot está bloqueado
    IF v_conv.is_bot_locked THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'AI_SUPPRESSED_HUMAN_CONTROL_ACTIVE',
        'is_bot_locked', true,
        'current_status', v_conv.status
      );
    END IF;

    -- Rechazo si la versión de estado cambió durante la generación (Stale AI Draft)
    IF p_draft_version IS NOT NULL AND v_conv.state_version <> p_draft_version THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'AI_DRAFT_INVALIDATED_STATE_VERSION_MISMATCH',
        'expected_version', p_draft_version,
        'current_version', v_conv.state_version
      );
    END IF;

    -- Rechazo si el estado de la conversación no permite IA activa
    IF v_conv.status NOT IN ('AI_ACTIVE', 'AI_HANDLING', 'OPEN') THEN
      RETURN jsonb_build_object(
        'allowed', false,
        'reason', 'CONVERSATION_STATUS_NOT_AI_ACTIVE',
        'current_status', v_conv.status
      );
    END IF;

    RETURN jsonb_build_object('allowed', true, 'state_version', v_conv.state_version);
  END IF;

  -- 2. Si el emisor es STAFF / HUMANO:
  IF p_sender_type IN ('AGENT', 'STAFF', 'HUMAN') THEN
    RETURN jsonb_build_object('allowed', true, 'state_version', v_conv.state_version);
  END IF;

  RETURN jsonb_build_object('allowed', false, 'error', 'UNKNOWN_SENDER_TYPE');
END;
$$;

-- 6.4 RPC: authorize_ai_resume (Retorno Explícito y Autorizado a IA)
CREATE OR REPLACE FUNCTION public.authorize_ai_resume(
  p_conversation_id uuid,
  p_authorizing_user_id uuid,
  p_reason text DEFAULT 'Caso humano concluido satisfactoriamente'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv record;
  v_new_version integer;
BEGIN
  SELECT * INTO v_conv FROM public.conversations WHERE id = p_conversation_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'CONVERSATION_NOT_FOUND');
  END IF;

  -- Impedir reactivar IA si existe emergencia médica no cerrada
  IF v_conv.handoff_priority = 'CRITICAL' AND v_conv.status <> 'RESOLVED' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'CANNOT_RESUME_AI_DURING_CRITICAL_EMERGENCY',
      'message', 'No se puede reactivar la IA mientras persista una emergencia clínica abierta.'
    );
  END IF;

  v_new_version := v_conv.state_version + 1;

  -- Actualizar conversación
  UPDATE public.conversations
  SET 
    is_bot_locked = false,
    status = 'AI_ACTIVE',
    state_version = v_new_version,
    updated_at = now()
  WHERE id = p_conversation_id;

  -- Resolver handoff abierto si existe
  UPDATE public.conversation_handoffs
  SET 
    status = 'RESOLVED',
    resolved_at = now(),
    state_version = v_new_version,
    updated_at = now()
  WHERE conversation_id = p_conversation_id AND status IN ('PENDING_ASSIGNMENT', 'ASSIGNED', 'ACCEPTED');

  -- Registrar auditoría
  INSERT INTO public.conversation_state_transitions (
    organization_id,
    conversation_id,
    previous_state,
    new_state,
    state_version,
    actor_type,
    actor_id,
    reason
  ) VALUES (
    v_conv.organization_id,
    p_conversation_id,
    v_conv.status,
    'AI_ACTIVE',
    v_new_version,
    'STAFF',
    p_authorizing_user_id::text,
    p_reason
  );

  -- Emisión a Outbox
  INSERT INTO public.transactional_outbox (
    organization_id,
    event_type,
    payload,
    status
  ) VALUES (
    v_conv.organization_id,
    'conversation.ai_resumed',
    jsonb_build_object(
      'conversation_id', p_conversation_id,
      'authorizing_user_id', p_authorizing_user_id,
      'state_version', v_new_version,
      'resumed_at', now()
    ),
    'PENDING'
  );

  RETURN jsonb_build_object(
    'success', true,
    'status', 'AI_ACTIVE',
    'conversation_id', p_conversation_id,
    'is_bot_locked', false,
    'state_version', v_new_version,
    'resumed_at', now()
  );
END;
$$;

-- 6.5 RPC: record_human_response (Mensajería Humana Autorizada)
CREATE OR REPLACE FUNCTION public.record_human_response(
  p_conversation_id uuid,
  p_agent_user_id uuid,
  p_message_text text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conv record;
  v_msg_id uuid;
  v_new_version integer;
BEGIN
  SELECT * INTO v_conv FROM public.conversations WHERE id = p_conversation_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'CONVERSATION_NOT_FOUND');
  END IF;

  v_new_version := v_conv.state_version + 1;

  -- Registrar mensaje
  INSERT INTO public.messages (
    conversation_id,
    direction,
    sender_type,
    message_type,
    content,
    delivery_status,
    metadata
  ) VALUES (
    p_conversation_id,
    'OUTBOUND',
    'AGENT',
    'TEXT',
    p_message_text,
    'DELIVERED',
    jsonb_build_object('author_user_id', p_agent_user_id, 'sent_at', now())
  ) RETURNING id INTO v_msg_id;

  -- Actualizar conversación a HUMAN_ACTIVE
  UPDATE public.conversations
  SET 
    status = 'HUMAN_ACTIVE',
    last_message_at = now(),
    state_version = v_new_version,
    updated_at = now()
  WHERE id = p_conversation_id;

  -- Registrar primera respuesta humana si aplica
  UPDATE public.conversation_handoffs
  SET 
    first_human_response_at = COALESCE(first_human_response_at, now()),
    updated_at = now()
  WHERE conversation_id = p_conversation_id AND status = 'ACCEPTED' AND first_human_response_at IS NULL;

  RETURN jsonb_build_object(
    'success', true,
    'message_id', v_msg_id,
    'conversation_id', p_conversation_id,
    'status', 'HUMAN_ACTIVE',
    'state_version', v_new_version
  );
END;
$$;

-- 6.6 RPC: get_authorized_handoff_context (Contexto 360 Grados de Transferencia)
CREATE OR REPLACE FUNCTION public.get_authorized_handoff_context(
  p_conversation_id uuid
)
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
  v_internal_notes jsonb;
  v_handoff record;
BEGIN
  SELECT * INTO v_conv FROM public.conversations WHERE id = p_conversation_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'CONVERSATION_NOT_FOUND');
  END IF;

  -- Tutor
  SELECT id, first_name, last_name, primary_phone, email INTO v_owner FROM public.owners WHERE id = v_conv.owner_id;

  -- Mascotas activas
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'name', name, 'species', species, 'breed', breed, 'is_active', is_active
  )), '[]'::jsonb) INTO v_pets FROM public.pets WHERE primary_owner_id = v_conv.owner_id AND is_active = true;

  -- Últimos mensajes
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'direction', direction, 'sender_type', sender_type, 'message_type', message_type, 'content', content, 'created_at', created_at
  ) ORDER BY created_at ASC), '[]'::jsonb) INTO v_recent_messages
  FROM (
    SELECT id, direction, sender_type, message_type, content, created_at
    FROM public.messages
    WHERE conversation_id = p_conversation_id
    ORDER BY created_at DESC
    LIMIT 10
  ) sub;

  -- Notas internas
  SELECT COALESCE(jsonb_agg(jsonb_build_object(
    'id', id, 'author_name', author_name, 'author_role', author_role, 'content', content, 'created_at', created_at
  ) ORDER BY created_at ASC), '[]'::jsonb) INTO v_internal_notes
  FROM public.conversation_internal_notes
  WHERE conversation_id = p_conversation_id;

  -- Último handoff activo
  SELECT * INTO v_handoff FROM public.conversation_handoffs WHERE conversation_id = p_conversation_id ORDER BY created_at DESC LIMIT 1;

  RETURN jsonb_build_object(
    'conversation_id', p_conversation_id,
    'status', v_conv.status,
    'state_version', v_conv.state_version,
    'is_bot_locked', v_conv.is_bot_locked,
    'assigned_agent_id', v_conv.assigned_agent_id,
    'assigned_team', v_conv.assigned_team,
    'handoff_priority', v_conv.handoff_priority,
    'owner', to_jsonb(v_owner),
    'associated_pets', v_pets,
    'recent_messages', v_recent_messages,
    'internal_notes', v_internal_notes,
    'active_handoff', to_jsonb(v_handoff)
  );
END;
$$;

-- 6.7 RPC: expire_unaccepted_handoffs (SRE Watchdog de Escalamiento por Vencimiento)
CREATE OR REPLACE FUNCTION public.expire_unaccepted_handoffs()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rec record;
  v_escalated_count integer := 0;
  v_new_version integer;
BEGIN
  FOR v_rec IN 
    SELECT h.id, h.conversation_id, h.organization_id, h.priority, h.state_version, c.status as conv_status
    FROM public.conversation_handoffs h
    JOIN public.conversations c ON c.id = h.conversation_id
    WHERE h.status IN ('PENDING_ASSIGNMENT', 'ASSIGNED')
      AND h.accepted_at IS NULL
      AND h.expires_at < now()
  LOOP
    v_new_version := v_rec.state_version + 1;

    -- Escalar handoff
    UPDATE public.conversation_handoffs
    SET 
      status = 'ESCALATED',
      requested_team = 'DIRECTOR',
      requested_role = 'DIRECTOR',
      priority = 'CRITICAL',
      state_version = v_new_version,
      updated_at = now()
    WHERE id = v_rec.id;

    -- Actualizar conversación
    UPDATE public.conversations
    SET 
      status = 'ESCALATED',
      assigned_team = 'DIRECTOR',
      assigned_role = 'DIRECTOR',
      handoff_priority = 'CRITICAL',
      state_version = v_new_version,
      updated_at = now()
    WHERE id = v_rec.conversation_id;

    -- Auditoría
    INSERT INTO public.conversation_state_transitions (
      organization_id,
      conversation_id,
      handoff_id,
      previous_state,
      new_state,
      state_version,
      actor_type,
      actor_id,
      reason
    ) VALUES (
      v_rec.organization_id,
      v_rec.conversation_id,
      v_rec.id,
      v_rec.conv_status,
      'ESCALATED',
      v_new_version,
      'SYSTEM',
      'SLA_TIMEOUT_EXPIRED',
      'Tiempo límite de aceptación superado sin respuesta humana.'
    );

    -- Outbox
    INSERT INTO public.transactional_outbox (
      organization_id,
      event_type,
      payload,
      status
    ) VALUES (
      v_rec.organization_id,
      'conversation.handoff_escalated',
      jsonb_build_object(
        'handoff_id', v_rec.id,
        'conversation_id', v_rec.conversation_id,
        'previous_priority', v_rec.priority,
        'escalated_to', 'DIRECTOR',
        'reason', 'SLA_TIMEOUT_EXPIRED'
      ),
      'PENDING'
    );

    v_escalated_count := v_escalated_count + 1;
  END LOOP;

  RETURN jsonb_build_object('escalated_count', v_escalated_count, 'executed_at', now());
END;
$$;

-- 7. Población de Personal Semilla en Vet Life
DO $$
DECLARE
  v_org_id uuid := '11111111-1111-1111-1111-111111111111';
BEGIN
  -- Insertar usuarios en auth.users
  INSERT INTO auth.users (id, email, raw_user_meta_data, role, aud, created_at, updated_at)
  VALUES 
    ('d1111111-1111-1111-1111-111111111111', 'luis.rios@vetlife.co', '{"full_name": "Dr. Luis Eduardo Ríos", "role": "DIRECTOR"}'::jsonb, 'authenticated', 'authenticated', now(), now()),
    ('d2222222-2222-2222-2222-222222222222', 'camila.torres@vetlife.co', '{"full_name": "Dra. Camila Torres", "role": "VETERINARIAN"}'::jsonb, 'authenticated', 'authenticated', now(), now()),
    ('d3333333-3333-3333-3333-333333333333', 'andres.salcedo@vetlife.co', '{"full_name": "Andrés Salcedo", "role": "COORDINATOR"}'::jsonb, 'authenticated', 'authenticated', now(), now()),
    ('d4444444-4444-4444-4444-444444444444', 'valentina.gomez@vetlife.co', '{"full_name": "Valentina Gómez", "role": "RECEPTION"}'::jsonb, 'authenticated', 'authenticated', now(), now()),
    ('d5555555-5555-5555-5555-555555555555', 'paola.mendez@vetlife.co', '{"full_name": "Paola Méndez", "role": "FINANCE"}'::jsonb, 'authenticated', 'authenticated', now(), now())
  ON CONFLICT (id) DO NOTHING;

  -- Insertar en user_profiles
  INSERT INTO public.user_profiles (id, email, full_name, phone, document_type, document_number, preferred_language, timezone, is_active, metadata)
  VALUES 
    ('d1111111-1111-1111-1111-111111111111', 'luis.rios@vetlife.co', 'Dr. Luis Eduardo Ríos', '+573105550001', 'CC', '10101010', 'es', 'America/Bogota', true, '{"professional_card": "COMVEZCOL-001"}'::jsonb),
    ('d2222222-2222-2222-2222-222222222222', 'camila.torres@vetlife.co', 'Dra. Camila Torres', '+573105550002', 'CC', '20202020', 'es', 'America/Bogota', true, '{"professional_card": "COMVEZCOL-002"}'::jsonb),
    ('d3333333-3333-3333-3333-333333333333', 'andres.salcedo@vetlife.co', 'Andrés Salcedo', '+573105550003', 'CC', '30303030', 'es', 'America/Bogota', true, '{}'::jsonb),
    ('d4444444-4444-4444-4444-444444444444', 'valentina.gomez@vetlife.co', 'Valentina Gómez', '+573105550004', 'CC', '40404040', 'es', 'America/Bogota', true, '{}'::jsonb),
    ('d5555555-5555-5555-5555-555555555555', 'paola.mendez@vetlife.co', 'Paola Méndez', '+573105550005', 'CC', '50505050', 'es', 'America/Bogota', true, '{}'::jsonb)
  ON CONFLICT (id) DO UPDATE SET is_active = true;

  -- Insertar membresías de organización
  INSERT INTO public.organization_memberships (organization_id, user_id, role, is_primary, is_active, permissions_override)
  VALUES 
    (v_org_id, 'd1111111-1111-1111-1111-111111111111', 'DIRECTOR'::public.app_role_type, true, true, '{}'::jsonb),
    (v_org_id, 'd2222222-2222-2222-2222-222222222222', 'VETERINARIAN'::public.app_role_type, true, true, '{}'::jsonb),
    (v_org_id, 'd3333333-3333-3333-3333-333333333333', 'COORDINATOR'::public.app_role_type, true, true, '{}'::jsonb),
    (v_org_id, 'd4444444-4444-4444-4444-444444444444', 'RECEPTION'::public.app_role_type, true, true, '{}'::jsonb),
    (v_org_id, 'd5555555-5555-5555-5555-555555555555', 'FINANCE'::public.app_role_type, true, true, '{}'::jsonb)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET is_active = true;

  -- Insertar perfiles de staff
  INSERT INTO public.staff_profiles (id, organization_id, user_id, professional_card_number, job_title, is_active, is_available_for_dispatch, specialties, working_zones, metadata)
  VALUES 
    ('s1111111-1111-1111-1111-111111111111', v_org_id, 'd1111111-1111-1111-1111-111111111111', 'COMVEZCOL-001', 'Director Médico General', true, true, ARRAY['Medicina General', 'Emergencias'], '["Bogotá Norte", "Chía"]'::jsonb, '{}'::jsonb),
    ('s2222222-2222-2222-2222-222222222222', v_org_id, 'd2222222-2222-2222-2222-222222222222', 'COMVEZCOL-002', 'Médica Veterinaria de Enlace', true, true, ARRAY['Medicina Felina', 'Medicina General'], '["Bogotá Chapinero", "Bogotá Usaquén"]'::jsonb, '{}'::jsonb),
    ('s3333333-3333-3333-3333-333333333333', v_org_id, 'd3333333-3333-3333-3333-333333333333', NULL, 'Coordinador de Operaciones y Agenda', true, false, ARRAY[]::text[], '[]'::jsonb, '{}'::jsonb),
    ('s4444444-4444-4444-4444-444444444444', v_org_id, 'd4444444-4444-4444-4444-444444444444', NULL, 'Líder de Recepción y Atención al Cliente', true, false, ARRAY[]::text[], '[]'::jsonb, '{}'::jsonb),
    ('s5555555-5555-5555-5555-555555555555', v_org_id, 'd5555555-5555-5555-5555-555555555555', NULL, 'Analista Financiera y Cobranzas', true, false, ARRAY[]::text[], '[]'::jsonb, '{}'::jsonb)
  ON CONFLICT (organization_id, user_id) DO UPDATE SET is_active = true;
END $$;
