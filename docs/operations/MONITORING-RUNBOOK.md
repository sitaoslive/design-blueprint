# MANUAL OPERATIVO DE SUPERVISIÓN Y RESPUESTA (RUNBOOK) — VET FREEDOM OS
**Módulo:** `VET-CORE-20 | Integration Health Monitoring`  
**Destinatarios:** Dr. Luis Eduardo Ríos (Dirección), Coordinación Veterinaria y Soporte Técnico  

---

## 1. Procedimiento de Diagnóstico Rápido

Cuando el Dr. Luis o Coordinación observen un estado `DEGRADED` o `CRITICAL` en la aplicación móvil Lovable:

1. **Paso 1: Consultar el Encabezado Ejecutivo (`executive_headline_es`)**
   - El sistema resume en lenguaje natural de negocios la afectación: qué componente falló y a qué citas, clientes o profesionales impacta.
2. **Paso 2: Identificar el Rol Asignado (`assigned_role`)**
   - Si es `DIRECTOR`: Requiere decisión del Dr. Luis (aprobación de contingencia, caída de proveedor crítico o brecha de seguridad).
   - Si es `COORDINATOR`: Tareas operativas de agenda, contacto manual a clientes o asignación de citas.
   - Si es `TECH_SUPPORT`: Renovación de credenciales, tokens OAuth de Google Calendar o validación de webhooks.
3. **Paso 3: Verificar Integración con `VET-CORE-19`**
   - Para fallas recuperables (Rate Limit, timeout transitorio), el sistema agenda reintentos con backoff exponencial automáticamente.
   - Para fallas con resultado externo incierto, se crea una tarea en `integration_reconciliation_tasks` para verificar antes de duplicar cobros o mensajes.

---

## 2. Acciones Específicas por Dominio

### A. n8n Cloud no responde (Watchdog Alerta P0)
- **Causa:** Caída del clúster de n8n o expiración de latidos (> 300s).
- **Acción:**
  1. El supervisor independiente en Supabase inserta un incidente P0 en `integration_incidents`.
  2. Los eventos salientes se retienen de forma segura en `public.transactional_outbox` (cero pérdida de datos).
  3. Soporte verifica el panel de n8n Cloud (`https://alphavision.app.n8n.cloud`).
  4. Al restablecerse n8n, el worker ejecuta `claim_outbox_events` y procesa la cola represada en orden cronológico.

### B. WhatsApp Meta API Degradado
- **Causa:** Rate limiting de Meta o webhook no verificado.
- **Acción:**
  1. Se suspenden los envíos no urgentes y se enrutan a `SAFE_RETRY`.
  2. Para citas inmediatas (< 2 horas), Coordinación realiza llamada telefónica directa de contingencia.
  3. No se envían mensajes masivos de prueba a clientes.

### C. Conflicto en Google Calendar
- **Causa:** Modificación manual fuera de Lovable o duplicación de slots.
- **Acción:**
  1. Lovable marca la cita como `CONFLICT_FLAGGED`.
  2. Coordinación recibe alerta para conciliar con el cliente.
  3. No se cancela la cita automáticamente sin autorización médica.
