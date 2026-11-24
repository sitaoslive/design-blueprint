# VET FREEDOM OS — RUNBOOK: COLA DE CONCILIACIÓN HUMANA
## Gestión de Tareas en Lovable Control Center, Asignaciones y SLAs

---

### 1. Centro de Control de Conciliación en Lovable UI

Toda discrepancia que requiere criterio médico, operacional o financiero es enrutada automáticamente a la tabla `integration_manual_confirmation_tasks` y visualizada en la interfaz web de Lovable.

- **URL de Acceso**: `/admin/integrations/reconciliation-queue`
- **Filtros Disponibles**: Por Rol (`VETERINARIAN`, `COORDINATOR`, `FINANCE`), por Severidad (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) y por Entidad (`appointment`, `clinical_record`, `payment`, `client`).

---

### 2. Tiempos de Respuesta Máximos (SLAs de Atención)

| Severidad de Tarea | Tipo de Discrepancia | Rol Responsable | SLA Máximo | Acción ante Vencimiento de SLA |
| :--- | :--- | :--- | :--- | :--- |
| `CRITICAL` | Colisión de identidad clínica, sospecha de manipulación de documentos | Dr. Luis Eduardo Ríos | **2 Horas** | Alerta por SMS/llamada prioritaria a coordinación |
| `HIGH` | Cita sin confirmar en OKVET (>24h), fallo de entrega de mensaje a paciente de hoy | Coordinación / Dr. Ríos | **4 Horas** | Escalamiento al canal de contingencia operativa |
| `MEDIUM` | Desfase de horario en Google Calendar, pago reportado sin confirmar extracto | Coordinación / Tesorería | **12 Horas** | Inclusión destacada en el informe matutino (VET-CORE-16) |
| `LOW` | Normalización de datos de perfil, etiquetas secundarias | Coordinación Operativa | **48 Horas** | Cierre automático con valores por defecto auditados |

---

### 3. Procedimiento Operativo de Resolución de Tareas

1. **Abrir Tarea**: El operador hace clic en la tarea en la bandeja de Lovable.
2. **Inspeccionar Evidencia**: Se despliega el comparador visual lado a lado (*diff viewer*) mostrando el estado en Supabase vs el estado en el sistema externo y los snapshots JSONB adjuntos.
3. **Seleccionar Acción**:
   - `APROBAR PROPUESTA`: Confirma la solución sugerida por el motor.
   - `MODIFICAR Y RESOLVER`: El humano ajusta manualmente el valor correcto (ej. asigna el horario real acordado telefónicamente).
   - `DESCARTAR / FALSO POSITIVO`: Cierra la discrepancia con justificación obligatoria.
4. **Firma y Registro**: La acción invoca la función RPC `approve_reconciliation_repair` persistiendo el UUID del usuario, rol y marca de tiempo.
