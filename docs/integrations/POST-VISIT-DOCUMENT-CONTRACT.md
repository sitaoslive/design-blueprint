# VET FREEDOM OS — POST-VISIT DOCUMENT CONTRACT
## Especificación de Intercambio Documental entre Continuidad (CORE-12) y Entrega Segura (CORE-13)
**Módulos:** VET-CORE-12 & VET-CORE-13  
**Dirección Médica:** Dr. Luis Eduardo Ríos  

---

## 1. Ciclo de Vida del Documento Pendiente

```mermaid
sequenceDiagram
    participant Vet as Veterinario Domiciliario
    participant Core12 as Hub Continuidad (CORE-12)
    participant Core13 as Entrega Segura (CORE-13)
    participant Client as Tutor del Paciente

    Vet->>Core12: Registra Documento Pendiente (post_visit_pending_documents)
    Core12->>Vet: Alerta de Preparación y Firma
    Vet->>Core12: Carga Documento y lo Aprueba (APPROVED)
    Core12->>Core13: Solicita Entrega Segura con Token Temporal
    Core13->>Client: Entrega Notificación con Enlace Seguro
    Client->>Core13: Descarga Documento (Auditoría IP/Timestamp)
    Core13->>Core12: Reporta Entrega Confirmada (SHARED_SECURELY)
    Core12->>Core12: Marca Compromiso como Cumplido
```

---

## 2. Invariantes de Seguridad Documental

1. **Prohibición de Entrega de Borradores:** Ningún documento en estado `REQUESTED`, `PREPARED` o `PENDING_APPROVAL` puede ser remitido a CORE-13 para entrega.
2. **Bucket Privado:** Los documentos residen en `referral-documents` o `medical-records` con acceso público estrictamente bloqueado.
3. **Cero Suposiciones de Entrega:** El simple almacenamiento del archivo en Supabase **nunca** equivale a documento entregado. Se requiere confirmación de despacho por CORE-13.
