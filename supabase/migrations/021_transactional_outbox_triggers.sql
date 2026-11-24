-- ==============================================================================
-- MIGRATION 021: AUTOMATIC EVENT TRIGGERS FOR TRANSACTIONAL OUTBOX
-- Proyecto: VET FREEDOM OS
-- Empresa: Vet Life — Veterinaria a Domicilio (Dr. Luis Eduardo Ríos)
-- Dirección Estratégica: Alpha Vision Method
-- ==============================================================================

-- 1. Función Genérica para Emisión de Eventos a Outbox
CREATE OR REPLACE FUNCTION public.fn_emit_outbox_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_event_type text;
    v_aggregate_type text;
    v_aggregate_id uuid;
    v_organization_id uuid;
    v_idempotency_key text;
    v_payload jsonb;
BEGIN
    -- Manejo por tabla de origen
    IF TG_TABLE_NAME = 'appointments' THEN
        v_aggregate_type := 'APPOINTMENT';
        v_aggregate_id := NEW.id;
        v_organization_id := NEW.organization_id;

        IF TG_OP = 'INSERT' THEN
            v_event_type := 'appointment.requested';
            v_idempotency_key := 'appointment.requested-' || NEW.id::text || '-' || EXTRACT(EPOCH FROM NOW())::text;
            v_payload := jsonb_build_object(
                'appointment_id', NEW.id,
                'owner_id', NEW.owner_id,
                'pet_id', NEW.pet_id,
                'start_time', NEW.start_time,
                'end_time', NEW.end_time,
                'status', NEW.status,
                'veterinarian_id', NEW.assigned_veterinarian_id
            );
        ELSIF TG_OP = 'UPDATE' THEN
            IF NEW.status = 'CONFIRMED' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
                v_event_type := 'appointment.confirmed';
            ELSIF NEW.status = 'CANCELLED' AND (OLD.status IS DISTINCT FROM NEW.status) THEN
                v_event_type := 'appointment.cancelled';
            ELSIF (NEW.start_time IS DISTINCT FROM OLD.start_time) AND NEW.status NOT IN ('CANCELLED', 'COMPLETED') THEN
                v_event_type := 'appointment.rescheduled';
            ELSE
                -- No requiere evento de outbox para otras actualizaciones menores
                RETURN NEW;
            END IF;

            v_idempotency_key := v_event_type || '-' || NEW.id::text || '-' || EXTRACT(EPOCH FROM NOW())::text;
            v_payload := jsonb_build_object(
                'appointment_id', NEW.id,
                'owner_id', NEW.owner_id,
                'pet_id', NEW.pet_id,
                'previous_status', OLD.status,
                'status', NEW.status,
                'start_time', NEW.start_time,
                'end_time', NEW.end_time,
                'veterinarian_id', NEW.assigned_veterinarian_id,
                'cancellation_reason', NEW.cancellation_reason
            );
        END IF;

    ELSIF TG_TABLE_NAME = 'visits' THEN
        v_aggregate_type := 'VISIT';
        v_aggregate_id := NEW.id;
        v_organization_id := NEW.organization_id;

        IF TG_OP = 'INSERT' THEN
            v_event_type := 'visit.started';
            v_idempotency_key := 'visit.started-' || NEW.id::text;
            v_payload := jsonb_build_object(
                'visit_id', NEW.id,
                'appointment_id', NEW.appointment_id,
                'veterinarian_id', NEW.veterinarian_id,
                'check_in_at', NEW.check_in_at
            );
        ELSIF TG_OP = 'UPDATE' THEN
            IF NEW.check_out_at IS NOT NULL AND OLD.check_out_at IS NULL THEN
                v_event_type := 'visit.completed';
                v_idempotency_key := 'visit.completed-' || NEW.id::text;
                v_payload := jsonb_build_object(
                    'visit_id', NEW.id,
                    'appointment_id', NEW.appointment_id,
                    'veterinarian_id', NEW.veterinarian_id,
                    'check_in_at', NEW.check_in_at,
                    'check_out_at', NEW.check_out_at,
                    'clinical_summary', NEW.clinical_summary,
                    'requires_followup', NEW.requires_followup
                );
            ELSE
                RETURN NEW;
            END IF;
        END IF;

    ELSIF TG_TABLE_NAME = 'payment_collections' THEN
        v_aggregate_type := 'PAYMENT';
        v_aggregate_id := NEW.id;
        v_organization_id := NEW.organization_id;

        IF TG_OP = 'INSERT' THEN
            v_event_type := 'payment.recorded';
            v_idempotency_key := 'payment.recorded-' || NEW.id::text;
            v_payload := jsonb_build_object(
                'payment_id', NEW.id,
                'appointment_id', NEW.appointment_id,
                'owner_id', NEW.owner_id,
                'amount', NEW.amount,
                'currency', NEW.currency,
                'payment_method', NEW.payment_method,
                'status', NEW.payment_status
            );
        ELSIF TG_OP = 'UPDATE' THEN
            IF NEW.payment_status = 'COMPLETED' AND (OLD.payment_status IS DISTINCT FROM NEW.payment_status) THEN
                v_event_type := 'payment.verified';
                v_idempotency_key := 'payment.verified-' || NEW.id::text;
                v_payload := jsonb_build_object(
                    'payment_id', NEW.id,
                    'appointment_id', NEW.appointment_id,
                    'owner_id', NEW.owner_id,
                    'amount', NEW.amount,
                    'currency', NEW.currency,
                    'payment_method', NEW.payment_method,
                    'status', NEW.payment_status
                );
            ELSE
                RETURN NEW;
            END IF;
        END IF;

    ELSIF TG_TABLE_NAME = 'post_visit_commitments' THEN
        v_aggregate_type := 'COMMITMENT';
        v_aggregate_id := NEW.id;
        v_organization_id := NEW.organization_id;

        IF TG_OP = 'INSERT' THEN
            v_event_type := 'commitment.created';
            v_idempotency_key := 'commitment.created-' || NEW.id::text;
            v_payload := jsonb_build_object(
                'commitment_id', NEW.id,
                'appointment_id', NEW.appointment_id,
                'owner_id', NEW.owner_id,
                'pet_id', NEW.pet_id,
                'commitment_type', NEW.commitment_type,
                'description', NEW.description,
                'due_date', NEW.due_date,
                'responsible_staff_id', NEW.responsible_staff_id
            );
        ELSE
            RETURN NEW;
        END IF;

    ELSIF TG_TABLE_NAME = 'patient_referrals' THEN
        v_aggregate_type := 'REFERRAL';
        v_aggregate_id := NEW.id;
        v_organization_id := NEW.organization_id;

        IF TG_OP = 'INSERT' THEN
            v_event_type := 'referral.created';
            v_idempotency_key := 'referral.created-' || NEW.id::text;
            v_payload := jsonb_build_object(
                'referral_id', NEW.id,
                'pet_id', NEW.pet_id,
                'specialty', NEW.specialty,
                'status', NEW.status
            );
        ELSE
            RETURN NEW;
        END IF;

    ELSIF TG_TABLE_NAME = 'staff_absences' THEN
        v_aggregate_type := 'STAFF';
        v_aggregate_id := NEW.staff_id;
        v_organization_id := NEW.organization_id;

        IF TG_OP = 'INSERT' THEN
            v_event_type := 'staff.absence_reported';
            v_idempotency_key := 'staff.absence_reported-' || NEW.id::text;
            v_payload := jsonb_build_object(
                'absence_id', NEW.id,
                'staff_id', NEW.staff_id,
                'start_date', NEW.start_date,
                'end_date', NEW.end_date,
                'reason', NEW.reason,
                'status', NEW.status
            );
        ELSE
            RETURN NEW;
        END IF;

    ELSE
        RETURN NEW;
    END IF;

    -- Inserción Atómica en transactional_outbox
    INSERT INTO public.transactional_outbox (
        organization_id,
        aggregate_type,
        aggregate_id,
        event_type,
        payload,
        idempotency_key,
        status,
        created_at
    ) VALUES (
        v_organization_id,
        v_aggregate_type,
        v_aggregate_id,
        v_event_type,
        v_payload,
        v_idempotency_key,
        'PENDING',
        NOW()
    )
    ON CONFLICT (idempotency_key) DO NOTHING;

    RETURN NEW;
END;
$$;

-- 2. Vincular Triggers a Tablas Operacionales
DROP TRIGGER IF EXISTS trg_appointments_outbox ON public.appointments;
CREATE TRIGGER trg_appointments_outbox
AFTER INSERT OR UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.fn_emit_outbox_event();

DROP TRIGGER IF EXISTS trg_visits_outbox ON public.visits;
CREATE TRIGGER trg_visits_outbox
AFTER INSERT OR UPDATE ON public.visits
FOR EACH ROW EXECUTE FUNCTION public.fn_emit_outbox_event();

DROP TRIGGER IF EXISTS trg_payments_outbox ON public.payment_collections;
CREATE TRIGGER trg_payments_outbox
AFTER INSERT OR UPDATE ON public.payment_collections
FOR EACH ROW EXECUTE FUNCTION public.fn_emit_outbox_event();

DROP TRIGGER IF EXISTS trg_commitments_outbox ON public.post_visit_commitments;
CREATE TRIGGER trg_commitments_outbox
AFTER INSERT ON public.post_visit_commitments
FOR EACH ROW EXECUTE FUNCTION public.fn_emit_outbox_event();

DROP TRIGGER IF EXISTS trg_referrals_outbox ON public.patient_referrals;
CREATE TRIGGER trg_referrals_outbox
AFTER INSERT ON public.patient_referrals
FOR EACH ROW EXECUTE FUNCTION public.fn_emit_outbox_event();

DROP TRIGGER IF EXISTS trg_staff_absences_outbox ON public.staff_absences;
CREATE TRIGGER trg_staff_absences_outbox
AFTER INSERT ON public.staff_absences
FOR EACH ROW EXECUTE FUNCTION public.fn_emit_outbox_event();

-- 3. Asegurar search_path y revocación anon
REVOKE ALL ON FUNCTION public.fn_emit_outbox_event() FROM anon, public;
