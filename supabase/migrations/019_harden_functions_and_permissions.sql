-- ==============================================================================
-- MIGRATION 019: HARDEN FUNCTION PERMISSIONS & SEARCH PATHS
-- Proyecto: VET FREEDOM OS
-- Empresa: Vet Life — Veterinaria a Domicilio (Dr. Luis Eduardo Ríos)
-- Dirección Estratégica: Alpha Vision Method
-- ==============================================================================

-- 1. Asegurar search_path inmutable en evaluate_action_risk
CREATE OR REPLACE FUNCTION public.evaluate_action_risk(
    p_action_type text,
    p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
BEGIN
    IF p_action_type IN (
        'execute_sql',
        'run_arbitrary_code',
        'update_any_table',
        'send_any_message',
        'modify_any_clinical_record',
        'prescribe_medication',
        'issue_clinical_diagnosis'
    ) THEN
        RETURN 'PROHIBITED';
    END IF;

    IF p_action_type LIKE 'get_%' OR p_action_type LIKE 'search_%' THEN
        RETURN 'READ_ONLY';
    END IF;

    IF p_action_type IN (
        'create_clinical_record',
        'modify_treatment_plan',
        'approve_controlled_prescription',
        'confirm_surgery_slot'
    ) THEN
        RETURN 'CLINICAL_APPROVAL_REQUIRED';
    END IF;

    IF p_action_type IN (
        'confirm_appointment_with_client',
        'request_specialist_external_booking',
        'refund_payment'
    ) THEN
        RETURN 'EXTERNAL_CONFIRMATION_REQUIRED';
    END IF;

    IF p_action_type IN (
        'cancel_appointment',
        'reassign_staff_shift',
        'reorder_route_emergency',
        'activate_absence_mode',
        'apply_commercial_discount'
    ) THEN
        RETURN 'APPROVAL_REQUIRED';
    END IF;

    IF p_action_type IN (
        'create_followup_task',
        'register_commitment',
        'prepare_customer_message',
        'log_support_ticket'
    ) THEN
        RETURN 'LOW_RISK_WRITE';
    END IF;

    RETURN 'APPROVAL_REQUIRED';
END;
$$;

-- 2. Revocar permisos de anon para todas las funciones administrativas y operativas de SECURITY DEFINER
REVOKE ALL ON FUNCTION public.get_business_snapshot(uuid, uuid, date, jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_business_snapshot(uuid, uuid, date, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.get_daily_operations(uuid, date) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_daily_operations(uuid, date) TO authenticated;

REVOKE ALL ON FUNCTION public.get_financial_summary(uuid, date, date) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_financial_summary(uuid, date, date) TO authenticated;

REVOKE ALL ON FUNCTION public.request_action_proposal(uuid, text, text, text, uuid, jsonb, text, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.request_action_proposal(uuid, text, text, text, uuid, jsonb, text, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.approve_action_proposal(uuid, uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.approve_action_proposal(uuid, uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.execute_approved_action(uuid, uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.execute_approved_action(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.create_schedule_simulation(uuid, text, date, date, text, uuid, jsonb) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.create_schedule_simulation(uuid, text, date, date, text, uuid, jsonb) TO authenticated;

REVOKE ALL ON FUNCTION public.evaluate_action_risk(text, jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.evaluate_action_risk(text, jsonb) TO authenticated;
