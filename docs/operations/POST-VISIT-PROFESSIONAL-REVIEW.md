# VET FREEDOM OS — PROFESSIONAL VETERINARY REVIEW RUNBOOK
## Protocolo de Firma, Responsabilidad Legal y Criterio Médico en la Continuidad
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS & CONTINUITY HUB  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Marco Regulatorio:** Consejo Profesional de Medicina Veterinaria y de Zootecnia de Colombia (COMVEZCOL) - Ley 576 de 2000  

---

## 1. Principio Fundamental de Responsabilidad Médica

En Vet Freedom OS, ninguna automatización, modelo de lenguaje artificial ni operador administrativo tiene atribuciones para emitir juicios clínicos, interpretar exámenes de laboratorio, recetar fármacos ni dar de alta a un paciente. 

El cierre clínico y la validación de resultados post-visita son actos médicos veterinarios personalísimos, indelegables y protegidos por la Ley 576 de 2000 de la República de Colombia.

---

## 2. Límites Estrictos de Roles

| Rol | Alcance Permitido | Acciones Estrictamente Prohibidas |
|---|---|---|
| **Inteligencia Artificial (n8n LLM)** | Detección preliminar de promesas, transcripción de notas de voz, formateo de recordatorios. | Diagnosticar, sugerir medicamentos, emitir recetas, interpretar valores analíticos, prometer plazos sin validación. |
| **Personal Administrativo / Asistencial** | Seguimiento de pagos, coordinación logística de rutas, recepción de PDFs de laboratorios externos. | Emitir opiniones sobre resultados, indicar cambios de posología al tutor, exonerar compromisos médicos. |
| **Médico Veterinario Colegiado (Dr. Luis / Staff Médico)** | Interpretación clínica de exámenes, formulación médica, firma de revisiones, exoneración clínica, cierre de continuidad. | N/A (Responsabilidad profesional plena). |

---

## 3. Protocolo de Revisión Profesional de Informes

Cuando un resultado de laboratorio o informe de especialista ingresa al sistema (`RECEIVED_AWAITING_REVIEW`):

1. **Notificación Médica Prioritaria:** La interfaz de Lovable presenta la ficha del paciente con el nuevo informe destacado en color ámbar.
2. **Inspección de Constantes y Hallazgos:** El médico veterinario compara los valores analíticos con el cuadro clínico observado en la visita domiciliaria.
3. **Determinación del Plan de Acción:**
   - **Normal / Sin Cambios:** Se ratifica el tratamiento vigente.
   - **Patológico / Requiere Ajuste:** Se redacta nueva formulación o remisión complementaria en Supabase.
4. **Firma Digital y Registro:** El profesional introduce sus notas de revisión y confirma su tarjeta profesional COMVEZCOL. El informe pasa a `REVIEWED_BY_VET`.
5. **Comunicación al Tutor:** Se habilita la preparación de la comunicación estructurada al cliente (vía CORE-03), explicada en lenguaje claro y comprensible sin generar pánico.
