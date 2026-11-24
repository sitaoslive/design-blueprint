-- ==============================================================================
-- Migration: 013_ai_assistants_and_audit.sql
-- Description: AI assistants governance (human-in-the-loop approvals), prompt versioning,
--              proposal executions, audit logging, system health, and security incidents.
-- Module: Module U (IA y Asistentes) y Módulo V (Seguridad y Monitoreo)
-- Requirements: WF-101..WF-112, AT-076..AT-090
-- ==============================================================================

-- 1. AI ASSISTANT CONFIGS (Gobernanza de modelos: Asistente Luis, WhatsApp, Simulador)
CREATE TABLE IF NOT EXISTS public.ai_assistant_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    assistant_code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    model_name TEXT NOT NULL DEFAULT 'gemini-1.5-pro',
    temperature NUMERIC(3,2) NOT NULL DEFAULT 0.2 CHECK (temperature >= 0 AND temperature <= 1),
    is_active BOOLEAN NOT NULL DEFAULT true,
    allowed_tools JSONB NOT NULL DEFAULT '[]'::jsonb,
    requires_human_approval_for TEXT[] NOT NULL DEFAULT '{"APPOINTMENT_CHANGE","MEDICATION_RECOMMENDATION","PAYMENT_MODIFICATION","CLINICAL_DIAGNOSIS"}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_ai_configs_updated_at
BEFORE UPDATE ON public.ai_assistant_configs
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. AI PROMPT VERSIONS (Versionado auditable de system prompts)
CREATE TABLE IF NOT EXISTS public.ai_prompt_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assistant_config_id UUID NOT NULL REFERENCES public.ai_assistant_configs(id) ON DELETE CASCADE,
    version_tag TEXT NOT NULL,
    system_prompt TEXT NOT NULL,
    is_current_active BOOLEAN NOT NULL DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_assistant_prompt_version UNIQUE (assistant_config_id, version_tag)
);

-- 3. AI ACTION PROPOSALS (Propuestas antes de ejecución: Lectura -> Propuesta -> Aprobación)
CREATE TABLE IF NOT EXISTS public.ai_action_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    assistant_code TEXT NOT NULL,
    proposed_action_type TEXT NOT NULL CHECK (proposed_action_type IN (
        'RESCHEDULE_APPOINTMENT', 'CREATE_REFERRAL', 'ASSIGN_VETERINARIAN', 
        'DISPATCH_MESSAGE', 'APPLY_DISCOUNT', 'UPDATE_CEM'
    )),
    target_entity_type TEXT NOT NULL,
    target_entity_id UUID NOT NULL,
    proposal_payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'PROPOSED' CHECK (status IN (
        'PROPOSED', 'APPROVED', 'REJECTED', 'EXECUTED', 'FAILED_EXECUTION'
    )),
    confidence_score NUMERIC(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    reasoning_summary TEXT,
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. AI ACTION EXECUTIONS (Trazabilidad del resultado verificado)
CREATE TABLE IF NOT EXISTS public.ai_action_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.ai_action_proposals(id) ON DELETE CASCADE,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    execution_status TEXT NOT NULL CHECK (execution_status IN ('SUCCESS', 'PARTIAL_SUCCESS', 'ERROR')),
    execution_result JSONB NOT NULL DEFAULT '{}'::jsonb,
    error_message TEXT
);

-- 5. AUDIT LOGS (Trazabilidad empresarial y clínica estricta)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    actor_role TEXT,
    action TEXT NOT NULL CHECK (action IN (
        'INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 
        'ROLE_CHANGE', 'EXACT_READ_SENSITIVE', 'PERMISSION_OVERRIDE'
    )),
    entity_type TEXT NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. SYSTEM EVENT LOGS (Salud de microservicios e integraciones)
CREATE TABLE IF NOT EXISTS public.system_event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'FATAL')),
    component TEXT NOT NULL, -- SUPABASE_DB, N8N_ORCHESTRATOR, LOVABLE_FRONTEND, WHATSAPP_GATEWAY
    event_name TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. SECURITY INCIDENTS (Alertas de intrusión o violación de reglas)
CREATE TABLE IF NOT EXISTS public.security_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    threat_level TEXT NOT NULL CHECK (threat_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    incident_type TEXT NOT NULL CHECK (incident_type IN (
        'UNAUTHORIZED_RLS_ATTEMPT', 'EXPIRED_CAREGIVER_ACCESS', 
        'INVALID_WEBHOOK_SIGNATURE', 'BRUTE_FORCE_TOKEN', 
        'UNAUTHORIZED_CLINICAL_MODIFICATION'
    )),
    details TEXT NOT NULL,
    ip_address TEXT,
    actor_user_id UUID REFERENCES auth.users(id),
    is_mitigated BOOLEAN NOT NULL DEFAULT false,
    mitigated_by UUID REFERENCES auth.users(id),
    mitigated_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
