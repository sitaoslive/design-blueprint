# VET FREEDOM OS — POST-VISIT COMMITMENT STATE MACHINE
## Ciclo de Vida y Máquina de Estados de Compromisos Post-Visita
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Plataforma:** PostgreSQL 17 (Supabase) + n8n Cloud  

---

## 1. Diagrama de Transición de Estados

```mermaid
stateDiagram-v2
    [*] --> PROPOSED: Detección por Checklist / IA / Nota
    PROPOSED --> PENDING_VALIDATION: Requiere validación de procedencia
    PENDING_VALIDATION --> OPEN: Validación aprobada por personal
    PROPOSED --> OPEN: Alta directa por veterinario
    
    OPEN --> PENDING_ASSIGNMENT: Sin responsable designado
    PENDING_ASSIGNMENT --> ASSIGNED: Responsable asignado en staff_profiles
    OPEN --> ASSIGNED: Creado con responsable
    
    ASSIGNED --> WAITING_ACCEPTANCE: Notificación despachada al responsable
    WAITING_ACCEPTANCE --> ACCEPTED: Responsable acepta asignación
    WAITING_ACCEPTANCE --> WAITING_ACCEPTANCE: Recordatorio de aceptación (CORE-07)
    
    ACCEPTED --> IN_PROGRESS: Inicio de gestiones
    
    IN_PROGRESS --> WAITING_EXTERNAL: Espera de clínica externa o laboratorio
    IN_PROGRESS --> WAITING_CUSTOMER: Espera de datos del tutor
    IN_PROGRESS --> WAITING_PROFESSIONAL_REVIEW: Espera de dictamen veterinario
    IN_PROGRESS --> BLOCKED: Bloqueo operativo justificado
    
    IN_PROGRESS --> SNOOZED: Posposición autorizada (máx 3 veces)
    SNOOZED --> IN_PROGRESS: Vencimiento de ventana de prórroga
    
    IN_PROGRESS --> OVERDUE: Fecha due_at superada sin reporte
    OVERDUE --> ESCALATED: Alerta a Coordinador / Dirección Médica
    ESCALATED --> IN_PROGRESS: Reasignación o resolución asistida
    
    IN_PROGRESS --> COMPLETION_REPORTED: Personal reporta evidencia
    COMPLETION_REPORTED --> PENDING_VERIFICATION: Requiere auditoría o revisión clínica
    PENDING_VERIFICATION --> VERIFIED_COMPLETE: Certificación por profesional habilitado
    COMPLETION_REPORTED --> VERIFIED_COMPLETE: No requería revisión profesional
    
    IN_PROGRESS --> CANCELLED_WITH_AUTHORIZATION: Cancelación justificada por veterinario
    BLOCKED --> CLOSED_WITH_DOCUMENTED_OUTCOME: Excepción documentada aprobada
    
    VERIFIED_COMPLETE --> [*]
    CANCELLED_WITH_AUTHORIZATION --> [*]
    CLOSED_WITH_DOCUMENTED_OUTCOME --> [*]
```

---

## 2. Catálogo Canónico de los 20 Estados

| # | Estado | Definición Operativa | Restricción / Invariante |
|---|---|---|---|
| 1 | `PROPOSED` | Candidato a compromiso extraído por IA o borrador. | No visible para tutores ni activo en cron. |
| 2 | `PENDING_VALIDATION` | Requiere verificación humana de procedencia (WFX-005). | Prohibido auto-aprobar por inferencias. |
| 3 | `OPEN` | Compromiso formalmente abierto y activo. | Cuenta en `open_commitments_count`. |
| 4 | `PENDING_ASSIGNMENT` | Compromiso huérfano sin responsable asignado. | Alerta inmediata a coordinación (CORE-07). |
| 5 | `ASSIGNED` | Responsable asignado formalmente en `staff_profiles`. | Requiere staff activo. |
| 6 | `WAITING_ACCEPTANCE` | Responsable notificado; espera acuse de recibo. | Plazo de 2 horas para aceptación. |
| 7 | `ACCEPTED` | Responsable asumió formalmente la tarea. | Registra timestamp en assignments. |
| 8 | `IN_PROGRESS` | Tarea en curso de resolución activa. | Permite adjuntar evidencia parcial. |
| 9 | `WAITING_EXTERNAL` | Esperando respuesta de especialista o centro externo. | No computa como negligencia interna. |
| 10 | `WAITING_CUSTOMER` | Esperando que el tutor envíe datos o confirme. | Sujeto a horario hábil. |
| 11 | `WAITING_PROFESSIONAL_REVIEW`| Esperando dictamen de médico veterinario colegiado. | Solo asignable a rol `VETERINARIAN`. |
| 12 | `BLOCKED` | Tarea detenida por impedimento material o legal. | Requiere `blocking_reason` obligatorio. |
| 13 | `SNOOZED` | Tarea pospuesta legítimamente con nueva fecha futura. | Límite estricto de 3 posposiciones. |
| 14 | `OVERDUE` | Plazo `due_at` superado sin reporte de cumplimiento. | Dispara watchdog automático. |
| 15 | `ESCALATED` | Tarea escalada a supervisión o dirección médica. | Registrado en `post_visit_commitment_escalations`. |
| 16 | `COMPLETION_REPORTED` | Evidencia adjuntada por el ejecutor de la tarea. | No es equivalente a verificación médica. |
| 17 | `PENDING_VERIFICATION` | En espera de certificación por veterinario tratante. | Exclusivo para tareas clínicas. |
| 18 | `VERIFIED_COMPLETE` | **Cumplimiento certificado:** Tarea formalmente cerrada. | Habilita el Gate de Cierre de continuidad. |
| 19 | `CANCELLED_WITH_AUTHORIZATION`| Compromiso anulado con justificación clínica. | Requiere firma de veterinario activo. |
| 20 | `CLOSED_WITH_DOCUMENTED_OUTCOME`| Cierre excepcional documentado (imposibilidad material). | Justificación mínima de 15 caracteres. |
