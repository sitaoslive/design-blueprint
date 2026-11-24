const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, '../supabase/migrations/040_customer_experience_followup_and_service_recovery_hub.sql');

const sql = `-- ==============================================================================
-- MIGRATION 040: CUSTOMER EXPERIENCE FOLLOW-UP & SERVICE RECOVERY HUB (VET-CORE-15)
-- Empresa: Vet Life — Veterinaria a Domicilio
-- Dirección: Dr. Luis Eduardo Ríos
-- Arquitectura: Google Antigravity + n8n + Supabase + Lovable
-- Cinco Subsistemas:
--   A. Seguimiento Posvisita (Follow-ups, Planes, Intentos, Respuestas)
--   B. Feedback y Encuestas (Surveys, Versiones, Respuestas, Feedback, Clasificaciones)
--   C. Service Recovery y Quejas (Complaints, Casos de Recuperación, Acciones, Compromisos, Cierres y Reaperturas)
--   D. Reputación, Reseñas Neutrales y Testimonios (Supresiones Sensibles, Reseñas sin Review Gating, Testimonios con Consentimiento)
--   E. Mejora Continua, Métricas y Auditoría Inmutable (Clusters, Métricas Diarias, Bitácora Forense)
-- ==============================================================================

-- 1. customer_experience_followups
CREATE TABLE IF NOT EXISTS customer_experience_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES owners(id) ON DELETE SET NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    professional_id UUID REFERENCES staff_profiles(id) ON DELETE SET NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'PENDING_ELIGIBILITY',
    channel VARCHAR(32) NOT NULL DEFAULT 'WHATSAPP',
    recipient_phone VARCHAR(32),
    recipient_name VARCHAR(128),
    followup_category VARCHAR(64) NOT NULL DEFAULT 'POST_VISIT_CHECK',
    policy_version VARCHAR(32) NOT NULL DEFAULT 'v1.0',
    scheduled_at TIMESTAMPTZ,
    eligible_after TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    suppression_reason VARCHAR(128),
    consent_reference VARCHAR(128),
    state_version INT NOT NULL DEFAULT 1,
    correlation_id VARCHAR(128),
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. customer_experience_followup_plans
CREATE TABLE IF NOT EXISTS customer_experience_followup_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    followup_id UUID NOT NULL REFERENCES customer_experience_followups(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_type VARCHAR(64) NOT NULL DEFAULT 'STANDARD_POST_VISIT',
    timing_rule VARCHAR(128) NOT NULL DEFAULT 'HOURS_AFTER_VISIT_24',
    message_template_key VARCHAR(64) NOT NULL DEFAULT 'TPL_CX_FOLLOWUP_V1',
    survey_id UUID,
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. customer_experience_followup_attempts
CREATE TABLE IF NOT EXISTS customer_experience_followup_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    followup_id UUID NOT NULL REFERENCES customer_experience_followups(id) ON DELETE CASCADE,
    attempt_number INT NOT NULL DEFAULT 1,
    status VARCHAR(32) NOT NULL DEFAULT 'REQUESTED',
    outbound_request_id UUID,
    provider_message_id VARCHAR(128),
    error_code VARCHAR(64),
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ
);

-- 4. customer_experience_responses
CREATE TABLE IF NOT EXISTS customer_experience_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    followup_id UUID REFERENCES customer_experience_followups(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES owners(id) ON DELETE SET NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    source_channel VARCHAR(32) NOT NULL DEFAULT 'WHATSAPP',
    raw_message_text TEXT NOT NULL,
    response_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    received_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    idempotency_key VARCHAR(128) UNIQUE
);

-- 5. customer_experience_surveys
CREATE TABLE IF NOT EXISTS customer_experience_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    slug VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 6. customer_experience_survey_versions
CREATE TABLE IF NOT EXISTS customer_experience_survey_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES customer_experience_surveys(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_current BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(survey_id, version_number)
);

-- 7. customer_experience_survey_answers
CREATE TABLE IF NOT EXISTS customer_experience_survey_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    survey_version_id UUID NOT NULL REFERENCES customer_experience_survey_versions(id) ON DELETE CASCADE,
    followup_id UUID REFERENCES customer_experience_followups(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES owners(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    overall_score INT,
    communication_clarity_score INT,
    punctuality_score INT,
    felt_heard_score INT,
    answers_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    answered_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 8. customer_experience_feedback
CREATE TABLE IF NOT EXISTS customer_experience_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    followup_id UUID REFERENCES customer_experience_followups(id) ON DELETE SET NULL,
    response_id UUID REFERENCES customer_experience_responses(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES owners(id) ON DELETE SET NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    feedback_text TEXT NOT NULL,
    sentiment VARCHAR(32) NOT NULL DEFAULT 'NEUTRAL',
    primary_category VARCHAR(64) NOT NULL DEFAULT 'UNCLASSIFIED',
    is_complaint BOOLEAN NOT NULL DEFAULT false,
    is_clinical_concern BOOLEAN NOT NULL DEFAULT false,
    is_urgent BOOLEAN NOT NULL DEFAULT false,
    is_public_testimonial_eligible BOOLEAN NOT NULL DEFAULT false,
    status VARCHAR(32) NOT NULL DEFAULT 'RECEIVED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 9. customer_experience_feedback_classifications
CREATE TABLE IF NOT EXISTS customer_experience_feedback_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES customer_experience_feedback(id) ON DELETE CASCADE,
    proposed_label VARCHAR(64) NOT NULL,
    confidence NUMERIC(5,4) NOT NULL DEFAULT 0.8500,
    model_provider VARCHAR(64) NOT NULL DEFAULT 'RULE_ENGINE',
    rationale TEXT,
    requires_human_confirmation BOOLEAN NOT NULL DEFAULT true,
    confirmed_by_user_id UUID,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 10. customer_experience_feedback_sources
CREATE TABLE IF NOT EXISTS customer_experience_feedback_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    feedback_id UUID NOT NULL REFERENCES customer_experience_feedback(id) ON DELETE CASCADE,
    source_system VARCHAR(64) NOT NULL DEFAULT 'WHATSAPP',
    external_reference VARCHAR(128),
    captured_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 11. customer_experience_complaints
CREATE TABLE IF NOT EXISTS customer_experience_complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    feedback_id UUID REFERENCES customer_experience_feedback(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES owners(id) ON DELETE SET NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    complaint_code VARCHAR(64) NOT NULL UNIQUE,
    category VARCHAR(64) NOT NULL DEFAULT 'COORDINATION_ISSUE',
    severity VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    summary TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 12. customer_experience_complaint_events
CREATE TABLE IF NOT EXISTS customer_experience_complaint_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES customer_experience_complaints(id) ON DELETE CASCADE,
    event_type VARCHAR(64) NOT NULL,
    actor_user_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 13. customer_experience_recovery_cases
CREATE TABLE IF NOT EXISTS customer_experience_recovery_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    complaint_id UUID REFERENCES customer_experience_complaints(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES owners(id) ON DELETE SET NULL,
    pet_id UUID REFERENCES pets(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    feedback_id UUID REFERENCES customer_experience_feedback(id) ON DELETE SET NULL,
    issue_category VARCHAR(64) NOT NULL,
    issue_description TEXT NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'NEW',
    priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    owner_team VARCHAR(64) NOT NULL DEFAULT 'COORDINATION',
    assigned_user_id UUID,
    due_at TIMESTAMPTZ,
    next_action TEXT,
    requires_human_review BOOLEAN NOT NULL DEFAULT true,
    requires_clinical_review BOOLEAN NOT NULL DEFAULT false,
    state_version INT NOT NULL DEFAULT 1,
    reopen_count INT NOT NULL DEFAULT 0,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 14. customer_experience_recovery_assignments
CREATE TABLE IF NOT EXISTS customer_experience_recovery_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_case_id UUID NOT NULL REFERENCES customer_experience_recovery_cases(id) ON DELETE CASCADE,
    assigned_user_id UUID NOT NULL,
    assigned_role VARCHAR(64) NOT NULL,
    assigned_by_user_id UUID,
    accepted_at TIMESTAMPTZ,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 15. customer_experience_recovery_actions
CREATE TABLE IF NOT EXISTS customer_experience_recovery_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_case_id UUID NOT NULL REFERENCES customer_experience_recovery_cases(id) ON DELETE CASCADE,
    action_type VARCHAR(64) NOT NULL,
    action_details TEXT NOT NULL,
    performed_by_user_id UUID,
    evidence_reference TEXT,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 16. customer_experience_recovery_commitments
CREATE TABLE IF NOT EXISTS customer_experience_recovery_commitments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_case_id UUID NOT NULL REFERENCES customer_experience_recovery_cases(id) ON DELETE CASCADE,
    commitment_description TEXT NOT NULL,
    responsible_user_id UUID NOT NULL,
    due_at TIMESTAMPTZ NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 17. customer_experience_recovery_outcomes
CREATE TABLE IF NOT EXISTS customer_experience_recovery_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recovery_case_id UUID NOT NULL REFERENCES customer_experience_recovery_cases(id) ON DELETE CASCADE,
    outcome_type VARCHAR(64) NOT NULL,
    customer_confirmed_satisfaction BOOLEAN DEFAULT NULL,
    closure_summary TEXT NOT NULL,
    verified_by_user_id UUID NOT NULL,
    closed_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 18. customer_experience_sensitive_suppressions
CREATE TABLE IF NOT EXISTS customer_experience_sensitive_suppressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    suppression_type VARCHAR(64) NOT NULL,
    reason TEXT NOT NULL,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    valid_until TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    registered_by_user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 19. customer_experience_review_request_plans
CREATE TABLE IF NOT EXISTS customer_experience_review_request_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_name VARCHAR(128) NOT NULL,
    delay_hours INT NOT NULL DEFAULT 48,
    policy_rules JSONB NOT NULL DEFAULT '{"neutral_language": true, "no_rating_gating": true, "suppress_on_bereavement": true}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 20. customer_experience_review_requests
CREATE TABLE IF NOT EXISTS customer_experience_review_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    visit_id UUID REFERENCES visits(id) ON DELETE SET NULL,
    platform_key VARCHAR(64) NOT NULL DEFAULT 'GOOGLE_BUSINESS_PROFILE',
    status VARCHAR(32) NOT NULL DEFAULT 'ELIGIBLE',
    suppression_reason VARCHAR(128),
    is_neutral_language BOOLEAN NOT NULL DEFAULT true,
    has_score_gating BOOLEAN NOT NULL DEFAULT false,
    has_incentive BOOLEAN NOT NULL DEFAULT false,
    scheduled_at TIMESTAMPTZ,
    requested_at TIMESTAMPTZ,
    idempotency_key VARCHAR(128) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 21. customer_experience_review_platforms
CREATE TABLE IF NOT EXISTS customer_experience_review_platforms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    platform_key VARCHAR(64) NOT NULL,
    profile_url TEXT NOT NULL,
    review_link TEXT NOT NULL,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    verified_by_user_id UUID,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(organization_id, platform_key)
);

-- 22. customer_experience_testimonial_consents
CREATE TABLE IF NOT EXISTS customer_experience_testimonial_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    status VARCHAR(64) NOT NULL DEFAULT 'CONSENT_NOT_REQUESTED',
    allowed_channels JSONB NOT NULL DEFAULT '["WEBSITE"]'::jsonb,
    allow_customer_name BOOLEAN NOT NULL DEFAULT false,
    allow_pet_name BOOLEAN NOT NULL DEFAULT true,
    allow_photo BOOLEAN NOT NULL DEFAULT false,
    consent_notes TEXT,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 23. customer_experience_testimonials
CREATE TABLE IF NOT EXISTS customer_experience_testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    consent_id UUID NOT NULL REFERENCES customer_experience_testimonial_consents(id) ON DELETE CASCADE,
    feedback_id UUID REFERENCES customer_experience_feedback(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    status VARCHAR(64) NOT NULL DEFAULT 'CONTENT_PENDING_REVIEW',
    approved_by_user_id UUID,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 24. customer_experience_quality_improvements
CREATE TABLE IF NOT EXISTS customer_experience_quality_improvements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    cluster_theme VARCHAR(128) NOT NULL,
    frequency_count INT NOT NULL DEFAULT 1,
    sample_case_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    improvement_proposal TEXT NOT NULL,
    assigned_owner_team VARCHAR(64) NOT NULL DEFAULT 'COORDINATION',
    target_core_module VARCHAR(32) DEFAULT 'CORE-08',
    status VARCHAR(32) NOT NULL DEFAULT 'PROPOSED',
    approved_by_user_id UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 25. customer_experience_metrics
CREATE TABLE IF NOT EXISTS customer_experience_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    eligible_visits INT NOT NULL DEFAULT 0,
    followups_scheduled INT NOT NULL DEFAULT 0,
    followups_suppressed INT NOT NULL DEFAULT 0,
    messages_delivered INT NOT NULL DEFAULT 0,
    responses_received INT NOT NULL DEFAULT 0,
    surveys_completed INT NOT NULL DEFAULT 0,
    average_csat NUMERIC(4,2) DEFAULT NULL,
    complaints_opened INT NOT NULL DEFAULT 0,
    recovery_cases_resolved INT NOT NULL DEFAULT 0,
    recovery_cases_reopened INT NOT NULL DEFAULT 0,
    clinical_concerns_transferred INT NOT NULL DEFAULT 0,
    neutral_reviews_invited INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    UNIQUE(organization_id, metric_date)
);

-- 26. customer_experience_audit
CREATE TABLE IF NOT EXISTS customer_experience_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    action_type VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id UUID NOT NULL,
    actor_type VARCHAR(32) NOT NULL DEFAULT 'SYSTEM',
    actor_id VARCHAR(128),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ROW LEVEL SECURITY ACTIVATION
ALTER TABLE customer_experience_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_followups FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_followup_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_followup_plans FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_followup_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_followup_attempts FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_responses FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_surveys FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_survey_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_survey_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_survey_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_survey_answers FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_feedback FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_feedback_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_feedback_classifications FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_feedback_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_feedback_sources FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_complaints FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_complaint_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_complaint_events FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_cases FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_assignments FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_actions FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_commitments FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_recovery_outcomes FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_sensitive_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_sensitive_suppressions FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_review_request_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_review_request_plans FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_review_requests FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_review_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_review_platforms FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_testimonial_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_testimonial_consents FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_testimonials FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_quality_improvements ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_quality_improvements FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_metrics FORCE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_experience_audit FORCE ROW LEVEL SECURITY;

-- POLICIES FOR DIRECT ORGANIZATION_ID TABLES
CREATE POLICY rls_cx_followups_isolation ON customer_experience_followups
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_followup_plans_isolation ON customer_experience_followup_plans
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_followup_attempts_isolation ON customer_experience_followup_attempts
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM customer_experience_followups f JOIN organization_memberships m ON m.organization_id = f.organization_id WHERE f.id = followup_id AND m.user_id = auth.uid()));

CREATE POLICY rls_cx_responses_isolation ON customer_experience_responses
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_surveys_isolation ON customer_experience_surveys
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_survey_versions_isolation ON customer_experience_survey_versions
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM customer_experience_surveys s JOIN organization_memberships m ON m.organization_id = s.organization_id WHERE s.id = survey_id AND m.user_id = auth.uid()));

CREATE POLICY rls_cx_survey_answers_isolation ON customer_experience_survey_answers
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_feedback_isolation ON customer_experience_feedback
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_feedback_classifications_isolation ON customer_experience_feedback_classifications
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM customer_experience_feedback f JOIN organization_memberships m ON m.organization_id = f.organization_id WHERE f.id = feedback_id AND m.user_id = auth.uid()));

CREATE POLICY rls_cx_feedback_sources_isolation ON customer_experience_feedback_sources
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM customer_experience_feedback f JOIN organization_memberships m ON m.organization_id = f.organization_id WHERE f.id = feedback_id AND m.user_id = auth.uid()));

CREATE POLICY rls_cx_complaints_isolation ON customer_experience_complaints
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_complaint_events_isolation ON customer_experience_complaint_events
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM customer_experience_complaints c JOIN organization_memberships m ON m.organization_id = c.organization_id WHERE c.id = complaint_id AND m.user_id = auth.uid()));

CREATE POLICY rls_cx_recovery_cases_isolation ON customer_experience_recovery_cases
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_recovery_assignments_isolation ON customer_experience_recovery_assignments
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM customer_experience_recovery_cases rc JOIN organization_memberships m ON m.organization_id = rc.organization_id WHERE rc.id = recovery_case_id AND m.user_id = auth.uid()));

CREATE POLICY rls_cx_recovery_actions_isolation ON customer_experience_recovery_actions
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM customer_experience_recovery_cases rc JOIN organization_memberships m ON m.organization_id = rc.organization_id WHERE rc.id = recovery_case_id AND m.user_id = auth.uid()));

CREATE POLICY rls_cx_recovery_commitments_isolation ON customer_experience_recovery_commitments
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM customer_experience_recovery_cases rc JOIN organization_memberships m ON m.organization_id = rc.organization_id WHERE rc.id = recovery_case_id AND m.user_id = auth.uid()));

CREATE POLICY rls_cx_recovery_outcomes_isolation ON customer_experience_recovery_outcomes
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM customer_experience_recovery_cases rc JOIN organization_memberships m ON m.organization_id = rc.organization_id WHERE rc.id = recovery_case_id AND m.user_id = auth.uid()));

CREATE POLICY rls_cx_suppressions_isolation ON customer_experience_sensitive_suppressions
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_review_request_plans_isolation ON customer_experience_review_request_plans
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_review_requests_isolation ON customer_experience_review_requests
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_review_platforms_isolation ON customer_experience_review_platforms
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_testimonial_consents_isolation ON customer_experience_testimonial_consents
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_testimonials_isolation ON customer_experience_testimonials
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_quality_improvements_isolation ON customer_experience_quality_improvements
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_metrics_isolation ON customer_experience_metrics
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

CREATE POLICY rls_cx_audit_isolation ON customer_experience_audit
FOR ALL TO authenticated
USING (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()))
WITH CHECK (organization_id IN (SELECT organization_id FROM organization_memberships WHERE user_id = auth.uid()));

-- SERVICE ROLE BYPASS POLICIES
CREATE POLICY rls_service_cx_followups ON customer_experience_followups FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_followup_plans ON customer_experience_followup_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_followup_attempts ON customer_experience_followup_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_responses ON customer_experience_responses FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_surveys ON customer_experience_surveys FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_survey_versions ON customer_experience_survey_versions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_survey_answers ON customer_experience_survey_answers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_feedback ON customer_experience_feedback FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_feedback_classifications ON customer_experience_feedback_classifications FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_feedback_sources ON customer_experience_feedback_sources FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_complaints ON customer_experience_complaints FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_complaint_events ON customer_experience_complaint_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_recovery_cases ON customer_experience_recovery_cases FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_recovery_assignments ON customer_experience_recovery_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_recovery_actions ON customer_experience_recovery_actions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_recovery_commitments ON customer_experience_recovery_commitments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_recovery_outcomes ON customer_experience_recovery_outcomes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_suppressions ON customer_experience_sensitive_suppressions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_review_request_plans ON customer_experience_review_request_plans FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_review_requests ON customer_experience_review_requests FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_review_platforms ON customer_experience_review_platforms FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_testimonial_consents ON customer_experience_testimonial_consents FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_testimonials ON customer_experience_testimonials FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_quality_improvements ON customer_experience_quality_improvements FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_metrics ON customer_experience_metrics FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY rls_service_cx_audit ON customer_experience_audit FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORED PROCEDURES (SECURITY DEFINER, search_path = public)
-- ==============================================================================

-- 1. evaluate_followup_eligibility
CREATE OR REPLACE FUNCTION evaluate_followup_eligibility(
    p_visit_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_visit RECORD;
    v_suppression RECORD;
    v_active_recovery RECORD;
    v_existing_followup RECORD;
    v_result JSONB;
BEGIN
    SELECT * INTO v_visit FROM visits WHERE id = p_visit_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('eligible', false, 'reason', 'VISIT_NOT_FOUND', 'status', 'NOT_ELIGIBLE');
    END IF;

    IF v_visit.status != 'completed' AND v_visit.status != 'verified' THEN
        RETURN jsonb_build_object('eligible', false, 'reason', 'VISIT_NOT_COMPLETED', 'status', 'NOT_ELIGIBLE');
    END IF;

    -- Check bereavement or sensitive suppressions
    SELECT * INTO v_suppression FROM customer_experience_sensitive_suppressions
    WHERE (customer_id = v_visit.customer_id OR pet_id = v_visit.pet_id)
      AND is_active = true
      AND (valid_until IS NULL OR valid_until > clock_timestamp())
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'eligible', false,
            'reason', 'SENSITIVE_SUPPRESSION_' || v_suppression.suppression_type,
            'status', 'SUPPRESSED',
            'suppression_id', v_suppression.id
        );
    END IF;

    -- Check active recovery case
    SELECT * INTO v_active_recovery FROM customer_experience_recovery_cases
    WHERE customer_id = v_visit.customer_id
      AND status NOT IN ('RESOLVED_VERIFIED', 'CLOSED_WITH_DOCUMENTED_OUTCOME')
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'eligible', false,
            'reason', 'ACTIVE_SERVICE_RECOVERY_EXISTS',
            'status', 'ON_HOLD',
            'recovery_case_id', v_active_recovery.id
        );
    END IF;

    -- Check duplicate followup
    SELECT * INTO v_existing_followup FROM customer_experience_followups
    WHERE visit_id = p_visit_id
      AND status NOT IN ('CANCELLED', 'ERROR')
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object(
            'eligible', false,
            'reason', 'FOLLOWUP_ALREADY_EXISTS',
            'status', 'DUPLICATE_IGNORED',
            'followup_id', v_existing_followup.id
        );
    END IF;

    RETURN jsonb_build_object(
        'eligible', true,
        'reason', 'CRITERIA_SATISFIED',
        'status', 'ELIGIBLE',
        'customer_id', v_visit.customer_id,
        'pet_id', v_visit.pet_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. schedule_experience_followup
CREATE OR REPLACE FUNCTION schedule_experience_followup(
    p_org_id UUID,
    p_customer_id UUID,
    p_pet_id UUID,
    p_visit_id UUID,
    p_category VARCHAR,
    p_idempotency_key VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_followup_id UUID;
    v_eligibility JSONB;
BEGIN
    v_eligibility := evaluate_followup_eligibility(p_visit_id);
    IF (v_eligibility->>'eligible')::boolean != true THEN
        INSERT INTO customer_experience_followups (
            organization_id, customer_id, pet_id, visit_id,
            status, followup_category, suppression_reason, idempotency_key
        ) VALUES (
            p_org_id, p_customer_id, p_pet_id, p_visit_id,
            v_eligibility->>'status', COALESCE(p_category, 'POST_VISIT_CHECK'),
            v_eligibility->>'reason', p_idempotency_key
        )
        ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = clock_timestamp()
        RETURNING id INTO v_followup_id;
        RETURN v_followup_id;
    END IF;

    INSERT INTO customer_experience_followups (
        organization_id, customer_id, pet_id, visit_id,
        status, followup_category, scheduled_at, eligible_after, idempotency_key
    ) VALUES (
        p_org_id, p_customer_id, p_pet_id, p_visit_id,
        'SCHEDULED', COALESCE(p_category, 'POST_VISIT_CHECK'),
        clock_timestamp() + INTERVAL '24 hours', clock_timestamp() + INTERVAL '24 hours', p_idempotency_key
    )
    ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = clock_timestamp()
    RETURNING id INTO v_followup_id;

    RETURN v_followup_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. suppress_experience_followup
CREATE OR REPLACE FUNCTION suppress_experience_followup(
    p_followup_id UUID,
    p_reason VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE customer_experience_followups
    SET status = 'SUPPRESSED',
        suppression_reason = p_reason,
        updated_at = clock_timestamp()
    WHERE id = p_followup_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 4. register_experience_response
CREATE OR REPLACE FUNCTION register_experience_response(
    p_org_id UUID,
    p_followup_id UUID,
    p_customer_id UUID,
    p_pet_id UUID,
    p_raw_text TEXT,
    p_channel VARCHAR,
    p_idempotency_key VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_response_id UUID;
    v_feedback_id UUID;
BEGIN
    INSERT INTO customer_experience_responses (
        organization_id, followup_id, customer_id, pet_id,
        source_channel, raw_message_text, idempotency_key
    ) VALUES (
        p_org_id, p_followup_id, p_customer_id, p_pet_id,
        COALESCE(p_channel, 'WHATSAPP'), p_raw_text, p_idempotency_key
    )
    ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = clock_timestamp()
    RETURNING id INTO v_response_id;

    IF p_followup_id IS NOT NULL THEN
        UPDATE customer_experience_followups
        SET status = 'RESPONSE_RECEIVED', updated_at = clock_timestamp()
        WHERE id = p_followup_id;
    END IF;

    INSERT INTO customer_experience_feedback (
        organization_id, followup_id, response_id, customer_id, pet_id,
        feedback_text, status
    ) VALUES (
        p_org_id, p_followup_id, v_response_id, p_customer_id, p_pet_id,
        p_raw_text, 'RECEIVED'
    ) RETURNING id INTO v_feedback_id;

    RETURN v_feedback_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. create_feedback_record
CREATE OR REPLACE FUNCTION create_feedback_record(
    p_org_id UUID,
    p_customer_id UUID,
    p_pet_id UUID,
    p_visit_id UUID,
    p_text TEXT,
    p_sentiment VARCHAR,
    p_category VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO customer_experience_feedback (
        organization_id, customer_id, pet_id, visit_id,
        feedback_text, sentiment, primary_category, status
    ) VALUES (
        p_org_id, p_customer_id, p_pet_id, p_visit_id,
        p_text, COALESCE(p_sentiment, 'NEUTRAL'), COALESCE(p_category, 'UNCLASSIFIED'), 'RECEIVED'
    ) RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. classify_feedback_candidate
CREATE OR REPLACE FUNCTION classify_feedback_candidate(
    p_feedback_id UUID,
    p_label VARCHAR,
    p_confidence NUMERIC,
    p_rationale TEXT
) RETURNS UUID AS $$
DECLARE
    v_class_id UUID;
    v_is_complaint BOOLEAN := false;
    v_is_clinical BOOLEAN := false;
    v_is_urgent BOOLEAN := false;
BEGIN
    IF p_label IN ('SERVICE_COMPLAINT', 'BILLING_ISSUE', 'SCHEDULING_ISSUE', 'PUNCTUALITY_ISSUE', 'COMMUNICATION_ISSUE', 'PROFESSIONAL_CONDUCT_CONCERN') THEN
        v_is_complaint := true;
    ELSIF p_label IN ('CLINICAL_CONCERN_REQUIRES_TRIAGE') THEN
        v_is_clinical := true;
    ELSIF p_label IN ('POSSIBLE_URGENT_CONCERN') THEN
        v_is_clinical := true;
        v_is_urgent := true;
    END IF;

    INSERT INTO customer_experience_feedback_classifications (
        feedback_id, proposed_label, confidence, rationale
    ) VALUES (
        p_feedback_id, p_label, COALESCE(p_confidence, 0.8500), p_rationale
    ) RETURNING id INTO v_class_id;

    UPDATE customer_experience_feedback
    SET primary_category = p_label,
        is_complaint = v_is_complaint,
        is_clinical_concern = v_is_clinical,
        is_urgent = v_is_urgent,
        status = 'CLASSIFIED'
    WHERE id = p_feedback_id;

    RETURN v_class_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. request_clinical_handoff
CREATE OR REPLACE FUNCTION request_clinical_handoff(
    p_feedback_id UUID,
    p_customer_id UUID,
    p_pet_id UUID,
    p_notes TEXT,
    p_is_urgent BOOLEAN
) RETURNS BOOLEAN AS $$
DECLARE
    v_fb RECORD;
BEGIN
    SELECT * INTO v_fb FROM customer_experience_feedback WHERE id = p_feedback_id;
    IF NOT FOUND THEN RETURN false; END IF;

    UPDATE customer_experience_feedback
    SET is_clinical_concern = true,
        is_urgent = COALESCE(p_is_urgent, false),
        status = 'ESCALATED'
    WHERE id = p_feedback_id;

    -- Emit outbox event for CORE-04 (Clinical Handoff)
    INSERT INTO transactional_outbox (
        organization_id, event_type, aggregate_type, aggregate_id, payload
    ) VALUES (
        v_fb.organization_id,
        'experience.clinical_concern_detected',
        'customer_experience_feedback',
        p_feedback_id,
        jsonb_build_object(
            'feedback_id', p_feedback_id,
            'customer_id', p_customer_id,
            'pet_id', p_pet_id,
            'notes', p_notes,
            'is_urgent', p_is_urgent,
            'guardrail', 'NO_AI_DIAGNOSIS_PERMITTED'
        )
    );

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. create_recovery_case
CREATE OR REPLACE FUNCTION create_recovery_case(
    p_org_id UUID,
    p_customer_id UUID,
    p_pet_id UUID,
    p_visit_id UUID,
    p_feedback_id UUID,
    p_category VARCHAR,
    p_desc TEXT,
    p_priority VARCHAR,
    p_idempotency_key VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_case_id UUID;
    v_complaint_id UUID;
    v_code VARCHAR(64);
BEGIN
    v_code := 'CMP-' || to_char(clock_timestamp(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);

    INSERT INTO customer_experience_complaints (
        organization_id, feedback_id, customer_id, pet_id, visit_id,
        complaint_code, category, severity, summary, status
    ) VALUES (
        p_org_id, p_feedback_id, p_customer_id, p_pet_id, p_visit_id,
        v_code, COALESCE(p_category, 'COORDINATION_ISSUE'), COALESCE(p_priority, 'MEDIUM'),
        p_desc, 'OPEN'
    ) RETURNING id INTO v_complaint_id;

    INSERT INTO customer_experience_recovery_cases (
        organization_id, complaint_id, customer_id, pet_id, visit_id, feedback_id,
        issue_category, issue_description, priority, idempotency_key, due_at
    ) VALUES (
        p_org_id, v_complaint_id, p_customer_id, p_pet_id, p_visit_id, p_feedback_id,
        COALESCE(p_category, 'COORDINATION_ISSUE'), p_desc, COALESCE(p_priority, 'MEDIUM'),
        p_idempotency_key, clock_timestamp() + INTERVAL '24 hours'
    )
    ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = clock_timestamp()
    RETURNING id INTO v_case_id;

    RETURN v_case_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. assign_recovery_owner
CREATE OR REPLACE FUNCTION assign_recovery_owner(
    p_case_id UUID,
    p_user_id UUID,
    p_role VARCHAR,
    p_assigned_by UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE customer_experience_recovery_cases
    SET assigned_user_id = p_user_id,
        owner_team = COALESCE(p_role, 'COORDINATION'),
        status = 'ASSIGNED',
        updated_at = clock_timestamp()
    WHERE id = p_case_id;

    INSERT INTO customer_experience_recovery_assignments (
        recovery_case_id, assigned_user_id, assigned_role, assigned_by_user_id
    ) VALUES (
        p_case_id, p_user_id, COALESCE(p_role, 'COORDINATION'), p_assigned_by
    );

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. record_recovery_action
CREATE OR REPLACE FUNCTION record_recovery_action(
    p_case_id UUID,
    p_action_type VARCHAR,
    p_details TEXT,
    p_performer_id UUID,
    p_evidence TEXT
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO customer_experience_recovery_actions (
        recovery_case_id, action_type, action_details, performed_by_user_id, evidence_reference
    ) VALUES (
        p_case_id, p_action_type, p_details, p_performer_id, p_evidence
    ) RETURNING id INTO v_id;

    UPDATE customer_experience_recovery_cases
    SET status = 'ACTION_IN_PROGRESS',
        updated_at = clock_timestamp()
    WHERE id = p_case_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. verify_recovery_outcome
CREATE OR REPLACE FUNCTION verify_recovery_outcome(
    p_case_id UUID,
    p_outcome_type VARCHAR,
    p_customer_confirmed BOOLEAN,
    p_summary TEXT,
    p_verifier_id UUID
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
    v_new_status VARCHAR(64);
BEGIN
    IF p_outcome_type = 'RESOLVED_VERIFIED' THEN
        v_new_status := 'RESOLVED_VERIFIED';
    ELSE
        v_new_status := 'CLOSED_WITH_DOCUMENTED_OUTCOME';
    END IF;

    INSERT INTO customer_experience_recovery_outcomes (
        recovery_case_id, outcome_type, customer_confirmed_satisfaction, closure_summary, verified_by_user_id
    ) VALUES (
        p_case_id, p_outcome_type, p_customer_confirmed, p_summary, p_verifier_id
    ) RETURNING id INTO v_id;

    UPDATE customer_experience_recovery_cases
    SET status = v_new_status,
        updated_at = clock_timestamp()
    WHERE id = p_case_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. close_recovery_case
CREATE OR REPLACE FUNCTION close_recovery_case(
    p_case_id UUID,
    p_summary TEXT,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    PERFORM verify_recovery_outcome(p_case_id, 'CLOSED_WITH_DOCUMENTED_OUTCOME', NULL, p_summary, p_user_id);
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 13. reopen_recovery_case
CREATE OR REPLACE FUNCTION reopen_recovery_case(
    p_case_id UUID,
    p_reason TEXT,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE customer_experience_recovery_cases
    SET status = 'REOPENED',
        reopen_count = reopen_count + 1,
        next_action = p_reason,
        updated_at = clock_timestamp()
    WHERE id = p_case_id;

    INSERT INTO customer_experience_recovery_actions (
        recovery_case_id, action_type, action_details, performed_by_user_id
    ) VALUES (
        p_case_id, 'REOPEN_CASE', p_reason, p_user_id
    );

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 14. evaluate_review_invitation_eligibility
CREATE OR REPLACE FUNCTION evaluate_review_invitation_eligibility(
    p_customer_id UUID,
    p_pet_id UUID
) RETURNS JSONB AS $$
DECLARE
    v_suppression RECORD;
    v_active_recovery RECORD;
BEGIN
    SELECT * INTO v_suppression FROM customer_experience_sensitive_suppressions
    WHERE (customer_id = p_customer_id OR pet_id = p_pet_id)
      AND is_active = true
      AND (valid_until IS NULL OR valid_until > clock_timestamp())
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object('eligible', false, 'reason', 'SENSITIVE_SUPPRESSION_' || v_suppression.suppression_type);
    END IF;

    SELECT * INTO v_active_recovery FROM customer_experience_recovery_cases
    WHERE customer_id = p_customer_id
      AND status NOT IN ('RESOLVED_VERIFIED', 'CLOSED_WITH_DOCUMENTED_OUTCOME')
    LIMIT 1;

    IF FOUND THEN
        RETURN jsonb_build_object('eligible', false, 'reason', 'ACTIVE_SERVICE_RECOVERY_EXISTS');
    END IF;

    -- NOTE: Score/CSAT is intentionally NOT checked here. NO REVIEW GATING.
    RETURN jsonb_build_object('eligible', true, 'reason', 'NEUTRAL_POLICY_ELIGIBLE');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 15. create_neutral_review_invitation
CREATE OR REPLACE FUNCTION create_neutral_review_invitation(
    p_org_id UUID,
    p_customer_id UUID,
    p_pet_id UUID,
    p_visit_id UUID,
    p_idempotency_key VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
    v_eligibility JSONB;
BEGIN
    v_eligibility := evaluate_review_invitation_eligibility(p_customer_id, p_pet_id);
    IF (v_eligibility->>'eligible')::boolean != true THEN
        INSERT INTO customer_experience_review_requests (
            organization_id, customer_id, pet_id, visit_id,
            status, suppression_reason, is_neutral_language, has_score_gating, has_incentive, idempotency_key
        ) VALUES (
            p_org_id, p_customer_id, p_pet_id, p_visit_id,
            'SUPPRESSED', v_eligibility->>'reason', true, false, false, p_idempotency_key
        )
        ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = clock_timestamp()
        RETURNING id INTO v_id;
        RETURN v_id;
    END IF;

    INSERT INTO customer_experience_review_requests (
        organization_id, customer_id, pet_id, visit_id,
        status, is_neutral_language, has_score_gating, has_incentive,
        scheduled_at, idempotency_key
    ) VALUES (
        p_org_id, p_customer_id, p_pet_id, p_visit_id,
        'SCHEDULED', true, false, false,
        clock_timestamp() + INTERVAL '48 hours', p_idempotency_key
    )
    ON CONFLICT (idempotency_key) DO UPDATE SET updated_at = clock_timestamp()
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 16. record_testimonial_consent
CREATE OR REPLACE FUNCTION record_testimonial_consent(
    p_org_id UUID,
    p_customer_id UUID,
    p_pet_id UUID,
    p_channels JSONB,
    p_allow_customer BOOLEAN,
    p_allow_pet BOOLEAN,
    p_allow_photo BOOLEAN
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO customer_experience_testimonial_consents (
        organization_id, customer_id, pet_id, status,
        allowed_channels, allow_customer_name, allow_pet_name, allow_photo, granted_at
    ) VALUES (
        p_org_id, p_customer_id, p_pet_id, 'CONSENT_GRANTED',
        COALESCE(p_channels, '["WEBSITE"]'::jsonb),
        COALESCE(p_allow_customer, false),
        COALESCE(p_allow_pet, true),
        COALESCE(p_allow_photo, false),
        clock_timestamp()
    ) RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 17. revoke_testimonial_consent
CREATE OR REPLACE FUNCTION revoke_testimonial_consent(
    p_consent_id UUID,
    p_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    UPDATE customer_experience_testimonial_consents
    SET status = 'CONSENT_REVOKED',
        revoked_at = clock_timestamp()
    WHERE id = p_consent_id;

    UPDATE customer_experience_testimonials
    SET status = 'REMOVAL_REQUESTED'
    WHERE consent_id = p_consent_id;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 18. create_quality_improvement_proposal
CREATE OR REPLACE FUNCTION create_quality_improvement_proposal(
    p_org_id UUID,
    p_cluster VARCHAR,
    p_proposal TEXT,
    p_team VARCHAR,
    p_core_module VARCHAR
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO customer_experience_quality_improvements (
        organization_id, cluster_theme, improvement_proposal, assigned_owner_team, target_core_module
    ) VALUES (
        p_org_id, p_cluster, p_proposal, COALESCE(p_team, 'COORDINATION'), COALESCE(p_core_module, 'CORE-08')
    ) RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 19. record_experience_audit
CREATE OR REPLACE FUNCTION record_experience_audit(
    p_org_id UUID,
    p_action VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_actor_type VARCHAR,
    p_actor_id VARCHAR,
    p_details JSONB
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO customer_experience_audit (
        organization_id, action_type, entity_type, entity_id, actor_type, actor_id, details
    ) VALUES (
        p_org_id, p_action, p_entity_type, p_entity_id,
        COALESCE(p_actor_type, 'SYSTEM'), p_actor_id, COALESCE(p_details, '{}'::jsonb)
    ) RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- REVOKE FROM anon/PUBLIC AND GRANT TO authenticated/service_role
REVOKE ALL ON FUNCTION evaluate_followup_eligibility FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION schedule_experience_followup FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION suppress_experience_followup FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION register_experience_response FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION create_feedback_record FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION classify_feedback_candidate FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION request_clinical_handoff FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION create_recovery_case FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION assign_recovery_owner FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION record_recovery_action FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION verify_recovery_outcome FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION close_recovery_case FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION reopen_recovery_case FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION evaluate_review_invitation_eligibility FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION create_neutral_review_invitation FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION record_testimonial_consent FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION revoke_testimonial_consent FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION create_quality_improvement_proposal FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION record_experience_audit FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION evaluate_followup_eligibility TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION schedule_experience_followup TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION suppress_experience_followup TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION register_experience_response TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_feedback_record TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION classify_feedback_candidate TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION request_clinical_handoff TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_recovery_case TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION assign_recovery_owner TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_recovery_action TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION verify_recovery_outcome TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION close_recovery_case TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION reopen_recovery_case TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION evaluate_review_invitation_eligibility TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_neutral_review_invitation TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_testimonial_consent TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION revoke_testimonial_consent TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION create_quality_improvement_proposal TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION record_experience_audit TO authenticated, service_role;
`;

fs.writeFileSync(migrationPath, sql, 'utf8');
console.log('Migration 040 created successfully at: ' + migrationPath);
