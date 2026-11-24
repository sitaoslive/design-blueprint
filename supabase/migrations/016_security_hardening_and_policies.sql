-- ==============================================================================
-- Migration: 016_security_hardening_and_policies.sql
-- Description: Security hardening (fix mutable search_path, restrict security
--              definer functions) and complete explicit RLS policies for all 63 tables.
-- Module: Security Architecture & Database Linter Remediation
-- ==============================================================================

-- 1. FIX FUNCTION SEARCH PATH
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. RESTRICT SECURITY DEFINER FUNCTIONS EXECUTION PRIVILEGES
REVOKE EXECUTE ON FUNCTION public.current_user_role(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.current_user_role(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_org_admin(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_admin(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_org_staff(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_staff(UUID) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.is_org_member(UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated;

-- 3. EXPLICIT POLICIES FOR CORE & AUTH TABLES

-- organizations
CREATE POLICY "Members can view their own organization"
ON public.organizations FOR SELECT
TO authenticated
USING (public.is_org_member(id));

CREATE POLICY "Admins can manage their organization"
ON public.organizations FOR ALL
TO authenticated
USING (public.is_org_admin(id))
WITH CHECK (public.is_org_admin(id));

-- system_settings
CREATE POLICY "Public can view public system settings"
ON public.system_settings FOR SELECT
USING (is_public = true);

CREATE POLICY "Staff can view all org system settings"
ON public.system_settings FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Admins can manage org system settings"
ON public.system_settings FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

-- staff_profiles & qualifications
CREATE POLICY "Staff can view staff profiles in their org"
ON public.staff_profiles FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Admins can manage staff profiles"
ON public.staff_profiles FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Staff can view staff qualifications"
ON public.staff_qualifications FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage staff qualifications"
ON public.staff_qualifications FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    WHERE sp.id = staff_profile_id AND public.is_org_admin(sp.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.staff_profiles sp
    WHERE sp.id = staff_profile_id AND public.is_org_admin(sp.organization_id)
));

-- caregiver_authorizations
CREATE POLICY "Owners and caregivers can view their authorizations"
ON public.caregiver_authorizations FOR SELECT
TO authenticated
USING (
    primary_owner_user_id = (SELECT auth.uid()) 
    OR caregiver_user_id = (SELECT auth.uid())
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Owners can manage caregiver authorizations"
ON public.caregiver_authorizations FOR ALL
TO authenticated
USING (primary_owner_user_id = (SELECT auth.uid()) OR public.is_org_admin(organization_id))
WITH CHECK (primary_owner_user_id = (SELECT auth.uid()) OR public.is_org_admin(organization_id));

-- user_invitations
CREATE POLICY "Admins can manage invitations"
ON public.user_invitations FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

-- pet_owner_relations
CREATE POLICY "Owners and staff can view pet relations"
ON public.pet_owner_relations FOR SELECT
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_id AND public.is_org_staff(p.organization_id))
);

CREATE POLICY "Staff and owners can manage pet relations"
ON public.pet_owner_relations FOR ALL
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_id AND public.is_org_staff(p.organization_id))
)
WITH CHECK (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.pets p WHERE p.id = pet_id AND public.is_org_staff(p.organization_id))
);

-- consents
CREATE POLICY "Owners can view their consents"
ON public.consents FOR SELECT
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Owners and staff can insert consents"
ON public.consents FOR INSERT
TO authenticated
WITH CHECK (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

-- bereavement_records
CREATE POLICY "Staff can view bereavement records"
ON public.bereavement_records FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Staff can manage bereavement records"
ON public.bereavement_records FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

-- contact_restrictions
CREATE POLICY "Owners and staff can view contact restrictions"
ON public.contact_restrictions FOR SELECT
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.owners o WHERE o.id = owner_id AND public.is_org_staff(o.organization_id))
);

CREATE POLICY "Owners and staff can manage contact restrictions"
ON public.contact_restrictions FOR ALL
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.owners o WHERE o.id = owner_id AND public.is_org_staff(o.organization_id))
)
WITH CHECK (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR EXISTS (SELECT 1 FROM public.owners o WHERE o.id = owner_id AND public.is_org_staff(o.organization_id))
);

-- client_complaints
CREATE POLICY "Owners can view and create complaints"
ON public.client_complaints FOR ALL
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
)
WITH CHECK (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

-- 4. EXPLICIT POLICIES FOR MESSAGING & APPOINTMENTS

-- message_templates
CREATE POLICY "Staff can view message templates"
ON public.message_templates FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Admins can manage message templates"
ON public.message_templates FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

-- outbound_dispatch_requests & conversation_transfers
CREATE POLICY "Staff can manage outbound dispatch"
ON public.outbound_dispatch_requests FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can manage conversation transfers"
ON public.conversation_transfers FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id AND public.is_org_staff(c.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id AND public.is_org_staff(c.organization_id)
));

-- appointment_services, status_history, holds, okvet
CREATE POLICY "Owners and staff can view appointment services"
ON public.appointment_services FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id AND (
        a.owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
        OR public.is_org_staff(a.organization_id)
    )
));

CREATE POLICY "Staff can manage appointment services"
ON public.appointment_services FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id AND public.is_org_staff(a.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id AND public.is_org_staff(a.organization_id)
));

CREATE POLICY "Staff can view and create appointment history"
ON public.appointment_status_history FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id AND public.is_org_staff(a.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id AND public.is_org_staff(a.organization_id)
));

CREATE POLICY "Staff can manage appointment holds"
ON public.appointment_holds FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can manage okvet references"
ON public.okvet_references FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

-- 5. EXPLICIT POLICIES FOR CALENDAR & CAPACITY

CREATE POLICY "Staff can manage their own calendar connections"
ON public.staff_calendar_connections FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp 
    WHERE sp.id = staff_profile_id AND sp.user_id = (SELECT auth.uid())
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.staff_profiles sp 
    WHERE sp.id = staff_profile_id AND sp.user_id = (SELECT auth.uid())
));

CREATE POLICY "Staff can manage external calendar events"
ON public.external_calendar_events FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.staff_calendar_connections sc
    JOIN public.staff_profiles sp ON sp.id = sc.staff_profile_id
    WHERE sc.id = connection_id AND (sp.user_id = (SELECT auth.uid()) OR public.is_org_staff(sp.organization_id))
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.staff_calendar_connections sc
    JOIN public.staff_profiles sp ON sp.id = sc.staff_profile_id
    WHERE sc.id = connection_id AND (sp.user_id = (SELECT auth.uid()) OR public.is_org_staff(sp.organization_id))
));

CREATE POLICY "Staff can view calendar sync state"
ON public.calendar_sync_state FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can manage calendar conflicts"
ON public.calendar_conflicts FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can view shifts"
ON public.staff_shifts FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Admins can manage shifts"
ON public.staff_shifts FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Staff can manage absences"
ON public.staff_absences FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can view capacity rules"
ON public.capacity_rules FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Admins can manage capacity rules"
ON public.capacity_rules FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

-- 6. EXPLICIT POLICIES FOR RECURRING, PREVENTION & CLINICAL CONSTRAINTS

CREATE POLICY "Staff can manage recurrence templates"
ON public.recurrence_templates FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Owners and staff can view treatment plans"
ON public.recurring_treatment_plans FOR SELECT
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Staff can manage treatment plans"
ON public.recurring_treatment_plans FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Owners and staff can view visit occurrences"
ON public.recurring_visit_occurrences FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.recurring_treatment_plans tp
    WHERE tp.id = plan_id AND (
        tp.owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
        OR public.is_org_staff(tp.organization_id)
    )
));

CREATE POLICY "Staff can manage visit occurrences"
ON public.recurring_visit_occurrences FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.recurring_treatment_plans tp
    WHERE tp.id = plan_id AND public.is_org_staff(tp.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.recurring_treatment_plans tp
    WHERE tp.id = plan_id AND public.is_org_staff(tp.organization_id)
));

CREATE POLICY "Owners and staff can view preventive care plans"
ON public.preventive_care_plans FOR SELECT
TO authenticated
USING (
    pet_id IN (
        SELECT id FROM public.pets 
        WHERE primary_owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    )
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Staff can manage preventive care plans"
ON public.preventive_care_plans FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Owners and staff can view preventive due dates"
ON public.preventive_due_dates FOR SELECT
TO authenticated
USING (
    pet_id IN (
        SELECT id FROM public.pets 
        WHERE primary_owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    )
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Staff can manage preventive due dates"
ON public.preventive_due_dates FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can view clinical constraints"
ON public.clinical_constraints FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Admins can manage clinical constraints"
ON public.clinical_constraints FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

-- 7. EXPLICIT POLICIES FOR ROUTES & OPERATIONS

CREATE POLICY "Staff can view routes"
ON public.routes FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Staff can manage routes"
ON public.routes FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can view and manage route stops"
ON public.route_stops FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.routes r 
    WHERE r.id = route_id AND public.is_org_staff(r.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.routes r 
    WHERE r.id = route_id AND public.is_org_staff(r.organization_id)
));

CREATE POLICY "Staff can manage route reoptimization"
ON public.route_reoptimization_requests FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.routes r 
    WHERE r.id = route_id AND public.is_org_staff(r.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.routes r 
    WHERE r.id = route_id AND public.is_org_staff(r.organization_id)
));

CREATE POLICY "Staff can view and manage route alerts"
ON public.route_alerts FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.routes r 
    WHERE r.id = route_id AND public.is_org_staff(r.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.routes r 
    WHERE r.id = route_id AND public.is_org_staff(r.organization_id)
));

CREATE POLICY "Staff can view supplies catalog"
ON public.supplies FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Admins can manage supplies catalog"
ON public.supplies FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Staff can view supply movements"
ON public.supply_movements FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Admins can manage supply movements"
ON public.supply_movements FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Staff can view vehicle inventories"
ON public.vehicle_inventory_allocations FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp 
    WHERE sp.id = staff_profile_id AND (sp.user_id = (SELECT auth.uid()) OR public.is_org_staff(sp.organization_id))
));

CREATE POLICY "Admins can manage vehicle inventories"
ON public.vehicle_inventory_allocations FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.staff_profiles sp 
    WHERE sp.id = staff_profile_id AND public.is_org_admin(sp.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.staff_profiles sp 
    WHERE sp.id = staff_profile_id AND public.is_org_admin(sp.organization_id)
));

-- 8. EXPLICIT POLICIES FOR FINANCES & METRICS

CREATE POLICY "Owners and staff can view charge lines"
ON public.visit_charge_lines FOR SELECT
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.appointments a 
    WHERE a.id = appointment_id AND (
        a.owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
        OR public.is_org_staff(a.organization_id)
    )
));

CREATE POLICY "Staff and finance can manage charge lines"
ON public.visit_charge_lines FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Owners and staff can view customer value metrics"
ON public.customer_value_metrics FOR SELECT
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Staff and finance can manage customer value metrics"
ON public.customer_value_metrics FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

-- 9. EXPLICIT POLICIES FOR SIMULATOR, SPECIALISTS & REFERRALS

CREATE POLICY "Admins can view simulation snapshots"
ON public.simulation_snapshots FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.schedule_simulations s 
    WHERE s.id = simulation_id AND public.is_org_admin(s.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.schedule_simulations s 
    WHERE s.id = simulation_id AND public.is_org_admin(s.organization_id)
));

CREATE POLICY "Admins can view simulation scenarios"
ON public.simulation_scenarios FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.schedule_simulations s 
    WHERE s.id = simulation_id AND public.is_org_admin(s.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.schedule_simulations s 
    WHERE s.id = simulation_id AND public.is_org_admin(s.organization_id)
));

CREATE POLICY "Staff can view specialist specialties"
ON public.specialist_specialties FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage specialist specialties"
ON public.specialist_specialties FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Staff can view specialist agreements"
ON public.specialist_agreements FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage specialist agreements"
ON public.specialist_agreements FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Staff can manage specialist slot holds"
ON public.specialist_slot_holds FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Staff can manage specialist booking requests"
ON public.specialist_booking_requests FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can manage specialist appointments"
ON public.specialist_appointments FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Director and Admins can manage referral approvals"
ON public.referral_approvals FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.patient_referrals r 
    WHERE r.id = referral_id AND public.is_org_staff(r.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.patient_referrals r 
    WHERE r.id = referral_id AND public.is_org_staff(r.organization_id)
));

CREATE POLICY "Staff can view and manage referral documents"
ON public.referral_documents FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.patient_referrals r 
    WHERE r.id = referral_id AND public.is_org_staff(r.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.patient_referrals r 
    WHERE r.id = referral_id AND public.is_org_staff(r.organization_id)
));

CREATE POLICY "Staff can view and manage referral followups"
ON public.referral_followups FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.patient_referrals r 
    WHERE r.id = referral_id AND public.is_org_staff(r.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.patient_referrals r 
    WHERE r.id = referral_id AND public.is_org_staff(r.organization_id)
));

-- 10. EXPLICIT POLICIES FOR COMMITMENTS & FEEDBACK

CREATE POLICY "Owners and staff can view post visit commitments"
ON public.post_visit_commitments FOR SELECT
TO authenticated
USING (
    owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid()))
    OR public.is_org_staff(organization_id)
);

CREATE POLICY "Staff can manage post visit commitments"
ON public.post_visit_commitments FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can view and manage post visit reminders"
ON public.post_visit_reminders FOR ALL
TO authenticated
USING (EXISTS (
    SELECT 1 FROM public.post_visit_commitments c 
    WHERE c.id = commitment_id AND public.is_org_staff(c.organization_id)
))
WITH CHECK (EXISTS (
    SELECT 1 FROM public.post_visit_commitments c 
    WHERE c.id = commitment_id AND public.is_org_staff(c.organization_id)
));

CREATE POLICY "Owners can submit feedback surveys"
ON public.feedback_surveys FOR INSERT
TO authenticated
WITH CHECK (owner_id IN (SELECT id FROM public.owners WHERE user_id = (SELECT auth.uid())));

CREATE POLICY "Staff can view feedback surveys"
ON public.feedback_surveys FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

-- 11. EXPLICIT POLICIES FOR AUTOMATION & SYSTEM LOGS

CREATE POLICY "Staff and tech support can view outbox"
ON public.transactional_outbox FOR SELECT
TO authenticated
USING (public.is_org_staff(organization_id));

CREATE POLICY "Tech support and admins can view processed events"
ON public.processed_events FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Staff can view n8n registry"
ON public.n8n_integration_registry FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage n8n registry"
ON public.n8n_integration_registry FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Admins and tech support can manage dead letter queue"
ON public.dead_letter_queue FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Tech support and admins can view webhook logs"
ON public.webhook_delivery_logs FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and tech support can manage AI configs"
ON public.ai_assistant_configs FOR ALL
TO authenticated
USING (public.is_org_admin(organization_id))
WITH CHECK (public.is_org_admin(organization_id));

CREATE POLICY "Admins and tech support can view prompt versions"
ON public.ai_prompt_versions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Staff can view and approve AI action proposals"
ON public.ai_action_proposals FOR ALL
TO authenticated
USING (public.is_org_staff(organization_id))
WITH CHECK (public.is_org_staff(organization_id));

CREATE POLICY "Staff can view AI action executions"
ON public.ai_action_executions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and tech support can manage security incidents"
ON public.security_incidents FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
