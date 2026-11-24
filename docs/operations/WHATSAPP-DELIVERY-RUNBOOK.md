# MANUAL DE OPERACIÓN Y DESPACHO WHATSAPP (RUNBOOK VET-CORE-03)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Módulo:** `VET-CORE-03 | WhatsApp Outbound Runbook`  
**Destinatarios:** Operadores de n8n, Equipo de Soporte Técnico y Coordinación de Citas  
**Zona Horaria:** `America/Bogota` (UTC-5)

---

## 1. Procedimiento de Verificación Diaria
Cada inicio de turno de operaciones (07:00 AM COT), el operador debe verificar:
1. **Estado del Workflow en n8n Cloud:** Comprobar que `VET-CORE-03` (`CURcbtf1AsoTNAV6`) se encuentra desplegado y accesible sin errores de configuración.
2. **Cola de Despacho en Supabase:**
   ```sql
   SELECT status, count(*) 
   FROM public.outbound_dispatch_requests 
   WHERE created_at >= now() - interval '24 hours'
   GROUP BY status;
   ```
3. **Mensajes Atascados en `CLAIMED`:** Si existen mensajes en estado `CLAIMED` por más de 5 minutos sin avanzar a `PROVIDER_ACCEPTED` o `FAILED`, indica que un worker perdió conectividad durante la llamada HTTP. Ejecutar el script de rescate:
   ```sql
   UPDATE public.outbound_dispatch_requests
   SET status = 'QUEUED', claimed_by = NULL
   WHERE status = 'CLAIMED' AND claimed_at < now() - interval '5 minutes';
   ```

---

## 2. Tratamiento de Incidencias Operativas

### Caso A: Tutor reporta no haber recibido confirmación de cita
1. Consultar el estado en Supabase mediante el número telefónico:
   ```sql
   SELECT id, status, template_name, provider_message_id, http_status, rejection_reason, created_at
   FROM public.outbound_dispatch_requests
   WHERE recipient_phone = '+573105550199'
   ORDER BY created_at DESC LIMIT 5;
   ```
2. **Si el estado es `CANCELLED_BEREAVEMENT`:** Verificar si la mascota falleció. NO forzar reenvío.
3. **Si el estado es `TEMPLATE_REQUIRED_OUTSIDE_WINDOW`:** La ventana de 24h cerró y se intentó enviar texto libre. Cambiar el despacho a plantilla aprobada `vet_appointment_confirmed`.
4. **Si el estado es `FAILED` con error 131026:** El número de teléfono no está registrado en WhatsApp o el destinatario bloqueó a la clínica. Contactar al tutor por llamada telefónica directa.

### Caso B: Mensaje en estado `RECONCILIATION_REQUIRED`
1. Este estado indica que hubo un timeout de red con Meta Graph API y no se sabe si Meta recibió o no el mensaje.
2. **Acción Prohibida:** NUNCA pulsar "Reintentar envío" inmediatamente, ya que podría duplicar el mensaje en el teléfono del tutor.
3. **Acción Correctiva:** Esperar 5 minutos a la llegada del webhook de recibo de entrega. Si pasados 15 minutos no llega recibo, verificar la API de Meta vía curl antes de reintentar.
