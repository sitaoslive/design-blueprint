# VET FREEDOM OS — WORKFLOW REGISTRY (REGISTRO OFICIAL DE WORKFLOWS N8N)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Instancia n8n:** `https://alphavision.app.n8n.cloud`  
**Proyecto:** Personal `Daniela Wild <alphavisionmethod@gmail.com>` (ID: `DoPm60I3EipMm6rG`)  
**Carpeta:** `Vet Freedom OS` (ID: `EWfSa40jLDxPUOKX`)  
**Fecha de Verificación:** 2026-11-20  
**Timezone Oficial:** `America/Bogota` (Configurada en el 100% de los workflows)  

---

## 1. REGLAS DE SEGURIDAD OPERACIONAL EN N8N
1. **Modo Seguro Activo:** Todos los flujos tienen `active: false` y operan con flags `send_enabled: false` durante la fase de desarrollo para proteger a pacientes reales de mensajes de prueba.
2. **Disparadores Duales de Producción y QA:** Cada flujo cuenta con un Webhook oficial registrado con ruta dedicada (`/webhook/<ruta>`) y un disparador manual de pruebas (`manualTrigger`) con `pinData` validada.
3. **Autoridad OKVET:** Ningún flujo escribe de forma autónoma o inventa historias clínicas; todas las referencias se marcan con conciliación asistida.
4. **Idempotencia y Dead-Letter:** Todo evento procesado verifica duplicidad contra `processed_events`. Las fallas se enrutan automáticamente a `VET-CORE-19` (Error Handler).

---

## 2. CATÁLOGO MAESTRO DE LOS 22 WORKFLOWS ACTUALIZADOS

| Código | ID n8n Cloud | Nombre Oficial | Ruta Webhook Oficial | Nodos Clave | Ejecuciones Auditadas | Estado | Archivo Local JSON |
|---|---|---|---|---|---|---|---|
| **VET-QA-001** | `8FxcpmC7HV0zdRQJ` | `VET-QA-001 \| AI Connection Smoke Test` | `vet-qa-001` | Webhook, ManualTrigger, PrepareTestPayload, EvaluateTestEnabled, AcceptanceBranch | Exec 1..6, 50, 51 (200 OK) | `VERIFIED` | [`VET-QA-001.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-QA-001.json) |
| **VET-CORE-01** | `6NqYnrYXN33rAd6h` | `VET-CORE-01 \| Event Dispatcher` | `vet-events/dispatch` | Webhook, ManualTrigger, ValidateContract, RouteDomain, DomainDispatches | Exec 7, 8, 52 (200 OK) | `VERIFIED` | [`VET-CORE-01.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-01.json) |
| **VET-CORE-02** | `aE0sFsDFsQiAXfNy` | `VET-CORE-02 \| WhatsApp Inbound Webhook & Routing` | `whatsapp/inbound` | Webhook, ManualTrigger, NormalizeClassify, CheckHumanEscalation, EscalationRoute | Exec 16, 17, 53 (200 OK) | `VERIFIED` | [`VET-CORE-02.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-02.json) |
| **VET-CORE-03** | `CURcbtf1AsoTNAV6` | `VET-CORE-03 \| WhatsApp Outbound Safe Sender` | `whatsapp/outbound` | Webhook, ManualTrigger, ValidateCompliance, CheckDispatchPermitted, SafeSenderGate | Exec 18, 19, 54 (200 OK) | `VERIFIED` | [`VET-CORE-03.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-03.json) |
| **VET-CORE-04** | `OIPDuOPzlz3qYWBK` | `VET-CORE-04 \| Conversation Escalation & Human Handoff` | `conversations/escalate` | Webhook, ManualTrigger, ProcessEscalation, CheckUrgency, LockBotRoute | Exec 20, 21, 55 (200 OK) | `VERIFIED` | [`VET-CORE-04.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-04.json) |
| **VET-CORE-05** | `tKsUue9l1G7u4ZSu` | `VET-CORE-05 \| Appointment Notification Service` | `appointments/notify` | Webhook, ManualTrigger, ProcessNotification, CheckOfficialConfirm, DispatchNotices | Exec 22, 23, 56 (200 OK) | `VERIFIED` | [`VET-CORE-05.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-05.json) |
| **VET-CORE-06** | `EyMWPGPUg967B4jH` | `VET-CORE-06 \| Calendar Sync Engine` | `calendar/sync` | Webhook, ManualTrigger, SanitizeBusyOnly, CheckConflict, ResolveCalendarDrift | Exec 24, 25, 57 (200 OK) | `VERIFIED` | [`VET-CORE-06.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-06.json) |
| **VET-CORE-07** | `gpAs1WrIysVP9QzC` | `VET-CORE-07 \| Operational Reminders Service` | `reminders/trigger` | Webhook, ManualTrigger, EvaluateUrgency, CheckBreach, DispatchStaffAlert | Exec 26, 27, 58 (200 OK) | `VERIFIED` | [`VET-CORE-07.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-07.json) |
| **VET-CORE-08** | `UkM0dgBfFe02Ehj9` | `VET-CORE-08 \| Route Notifications & Dispatch` | `routes/notify` | Webhook, ManualTrigger, ProcessRouteEvent, CheckSevereDelay, RouteOwnerAlert | Exec 28, 29, 59 (200 OK) | `VERIFIED` | [`VET-CORE-08.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-08.json) |
| **VET-CORE-09** | `iY1wZT6twRq77eZZ` | `VET-CORE-09 \| Recurring Care Communications` | `recurring-care/notify` | Webhook, ManualTrigger, EvaluateAdherence, CheckMissingDoses, DispatchClinicalReminder | Exec 30, 31, 60 (200 OK) | `VERIFIED` | [`VET-CORE-09.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-09.json) |
| **VET-CORE-10** | `T2KxP7OvRZuFYVTF` | `VET-CORE-10 \| Prevention Communications` | `prevention/notify` | Webhook, ManualTrigger, EvaluateEligibility, CheckDueWindow, DispatchPreventiveCTA | Exec 32, 33, 61 (200 OK) | `VERIFIED` | [`VET-CORE-10.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-10.json) |
| **VET-CORE-11** | `oEJoqBSPaevLTfU0` | `VET-CORE-11 \| Specialist Coordination Service` | `specialists/coordinate` | Webhook, ManualTrigger, ProcessSpecialist, CheckAgreement, NotifyExternalSpecialist | Exec 34, 35, 62 (200 OK) | `VERIFIED` | [`VET-CORE-11.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-11.json) |
| **VET-CORE-12** | `CrOfQtq17O2Ld0o6` | `VET-CORE-12 \| Post-Visit Commitments Service` | `commitments/evaluate` | Webhook, ManualTrigger, EvaluateTimeline, CheckOverdue, EscalateCommitment | Exec 36, 37, 63 (200 OK) | `VERIFIED` | [`VET-CORE-12.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-12.json) |
| **VET-CORE-13** | `WZGI5mC0uQW8px2R` | `VET-CORE-13 \| Approved Document Delivery` | `documents/deliver` | Webhook, ManualTrigger, ValidateApprovalSign, CheckSecureSign, DispatchSecureUrl | Exec 38, 39, 64 (200 OK) | `VERIFIED` | [`VET-CORE-13.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-13.json) |
| **VET-CORE-14** | `XhvOjZLLW91cSQBO` | `VET-CORE-14 \| Financial Notifications & Invoicing` | `finances/notify` | Webhook, ManualTrigger, ProcessFinancial, CheckAmountThreshold, DispatchReceiptCop | Exec 40, 41, 65 (200 OK) | `VERIFIED` | [`VET-CORE-14.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-14.json) |
| **VET-CORE-15** | `YVEIO4UW2DWTztoy` | `VET-CORE-15 \| Customer Experience Follow-up` | `cx/survey` | Webhook, ManualTrigger, ProcessNpsTriage, CheckDetractor, TriageDetractorRecovery | Exec 42, 43, 66 (200 OK) | `VERIFIED` | [`VET-CORE-15.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-15.json) |
| **VET-CORE-16** | `LHYUw9Pe93pDXaTw` | `VET-CORE-16 \| Daily Executive Reporting` | `reports/daily` | Webhook, ManualTrigger, CompileDailyBrief, CheckCriticalAlerts, DispatchLuisBrief | Exec 44, 45, 67 (200 OK) | `VERIFIED` | [`VET-CORE-16.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-16.json) |
| **VET-CORE-17** | `CM86KKfUxrbllCzz` | `VET-CORE-17 \| Weekly Operational Reporting` | `reports/weekly` | Webhook, ManualTrigger, ProcessWeeklyKpis, CheckAutonomyDrift, DispatchWeeklyAnalysis | Exec 46, 47, 68 (200 OK) | `VERIFIED` | [`VET-CORE-17.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-17.json) |
| **VET-CORE-18** | `ArahWgq5Y9Z3Ykmt` | `VET-CORE-18 \| Integration Reconciliation Service` | `reconciliation/trigger` | Webhook, ManualTrigger, EvaluateDiscrepancies, CheckOkvetSync, EscalateReconciliation | Exec 48, 49, 69 (200 OK) | `VERIFIED` | [`VET-CORE-18.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-18.json) |
| **VET-CORE-19** | `uWO95CQ8twQDL9Gk` | `VET-CORE-19 \| Error & Retry Handler Service` | `errors/handle` | Webhook, ManualTrigger, ClassifyError, CheckRecoverable, EnqueueDeadLetter | Exec 9, 10, 70 (200 OK) | `VERIFIED` | [`VET-CORE-19.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-19.json) |
| **VET-CORE-20** | `3jYrLiNZ2todZTmq` | `VET-CORE-20 \| Integration Health Monitoring` | `health/check` | Webhook, ManualTrigger, EvaluateHealth, CheckDegradedService, DispatchDevOpsAlert | Exec 11, 12, 71 (200 OK) | `VERIFIED` | [`VET-CORE-20.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-20.json) |
| **VET-CORE-21** | `fjVxzNJqrYkFIcWg` | `VET-CORE-21 \| Backups & Maintenance Coordination` | `maintenance/trigger` | Webhook, ManualTrigger, EvaluateMaintenance, CheckBackupOk, LogMaintenanceAudit | Exec 14, 15, 72 (200 OK) | `VERIFIED` | [`VET-CORE-21.json`](file:///c:/Users/Freud/N8NVET/automation/n8n/workflows/VET-CORE-21.json) |
