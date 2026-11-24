# VET FREEDOM OS — FINANCIAL MESSAGING CONTRACT
## Contrato de Mensajería Financiera, Plantillas y Despacho Seguro (CORE-03)
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Plataforma:** WhatsApp Business Platform API + n8n CORE-03

---

## 1. Políticas de Comunicación Financiera

Las comunicaciones financieras (recordatorios de cobro, recibos de pago, cotizaciones, enlaces de pago) son altamente sensibles. Deben adherirse a directrices estrictas:
1. **Tono Empático y Profesional:** En Vet Life, la salud de las mascotas y la relación de confianza con la familia es primordial. Se prohíben categóricamente términos agresivos, intimidatorios o de cobranza judicial compulsiva.
2. **Ventana de 24 Horas y Plantillas HSM (Meta):**
   - Dentro de la ventana de conversación iniciada por el usuario (24h), se pueden enviar resúmenes detallados y confirmaciones.
   - Fuera de la ventana, solo se permiten plantillas HSM aprobadas por Meta de categoría `UTILITY`.
3. **Safe Mode en Entornos de Desarrollo / QA:**
   - Durante las pruebas, el parámetro `send_enabled: false` bloquea el envío de mensajes reales hacia WhatsApp. Todos los despachos se dirigen a colas simuladas de auditoría.

---

## 2. Catálogo de Plantillas Financieras Oficiales

### A. Plantilla: Solicitud de Pago con Enlace Seguro
- **Nombre Técnico:** `vetlife_payment_request_v1`
- **Categoría:** `UTILITY`
- **Variables:**
  - `{{1}}`: Nombre del tutor.
  - `{{2}}`: Nombre de la mascota.
  - `{{3}}`: Valor a pagar en COP (formateado con separador de miles).
  - `{{4}}`: Enlace seguro de pago efímero.
  - `{{5}}`: Fecha y hora límite de vigencia.

### B. Plantilla: Recibo de Pago Confirmado
- **Nombre Técnico:** `vetlife_payment_receipt_v1`
- **Categoría:** `UTILITY`
- **Variables:**
  - `{{1}}`: Nombre del tutor.
  - `{{2}}`: Valor pagado en COP.
  - `{{3}}`: Referencia de transacción o recibo oficial.
  - `{{4}}`: Enlace de descarga de factura electrónica / recibo en CORE-13.

### C. Plantilla: Reporte de Transferencia Recibida (Aviso de Verificación)
- **Nombre Técnico:** `vetlife_transfer_received_pending_v1`
- **Texto Estándar:** *"Hemos recibido tu comprobante de transferencia. Nuestro equipo administrativo verificará el ingreso en extracto bancario en las próximas horas laborales. ¡Gracias por confiar en Vet Life!"*
