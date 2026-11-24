-- ==============================================================================
-- Migration: 004_conversations_and_whatsapp.sql
-- Description: Multi-channel conversations, messages, templates, outbound dispatch
--              requests, and human-in-the-loop transfer workflows.
-- Module: Module D (WhatsApp y Conversaciones)
-- Requirements: WF-037..WF-048, AT-026..AT-035
-- ==============================================================================

-- 1. CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'WHATSAPP' CHECK (channel IN ('WHATSAPP', 'WEB_CHAT', 'SMS', 'INSTAGRAM', 'INTERNAL')),
    external_conversation_id TEXT NOT NULL, -- e.g. Teléfono en formato E.164 o wa_id
    sender_phone TEXT NOT NULL,
    sender_name TEXT,
    status TEXT NOT NULL DEFAULT 'AI_HANDLING' CHECK (status IN ('AI_HANDLING', 'WAITING_HUMAN', 'HUMAN_ASSIGNED', 'RESOLVED', 'CLOSED')),
    assigned_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    window_expires_at TIMESTAMPTZ, -- Ventana de 24 horas de WhatsApp Cloud API
    is_bot_locked BOOLEAN NOT NULL DEFAULT false, -- Bloqueo de concurrencia contra doble respuesta bot/humano
    ai_intent TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_channel_external_id UNIQUE (organization_id, channel, external_conversation_id)
);

CREATE TRIGGER trg_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    sender_type TEXT NOT NULL CHECK (sender_type IN ('CLIENT', 'BOT_AI', 'STAFF_HUMAN', 'SYSTEM_NOTIFICATION')),
    sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    external_message_id TEXT, -- WAMID de Meta
    message_type TEXT NOT NULL DEFAULT 'TEXT' CHECK (message_type IN (
        'TEXT', 'IMAGE', 'DOCUMENT', 'AUDIO', 'LOCATION', 
        'TEMPLATE', 'INTERACTIVE_BUTTON', 'INTERACTIVE_LIST'
    )),
    content_text TEXT,
    media_url TEXT,
    delivery_status TEXT NOT NULL DEFAULT 'SENT' CHECK (delivery_status IN ('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED')),
    error_code TEXT,
    error_message TEXT,
    raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. MESSAGE TEMPLATES (Plantillas pre-aprobadas de WhatsApp Cloud API)
CREATE TABLE IF NOT EXISTS public.message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    template_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'APPOINTMENT_REMINDER', 'VISIT_CONFIRMATION', 'POST_VISIT_CARE', 
        'BILLING', 'MARKETING', 'ALERT'
    )),
    language TEXT NOT NULL DEFAULT 'es',
    meta_template_id TEXT,
    body_template TEXT NOT NULL,
    parameter_definitions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_approved_by_meta BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_org_template_name UNIQUE (organization_id, template_name, language)
);

CREATE TRIGGER trg_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. OUTBOUND DISPATCH REQUESTS (Cola de envíos para n8n)
CREATE TABLE IF NOT EXISTS public.outbound_dispatch_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    recipient_phone TEXT NOT NULL,
    recipient_owner_id UUID REFERENCES public.owners(id) ON DELETE SET NULL,
    channel TEXT NOT NULL DEFAULT 'WHATSAPP',
    template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
    template_variables JSONB NOT NULL DEFAULT '{}'::jsonb,
    freeform_text TEXT,
    scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK (status IN (
        'QUEUED', 'CLAIMED_BY_N8N', 'DISPATCHED', 'DELIVERED', 
        'FAILED', 'CANCELLED_BEREAVEMENT', 'CANCELLED_OPT_OUT'
    )),
    dispatch_attempts INTEGER NOT NULL DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    provider_message_id TEXT,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_outbound_dispatch_updated_at
BEFORE UPDATE ON public.outbound_dispatch_requests
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. CONVERSATION TRANSFERS (Escalamiento a agentes humanos)
CREATE TABLE IF NOT EXISTS public.conversation_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    transferred_from_type TEXT NOT NULL CHECK (transferred_from_type IN ('BOT_AI', 'STAFF_HUMAN')),
    transferred_to_agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    transferred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at TIMESTAMPTZ
);
