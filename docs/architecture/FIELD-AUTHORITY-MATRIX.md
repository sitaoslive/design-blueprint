# VET FREEDOM OS — MATRIZ DE AUTORIDAD POR CAMPO
## Single Source of Truth (SSOT) y Gobernanza de Datos por Dominio

---

### 1. Principio Fundamental: Prohibición de "Latest Timestamp Wins"

En sistemas asíncronos distribuidos, la estrategia simplista de resolver discrepancias adoptando el registro con la marca de tiempo más reciente (`latest_timestamp_wins`) es **catastrófica** en operaciones veterinarias y comerciales.
- Una actualización en Google Calendar realizada por un tercero no puede anular una cita confirmada con anticipo pagado en Supabase.
- Un cambio de texto en un mensaje de WhatsApp no puede modificar la fórmula médica emitida por el Dr. Ríos.
- Un retraso en la recepción de un webhook no puede revertir una historia clínica aprobada en OKVET.

Por tanto, **VET FREEDOM OS** establece una **Matriz de Autoridad Estricta por Dominio**, codificada en la tabla `integration_sync_policies` y validada por el motor de conciliación VET-CORE-18.

---

### 2. Matriz Canónica de Autoridad por Entidad y Campo

| Entidad / Dominio | Campo(s) Específico(s) | Sistema Autoridad Primaria | Sistemas Secundarios / Espejos | Política de Sincronización | Procedimiento ante Discrepancia |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Historia Clínica** | Diagnósticos, Fórmulas, Dosis, Procedimientos, Signos Vitales | **OKVET** | Supabase (Copia de consulta asistida) | `READ_ONLY` / `MANUAL_IMPORT_ONLY` | OKVET prevalece siempre. Discrepancia en Supabase se corrige para igualar OKVET previa revisión médica. |
| **Cita Domiciliaria** | Estado (`confirmed`, `in_route`, `completed`), Dirección, Tarifa | **Supabase** | Google Calendar, n8n, Lovable UI | `BIDIRECTIONAL_AUTHORIZED` | Supabase prevalece. Evento en Google Calendar se ajusta a Supabase; cambios en Google disparan propuesta de re-agendamiento. |
| **Agenda Personal** | Bloques personales del médico, Bloqueos de almuerzo / congresos | **Google Calendar** | Supabase (Bloqueos de disponibilidad) | `READ_ONLY` desde Google | Google Calendar bloquea slots en Supabase; Supabase jamás borra eventos privados del Dr. Ríos. |
| **Comunicaciones** | Estado de entrega (`sent`, `delivered`, `read`, `failed`), Message ID | **WhatsApp / Meta** | Supabase `messages` / Outbox | `EVENT_DRIVEN` (Webhooks) | Recibo de Meta es la verdad de entrega. Falla de entrega no cancela citas en Supabase; genera tarea humana. |
| **Transacciones** | Referencia de pago, Estado (`APPROVED`, `DECLINED`), Monto verificado | **Wompi / Banco** | Supabase `payment_transactions` | `EVENT_DRIVEN` + `PERIODIC_RECONCILIATION` | Estado de pasarela manda. Si cliente afirma pago sin confirmación bancaria, se mantiene en revisión (`UNDER_REVIEW`). |
| **Facturación Fiscal** | Número de factura electrónica, CUFE, Estado ante la DIAN | **DIAN / Facturador** | Supabase `invoices` | `READ_ONLY` / `MANUAL_IMPORT_ONLY` | Prevalece la DIAN. Facturas borrador en Supabase no tienen valor fiscal hasta contar con CUFE radicado. |
| **Interconsultas** | Horario especialista externo, Cupo confirmado, Tarifa especialista | **Especialista Externo** | Supabase `specialist_referrals` | `MANUAL_CONFIRMATION` | Selección de tutor no confirma automáticamente. Requiere confirmación expresa del especialista externo. |
| **Cuidadores / Permisos** | Tutores autorizados, Cuidadores temporales, Revocación de acceso | **Supabase** | Lovable UI, Supabase Storage Auth | `WRITE_ONLY` / `STRICT_ENFORCEMENT` | Supabase es autoridad absoluta. Cuidador revocado pierde acceso inmediatamente sin posibilidad de restauración secundaria. |
| **Compromisos Post-Visita** | Lista de tareas, Responsable, Evidencia documental requerida | **Supabase** | n8n, Tareas operativas Lovable | `EVENT_DRIVEN` | Supabase es autoridad absoluta. Ningún compromiso se cierra sin evidencia documental verificada. |

---

### 3. Reglas de Resolución de Conflictos

1. **Conflicto Clínico**:
   Si un campo clínico en Supabase difiere del registro en OKVET:
   - Se marca inmediatamente con severidad `HIGH`.
   - Se congela la sincronización automática de ese paciente.
   - Se crea una tarea de confirmación manual exclusiva para el Dr. Luis Eduardo Ríos.
2. **Conflicto de Horario de Cita**:
   Si el horario de una cita en Google Calendar difiere del fijado en Supabase:
   - Supabase es la verdad operacional.
   - Si la diferencia fue introducida en Google Calendar dentro del periodo de gracia (15 min), se evalúa si fue una modificación consciente del médico.
   - No se mueve la cita automáticamente en Supabase; se genera una propuesta de re-agendamiento (`SAFE_REPAIR_PROPOSED`) o alerta al coordinador.
3. **Conflicto Financiero**:
   Si un tutor reporta haber transferido el pago pero Wompi o el extracto bancario no registran el ingreso:
   - La cita NO se marca como `PAID`.
   - Se clasifica como discrepancia `FINANCIAL_UNCONFIRMED_PAYMENT`.
   - Se asigna tarea al rol de tesorería/coordinación para verificar el soporte consignado.
4. **Conflicto de Identidad de Pacientes**:
   Si dos pacientes comparten nombre (ej. "Luna"), raza similar o tutor con el mismo número de teléfono:
   - Jamás se fusionan registros (`MERGE_BLOCKED`).
   - Se exige documento de identidad del tutor y número de microchip / número de historia clínica OKVET para desambiguación formal.
