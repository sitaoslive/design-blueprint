# VET FREEDOM OS — INVOICING REQUIREMENTS RUNBOOK
## Requisitos Normativos de Facturación Electrónica DIAN y Emisión de Notas Crédito
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Marco Legal:** Resolución DIAN 000042 de 2020 y Anexo Técnico vigente

---

## 1. Campos Obligatorios de la Factura Electrónica de Venta

Cada registro emitido en `financial_invoices` debe contener la información requerida por la legislación tributaria colombiana:
1. **Identificación del Emisor:** Razón social, NIT, régimen tributario de Vet Life.
2. **Identificación del Adquirente:** Nombres y apellidos del tutor, tipo y número de documento (Cédula de Ciudadanía, Cédula de Extranjería, NIT, o Consumidor Final `222222222222`), dirección y correo electrónico.
3. **Numeración Consecutiva Autorizada:** Prefijo y rango autorizado por la resolución DIAN vigente.
4. **Discriminación de Bienes y Servicios:** Servicios profesionales veterinarios (excluidos/gravados según normativa), medicamentos e insumos con tarifa de IVA correspondiente.
5. **Código Único de Factura Electrónica (CUFE):** Cadena alfanumérica generada por el algoritmo SHA-384 reglamentario.
6. **Código Bidimensional (QR):** Para verificación instantánea en el portal de la DIAN.

---

## 2. Emisión de Notas Crédito y Ajustes

- Una factura electrónica validada por la DIAN **nunca se elimina ni se sobreescribe**.
- Para correcciones de montos, anulaciones o devoluciones, se emite una **Nota Crédito Electrónica** vinculada al CUFE de la factura original (`financial_credit_notes`).
- Requiere autorización formal del Administrador Financiero o Dr. Luis Eduardo Ríos.
