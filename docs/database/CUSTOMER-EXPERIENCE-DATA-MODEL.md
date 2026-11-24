# VET FREEDOM OS — MODELO DE DATOS: EXPERIENCIA DEL CLIENTE (MIGRACIÓN 040)

## 1. Resumen de Tablas (26 Tablas Relacionales)
La migración `040_customer_experience_followup_and_service_recovery_hub.sql` implementa 26 tablas:
1. `customer_experience_followups`
2. `customer_experience_followup_plans`
3. `customer_experience_followup_attempts`
4. `customer_experience_responses`
5. `customer_experience_surveys`
6. `customer_experience_survey_versions`
7. `customer_experience_survey_answers`
8. `customer_experience_feedback`
9. `customer_experience_feedback_classifications`
10. `customer_experience_feedback_sources`
11. `customer_experience_complaints`
12. `customer_experience_complaint_events`
13. `customer_experience_recovery_cases`
14. `customer_experience_recovery_assignments`
15. `customer_experience_recovery_actions`
16. `customer_experience_recovery_commitments`
17. `customer_experience_recovery_outcomes`
18. `customer_experience_sensitive_suppressions`
19. `customer_experience_review_request_plans`
20. `customer_experience_review_requests`
21. `customer_experience_review_platforms`
22. `customer_experience_testimonial_consents`
23. `customer_experience_testimonials`
24. `customer_experience_quality_improvements`
25. `customer_experience_metrics`
26. `customer_experience_audit`

## 2. Stored Procedures (19 RPCs Seguras)
Todas definidas con `SECURITY DEFINER`, `SET search_path = public`, con revocación explícita para `anon` y `PUBLIC`:
- `evaluate_followup_eligibility`
- `schedule_experience_followup`
- `suppress_experience_followup`
- `register_experience_response`
- `create_feedback_record`
- `classify_feedback_candidate`
- `request_clinical_handoff`
- `create_recovery_case`
- `assign_recovery_owner`
- `record_recovery_action`
- `verify_recovery_outcome`
- `close_recovery_case`
- `reopen_recovery_case`
- `evaluate_review_invitation_eligibility`
- `create_neutral_review_invitation`
- `record_testimonial_consent`
- `revoke_testimonial_consent`
- `create_quality_improvement_proposal`
- `record_experience_audit`
