import json

with open('real_supabase_tables.json', 'r', encoding='utf-8') as f:
    tables = json.load(f)

table_names = [t['table_name'] for t in tables]

# Categorize tables by domain
domains = {
    "1. Organización y Configuración": [
        "organizations", "branches", "operating_hours", "non_working_days", "system_settings"
    ],
    "2. Identidad, Autenticación y Permisos": [
        "user_profiles", "organization_memberships", "user_invitations", "consents", "security_incidents"
    ],
    "3. Clientes, Familias y Mascotas": [
        "owners", "pets", "pet_owner_relations", "caregiver_authorizations", "addresses", 
        "contact_restrictions", "bereavement_records"
    ],
    "4. Customer Experience Memory (CEM)": [
        "customer_experience_memory", "customer_experience_sensitive_suppressions", "customer_experience_audit"
    ],
    "5. Conversaciones y Canales WhatsApp": [
        "conversations", "messages", "message_templates", "whatsapp_delivery_events", 
        "whatsapp_conversation_windows", "whatsapp_contact_suppressions", "outbound_dispatch_requests", 
        "conversation_handoffs", "conversation_state_transitions", "conversation_transfers", 
        "conversation_internal_notes"
    ],
    "6. Servicios, Tarifas y Catálogo": [
        "services", "tariffs", "clinical_constraints", "specialty_catalog"
    ],
    "7. Personal, Turnos y Capacidad": [
        "staff_profiles", "staff_shifts", "staff_absences", "staff_qualifications", 
        "capacity_rules", "founder_absence_delegations", "operational_shift_handoffs"
    ],
    "8. Calendarios Conectados y Sincronización": [
        "staff_calendar_connections", "external_calendar_events", "calendar_sync_state", 
        "calendar_sync_leases", "calendar_sync_runs", "calendar_sync_audit", "calendar_conflicts", 
        "calendar_blocked_times", "calendar_availability_snapshots", "calendar_watch_channels", 
        "calendar_event_mappings", "calendar_change_events", "calendar_reconciliation_tasks"
    ],
    "9. Citas, Solicitudes y Holds": [
        "appointment_requests", "appointments", "appointment_services", "appointment_status_history", 
        "appointment_holds", "appointment_waitlist_entries", "appointment_waitlist_offers", 
        "appointment_reschedule_proposals", "appointment_notification_plans", 
        "appointment_notification_jobs", "appointment_recovery_tasks"
    ],
    "10. Visitas y Operación en Campo": [
        "visits", "visit_charge_lines"
    ],
    "11. Rutas, Mapas y Desplazamientos": [
        "routes", "route_stops", "route_alerts", "route_reoptimization_requests"
    ],
    "12. Vet Schedule Simulator": [
        "schedule_simulations", "simulation_scenarios", "simulation_snapshots"
    ],
    "13. Cuidados Recurrentes y Prevención": [
        "recurring_treatment_plans", "recurring_visit_occurrences", "recurrence_templates", 
        "preventive_care_plans", "preventive_due_dates"
    ],
    "14. Red de Especialistas y Remisiones": [
        "specialist_profiles", "specialist_specialties", "specialist_agreements", "specialist_referrals", 
        "specialist_referral_versions", "specialist_referral_commitments", "specialist_referral_documents", 
        "specialist_referral_escalations", "specialist_referral_audit", "specialist_availability_requests", 
        "specialist_availability_responses", "specialist_availability_options", "specialist_slot_holds", 
        "specialist_option_offers", "specialist_option_offer_items", "specialist_offer_selections", 
        "specialist_external_confirmations", "specialist_booking_requests", "specialist_appointments", 
        "specialist_appointment_changes", "specialist_appointment_cancellations", 
        "specialist_attendance_followups", "specialist_report_receipts", "specialist_report_reviews", 
        "specialist_document_access_grants", "specialist_document_access_audit", "patient_referrals", 
        "referral_approvals", "referral_documents", "referral_followups"
    ],
    "15. Compromisos Post-Visita y Promesas": [
        "post_visit_cases", "post_visit_commitments", "post_visit_commitment_versions", 
        "post_visit_commitment_assignments", "post_visit_commitment_snooze_records", 
        "post_visit_commitment_escalations", "post_visit_customer_promises", "post_visit_checklists", 
        "post_visit_checklist_items", "post_visit_closure_checks", "post_visit_continuity_handoffs", 
        "post_visit_pending_reports", "post_visit_pending_documents", "post_visit_reminders", 
        "post_visit_audit"
    ],
    "16. Bóveda Segura de Documentos": [
        "documents", "document_versions", "document_approvals", "document_access_grants", 
        "document_access_events", "document_delivery_requests", "document_delivery_attempts", 
        "document_recipient_permissions", "document_retention_policies", "document_deletion_requests", 
        "document_audit"
    ],
    "17. Finanzas, Cobros y Facturación": [
        "financial_quotes", "financial_quote_versions", "financial_quote_items", 
        "financial_quote_approvals", "financial_service_rates", "financial_payment_requests", 
        "financial_payment_links", "financial_payment_transactions", "financial_payment_allocations", 
        "financial_payment_reconciliations", "financial_bank_transfer_reports", "financial_cash_receipts", 
        "financial_invoices", "financial_credit_notes", "financial_refund_requests", "financial_disputes", 
        "financial_customer_balances", "financial_notification_jobs", "financial_audit_events", 
        "payment_collections", "payment_verifications"
    ],
    "18. Inventario Rodante y Mochilas": [
        "supplies", "supply_movements", "vehicle_inventory_allocations"
    ],
    "19. Academia, Asistentes y Cultura": [
        "ai_assistant_configs", "ai_prompt_versions"
    ],
    "20. Experiencia del Cliente, NPS y Recuperación": [
        "customer_experience_surveys", "customer_experience_survey_versions", 
        "customer_experience_survey_answers", "customer_experience_followups", 
        "customer_experience_followup_plans", "customer_experience_followup_attempts", 
        "customer_experience_feedback", "customer_experience_feedback_sources", 
        "customer_experience_feedback_classifications", "customer_experience_complaints", 
        "customer_experience_complaint_events", "customer_experience_recovery_cases", 
        "customer_experience_recovery_assignments", "customer_experience_recovery_actions", 
        "customer_experience_recovery_commitments", "customer_experience_recovery_outcomes", 
        "customer_experience_review_platforms", "customer_experience_review_requests", 
        "customer_experience_review_request_plans", "customer_experience_testimonials", 
        "customer_experience_testimonial_consents", "customer_experience_quality_improvements", 
        "customer_experience_metrics", "customer_experience_responses", "customer_experience_audit", 
        "feedback_surveys", "client_complaints"
    ],
    "21. Tareas, Aprobaciones y Delegaciones": [
        "operational_tasks", "operational_task_assignment_history", "operational_task_reminder_jobs", 
        "operational_task_evidence", "operational_commitments", "ai_action_proposals", 
        "ai_action_executions", "executive_decision_requests", "executive_action_requests"
    ],
    "22. Inteligencia Ejecutiva y Reportes": [
        "executive_daily_reports", "executive_daily_report_versions", "executive_daily_snapshots", 
        "executive_weekly_reports", "executive_weekly_report_versions", "executive_weekly_snapshots", 
        "executive_metric_definitions", "executive_metric_sources", "executive_metric_results", 
        "executive_metric_quality_checks", "executive_weekly_metric_results", 
        "executive_weekly_report_deliveries", "executive_weekly_action_plans", 
        "executive_weekly_decision_requests", "executive_weekly_audit", "executive_report_approvals", 
        "executive_report_delivery_requests", "executive_report_delivery_results", 
        "executive_report_audit", "executive_operational_exceptions", "executive_priority_recommendations", 
        "executive_profitability_analyses", "executive_capacity_analyses", 
        "executive_continuity_analyses", "executive_founder_dependency_analyses", 
        "executive_recurring_problem_clusters", "executive_risk_signals", 
        "executive_improvement_proposals", "executive_source_freshness", "customer_value_metrics"
    ],
    "23. Event Outbox, Inbox e Integraciones": [
        "transactional_outbox", "dead_letter_queue", "processed_events", "integration_connectors", 
        "integration_connector_capabilities", "integration_credentials_metadata", 
        "integration_event_receipts", "integration_health_snapshots", "integration_heartbeats", 
        "integration_probe_results", "integration_incidents", "integration_monitoring_cycles", 
        "integration_sync_policies", "integration_sync_checkpoints", "integration_sync_cursors", 
        "integration_cost_usage", "integration_backup_records", "integration_restore_tests", 
        "integration_maintenance_windows", "integration_retry_attempts", "webhook_delivery_logs", 
        "n8n_integration_registry"
    ],
    "24. Auditoría y Trazabilidad Inmutable": [
        "audit_logs", "system_event_logs"
    ],
    "25. OKVET Assisted Integration Bridge": [
        "okvet_references", "integration_manual_confirmation_tasks", "integration_external_identity_map", 
        "integration_external_reference_map", "integration_reconciliation_tasks", 
        "integration_reconciliation_runs", "integration_reconciliation_discrepancies", 
        "integration_discrepancy_evidence", "integration_reconciliation_audit", 
        "integration_repair_proposals", "integration_repair_approvals", 
        "integration_repair_executions", "integration_repair_verifications"
    ]
}

categorized = set()
for d, tlist in domains.items():
    for t in tlist:
        categorized.add(t)

uncategorized = set(table_names) - categorized
print(f"Total Categorized: {len(categorized)}")
print(f"Uncategorized: {len(uncategorized)}")
if uncategorized:
    print("Uncategorized list:", sorted(list(uncategorized)))
