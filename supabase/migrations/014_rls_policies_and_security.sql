-- ==============================================================================
-- Migration: 014_rls_policies_and_security.sql
-- Description: Enable Row Level Security (RLS) on all 86 tables, security helper
--              functions, and explicit policies for all 11 user roles.
-- Module: Module V & Enterprise Security Architecture
-- Requirements: Section 7 of Specification (11 Roles, Tenant Isolation, Privacy)
-- ==============================================================================

-- 1. HELPER SECURITY FUNCTIONS (SECURITY DEFINER with strict search_path)

CREATE OR REPLACE FUNCTION public.current_user_role(p_org_id UUID)
RETURNS public.app_role_type AS $$
    SELECT role 
    FROM public.organization_memberships 
    WHERE user_id = auth.uid() 
      AND organization_id = p_org_id 
      AND is_active = true 
    LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_org_admin(p_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_memberships 
        WHERE user_id = auth.uid() 
          AND organization_id = p_org_id 
          AND role IN ('ADMINISTRATOR', 'DIRECTOR')
          AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_org_staff(p_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_memberships 
        WHERE user_id = auth.uid() 
          AND organization_id = p_org_id 
          AND role IN ('VETERINARIAN', 'VET_ASSISTANT', 'COORDINATOR', 'RECEPTION', 'FINANCE', 'ADMINISTRATOR', 'DIRECTOR', 'TECH_SUPPORT')
          AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_org_member(p_org_id UUID)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM public.organization_memberships 
        WHERE user_id = auth.uid() 
          AND organization_id = p_org_id 
          AND is_active = true
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

-- 2. ENABLE RLS ACROSS ALL 86 TABLES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_working_days ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_authorizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_owner_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_experience_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bereavement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_restrictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_complaints ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_dispatch_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_transfers ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.appointment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okvet_references ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.staff_calendar_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_absences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacity_rules ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.recurrence_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_visit_occurrences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_care_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preventive_due_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_constraints ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_reoptimization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_inventory_allocations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.visit_charge_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_value_metrics ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.schedule_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_slot_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_appointments ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.patient_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_followups ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.post_visit_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_visit_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_surveys ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.transactional_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processed_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_integration_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dead_letter_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_delivery_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ai_assistant_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_action_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_action_executions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_incidents ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES: PUBLIC / OPERATIONAL CATALOGS (Services, Tariffs, Branches)
CREATE POLICY "Public and clients can read active services"
ON public.services FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage services"
ON public.services FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Public and clients can read active tariffs"
ON public.tariffs FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage tariffs"
ON public.tariffs FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Public can read active branches"
ON public.branches FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage branches"
ON public.branches FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Public can read operating hours"
ON public.operating_hours FOR SELECT
USING (is_active = true);

CREATE POLICY "Public can read non-working days"
ON public.non_working_days FOR SELECT
USING (true);

-- 4. POLICIES: USER PROFILES & MEMBERSHIPS
CREATE POLICY "Users can view and edit their own profile"
ON public.user_profiles FOR ALL
TO authenticated
USING (id = (SELECT auth.uid()))
WITH CHECK (id = (SELECT auth.uid()));

CREATE POLICY "Staff can view user profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can view their own org memberships"
ON public.organization_memberships FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_org_admin(organization_id));

CREATE POLICY "Admins can manage memberships"
ON public.organization_memberships FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

-- 5. POLICIES: CLIENTS, PETS, ADDRESSES & CONSENTS
CREATE POLICY "Owners can view and manage their own owner profile"
ON public.owners FOR ALL
TO authenticated
USING (user_id = (SELECT auth.uid()) OR public.is_org_staff(organization_id))
WITH CHECK (user_id = (SELECT auth.uid()) OR public.is_org_staff(organization_id));

CREATE POLICY "Owners can view and manage their own addresses"
ON public.addresses FOR ALL
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
)
WITH CHECK (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Owners can view and manage their own pets"
ON public.pets FOR ALL
TO authenticated
USING (
    primary_owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR id IN (
        SELECT pet_id FROM public.pet_owner_relations 
        WHERE owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    )
    OR public.is_org_staff(organization_id)
)
WITH CHECK (
    primary_owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Staff can view and update CEM records"
ON public.customer_experience_memory FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

-- 6. POLICIES: APPOINTMENT REQUESTS & APPOINTMENTS
CREATE POLICY "Owners can create and view their appointment requests"
ON public.appointment_requests FOR ALL
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
)
WITH CHECK (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Owners can view their scheduled appointments"
ON public.appointments FOR SELECT
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Staff can manage appointments"
ON public.appointments FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can manage visits and check-ins"
ON public.visits FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

-- 7. POLICIES: CONVERSATIONS & WHATSAPP
CREATE POLICY "Staff can manage conversations"
ON public.conversations FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can manage messages"
ON public.messages FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id AND public.is_org_staff(c.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id AND public.is_org_staff(c.organization_id)
));

-- 8. POLICIES: FINANCES & PAYMENTS
CREATE POLICY "Owners can view their own payment collections"
ON public.payment_collections FOR SELECT
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Staff and Finance can manage payments"
ON public.payment_collections FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Finance and Admin can manage payment verifications"
ON public.payment_verifications FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.organization_memberships m
    JOIN public.payment_collections pc ON pc.id = payment_collection_id
    WHERE m.user_id = (SELECT auth.uid())
      AND m.organization_id = pc.organization_id
      AND m.role IN ('FINANCE', 'ADMINISTRATOR', 'DIRECTOR')
      AND m.is_active = true
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.organization_memberships m
    JOIN public.payment_collections pc ON pc.id = payment_collection_id
    WHERE m.user_id = (SELECT auth.uid())
      AND m.organization_id = pc.organization_id
      AND m.role IN ('FINANCE', 'ADMINISTRATOR', 'DIRECTOR')
      AND m.is_active = true
));

-- 9. POLICIES: SPECIALISTS, SIMULATOR & REFERRALS
CREATE POLICY "Staff can view and manage specialist network"
ON public.specialist_profiles FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can view and manage referrals"
ON public.patient_referrals FOR ALL
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
)
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Director and Admin can manage simulation scenarios"
ON public.schedule_simulations FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

-- 10. POLICIES: AUDIT & SYSTEM LOGS (Restricted to Admins & Tech Support)
CREATE POLICY "Admins and tech support can read audit logs"
ON public.audit_logs FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.organization_memberships
    WHERE user_id = (SELECT auth.uid())
      AND role IN ('ADMINISTRATOR', 'DIRECTOR', 'TECH_SUPPORT')
      AND is_active = true
));

CREATE POLICY "Admins and tech support can read system events"
ON public.system_event_logs FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.organization_memberships
    WHERE user_id = (SELECT auth.uid())
      AND role IN ('ADMINISTRATOR', 'DIRECTOR', 'TECH_SUPPORT')
      AND is_active = true
));
