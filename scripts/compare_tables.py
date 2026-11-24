import re
import json

# Read prompt to extract tables under Chapter 06 to 32
with open('c:/Users/Freud/N8NVET/VET_FREEDOM_OS_AUDITORIA_MAESTRA_LOVABLE.md', 'r', encoding='utf-8') as f:
    text = f.read()

# Also let's extract from the transcript step 5767 or user prompt:
# We can extract the table names from the user request
with open('c:/Users/Freud/N8NVET/types/supabase.ts', 'r', encoding='utf-8') as f:
    supabase_ts = f.read()

# Load real supabase tables
with open('real_supabase_tables.json', 'r', encoding='utf-8') as f:
    real_tables = json.load(f)

real_table_names = set(t['table_name'] for t in real_tables)
print(f"Total tables currently in Supabase PostgreSQL: {len(real_table_names)}")

# Let's list table names from prompt chapters 06-32:
prompt_tables = [
    # 6A
    "organizations", "organization_settings", "organization_locations", "service_zones",
    "operational_hours", "holidays_and_closures", "system_configuration_versions",
    "feature_flags", "external_accounts_registry", "business_policies", "policy_acknowledgements",
    # 7A
    "user_profiles", "organization_memberships", "roles", "permissions", "role_permissions",
    "user_role_assignments", "user_permission_overrides", "user_invitations",
    "user_access_revocations", "delegations", "delegation_events", "access_review_records",
    "login_security_events", "external_user_access_grants",
    # 8A
    "customers", "customer_contacts", "customer_addresses", "customer_address_access_notes",
    "customer_households", "household_members", "pets", "pet_ownership_relations",
    "pet_caregivers", "caregiver_permission_scopes", "pet_service_preferences",
    "customer_service_preferences", "customer_consents", "customer_consent_events",
    "customer_contact_restrictions", "customer_source_attributions", "customer_merge_candidates",
    "customer_identity_verifications",
    # 9A
    "customer_memory_items", "customer_memory_sources", "customer_memory_verifications",
    "customer_memory_corrections", "customer_memory_retention", "customer_memory_access_events",
    "customer_handoff_summaries", "customer_sensitive_context_flags",
    "customer_communication_frequency_policies",
    # 10A
    "communication_channels", "conversations", "conversation_participants", "conversation_messages",
    "message_attachments", "message_delivery_events", "message_templates", "message_template_versions",
    "outbound_message_requests", "inbound_message_receipts", "conversation_assignments",
    "conversation_handoffs", "conversation_intent_candidates", "communication_opt_out_events",
    "communication_suppressions",
    # 11A
    "service_categories", "services", "service_requirements", "service_pricing_versions",
    "service_zone_availability", "service_duration_policies", "service_booking_policies",
    "service_resource_requirements", "service_professional_eligibility", "customer_service_quotes",
    # 12A
    "professionals", "staff_members", "staff_teams", "professional_competencies",
    "professional_service_authorizations", "professional_coverage_zones", "professional_shifts",
    "professional_breaks", "professional_absences", "staff_coverage_requests",
    "staff_coverage_offers", "staff_replacements", "professional_capacity_snapshots",
    "professional_workload_alerts", "founder_absence_plans",
    # 13A
    "calendar_connections", "calendar_resources", "calendar_events", "calendar_sync_checkpoints",
    "calendar_webhook_subscriptions", "calendar_conflicts", "availability_rules",
    "availability_constraints", "availability_searches", "availability_options",
    "availability_snapshots", "appointment_holds", "waitlist_entries", "waitlist_offers",
    # 14A
    "appointment_requests", "appointments", "appointment_assignments", "appointment_state_events",
    "appointment_change_requests", "appointment_reschedule_proposals",
    "appointment_cancellation_requests", "appointment_confirmations", "appointment_call_logs",
    "appointment_notification_plans", "appointment_reconciliation_flags",
    # 15A
    "visits", "visit_status_events", "visit_checklist_templates", "visit_checklist_instances",
    "visit_checklist_answers", "visit_incidents", "visit_assistance_requests",
    "visit_operational_closures", "visit_service_records", "visit_consumed_resources",
    # 16A
    "routes", "route_versions", "route_stops", "route_assignments", "route_travel_estimates",
    "route_change_requests", "route_optimization_scenarios", "route_departure_events",
    "route_arrival_events", "route_delay_incidents", "route_notifications",
    # 17A
    "schedule_simulations", "simulation_snapshots", "simulation_constraints", "simulation_scenarios",
    "simulation_impact_metrics", "simulation_comparisons", "simulation_affected_entities",
    "simulation_approval_requests", "simulation_execution_plans", "simulation_execution_steps",
    "simulation_compensation_actions", "simulation_audit_events",
    # 18A
    "recurring_care_plans", "recurring_plan_versions", "recurring_occurrences",
    "recurring_occurrence_assignments", "recurring_care_incidents", "recurring_care_compliance",
    "preventive_care_plans", "preventive_plan_versions", "preventive_due_events",
    "preventive_service_requests", "preventive_application_references",
    "preventive_inventory_requirements",
    # 19A
    "specialties", "specialist_organizations", "specialists", "specialist_contact_methods",
    "specialist_service_terms", "specialist_availability_sources",
    "specialist_availability_options", "specialist_referrals", "referral_approval_events",
    "referral_availability_requests", "referral_offers", "referral_offer_options",
    "referral_customer_selections", "referral_external_holds", "referral_external_confirmations",
    "referral_appointment_changes", "referral_attendance_records", "referral_report_receipts",
    "referral_professional_reviews", "referral_continuity_actions",
    # 20A
    "care_commitments", "commitment_sources", "commitment_assignments", "commitment_dependencies",
    "commitment_snoozes", "commitment_verifications", "commitment_escalations",
    "post_visit_checklists", "post_visit_continuity_records", "commitment_audit_events",
    # 21A
    "documents", "document_versions", "document_approvals", "document_access_grants",
    "document_delivery_requests", "document_delivery_results", "document_access_events",
    "document_revocations", "document_retention_records",
    # 22A
    "service_quotes", "quote_line_items", "quote_approvals", "service_charges",
    "charge_line_items", "payment_requests", "payment_provider_transactions", "payment_reports",
    "payment_verifications", "payment_allocations", "payment_reconciliations", "invoices",
    "invoice_line_items", "refund_requests", "refund_executions", "financial_disputes",
    "expense_categories", "operational_cost_records", "visit_cost_allocations",
    # 23A
    "inventory_categories", "inventory_items", "inventory_locations", "inventory_lots",
    "inventory_movements", "inventory_balances", "inventory_reservations", "inventory_kits",
    "inventory_kit_items", "inventory_kit_checklists", "inventory_consumptions",
    "inventory_returns", "replenishment_requests", "replenishment_approvals",
    "inventory_incidents",
    # 24A
    "sop_documents", "sop_versions", "training_courses", "training_modules",
    "training_lessons", "training_assignments", "training_progress", "training_assessments",
    "training_assessment_results", "training_competency_evidence",
    # 25A
    "experience_followups", "experience_surveys", "experience_survey_questions",
    "experience_survey_invitations", "experience_survey_answers", "customer_feedback",
    "customer_complaints", "service_recovery_cases", "service_recovery_actions",
    "recovery_outcome_verifications", "review_invitation_requests", "testimonial_consents",
    "quality_improvement_proposals",
    # 26A
    "tasks", "task_assignments", "task_dependencies", "task_events", "task_escalations",
    "approval_requests", "approval_decisions", "approved_action_executions",
    "human_handoff_requests", "human_handoff_events",
    # 27A
    "metric_definitions", "metric_quality_results", "daily_report_snapshots",
    "weekly_report_snapshots", "report_metric_results", "executive_report_narratives",
    "founder_dependency_records", "operational_autonomy_metrics", "executive_decision_requests",
    "operational_improvement_actions", "report_delivery_requests",
    # 28A
    "event_outbox", "event_inbox", "event_processing_attempts", "event_dead_letters",
    "integration_connectors", "integration_credentials_metadata", "integration_sync_runs",
    "integration_sync_checkpoints", "integration_external_id_maps", "integration_discrepancies",
    "integration_repair_proposals", "integration_repair_verifications", "workflow_registry",
    "workflow_execution_observations", "integration_health_checks", "system_incidents",
    "system_alerts", "backup_verification_records", "restore_test_records", "provider_usage_records",
    # 29A
    "audit_events", "audit_change_references", "data_source_registry", "data_quality_issues",
    "data_retention_policies", "data_disposition_requests", "security_incidents",
    "security_access_reviews",
    # 32A OKVET
    "okvet_connector_configuration", "okvet_capability_registry", "okvet_external_identity_map",
    "okvet_manual_confirmation_tasks", "okvet_manual_confirmations", "okvet_confirmation_evidence",
    "okvet_import_batches", "okvet_import_row_staging", "okvet_import_column_mappings",
    "okvet_import_validations", "okvet_import_conflicts", "okvet_import_approvals",
    "okvet_import_application_results", "okvet_reconciliation_cases", "okvet_reconciliation_events",
    "okvet_data_freshness", "okvet_manual_work_sessions", "okvet_audit_events"
]

present = [t for t in prompt_tables if t in real_table_names]
missing = [t for t in prompt_tables if t not in real_table_names]

print(f"Total prompt requested logical tables: {len(prompt_tables)}")
print(f"Prompt tables EXACTLY matching real table names: {len(present)}")
print(f"Prompt tables not matching name directly: {len(missing)}")

with open('tables_comparison.json', 'w', encoding='utf-8') as out:
    json.dump({
        'total_prompt': len(prompt_tables),
        'present': sorted(present),
        'missing': sorted(missing),
        'real_tables_not_in_prompt': sorted(list(real_table_names - set(prompt_tables)))
    }, out, indent=2)
