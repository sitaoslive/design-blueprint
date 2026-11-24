# VET FREEDOM OS — AUTORIZACIÓN Y MATRIZ DE PERMISOS DE CONCILIACIÓN
## Control de Acceso Basado en Roles (RBAC), Permisos RPC y Trazabilidad

---

### 1. Modelo de Autorización y Principio de Menor Privilegio

El acceso al motor de conciliación transversal VET-CORE-18 y a la toma de decisiones sobre discrepancias está regido por un esquema estricto de Control de Acceso Basado en Roles (RBAC).

Se definen cuatro roles operacionales:
1. **Director Médico (Dr. Luis Eduardo Ríos)**:
   - Matrícula profesional COMVET verificada.
   - Autoridad exclusiva sobre discrepancias clínicas, historiales en OKVET, fórmulas médicas y confirmación de procedimientos.
2. **Coordinador Operativo**:
   - Gestión de agenda de visitas domiciliarias, re-agendamiento de horarios en Google Calendar, confirmación de llegadas y resolución de conflictos de asignación.
3. **Responsable Financiero / Tesorería**:
   - Autorización de ajustes en montos recaudados, conciliación de extractos bancarios de Wompi, validación de devoluciones y facturación electrónica DIAN.
4. **Administrador de Sistemas / Automatización**:
   - Monitoreo de salud de conectores, rotación de credenciales API, reintentos de Dead Letter Queue y purga de logs caducados.

---

### 2. Matriz de Autorización por Operación de Conciliación

| Acción / Función RPC | Director Médico | Coordinador Operativo | Responsable Financiero | Admin Sistemas | Agente IA (LLM) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `claim_reconciliation_run` | Permitido | Permitido | Permitido | Permitido | Solo Consulta |
| `match_external_identity` | Permitido | Permitido | Permitido | Permitido | Solo Lectura |
| `classify_reconciliation_discrepancy`| Permitido | Permitido | Permitido | Permitido | Sugerir |
| `propose_safe_repair` | Permitido | Permitido | Permitido | Permitido | Sugerir |
| `approve_reconciliation_repair` (Clínico)| **Exclusivo** | **BLOQUEADO** | **BLOQUEADO** | **BLOQUEADO** | **PROHIBIDO** |
| `approve_reconciliation_repair` (Agenda)| Permitido | **Permitido** | **BLOQUEADO** | Permitido | **PROHIBIDO** |
| `approve_reconciliation_repair` (Finanzas)| Permitido | **BLOQUEADO** | **Permitido** | **BLOQUEADO** | **PROHIBIDO** |
| `execute_authorized_safe_repair`| Automático | Automático | Automático | Automático | Solo Ejecutor |
| `verify_reconciliation_result` | Permitido | Permitido | Permitido | Permitido | Solo Verificador |

---

### 3. Protección de las Funciones RPC (`SECURITY DEFINER`)

Para mitigar riesgos de elevación de privilegios (*privilege escalation*):
1. **Revocación Global**:
   ```sql
   REVOKE EXECUTE ON FUNCTION claim_reconciliation_run FROM PUBLIC, anon;
   REVOKE EXECUTE ON FUNCTION approve_reconciliation_repair FROM PUBLIC, anon;
   -- (Aplicado a las 8 funciones RPC)
   ```
2. **Concesión Explícita**:
   Solo los roles `authenticated` y `service_role` pueden invocar estas funciones.
3. **Verificación de Rol en Runtime**:
   La función `approve_reconciliation_repair` valida en tiempo de ejecución que el usuario ejecutor posea la membresía activa requerida en `user_organization_memberships` y que su rol sea compatible con la categoría de la propuesta antes de escribir la aprobación.
