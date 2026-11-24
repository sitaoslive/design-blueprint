# VET FREEDOM OS — PAYMENT PROVIDER CONTRACT
## Contrato de Integración con Pasarelas de Pago Autorizadas (Wompi, Bold, PSE, Mercado Pago)
**Módulo:** VET-CORE-14 | FINANCIAL NOTIFICATIONS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Plataformas:** Wompi API v1, Bold API, PSE Colombia, Mercado Pago Checkout Pro

---

## 1. Alcance de los Proveedores de Pago

Vet Freedom OS integra las principales pasarelas habilitadas para el mercado colombiano bajo estándares de seguridad PCI-DSS Nivel 1 delegados:

| Proveedor | Métodos Soportados | Casos de Uso en Vet Life |
|---|---|---|
| **Wompi (Bancolombia)** | Tarjetas Crédito/Débito, Botón Bancolombia, Nequi QR, PSE | Cobro en línea principal, enlaces de pago en WhatsApp |
| **Bold** | Datáfonos móviles (Link de pago Bold, Tarjetas chip/contactless) | Recaudo por veterinarios en visita domiciliaria |
| **PSE (ACH Colombia)** | Débito bancario en línea directo | Servicios clínicos de alto valor, cirugías, hospitalizaciones |
| **Mercado Pago** | Tarjetas, Dinero en cuenta MP, Efecty | Pagos en línea secundarios y planes preventivos |

---

## 2. Contrato de Generación de Enlace de Pago (`Payment Link Request`)

### Endpoint Interno: `POST /api/financial/payment-links`
Headers requeridos:
- `Authorization: Bearer <SUPABASE_JWT_STAFF>`
- `X-Idempotency-Key: <UUID>`

### Payload de Solicitud (JSON):
```json
{
  "payment_request_id": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  "provider": "WOMPI",
  "amount_in_cents": 15000000,
  "currency": "COP",
  "customer_data": {
    "full_name": "Carlos Rodríguez",
    "email": "carlos.rodriguez@ejemplo.com",
    "phone_number": "+573001234567"
  },
  "redirect_url": "https://vetlife.app/checkout/completed",
  "expiration_minutes": 1440
}
```

### Respuesta del Proveedor (JSON):
```json
{
  "provider": "WOMPI",
  "payment_link_id": "link_sandbox_abc123",
  "checkout_url": "https://checkout.wompi.co/l/link_sandbox_abc123",
  "status": "ACTIVE",
  "expires_at": "2026-11-22T10:00:00Z"
}
```
