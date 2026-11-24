# VET FREEDOM OS — INVENTARIO COMPLETO DE ENTIDADES (86 TABLAS)
**Proyecto:** Vet Life — Veterinaria a Domicilio  
**Motor:** PostgreSQL 17.12 en Supabase (`sznvahhocgnhsqhksygq`)  
**Fecha:** 2026-11-20  
**Estado:** 100% Creadas con Row Level Security (RLS) habilitado.  

---

## RESUMEN POR MÓDULOS

| Módulo | Nombre del Módulo | Tablas Creadas |
|--------|-------------------|----------------|
| **Módulo A** | Organizaciones y Configuración | `organizations`, `branches`, `system_settings`, `services`, `tariffs`, `operating_hours`, `non_working_days` (7) |
| **Módulo B** | Autenticación y 11 Roles | `user_profiles`, `organization_memberships`, `staff_profiles`, `staff_qualifications`, `caregiver_authorizations`, `user_invitations` (6) |
| **Módulo C** | Clientes, Mascotas y CEM | `owners`, `addresses`, `pets`, `pet_owner_relations`, `consents`, `customer_experience_memory`, `bereavement_records`, `contact_restrictions`, `client_complaints` (9) |
| **Módulo D** | WhatsApp y Conversaciones | `conversations`, `messages`, `message_templates`, `outbound_dispatch_requests`, `conversation_transfers` (5) |
| **Módulo E** | Solicitudes, Citas y Visitas | `appointment_requests`, `appointments`, `appointment_services`, `appointment_status_history`, `appointment_holds`, `visits`, `okvet_references` (7) |
| **Módulo F** | Agenda Inteligente y Calendarios | `staff_calendar_connections`, `external_calendar_events`, `calendar_sync_state`, `calendar_conflicts` (4) |
| **Módulo G/H** | Capacidad, Turnos y Personal | `staff_shifts`, `staff_absences`, `capacity_rules` (3) |
| **Módulo I/J** | Tratamientos Recurrentes y Prevención | `recurrence_templates`, `recurring_treatment_plans`, `recurring_visit_occurrences`, `preventive_care_plans`, `preventive_due_dates`, `clinical_constraints` (6) |
| **Módulo L/R** | Rutas, Insumos y Operaciones | `routes`, `route_stops`, `route_reoptimization_requests`, `route_alerts`, `supplies`, `supply_movements`, `vehicle_inventory_allocations` (7) |
| **Módulo K** | Finanzas y Recaudos (COP) | `visit_charge_lines`, `payment_collections`, `payment_verifications`, `customer_value_metrics` (4) |
| **Módulo M** | Simulador Inteligente | `schedule_simulations`, `simulation_snapshots`, `simulation_scenarios` (3) |
| **Módulo N** | Especialistas Aliados | `specialist_profiles`, `specialist_specialties`, `specialist_agreements`, `specialist_slot_holds`, `specialist_booking_requests`, `specialist_appointments` (6) |
| **Módulo O** | Remisiones Clínicas | `patient_referrals`, `referral_approvals`, `referral_documents`, `referral_followups` (4) |
| **Módulo P** | Compromisos y Seguimiento | `post_visit_commitments`, `post_visit_reminders` (2) |
| **Módulo Q** | Experiencia y Satisfacción | `feedback_surveys` (1) |
| **Módulo T** | Automatización, Eventos y n8n | `transactional_outbox`, `processed_events`, `n8n_integration_registry`, `dead_letter_queue`, `webhook_delivery_logs` (5) |
| **Módulo U** | IA y Gobernanza de Asistentes | `ai_assistant_configs`, `ai_prompt_versions`, `ai_action_proposals`, `ai_action_executions` (4) |
| **Módulo V** | Seguridad, Auditoría y Monitoreo | `audit_logs`, `system_event_logs`, `security_incidents` (3) |
| **TOTAL** | **86 Entidades Relacionales Normalizadas** | **86 Tablas** |

---

## DETALLE DE ENTIDADES

### Módulo A — Organizaciones y Configuración
1. `public.organizations`: Raíz multi-inquilino. UUID, nombre, slug único, configuración JSONB, zona horaria (`America/Bogota`), moneda (`COP`).
2. `public.branches`: Sedes operativas o zonas de despacho en Bogotá/Sabana.
3. `public.system_settings`: Parámetros de configuración general de la organización con bandera `is_public`.
4. `public.services`: Catálogo de servicios veterinarios a domicilio (duración, buffer pre/post, requerimiento de médico).
5. `public.tariffs`: Precios oficiales en COP, recargos por domicilio, urgencia o fin de semana.
6. `public.operating_hours`: Horarios de operación semanal de la sede.
7. `public.non_working_days`: Días festivos y no laborables para cálculo de disponibilidad.

### Módulo B — Autenticación y Roles
8. `public.user_profiles`: Extensión de `auth.users`, datos personales, documento, teléfono, idioma.
9. `public.organization_memberships`: Mapeo de usuarios a organizaciones con uno de los 11 roles `public.app_role_type`.
10. `public.staff_profiles`: Perfil del personal (veterinario COMVEZCOL, auxiliar, etc.), zonas de cobertura.
11. `public.staff_qualifications`: Títulos, acreditaciones y estado de verificación profesional.
12. `public.caregiver_authorizations`: Autorizaciones formales y revocables de un cliente hacia un cuidador con niveles (`FULL`, `ROUTINE_ONLY`, etc.).
13. `public.user_invitations`: Tokens seguros de invitación para incorporación de equipo.

### Módulo C — Clientes, Mascotas y Customer Experience Memory (CEM)
14. `public.owners`: Registro canónico de clientes/propietarios, estado VIP, canal de preferencia.
15. `public.addresses`: Domicilios múltiples georreferenciados con instrucciones de acceso vehicular/portería.
16. `public.pets`: Pacientes caninos, felinos, raza, peso, microchip, temperamento y alertas de manejo.
17. `public.pet_owner_relations`: Co-propietarios y tutores con permisos de decisión.
18. `public.consents`: Consentimientos informados (Habeas Data, sedación, eutanasia) con versión y firma.
19. `public.customer_experience_memory`: Observaciones de trato, sensibilidad y preferencias personales del cliente.
20. `public.bereavement_records`: Registros de fallecimiento de mascotas que suprimen de inmediato recordatorios y marketing.
21. `public.contact_restrictions`: Horarios de no molestar y exclusión voluntaria de mensajes automáticos.
22. `public.client_complaints`: Registro formal de PQRs e incidencias con resolución auditada.

### Módulo D — WhatsApp y Conversaciones
23. `public.conversations`: Hilos omnicanal (WhatsApp Cloud API), ventana de 24h, bloqueo bot/humano.
24. `public.messages`: Historial inmutable de mensajes entrantes y salientes con WAMID de Meta.
25. `public.message_templates`: Plantillas oficiales aprobadas por Meta para recordatorios y notificaciones.
26. `public.outbound_dispatch_requests`: Cola durable de despacho procesada por n8n.
27. `public.conversation_transfers`: Trazabilidad de traspaso entre bot de IA y agente humano.

### Módulo E — Solicitudes, Citas y Visitas
28. `public.appointment_requests`: Solicitudes previas con triaje antes de validación operativa.
29. `public.appointments`: Citas confirmadas con médico asignado, horarios y estado de sincronización con OKVET.
30. `public.appointment_services`: Servicios y procedimientos complementarios agendados en la cita.
31. `public.appointment_status_history`: Registro inmutable de transiciones de estado de cada cita.
32. `public.appointment_holds`: Bloqueos temporales para prevenir doble reserva durante el flujo de agenda.
33. `public.visits`: Ejecución domiciliaria en campo, geolocalización de check-in y resumen clínico.
34. `public.okvet_references`: Enlace formal y verificado entre entidades locales y registros oficiales en OKVET.

### Módulo F & G/H — Agenda Inteligente, Capacidad y Personal
35. `public.staff_calendar_connections`: Integraciones OAuth con Google Calendar / Outlook con modo privacidad (`BUSY_ONLY`).
36. `public.external_calendar_events`: Bloqueos sincronizados desde calendarios personales del médico.
37. `public.calendar_sync_state`: Estado de salud y frecuencia de sincronización de calendarios.
38. `public.calendar_conflicts`: Solapamientos detectados entre agenda personal y citas.
39. `public.staff_shifts`: Turnos laborales programados con límite máximo de visitas.
40. `public.staff_absences`: Vacaciones, incapacidades y permisos aprobados.
41. `public.capacity_rules`: Reglas de capacidad máxima diaria y tiempos de desplazamiento entre visitas.

### Módulo I & J — Tratamientos Recurrentes y Prevención
42. `public.recurrence_templates`: Plantillas de frecuencia para tratamientos crónicos o terapias.
43. `public.recurring_treatment_plans`: Prescripción de sesiones seriadas con veterinario tratante.
44. `public.recurring_visit_occurrences`: Sesiones individuales planificadas con ventanas de tolerancia.
45. `public.preventive_care_plans`: Planes integrales de medicina preventiva (cachorro, adulto, senior).
46. `public.preventive_due_dates`: Vencimientos de vacunas, desparasitaciones y chequeos preventivos.
47. `public.clinical_constraints`: Reglas biológicas ineludibles (intervalo mínimo entre vacunas, edad mínima para rabia).

### Módulo L & R — Rutas, Insumos y Operaciones
48. `public.routes`: Plan de ruta diario por veterinario en Bogotá con distancias y tiempos.
49. `public.route_stops`: Paradas georreferenciadas con orden de visita y cálculo de trayecto.
50. `public.route_reoptimization_requests`: Recálculo de ruta por tráfico o inserción de urgencias.
51. `public.route_alerts`: Alertas de retraso, clima o riesgo térmico de biológicos.
52. `public.supplies`: Catálogo de insumos, medicamentos y vacunas (cadena de frío, control especial).
53. `public.supply_movements`: Kardex de almacén central a botiquines móviles y salidas por visita.
54. `public.vehicle_inventory_allocations`: Existencias actuales por lote en el botiquín del veterinario.

### Módulo K — Finanzas (COP)
55. `public.visit_charge_lines`: Liquidación detallada de honorarios, medicamentos y transporte.
56. `public.payment_collections`: Recaudos por Bre-B, Nequi, Daviplata, tarjeta o efectivo en campo.
57. `public.payment_verifications`: Auditoría y conciliación bancaria ejecutada por el rol Finanzas.
58. `public.customer_value_metrics`: LTV, saldo pendiente y nivel de fidelización del cliente.

### Módulo M, N, O, P & Q — Simulador, Especialistas, Remisiones y Calidad
59. `public.schedule_simulations`: Simulaciones de optimización de agenda sin tocar citas reales.
60. `public.simulation_snapshots`: Snapshot inmutable del estado previo para rollback.
61. `public.simulation_scenarios`: Propuestas comparativas con métricas de tiempo ahorrado.
62. `public.specialist_profiles`: Directorio de especialistas aliados.
63. `public.specialist_specialties`: Especialidades médicas acreditadas por especialista.
64. `public.specialist_agreements`: Modelos de convenio y comisiones por remisión.
65. `public.specialist_slot_holds`: Bloqueo preventivo de cupo con el especialista.
66. `public.specialist_booking_requests`: Solicitud formal de cupo para el paciente.
67. `public.specialist_appointments`: Cita concertada en sede del especialista o domicilio.
68. `public.patient_referrals`: Remisión formal con triaje, motivo clínico y seguimiento.
69. `public.referral_approvals`: Aprobación médica obligatoria por Dirección Clínica (Dr. Luis).
70. `public.referral_documents`: Epicrisis, resultados de exámenes y contra-remisión.
71. `public.referral_followups`: Contactos de control post-remisión para verificar evolución.
72. `public.post_visit_commitments`: Compromisos post-visita (envío de laboratorio, ajuste de dosis).
73. `public.post_visit_reminders`: Recordatorios programados asociados a compromisos.
74. `public.feedback_surveys`: Encuestas de satisfacción post-visita con Net Promoter Score (NPS 0-10).

### Módulo T — Eventos, Outbox y n8n
75. `public.transactional_outbox`: Despacho transaccional durable para los 21 workflows de n8n.
76. `public.processed_events`: Deduplicación e idempotencia estricta por clave única.
77. `public.n8n_integration_registry`: Directorio de salud y vinculación de los workflows CORE.
78. `public.dead_letter_queue`: Cola de eventos fallidos para diagnóstico e intervención manual.
79. `public.webhook_delivery_logs`: Registro técnico de llamadas HTTP y firmas HMAC.

### Módulo U & V — Inteligencia Artificial, Auditoría y Seguridad
80. `public.ai_assistant_configs`: Configuración de modelos, herramientas y límites de autonomía.
81. `public.ai_prompt_versions`: Historial versionado y auditable de system prompts.
82. `public.ai_action_proposals`: Propuestas generadas por IA que requieren validación humana.
83. `public.ai_action_executions`: Resultado verificado post-aprobación humana.
84. `public.audit_logs`: Trazabilidad forense inmutable de operaciones sensibles.
85. `public.system_event_logs`: Estado de salud de componentes y microservicios.
86. `public.security_incidents`: Registro y mitigación de alertas de seguridad o RLS.
