# VET FREEDOM OS — PAYMENT DATA PROTECTION
## Protección de Datos Financieros, Cumplimiento PCI-DSS y Privacidad de la Información
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Normativas:** Ley 1581 de 2012 (Habeas Data Colombia), PCI-DSS SAQ A

---

## 1. Postura Frente a Datos de Tarjetas de Crédito y Débito

Vet Freedom OS opera bajo el estándar **PCI-DSS SAQ A** (Self-Assessment Questionnaire A):
- **Cero Tránsito de Números de Tarjeta (PAN):** Ni un solo byte de números de tarjeta de 16 dígitos transita por los servidores de Vet Life, n8n o la base de datos de Supabase.
- **Cero Almacenamiento de Códigos de Seguridad (CVV/CVC):** El código de verificación de tres o cuatro dígitos nunca se recibe ni se solicita en interfaces desarrolladas internamente.
- **Campos Prohibidos en Base de Datos:** Queda expresamente prohibido agregar columnas de tipo tarjeta, fecha de vencimiento o códigos de verificación en esquemas relacionales.
- **Uso Exclusivo de Pasarelas Tokenizadas:** Todo procesamiento con tarjeta se realiza mediante iframes seguros o redirección a los dominios autorizados de Wompi, Bold o Mercado Pago.

---

## 2. Protección de Comprobantes Bancarios (Habeas Data)

Los comprobantes de transferencia (capturas de Nequi, Daviplata o Bancolombia) contienen información financiera de los tutores (números de cuenta parciales, nombres, saldos):
1. **Almacenamiento Cifrado y Privado:** Las imágenes se guardan exclusivamente en el bucket privado de Supabase Storage `financial-vouchers/` con acceso restringido por RLS.
2. **URLs Firmadas Efímeras:** El personal administrativo accede a la imagen para el cotejo con extracto únicamente mediante URLs firmadas con expiración de 15 minutos.
3. **No Indexación ni Caché Pública:** Las cabeceras `Cache-Control: private, no-store` impiden el almacenamiento en servidores proxy públicos.

---

## 3. Prevención de Ataques y Fraude Financiero

- **Inspección de Firmas HMAC:** Todos los webhooks de pasarelas se firman con HMAC-SHA256 y secreto compartido de alta entropía.
- **Auditoría Inmutable:** Cada intento de modificación sobre montos o estados financieros genera una traza en `financial_audit_events` con IP de origen, usuario y estado previo/posterior.
- **Prohibición de IA en Ejecución Financiera:** Los modelos de Inteligencia Artificial tienen prohibido emitir reembolsos, modificar estados a `PAID` o liquidar deudas de forma autónoma.
