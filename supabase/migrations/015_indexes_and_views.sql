-- ==============================================================================
-- Migration: 015_indexes_and_views.sql
-- Description: High-performance composite indexes, foreign key coverage, and
--              Security Invoker views for Lovable UI and n8n query pipelines.
-- Module: System Performance & Query Optimization
-- Requirements: Performance standards and Security Invoker views (PG17)
-- ==============================================================================

-- 1. PERFORMANCE INDEXES ON CRITICAL FOREIGN KEYS & WORKLOAD PATHS

-- Organizations & Settings
CREATE INDEX IF NOT EXISTS idx_branches_org ON public.branches(organization_id);
CREATE INDEX IF NOT EXISTS idx_services_org ON public.services(organization_id);
CREATE INDEX IF NOT EXISTS idx_tariffs_service ON public.tariffs(service_id);

-- Auth & Staff
CREATE INDEX IF NOT EXISTS idx_org_memberships_user ON public.organization_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_org_memberships_org_role ON public.organization_memberships(organization_id, role);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_user ON public.staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_org ON public.staff_profiles(organization_id);

-- Owners & Pets
CREATE INDEX IF NOT EXISTS idx_owners_user_id ON public.owners(user_id);
CREATE INDEX IF NOT EXISTS idx_owners_phone ON public.owners(primary_phone);
CREATE INDEX IF NOT EXISTS idx_owners_org ON public.owners(organization_id);
CREATE INDEX IF NOT EXISTS idx_pets_owner ON public.pets(primary_owner_id);
CREATE INDEX IF NOT EXISTS idx_pets_org ON public.pets(organization_id);
CREATE INDEX IF NOT EXISTS idx_addresses_owner ON public.addresses(owner_id);
CREATE INDEX IF NOT EXISTS idx_cem_owner ON public.customer_experience_memory(owner_id);
CREATE INDEX IF NOT EXISTS idx_bereavement_pet ON public.bereavement_records(pet_id);

-- Appointments & Visits
CREATE INDEX IF NOT EXISTS idx_appointments_org ON public.appointments(organization_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet_time ON public.appointments(assigned_veterinarian_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_appointments_owner ON public.appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet ON public.appointments(pet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status_date ON public.appointment_requests(status, preferred_date);
CREATE INDEX IF NOT EXISTS idx_visits_appointment ON public.visits(appointment_id);
CREATE INDEX IF NOT EXISTS idx_visits_vet ON public.visits(veterinarian_id);

-- Conversations & Messaging
CREATE INDEX IF NOT EXISTS idx_conversations_org_status ON public.conversations(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_phone ON public.conversations(sender_phone);
CREATE INDEX IF NOT EXISTS idx_messages_conv_sent ON public.messages(conversation_id, sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_outbound_dispatch_status_time ON public.outbound_dispatch_requests(status, scheduled_for);

-- Calendar & Routes
CREATE INDEX IF NOT EXISTS idx_ext_events_time ON public.external_calendar_events(connection_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_staff_shifts_vet_date ON public.staff_shifts(staff_profile_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_routes_vet_date ON public.routes(veterinarian_id, route_date);
CREATE INDEX IF NOT EXISTS idx_route_stops_route ON public.route_stops(route_id, stop_order);

-- Recurring & Prevention
CREATE INDEX IF NOT EXISTS idx_preventive_due_status_date ON public.preventive_due_dates(status, due_date);
CREATE INDEX IF NOT EXISTS idx_preventive_due_pet ON public.preventive_due_dates(pet_id);
CREATE INDEX IF NOT EXISTS idx_recurring_occ_plan ON public.recurring_visit_occurrences(plan_id, status);

-- Finances & Outbox
CREATE INDEX IF NOT EXISTS idx_payment_collections_appt ON public.payment_collections(appointment_id);
CREATE INDEX IF NOT EXISTS idx_payment_collections_status ON public.payment_collections(payment_status);
CREATE INDEX IF NOT EXISTS idx_outbox_pending_retry ON public.transactional_outbox(status, retry_count, created_at);
CREATE INDEX IF NOT EXISTS idx_referrals_status_priority ON public.patient_referrals(status, triage_priority);

-- 2. SECURITY INVOKER VIEWS (Para consumo seguro desde Lovable UI)

-- Vista 1: Agenda consolidada del día
CREATE OR REPLACE VIEW public.v_daily_schedule
WITH (security_invoker = true) AS
SELECT 
    a.id AS appointment_id,
    a.organization_id,
    a.start_time,
    a.end_time,
    a.duration_minutes,
    a.status AS appointment_status,
    s.name AS service_name,
    s.category AS service_category,
    p.id AS pet_id,
    p.name AS pet_name,
    p.species AS pet_species,
    o.id AS owner_id,
    o.first_name || ' ' || o.last_name AS owner_full_name,
    o.primary_phone AS owner_phone,
    addr.address_line,
    addr.neighborhood,
    addr.access_instructions,
    sp.id AS veterinarian_id,
    up.full_name AS veterinarian_name,
    a.okvet_appointment_id,
    a.okvet_sync_status
FROM public.appointments a
JOIN public.services s ON s.id = a.service_id
JOIN public.pets p ON p.id = a.pet_id
JOIN public.owners o ON o.id = a.owner_id
JOIN public.addresses addr ON addr.id = a.address_id
JOIN public.staff_profiles sp ON sp.id = a.assigned_veterinarian_id
JOIN public.user_profiles up ON up.id = sp.user_id;

-- Vista 2: Ficha 360 del paciente con alertas y CEM
CREATE OR REPLACE VIEW public.v_patient_360
WITH (security_invoker = true) AS
SELECT 
    p.id AS pet_id,
    p.organization_id,
    p.name AS pet_name,
    p.species,
    p.breed,
    p.sex,
    p.birth_date,
    p.weight_kg,
    p.status AS pet_status,
    p.temperament,
    p.is_temperament_warning,
    o.id AS primary_owner_id,
    o.first_name || ' ' || o.last_name AS owner_name,
    o.primary_phone,
    o.is_vip,
    b.id IS NOT NULL AS is_in_bereavement,
    b.suppress_marketing_until,
    (
        SELECT jsonb_agg(jsonb_build_object(
            'id', pdd.id,
            'type', pdd.preventive_type,
            'due_date', pdd.due_date,
            'status', pdd.status
        ))
        FROM public.preventive_due_dates pdd
        WHERE pdd.pet_id = p.id AND pdd.status IN ('PENDING', 'OVERDUE')
    ) AS pending_preventives,
    p.created_at
FROM public.pets p
JOIN public.owners o ON o.id = p.primary_owner_id
LEFT JOIN public.bereavement_records b ON b.pet_id = p.id;

-- Vista 3: Cola de despacho para n8n
CREATE OR REPLACE VIEW public.v_n8n_outbox_queue
WITH (security_invoker = true) AS
SELECT 
    o.id,
    o.organization_id,
    o.aggregate_type,
    o.aggregate_id,
    o.event_type,
    o.payload,
    o.idempotency_key,
    o.retry_count,
    o.created_at
FROM public.transactional_outbox o
WHERE o.status = 'PENDING'
ORDER BY o.created_at ASC;
