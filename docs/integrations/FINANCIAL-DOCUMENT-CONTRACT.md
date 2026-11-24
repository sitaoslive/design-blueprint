# VET FREEDOM OS — FINANCIAL DOCUMENT CONTRACT
## Contrato de Integración Documental con Facturación Electrónica DIAN y CORE-13
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Plataforma:** Proveedor Tecnológico DIAN + Supabase Storage Privado + CORE-13

---

## 1. Integración con el Sistema de Facturación Electrónica

Vet Life cumple con la normatividad fiscal de la Dirección de Impuestos y Aduanas Nacionales (DIAN) de Colombia para servicios veterinarios y venta de insumos.

### Flujo de Emisión Fiscal:
1. Una vez confirmado el pago o generada la obligación, el backend invoca el servicio de facturación electrónica autorizado.
2. El proveedor valida la estructura XML con el Anexo Técnico vigente de la DIAN.
3. Se obtiene el **Código Único de Factura Electrónica (CUFE)**, el código QR y la fecha/hora oficial de firma digital.
4. El PDF de la factura electrónica (`Representación Gráfica`) y el XML firmado se archivan en el bucket privado de Supabase Storage: `financial-invoices/<owner_id>/<invoice_id>.pdf`.

---

## 2. Contrato de Intercambio con VET-CORE-13 (Approved Document Delivery)

La entrega de documentos financieros a clientes y tutores se delega íntegramente a `VET-CORE-13`:

```json
{
  "source_module": "VET-CORE-14",
  "document_type": "INVOICE",
  "document_metadata": {
    "invoice_id": "inv_12345",
    "invoice_number": "FE-000452",
    "cufe": "a1b2c3d4e5f6...cufe...7890",
    "total_amount": 250000.00,
    "currency": "COP"
  },
  "recipient": {
    "owner_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "phone": "+573001234567",
    "email": "tutor@ejemplo.com"
  },
  "storage_path": "financial-invoices/9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d/inv_12345.pdf",
  "link_expiration_hours": 24
}
```

- CORE-13 genera un enlace seguro de 24 horas y valida que el tutor mantenga parentesco activo con el paciente antes de servir el archivo.
