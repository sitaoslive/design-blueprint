# VET FREEDOM OS — DOCUMENT REFERRAL CONTRACT
## Contrato de Paquetes Documentales entre CORE-11 (Specialist Hub) y CORE-13
**Módulo:** VET-CORE-13 | APPROVED DOCUMENT DELIVERY  
**Módulo Emisor:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Bucket de Custodia:** `referral-documents` (Privado, 50MB)  

---

## 1. Alcance y Contexto de la Remisión

Cuando el médico veterinario tratante aprueba una remisión especializada en `VET-CORE-11` (`approve_specialist_referral`), se genera la necesidad clínica de compartir documentación de soporte con el especialista externo (ej. carta de remisión, extracto clínico, electrocardiograma o placas de rayos X previas).

`VET-CORE-13` actúa como el custodio y distribuidor autorizado de dicho paquete documental.

---

## 2. Reglas Estrictas de Acceso para Especialistas Externos

1. **Aislamiento por Remisión:** El especialista externo únicamente recibe permiso de lectura (`READ_DOWNLOAD`) sobre los documentos vinculados a la remisión específica (`referral_id`).
2. **Prohibición de Acceso General:** El especialista no puede explorar el portal Lovable, ni ver otras mascotas del tutor, ni acceder al historial financiero o administrativo de la familia.
3. **Vigencia Acotada a la Consulta:** El token de acceso emitido para el especialista tiene una vigencia máxima de 7 días o hasta que se asiente el informe definitivo en `post_visit_pending_reports`.
4. **Revocación Automática:** Al concluir la interconsulta o ante un cambio de especialista de respaldo (WF3-043), el permiso del especialista anterior se revoca inmediatamente vía `revoke_document_access`.

---

## 3. Estructura del Contrato JSON de Remisión

```json
{
  "referral_id": "ref-1000000-0000-0000-0000-000000000001",
  "specialist_id": "spec-cardio-001",
  "specialty": "CARDIOLOGIA",
  "patient_id": "pet-simba",
  "required_documents": [
    {
      "document_type": "REFERRAL_LETTER",
      "version_id": "ver-ref-letter-001",
      "file_name": "carta_remision_cardiologia_simba.pdf",
      "is_approved": true,
      "approved_by_card": "COMVEZCOL-001"
    },
    {
      "document_type": "LAB_RESULT",
      "version_id": "ver-lab-hemograma-001",
      "file_name": "hemograma_reciente_simba.pdf",
      "is_approved": true,
      "approved_by_card": "COMVEZCOL-001"
    }
  ],
  "authorized_until": "2026-11-28T23:59:59Z"
}
```
