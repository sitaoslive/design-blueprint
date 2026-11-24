# VET FREEDOM OS — POST-VISIT PROMISE TRACKING RUNBOOK
## Detección, Clasificación, Validación y Seguimiento de Promesas al Cliente
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS & CONTINUITY HUB  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tabla Principal:** `public.post_visit_customer_promises`  

---

## 1. El Concepto de Promesa al Cliente en Vet Life

En la atención veterinaria a domicilio, la relación de confianza entre el tutor y el equipo médico depende directamente de cumplir los compromisos verbales adquiridos durante la visita (ej. "te envío la orden del laboratorio hoy a las 5:00 PM", "te contacto el jueves por la mañana para evaluar la respuesta al antibiótico", "cotizamos el ecocardiograma con la especialista y te pasamos los horarios").

El subsistema de seguimiento de promesas captura estas afirmaciones, previene que queden en el olvido y garantiza que se gestionen con la debida rigurosidad operativa y clínica.

---

## 2. Taxonomía de Procedencia de la Fuente (WFX-005 / WFX-006)

Cada compromiso o promesa capturada en el sistema recibe una etiqueta inmutable de procedencia:

| Estado de Procedencia | Significado Operativo | Acción Permitida |
|---|---|---|
| `VERIFIED` | Creado o ratificado directamente por el médico veterinario tratante con tarjeta profesional. | Puede generar tareas operativas y notificaciones activas. |
| `REPORTED` | Reportado por personal administrativo, recepcionista o cuidador del paciente. | Requiere validación del veterinario si implica actos clínicos. |
| `INFERRED` | Extraído automáticamente por modelos de IA a partir de notas de voz o transcripciones de la visita. | **BLOQUEADO.** Requiere validación humana obligatoria antes de cualquier despacho. |
| `PENDING_CONFIRMATION` | En espera de respuesta o confirmación de fecha/hora por parte de un tercero (laboratorio/especialista). | Monitoreado con recordatorios internos sin comprometer fecha final al tutor. |
| `STALE` | Compromiso desactualizado o sustituido por una nueva indicación médica v2. | Archivado con registro de reemplazo. |
| `CONFLICTING` | Compromiso que contradice una directriz clínica oficial, el horario de atención o el protocolo médico. | Escalamiento inmediato a Dirección Médica. |

---

## 3. Salvaguarda Anti-Alucinación de IA (WFX-009)

Para proteger la integridad médica y evitar falsas expectativas al cliente:

1. **Aislamiento Total de Sugerencias de IA:**
   - Toda sugerencia extraída por IA se almacena en `post_visit_customer_promises` con `source_provenance = 'INFERRED'` y `human_validated = false`.
   - El motor de n8n evalúa esta condición: si `human_validated = false`, la tarea se descarta del ciclo de despachos a WhatsApp y se coloca en la bandeja de revisión del Dr. Luis en la interfaz de Lovable.
2. **Prohibición de Promesas Clínicas por IA:**
   - La IA tiene prohibido inferir ajustes de dosis, sustitución de medicamentos o diagnósticos no formulados explícitamente por el veterinario colegiado.
3. **Aprobación en Un Clic:**
   - El veterinario revisa en Lovable las promesas sugeridas y puede:
     - **Aprobar:** Transiciona a `VERIFIED` y `human_validated = true`.
     - **Editar:** Modifica plazos o contenido clínico y valida.
     - **Rechazar:** Elimina la promesa y registra el motivo del rechazo en auditoría.
