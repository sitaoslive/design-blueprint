-- ==============================================================================
-- Migration: 012_outbox_events_and_automation.sql
-- Description: Transactional outbox pattern, idempotent event registry, n8n workflow
--              registry (21 core workflows), dead letter queue, and webhook logs.
-- Module: Module T (Automatización, Eventos y n8n)
-- Requirements: WF-081..WF-100, AT-061..AT-075, VET-CORE-01..VET-CORE-21
-- ==============================================================================

-- 1. TRANSACTIONAL OUTBOX (Despacho seguro de eventos a n8n)
CREATE TABLE IF NOT EXISTS public.transactional_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    aggregate_type TEXT NOT NULL, -- e.g. APPOINTMENT, PAYMENT, REFERRAL, CONVERSATION
    aggregate_id UUID NOT NULL,
    event_type TEXT NOT NULL,     -- e.g. APPOINTMENT_REQUESTED, VISIT_COMPLETED
    payload JSONB NOT NULL,
    idempotency_key TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'CLAIMED', 'PROCESSED', 'FAILED', 'DEAD_LETTER'
    )),
    retry_count INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
    max_retries INTEGER NOT NULL DEFAULT 5 CHECK (max_retries > 0),
    claimed_by TEXT,
    claimed_at TIMESTAMPTZ,
    processed_at TIMESTAMPTZ,
    error_log TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. PROCESSED EVENTS (Registro de deduplicación e idempotencia estricta)
CREATE TABLE IF NOT EXISTS public.processed_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID,
    idempotency_key TEXT NOT NULL UNIQUE,
    source_system TEXT NOT NULL DEFAULT 'N8N',
    handler_name TEXT NOT NULL,
    execution_id TEXT, -- ID real de ejecución en n8n
    processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. N8N INTEGRATION REGISTRY (Directorio de los 21 workflows CORE)
CREATE TABLE IF NOT EXISTS public.n8n_integration_registry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    core_code TEXT NOT NULL UNIQUE, -- VET-CORE-01 .. VET-CORE-21
    name TEXT NOT NULL,
    n8n_workflow_id TEXT,           -- ID real en n8n Cloud
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('WEBHOOK', 'SCHEDULED_POLL', 'SUBWORKFLOW', 'OUTBOX_CLAIM')),
    is_enabled BOOLEAN NOT NULL DEFAULT false,
    last_heartbeat_at TIMESTAMPTZ,
    last_execution_status TEXT,
    error_rate_24h NUMERIC(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_n8n_registry_updated_at
BEFORE UPDATE ON public.n8n_integration_registry
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. DEAD LETTER QUEUE (Eventos con fallo irrecuperable)
CREATE TABLE IF NOT EXISTS public.dead_letter_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    outbox_id UUID REFERENCES public.transactional_outbox(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    failure_reason TEXT NOT NULL,
    stack_trace TEXT,
    resolved_by UUID REFERENCES auth.users(id),
    resolved_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'UNRESOLVED' CHECK (status IN ('UNRESOLVED', 'REPLAYED', 'DISCARDED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. WEBHOOK DELIVERY LOGS (Auditoría de llamadas HTTP de integración)
CREATE TABLE IF NOT EXISTS public.webhook_delivery_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    direction TEXT NOT NULL CHECK (direction IN ('INBOUND', 'OUTBOUND')),
    endpoint_url TEXT NOT NULL,
    http_status INTEGER,
    headers JSONB NOT NULL DEFAULT '{}'::jsonb,
    payload_summary JSONB,
    ip_address TEXT,
    verified_hmac BOOLEAN NOT NULL DEFAULT false,
    latency_ms INTEGER CHECK (latency_ms >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
