# VET FREEDOM OS — DOCUMENT DELETION & PURGE PROTOCOL
## Procedimiento Operativo Estándar (SOP): Solicitudes de Eliminación, Habeas Data y Expurgo Certificado

**Proyecto:** VET FREEDOM OS  
**Módulo:** `VET-CORE-13`  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Marco Legal:** Ley 1581 de 2012 (Derecho de Supresión / Habeas Data), Conflicto con Ley 576 de 2000

---

## 1. El Conflicto Jurídico: Habeas Data vs. Custodia de Historias Clínicas

Una de las situaciones legales más complejas en salud veterinaria surge cuando un tutor ejerce su derecho constitucional de Habeas Data exigiendo:  
*"Eliminen todos mis datos y los registros de mis mascotas de sus sistemas"*.

### Doctrina Jurídica Aplicada por Vet Freedom OS:
1. **Datos de Contacto y Comerciales (Supresión Procedente):** Los números de teléfono, correos y preferencias comerciales pueden y deben ser suprimidos o desvinculados de inmediato de las listas de mensajería activa.
2. **Historia Clínica y Actos Médicos (Custodia Obligatoria Prevalente):** Conforme al **Artículo 35 de la Ley 576 de 2000**, el médico veterinario tiene el deber legal y ético de conservar la historia clínica como prueba de la atención y medio de defensa profesional. La solicitud de eliminación de la historia clínica es **improcedente por mandato de ley** durante el periodo mínimo de 20 años.
3. **Solución Técnica:** Se aplica **Anonimización / Disociación de Datos**. Se reemplaza el nombre del cliente y dirección por identificadores opacos desvinculados, preservando el acto médico inmutable para cumplimiento ante COMVEZCOL y autoridades sanitarias.

---

## 2. Flujo de Solicitud y Aprobación de Eliminación

```mermaid
sequenceDiagram
    autonumber
    participant Tutor as Tutor / Titular del Dato
    participant Admin as Panel Lovable (Admin)
    participant RPC as Supabase (document_deletion_requests)
    participant Vet as Dr. Luis Eduardo Ríos (Comité Médico)
    participant Storage as Supabase Storage Bucket

    Tutor->>Admin: Radica solicitud de supresión de datos / documentos
    Admin->>RPC: Registra document_deletion_requests (status = 'PENDING_REVIEW')
    RPC->>Vet: Alerta de revisión legal obligatoria
    
    Note over Vet: Evaluación de Tipo de Documento y Retención Legal
    alt Documento Clínico dentro de los 20 Años de Custodia
        Vet->>RPC: Rechaza eliminación física; Autoriza Disociación (ANONYMIZED)
        RPC-->>Tutor: Notificación legal: "Custodia obligatoria Ley 576; datos disociados"
    else Documento Administrativo o Borrador No Aprobado
        Vet->>RPC: Aprueba eliminación física (APPROVED_FOR_PURGE)
        RPC->>Storage: Purga física del binario en el bucket privado
        RPC->>RPC: Marca document_versions status = 'DELETED'
        RPC-->>Tutor: Confirmación de eliminación certificada
    end
```

---

## 3. Destrucción Certificada de Binarios

Cuando la eliminación de un archivo es autorizada legítimamente (ej. un archivo corrupto, un borrador obsoleto o un documento administrativo que superó su retención):
1. **Borrado Seguro del Objeto en Storage:** Se ejecuta la API de Supabase Storage para eliminar el blob binario físico del bucket privado.
2. **Sello de Destrucción en Auditoría:** El registro en `document_audit` almacena:
   - Identificador del documento y hash SHA-256 del archivo destruido.
   - Identidad del aprobador (Dr. Luis Ríos).
   - Motivo legal de la destrucción.
   - Fecha y hora exacta de la purga.
3. **Cero Retención Residual:** Se purgan las copias en CDN y se verifica que los punteros apunten a estado `DELETED`.
