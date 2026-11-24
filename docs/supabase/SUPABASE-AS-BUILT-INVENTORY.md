# VET FREEDOM OS — INVENTARIO FORENSE AS-BUILT DE SUPABASE BACKEND
**Documento Obligatorio Inicial conforme al Capítulo 02 del Prompt Maestro 25**

- **Proyecto Primario:** `sznvahhocgnhsqhksygq` (`vet-freedom-os-dev`)
- **Host de Base de Datos:** `db.sznvahhocgnhsqhksygq.supabase.co`
- **Región AWS:** `us-east-1` (US East, N. Virginia)
- **Motor de Base de Datos:** PostgreSQL 17.12.0.000 (Release Channel: GA)
- **Estado de Salud de Infraestructura:** `ACTIVE_HEALTHY`
- **Organización Propietaria Supabase:** `egaivaihtmuggmkgnbze`
- **Organización Semilla en Datos:** `11111111-1111-1111-1111-111111111111` (Vet Life — Veterinaria a Domicilio)
- **Fecha de Auditoría en Vivo:** 21 de Noviembre de 2026
- **Auditor:** Antigravity Principal Systems & Supabase Backend Architecture Team

---

## 1. IDENTIFICACIÓN Y SEGREGACIÓN DE PROYECTOS

Al inspeccionar la cuenta de Supabase mediante la Management API y herramientas MCP, se constata la existencia de **dos proyectos independientes**:

| Parámetro | Proyecto A (Producción Vet Life) | Proyecto B (Consultoría Metodológica) |
|---|---|---|
| **Project Ref / ID** | `sznvahhocgnhsqhksygq` | `djtejmrzxfkctbvpdkbg` |
| **Nombre** | `vet-freedom-os-dev` | `Alpha Vision Method` |
| **Región** | `us-east-1` | `us-east-2` |
| **Propósito Operativo** | **Exclusivo para Vet Life — Veterinaria a Domicilio** | Metodología de consultoría y prototipado estratégico |
| **Estado** | `ACTIVE_HEALTHY` | `ACTIVE_HEALTHY` |
| **Aislamiento** | **Aislamiento estricto.** No se cruzan datos ni credenciales entre proyectos. |

> [!IMPORTANT]
> **REGLA DE SOBERANÍA:** Vet Freedom OS opera exclusivamente sobre el proyecto `sznvahhocgnhsqhksygq`. Ninguna tabla ni migración de Vet Life debe escribirse en `djtejmrzxfkctbvpdkbg`.

---

## 2. RESUMEN EJECUTIVO DEL ESQUEMA `public`

| Objeto de Base de Datos | Cantidad Observada en Vivo | Estado de Verificación |
|---|:---:|---|
| **Tablas Relacionales Base (`relkind = 'r'`)** | **264 tablas** | 100% catalogadas y auditadas en esquema `public` |
| **Tablas con Row Level Security (RLS) Activo** | **264 tablas (100%)** | `rls_enabled = true` en la totalidad de tablas expuestas |
| **Llaves Foráneas (Foreign Key Constraints)** | **620 restricciones** | Integridad referencial estricta y cascadas controladas |
| **Índices Secundarios y Compuestos** | **449 índices** | B-tree optimizados por `organization_id`, `created_at`, `status` |
| **Funciones y Stored Procedures en `public`** | **157 funciones** | 155 con `SECURITY DEFINER`, fijando `search_path = public` |
| **Vistas Analíticas (`security_invoker = true`)** | **3 vistas** | `v_daily_schedule`, `v_patient_360`, `v_n8n_outbox_queue` |
| **Buckets de Almacenamiento (Supabase Storage)** | **3 buckets privados** | `medical-records`, `referral-documents`, `system-backups-metadata` |
| **Migraciones en Historial (`schema_migrations`)** | **28 registradas en DB / 41 archivos SQL locales** | Secuencia ordenada desde `001` hasta `041` |

---

## 3. INVENTARIO COMPLETO DE TABLAS POR DOMINIOS OPERATIVOS (264 TABLAS)


### 1. Organización y Configuración (5 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `branches` | SÍ | SÍ | Persistencia transaccional de branches |
| `non_working_days` | SÍ | SÍ | Persistencia transaccional de non working days |
| `operating_hours` | SÍ | SÍ | Persistencia transaccional de operating hours |
| `organizations` | SÍ | SÍ | Persistencia transaccional de organizations |
| `system_settings` | SÍ | SÍ | Persistencia transaccional de system settings |

### 10. Visitas y Operación en Campo (2 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `visit_charge_lines` | SÍ | SÍ | Persistencia transaccional de visit charge lines |
| `visits` | SÍ | SÍ | Persistencia transaccional de visits |

### 11. Rutas, Mapas y Desplazamientos (4 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `route_alerts` | SÍ | SÍ | Persistencia transaccional de route alerts |
| `route_reoptimization_requests` | SÍ | SÍ | Persistencia transaccional de route reoptimization requests |
| `route_stops` | SÍ | SÍ | Persistencia transaccional de route stops |
| `routes` | SÍ | SÍ | Persistencia transaccional de routes |

### 12. Vet Schedule Simulator (3 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `schedule_simulations` | SÍ | SÍ | Persistencia transaccional de schedule simulations |
| `simulation_scenarios` | SÍ | SÍ | Persistencia transaccional de simulation scenarios |
| `simulation_snapshots` | SÍ | SÍ | Persistencia transaccional de simulation snapshots |

### 13. Cuidados Recurrentes y Prevención (5 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `preventive_care_plans` | SÍ | SÍ | Persistencia transaccional de preventive care plans |
| `preventive_due_dates` | SÍ | SÍ | Persistencia transaccional de preventive due dates |
| `recurrence_templates` | SÍ | SÍ | Persistencia transaccional de recurrence templates |
| `recurring_treatment_plans` | SÍ | SÍ | Persistencia transaccional de recurring treatment plans |
| `recurring_visit_occurrences` | SÍ | SÍ | Persistencia transaccional de recurring visit occurrences |

### 14. Red de Especialistas y Remisiones (30 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `patient_referrals` | SÍ | SÍ | Persistencia transaccional de patient referrals |
| `referral_approvals` | SÍ | SÍ | Persistencia transaccional de referral approvals |
| `referral_documents` | SÍ | SÍ | Persistencia transaccional de referral documents |
| `referral_followups` | SÍ | SÍ | Persistencia transaccional de referral followups |
| `specialist_agreements` | SÍ | SÍ | Persistencia transaccional de specialist agreements |
| `specialist_appointment_cancellations` | SÍ | SÍ | Persistencia transaccional de specialist appointment cancellations |
| `specialist_appointment_changes` | SÍ | SÍ | Persistencia transaccional de specialist appointment changes |
| `specialist_appointments` | SÍ | SÍ | Persistencia transaccional de specialist appointments |
| `specialist_attendance_followups` | SÍ | SÍ | Persistencia transaccional de specialist attendance followups |
| `specialist_availability_options` | SÍ | SÍ | Persistencia transaccional de specialist availability options |
| `specialist_availability_requests` | SÍ | SÍ | Persistencia transaccional de specialist availability requests |
| `specialist_availability_responses` | SÍ | SÍ | Persistencia transaccional de specialist availability responses |
| `specialist_booking_requests` | SÍ | SÍ | Persistencia transaccional de specialist booking requests |
| `specialist_document_access_audit` | SÍ | SÍ | Persistencia transaccional de specialist document access audit |
| `specialist_document_access_grants` | SÍ | SÍ | Persistencia transaccional de specialist document access grants |
| `specialist_external_confirmations` | SÍ | SÍ | Persistencia transaccional de specialist external confirmations |
| `specialist_offer_selections` | SÍ | SÍ | Persistencia transaccional de specialist offer selections |
| `specialist_option_offer_items` | SÍ | SÍ | Persistencia transaccional de specialist option offer items |
| `specialist_option_offers` | SÍ | SÍ | Persistencia transaccional de specialist option offers |
| `specialist_profiles` | SÍ | SÍ | Persistencia transaccional de specialist profiles |
| `specialist_referral_audit` | SÍ | SÍ | Persistencia transaccional de specialist referral audit |
| `specialist_referral_commitments` | SÍ | SÍ | Persistencia transaccional de specialist referral commitments |
| `specialist_referral_documents` | SÍ | SÍ | Persistencia transaccional de specialist referral documents |
| `specialist_referral_escalations` | SÍ | SÍ | Persistencia transaccional de specialist referral escalations |
| `specialist_referral_versions` | SÍ | SÍ | Persistencia transaccional de specialist referral versions |
| `specialist_referrals` | SÍ | SÍ | Persistencia transaccional de specialist referrals |
| `specialist_report_receipts` | SÍ | SÍ | Persistencia transaccional de specialist report receipts |
| `specialist_report_reviews` | SÍ | SÍ | Persistencia transaccional de specialist report reviews |
| `specialist_slot_holds` | SÍ | SÍ | Persistencia transaccional de specialist slot holds |
| `specialist_specialties` | SÍ | SÍ | Persistencia transaccional de specialist specialties |

### 15. Compromisos Post-Visita y Promesas (15 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `post_visit_audit` | SÍ | SÍ | Persistencia transaccional de post visit audit |
| `post_visit_cases` | SÍ | SÍ | Persistencia transaccional de post visit cases |
| `post_visit_checklist_items` | SÍ | SÍ | Persistencia transaccional de post visit checklist items |
| `post_visit_checklists` | SÍ | SÍ | Persistencia transaccional de post visit checklists |
| `post_visit_closure_checks` | SÍ | SÍ | Persistencia transaccional de post visit closure checks |
| `post_visit_commitment_assignments` | SÍ | SÍ | Persistencia transaccional de post visit commitment assignments |
| `post_visit_commitment_escalations` | SÍ | SÍ | Persistencia transaccional de post visit commitment escalations |
| `post_visit_commitment_snooze_records` | SÍ | SÍ | Persistencia transaccional de post visit commitment snooze records |
| `post_visit_commitment_versions` | SÍ | SÍ | Persistencia transaccional de post visit commitment versions |
| `post_visit_commitments` | SÍ | SÍ | Persistencia transaccional de post visit commitments |
| `post_visit_continuity_handoffs` | SÍ | SÍ | Persistencia transaccional de post visit continuity handoffs |
| `post_visit_customer_promises` | SÍ | SÍ | Persistencia transaccional de post visit customer promises |
| `post_visit_pending_documents` | SÍ | SÍ | Persistencia transaccional de post visit pending documents |
| `post_visit_pending_reports` | SÍ | SÍ | Persistencia transaccional de post visit pending reports |
| `post_visit_reminders` | SÍ | SÍ | Persistencia transaccional de post visit reminders |

### 16. Bóveda Segura de Documentos (11 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `document_access_events` | SÍ | SÍ | Persistencia transaccional de document access events |
| `document_access_grants` | SÍ | SÍ | Persistencia transaccional de document access grants |
| `document_approvals` | SÍ | SÍ | Persistencia transaccional de document approvals |
| `document_audit` | SÍ | SÍ | Persistencia transaccional de document audit |
| `document_deletion_requests` | SÍ | SÍ | Persistencia transaccional de document deletion requests |
| `document_delivery_attempts` | SÍ | SÍ | Persistencia transaccional de document delivery attempts |
| `document_delivery_requests` | SÍ | SÍ | Persistencia transaccional de document delivery requests |
| `document_recipient_permissions` | SÍ | SÍ | Persistencia transaccional de document recipient permissions |
| `document_retention_policies` | SÍ | SÍ | Persistencia transaccional de document retention policies |
| `document_versions` | SÍ | SÍ | Persistencia transaccional de document versions |
| `documents` | SÍ | SÍ | Persistencia transaccional de documents |

### 17. Finanzas, Cobros y Facturación (21 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `financial_audit_events` | SÍ | SÍ | Persistencia transaccional de financial audit events |
| `financial_bank_transfer_reports` | SÍ | SÍ | Persistencia transaccional de financial bank transfer reports |
| `financial_cash_receipts` | SÍ | SÍ | Persistencia transaccional de financial cash receipts |
| `financial_credit_notes` | SÍ | SÍ | Persistencia transaccional de financial credit notes |
| `financial_customer_balances` | SÍ | SÍ | Persistencia transaccional de financial customer balances |
| `financial_disputes` | SÍ | SÍ | Persistencia transaccional de financial disputes |
| `financial_invoices` | SÍ | SÍ | Persistencia transaccional de financial invoices |
| `financial_notification_jobs` | SÍ | SÍ | Persistencia transaccional de financial notification jobs |
| `financial_payment_allocations` | SÍ | SÍ | Persistencia transaccional de financial payment allocations |
| `financial_payment_links` | SÍ | SÍ | Persistencia transaccional de financial payment links |
| `financial_payment_reconciliations` | SÍ | SÍ | Persistencia transaccional de financial payment reconciliations |
| `financial_payment_requests` | SÍ | SÍ | Persistencia transaccional de financial payment requests |
| `financial_payment_transactions` | SÍ | SÍ | Persistencia transaccional de financial payment transactions |
| `financial_quote_approvals` | SÍ | SÍ | Persistencia transaccional de financial quote approvals |
| `financial_quote_items` | SÍ | SÍ | Persistencia transaccional de financial quote items |
| `financial_quote_versions` | SÍ | SÍ | Persistencia transaccional de financial quote versions |
| `financial_quotes` | SÍ | SÍ | Persistencia transaccional de financial quotes |
| `financial_refund_requests` | SÍ | SÍ | Persistencia transaccional de financial refund requests |
| `financial_service_rates` | SÍ | SÍ | Persistencia transaccional de financial service rates |
| `payment_collections` | SÍ | SÍ | Persistencia transaccional de payment collections |
| `payment_verifications` | SÍ | SÍ | Persistencia transaccional de payment verifications |

### 18. Inventario Rodante y Mochilas (3 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `supplies` | SÍ | SÍ | Persistencia transaccional de supplies |
| `supply_movements` | SÍ | SÍ | Persistencia transaccional de supply movements |
| `vehicle_inventory_allocations` | SÍ | SÍ | Persistencia transaccional de vehicle inventory allocations |

### 19. Academia, Asistentes y Cultura (2 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `ai_assistant_configs` | SÍ | SÍ | Persistencia transaccional de ai assistant configs |
| `ai_prompt_versions` | SÍ | SÍ | Persistencia transaccional de ai prompt versions |

### 2. Identidad, Autenticación y Permisos (5 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `consents` | SÍ | SÍ | Persistencia transaccional de consents |
| `organization_memberships` | SÍ | SÍ | Persistencia transaccional de organization memberships |
| `security_incidents` | SÍ | SÍ | Persistencia transaccional de security incidents |
| `user_invitations` | SÍ | SÍ | Persistencia transaccional de user invitations |
| `user_profiles` | SÍ | SÍ | Persistencia transaccional de user profiles |

### 20. Experiencia del Cliente, NPS y Recuperación (27 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `client_complaints` | SÍ | SÍ | Persistencia transaccional de client complaints |
| `customer_experience_audit` | SÍ | SÍ | Persistencia transaccional de customer experience audit |
| `customer_experience_complaint_events` | SÍ | SÍ | Persistencia transaccional de customer experience complaint events |
| `customer_experience_complaints` | SÍ | SÍ | Persistencia transaccional de customer experience complaints |
| `customer_experience_feedback` | SÍ | SÍ | Persistencia transaccional de customer experience feedback |
| `customer_experience_feedback_classifications` | SÍ | SÍ | Persistencia transaccional de customer experience feedback classifications |
| `customer_experience_feedback_sources` | SÍ | SÍ | Persistencia transaccional de customer experience feedback sources |
| `customer_experience_followup_attempts` | SÍ | SÍ | Persistencia transaccional de customer experience followup attempts |
| `customer_experience_followup_plans` | SÍ | SÍ | Persistencia transaccional de customer experience followup plans |
| `customer_experience_followups` | SÍ | SÍ | Persistencia transaccional de customer experience followups |
| `customer_experience_metrics` | SÍ | SÍ | Persistencia transaccional de customer experience metrics |
| `customer_experience_quality_improvements` | SÍ | SÍ | Persistencia transaccional de customer experience quality improvements |
| `customer_experience_recovery_actions` | SÍ | SÍ | Persistencia transaccional de customer experience recovery actions |
| `customer_experience_recovery_assignments` | SÍ | SÍ | Persistencia transaccional de customer experience recovery assignments |
| `customer_experience_recovery_cases` | SÍ | SÍ | Persistencia transaccional de customer experience recovery cases |
| `customer_experience_recovery_commitments` | SÍ | SÍ | Persistencia transaccional de customer experience recovery commitments |
| `customer_experience_recovery_outcomes` | SÍ | SÍ | Persistencia transaccional de customer experience recovery outcomes |
| `customer_experience_responses` | SÍ | SÍ | Persistencia transaccional de customer experience responses |
| `customer_experience_review_platforms` | SÍ | SÍ | Persistencia transaccional de customer experience review platforms |
| `customer_experience_review_request_plans` | SÍ | SÍ | Persistencia transaccional de customer experience review request plans |
| `customer_experience_review_requests` | SÍ | SÍ | Persistencia transaccional de customer experience review requests |
| `customer_experience_survey_answers` | SÍ | SÍ | Persistencia transaccional de customer experience survey answers |
| `customer_experience_survey_versions` | SÍ | SÍ | Persistencia transaccional de customer experience survey versions |
| `customer_experience_surveys` | SÍ | SÍ | Persistencia transaccional de customer experience surveys |
| `customer_experience_testimonial_consents` | SÍ | SÍ | Persistencia transaccional de customer experience testimonial consents |
| `customer_experience_testimonials` | SÍ | SÍ | Persistencia transaccional de customer experience testimonials |
| `feedback_surveys` | SÍ | SÍ | Persistencia transaccional de feedback surveys |

### 21. Tareas, Aprobaciones y Delegaciones (9 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `ai_action_executions` | SÍ | SÍ | Persistencia transaccional de ai action executions |
| `ai_action_proposals` | SÍ | SÍ | Persistencia transaccional de ai action proposals |
| `executive_action_requests` | SÍ | SÍ | Persistencia transaccional de executive action requests |
| `executive_decision_requests` | SÍ | SÍ | Persistencia transaccional de executive decision requests |
| `operational_commitments` | SÍ | SÍ | Persistencia transaccional de operational commitments |
| `operational_task_assignment_history` | SÍ | SÍ | Persistencia transaccional de operational task assignment history |
| `operational_task_evidence` | SÍ | SÍ | Persistencia transaccional de operational task evidence |
| `operational_task_reminder_jobs` | SÍ | SÍ | Persistencia transaccional de operational task reminder jobs |
| `operational_tasks` | SÍ | SÍ | Persistencia transaccional de operational tasks |

### 22. Inteligencia Ejecutiva y Reportes (30 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `customer_value_metrics` | SÍ | SÍ | Persistencia transaccional de customer value metrics |
| `executive_capacity_analyses` | SÍ | SÍ | Persistencia transaccional de executive capacity analyses |
| `executive_continuity_analyses` | SÍ | SÍ | Persistencia transaccional de executive continuity analyses |
| `executive_daily_report_versions` | SÍ | SÍ | Persistencia transaccional de executive daily report versions |
| `executive_daily_reports` | SÍ | SÍ | Persistencia transaccional de executive daily reports |
| `executive_daily_snapshots` | SÍ | SÍ | Persistencia transaccional de executive daily snapshots |
| `executive_founder_dependency_analyses` | SÍ | SÍ | Persistencia transaccional de executive founder dependency analyses |
| `executive_improvement_proposals` | SÍ | SÍ | Persistencia transaccional de executive improvement proposals |
| `executive_metric_definitions` | SÍ | SÍ | Persistencia transaccional de executive metric definitions |
| `executive_metric_quality_checks` | SÍ | SÍ | Persistencia transaccional de executive metric quality checks |
| `executive_metric_results` | SÍ | SÍ | Persistencia transaccional de executive metric results |
| `executive_metric_sources` | SÍ | SÍ | Persistencia transaccional de executive metric sources |
| `executive_operational_exceptions` | SÍ | SÍ | Persistencia transaccional de executive operational exceptions |
| `executive_priority_recommendations` | SÍ | SÍ | Persistencia transaccional de executive priority recommendations |
| `executive_profitability_analyses` | SÍ | SÍ | Persistencia transaccional de executive profitability analyses |
| `executive_recurring_problem_clusters` | SÍ | SÍ | Persistencia transaccional de executive recurring problem clusters |
| `executive_report_approvals` | SÍ | SÍ | Persistencia transaccional de executive report approvals |
| `executive_report_audit` | SÍ | SÍ | Persistencia transaccional de executive report audit |
| `executive_report_delivery_requests` | SÍ | SÍ | Persistencia transaccional de executive report delivery requests |
| `executive_report_delivery_results` | SÍ | SÍ | Persistencia transaccional de executive report delivery results |
| `executive_risk_signals` | SÍ | SÍ | Persistencia transaccional de executive risk signals |
| `executive_source_freshness` | SÍ | SÍ | Persistencia transaccional de executive source freshness |
| `executive_weekly_action_plans` | SÍ | SÍ | Persistencia transaccional de executive weekly action plans |
| `executive_weekly_audit` | SÍ | SÍ | Persistencia transaccional de executive weekly audit |
| `executive_weekly_decision_requests` | SÍ | SÍ | Persistencia transaccional de executive weekly decision requests |
| `executive_weekly_metric_results` | SÍ | SÍ | Persistencia transaccional de executive weekly metric results |
| `executive_weekly_report_deliveries` | SÍ | SÍ | Persistencia transaccional de executive weekly report deliveries |
| `executive_weekly_report_versions` | SÍ | SÍ | Persistencia transaccional de executive weekly report versions |
| `executive_weekly_reports` | SÍ | SÍ | Persistencia transaccional de executive weekly reports |
| `executive_weekly_snapshots` | SÍ | SÍ | Persistencia transaccional de executive weekly snapshots |

### 23. Event Outbox, Inbox e Integraciones (22 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `dead_letter_queue` | SÍ | SÍ | Persistencia transaccional de dead letter queue |
| `integration_backup_records` | SÍ | SÍ | Persistencia transaccional de integration backup records |
| `integration_connector_capabilities` | SÍ | SÍ | Persistencia transaccional de integration connector capabilities |
| `integration_connectors` | SÍ | SÍ | Persistencia transaccional de integration connectors |
| `integration_cost_usage` | SÍ | SÍ | Persistencia transaccional de integration cost usage |
| `integration_credentials_metadata` | SÍ | SÍ | Persistencia transaccional de integration credentials metadata |
| `integration_event_receipts` | SÍ | SÍ | Persistencia transaccional de integration event receipts |
| `integration_health_snapshots` | SÍ | SÍ | Persistencia transaccional de integration health snapshots |
| `integration_heartbeats` | SÍ | SÍ | Persistencia transaccional de integration heartbeats |
| `integration_incidents` | SÍ | SÍ | Persistencia transaccional de integration incidents |
| `integration_maintenance_windows` | SÍ | SÍ | Persistencia transaccional de integration maintenance windows |
| `integration_monitoring_cycles` | SÍ | SÍ | Persistencia transaccional de integration monitoring cycles |
| `integration_probe_results` | SÍ | SÍ | Persistencia transaccional de integration probe results |
| `integration_restore_tests` | SÍ | SÍ | Persistencia transaccional de integration restore tests |
| `integration_retry_attempts` | SÍ | SÍ | Persistencia transaccional de integration retry attempts |
| `integration_sync_checkpoints` | SÍ | SÍ | Persistencia transaccional de integration sync checkpoints |
| `integration_sync_cursors` | SÍ | SÍ | Persistencia transaccional de integration sync cursors |
| `integration_sync_policies` | SÍ | SÍ | Persistencia transaccional de integration sync policies |
| `n8n_integration_registry` | SÍ | SÍ | Persistencia transaccional de n8n integration registry |
| `processed_events` | SÍ | SÍ | Persistencia transaccional de processed events |
| `transactional_outbox` | SÍ | SÍ | Persistencia transaccional de transactional outbox |
| `webhook_delivery_logs` | SÍ | SÍ | Persistencia transaccional de webhook delivery logs |

### 24. Auditoría y Trazabilidad Inmutable (2 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `audit_logs` | SÍ | SÍ | Persistencia transaccional de audit logs |
| `system_event_logs` | SÍ | SÍ | Persistencia transaccional de system event logs |

### 25. OKVET Assisted Integration Bridge (13 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `integration_discrepancy_evidence` | SÍ | SÍ | Persistencia transaccional de integration discrepancy evidence |
| `integration_external_identity_map` | SÍ | SÍ | Persistencia transaccional de integration external identity map |
| `integration_external_reference_map` | SÍ | SÍ | Persistencia transaccional de integration external reference map |
| `integration_manual_confirmation_tasks` | SÍ | SÍ | Persistencia transaccional de integration manual confirmation tasks |
| `integration_reconciliation_audit` | SÍ | SÍ | Persistencia transaccional de integration reconciliation audit |
| `integration_reconciliation_discrepancies` | SÍ | SÍ | Persistencia transaccional de integration reconciliation discrepancies |
| `integration_reconciliation_runs` | SÍ | SÍ | Persistencia transaccional de integration reconciliation runs |
| `integration_reconciliation_tasks` | SÍ | SÍ | Persistencia transaccional de integration reconciliation tasks |
| `integration_repair_approvals` | SÍ | SÍ | Persistencia transaccional de integration repair approvals |
| `integration_repair_executions` | SÍ | SÍ | Persistencia transaccional de integration repair executions |
| `integration_repair_proposals` | SÍ | SÍ | Persistencia transaccional de integration repair proposals |
| `integration_repair_verifications` | SÍ | SÍ | Persistencia transaccional de integration repair verifications |
| `okvet_references` | SÍ | SÍ | Persistencia transaccional de okvet references |

### 3. Clientes, Familias y Mascotas (7 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `addresses` | SÍ | SÍ | Persistencia transaccional de addresses |
| `bereavement_records` | SÍ | SÍ | Persistencia transaccional de bereavement records |
| `caregiver_authorizations` | SÍ | SÍ | Persistencia transaccional de caregiver authorizations |
| `contact_restrictions` | SÍ | SÍ | Persistencia transaccional de contact restrictions |
| `owners` | SÍ | SÍ | Persistencia transaccional de owners |
| `pet_owner_relations` | SÍ | SÍ | Persistencia transaccional de pet owner relations |
| `pets` | SÍ | SÍ | Persistencia transaccional de pets |

### 4. Customer Experience Memory (CEM) (3 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `customer_experience_audit` | SÍ | SÍ | Persistencia transaccional de customer experience audit |
| `customer_experience_memory` | SÍ | SÍ | Persistencia transaccional de customer experience memory |
| `customer_experience_sensitive_suppressions` | SÍ | SÍ | Persistencia transaccional de customer experience sensitive suppressions |

### 5. Conversaciones y Canales WhatsApp (11 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `conversation_handoffs` | SÍ | SÍ | Persistencia transaccional de conversation handoffs |
| `conversation_internal_notes` | SÍ | SÍ | Persistencia transaccional de conversation internal notes |
| `conversation_state_transitions` | SÍ | SÍ | Persistencia transaccional de conversation state transitions |
| `conversation_transfers` | SÍ | SÍ | Persistencia transaccional de conversation transfers |
| `conversations` | SÍ | SÍ | Persistencia transaccional de conversations |
| `message_templates` | SÍ | SÍ | Persistencia transaccional de message templates |
| `messages` | SÍ | SÍ | Persistencia transaccional de messages |
| `outbound_dispatch_requests` | SÍ | SÍ | Persistencia transaccional de outbound dispatch requests |
| `whatsapp_contact_suppressions` | SÍ | SÍ | Persistencia transaccional de whatsapp contact suppressions |
| `whatsapp_conversation_windows` | SÍ | SÍ | Persistencia transaccional de whatsapp conversation windows |
| `whatsapp_delivery_events` | SÍ | SÍ | Persistencia transaccional de whatsapp delivery events |

### 6. Servicios, Tarifas y Catálogo (4 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `clinical_constraints` | SÍ | SÍ | Persistencia transaccional de clinical constraints |
| `services` | SÍ | SÍ | Persistencia transaccional de services |
| `specialty_catalog` | SÍ | SÍ | Persistencia transaccional de specialty catalog |
| `tariffs` | SÍ | SÍ | Persistencia transaccional de tariffs |

### 7. Personal, Turnos y Capacidad (7 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `capacity_rules` | SÍ | SÍ | Persistencia transaccional de capacity rules |
| `founder_absence_delegations` | SÍ | SÍ | Persistencia transaccional de founder absence delegations |
| `operational_shift_handoffs` | SÍ | SÍ | Persistencia transaccional de operational shift handoffs |
| `staff_absences` | SÍ | SÍ | Persistencia transaccional de staff absences |
| `staff_profiles` | SÍ | SÍ | Persistencia transaccional de staff profiles |
| `staff_qualifications` | SÍ | SÍ | Persistencia transaccional de staff qualifications |
| `staff_shifts` | SÍ | SÍ | Persistencia transaccional de staff shifts |

### 8. Calendarios Conectados y Sincronización (13 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `calendar_availability_snapshots` | SÍ | SÍ | Persistencia transaccional de calendar availability snapshots |
| `calendar_blocked_times` | SÍ | SÍ | Persistencia transaccional de calendar blocked times |
| `calendar_change_events` | SÍ | SÍ | Persistencia transaccional de calendar change events |
| `calendar_conflicts` | SÍ | SÍ | Persistencia transaccional de calendar conflicts |
| `calendar_event_mappings` | SÍ | SÍ | Persistencia transaccional de calendar event mappings |
| `calendar_reconciliation_tasks` | SÍ | SÍ | Persistencia transaccional de calendar reconciliation tasks |
| `calendar_sync_audit` | SÍ | SÍ | Persistencia transaccional de calendar sync audit |
| `calendar_sync_leases` | SÍ | SÍ | Persistencia transaccional de calendar sync leases |
| `calendar_sync_runs` | SÍ | SÍ | Persistencia transaccional de calendar sync runs |
| `calendar_sync_state` | SÍ | SÍ | Persistencia transaccional de calendar sync state |
| `calendar_watch_channels` | SÍ | SÍ | Persistencia transaccional de calendar watch channels |
| `external_calendar_events` | SÍ | SÍ | Persistencia transaccional de external calendar events |
| `staff_calendar_connections` | SÍ | SÍ | Persistencia transaccional de staff calendar connections |

### 9. Citas, Solicitudes y Holds (11 Tablas)
| Tabla | RLS Activo | RLS Forzado | Finalidad Operativa |
|---|:---:|:---:|---|
| `appointment_holds` | SÍ | SÍ | Persistencia transaccional de appointment holds |
| `appointment_notification_jobs` | SÍ | SÍ | Persistencia transaccional de appointment notification jobs |
| `appointment_notification_plans` | SÍ | SÍ | Persistencia transaccional de appointment notification plans |
| `appointment_recovery_tasks` | SÍ | SÍ | Persistencia transaccional de appointment recovery tasks |
| `appointment_requests` | SÍ | SÍ | Persistencia transaccional de appointment requests |
| `appointment_reschedule_proposals` | SÍ | SÍ | Persistencia transaccional de appointment reschedule proposals |
| `appointment_services` | SÍ | SÍ | Persistencia transaccional de appointment services |
| `appointment_status_history` | SÍ | SÍ | Persistencia transaccional de appointment status history |
| `appointment_waitlist_entries` | SÍ | SÍ | Persistencia transaccional de appointment waitlist entries |
| `appointment_waitlist_offers` | SÍ | SÍ | Persistencia transaccional de appointment waitlist offers |
| `appointments` | SÍ | SÍ | Persistencia transaccional de appointments |

---

## 4. AUDITORÍA DE FUNCIONES SQL Y STORED PROCEDURES (157 FUNCIONES)

### 4.1 Principales Procedimientos Transaccionales RPC
1. `public.get_business_snapshot(p_org_id UUID, p_query_date DATE)`: Retorna métricas en vivo en COP, citas del día y alertas de seguridad.
2. `public.create_schedule_simulation(...)`: Modela escenarios de contingencia en memoria sin tocar citas reales.
3. `public.claim_outbox_events(...)`: Adquiere de forma atómica y concurrente eventos del Outbox (`FOR UPDATE SKIP LOCKED`).
4. `public.execute_approved_action(...)`: Ejecuta acciones tras validación de firma o PIN del Dr. Luis.
5. `public.reconcile_integration_event(...)`: Resuelve discrepancias entre Supabase, n8n y OKVET.
6. `public.verify_and_confirm_appointment_okvet(...)`: Registra la confirmación humana de cita verificada en OKVET.
7. `public.register_payment_attempt(...)`: Registra transferencias bancarias Nequi/Bre-B con control de idempotencia.
8. `public.get_system_health_summary(...)`: Sonda de latencia y disponibilidad de servicios.

### 4.2 Hallazgos de Seguridad del Linter de Supabase (`db advisors`)
- **Aviso:** `anon_security_definer_function_executable` (WARN).
- **Causa Raíz:** Por defecto, PostgreSQL otorga permisos `EXECUTE` al rol `PUBLIC` en funciones de `public`.
- **Acción Correctiva:** Ejecutar migración de hardening `REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;` garantizando que solo `authenticated` y `service_role` puedan invocar procedimientos de aplicación.

---

## 5. SUPABASE STORAGE (BUCKETS PRIVADOS)

| Bucket ID | Público | Límite de Tamaño | Tipos MIME Permitidos | Finalidad |
|---|:---:|:---:|---|---|
| `medical-records` | **NO** | 50 MB | `pdf`, `jpeg`, `png`, `webp` | Fórmulas médicas oficiales, historias clínicas firmadas y certificaciones. |
| `referral-documents` | **NO** | 50 MB | `pdf`, `jpeg`, `png` | Informes de especialistas externos, ecografías y paraclínicos. |
| `system-backups-metadata` | **NO** | 100 MB | `json`, `gzip` | Snapshots inmutables de verificación de integridad de datos. |

---

## 6. MAPEO DE CONEXIÓN CON LOVABLE Y N8N

- **Lovable Frontend:** Se conecta vía PostgREST con la clave pública `sb_publishable_caToaYTxjdravNvXvDuVLg_htNwLZzI` y los tipos de [`types/supabase.ts`](file:///c:/Users/Freud/N8NVET/types/supabase.ts).
- **n8n Cloud:** Se conecta mediante el Transactional Outbox Pattern (`v_n8n_outbox_queue`) consumiendo eventos con lease atómico sin acoplamiento punto a punto.
- **OKVET Bridge:** Se conecta mediante el protocolo de **Conciliación Asistida Humana**, registrando referencias cruzadas sin recurrir a scraping ni robots no autorizados.
