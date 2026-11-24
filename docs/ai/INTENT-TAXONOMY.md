# TAXONOMÍA DE INTENCIONES CONVERSACIONALES
## VET FREEDOM OS — Clasificación Semántica Oficial (VET-CORE-02)
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Total de Categorías:** 22 Clases de Intención  
**Criterio de Resolución:** Jerarquía Determinista de Precedencia

---

## 1. TABLA DE TAXONOMÍA DE INTENCIONES

| ID | Código de Intención | Prioridad | Nivel de Triage | Cola de Enrutamiento | Descripción / Ejemplos |
|---|---|---|---|---|---|
| **01** | `EMERGENCY_TRIAGE` | CRITICAL (P0) | EMERGENCY_IMMEDIATE | `CLINICAL_EMERGENCY_QUEUE` | Convulsiones, ahogo, hemorragias, atropellamiento, veneno. |
| **02** | `SECURITY_ALERT` | HIGH | SECURITY_QUARANTINE | `SECURITY_QUARANTINE` | Intentos de prompt injection, evasión de directivas, jailbreak. |
| **03** | `CAREGIVER_REVOKED` | HIGH | AUTHORIZATION_REVOKED | `HUMAN_SUPPORT_QUEUE` | Cuidador con permiso revocado intenta consultar historia médica. |
| **04** | `HUMAN_HANDOFF_REQUEST` | HIGH | HUMAN_ASSISTANCE_REQUEST | `HUMAN_SUPPORT_QUEUE` | "Quiero hablar con una persona", "asesor humano". |
| **05** | `PET_BEREAVEMENT_ALERT` | HIGH | SENSITIVE_CARE | `HUMAN_SUPPORT_QUEUE` | Fallecimiento de la mascota, notificación de pérdida, eutanasia. |
| **06** | `MEDICATION_DOSAGE_REQUEST`| HIGH | SAFETY_REFUSAL | `HUMAN_SUPPORT_QUEUE` | Consulta de dosis o mg de medicamentos (Rechazo clínico por IA). |
| **07** | `IMAGE_DIAGNOSIS_REQUEST` | HIGH | SAFETY_REFUSAL | `HUMAN_SUPPORT_QUEUE` | Envío de fotos pidiendo diagnóstico de lesiones o afecciones. |
| **08** | `MEDICATION_CHANGE_REQUEST`| HIGH | SAFETY_REFUSAL | `HUMAN_SUPPORT_QUEUE` | Modificación de fármacos o administración de analgésicos humanos. |
| **09** | `CLIENT_COMPLAINT` | HIGH | ESCALATED_SERVICE_ISSUE | `HUMAN_SUPPORT_QUEUE` | Reclamos por demoras, inconformidad en el servicio, quejas formales. |
| **10** | `CLIENT_FRUSTRATION` | HIGH | EMOTIONAL_ATTENTION | `HUMAN_SUPPORT_QUEUE` | Lenguaje de molestia o impaciencia severa. |
| **11** | `APPOINTMENT_MODIFICATION`| HIGH | MODIFICATION_REQUEST | `HUMAN_SUPPORT_QUEUE` | Cancelar, reprogramar, aplazar o cambiar fecha de cita. |
| **12** | `APPOINTMENT_REQUEST` | HIGH | SCHEDULE_REQUEST | `AI_ASSISTANT_PIPELINE` | Solicitud de agendamiento de cita veterinaria domiciliaria. |
| **13** | `APPOINTMENT_STATUS_QUERY`| MEDIUM | INFORMATION | `AI_ASSISTANT_PIPELINE` | Consulta de hora o estado de cita ya programada. |
| **14** | `PRICE_INQUIRY` | MEDIUM | INFORMATION | `AI_ASSISTANT_PIPELINE` | Consulta de tarifas y precios de consultas o vacunas. |
| **15** | `COVERAGE_INQUIRY` | MEDIUM | INFORMATION | `AI_ASSISTANT_PIPELINE` | Consulta sobre perímetros de atención y cobertura barrial/municipal. |
| **16** | `SERVICES_INQUIRY` | LOW | INFORMATION | `AI_ASSISTANT_PIPELINE` | Portafolio de servicios médicos veterinarios ofrecidos a domicilio. |
| **17** | `PREVENTIVE_FOLLOWUP` | MEDIUM | CLINICAL_FOLLOWUP | `AI_ASSISTANT_PIPELINE` | Recordatorios de vacunas, desparasitación o posoperatorio. |
| **18** | `CONSENT_REVOCATION` | MEDIUM | LEGAL_COMPLIANCE | `AI_ASSISTANT_PIPELINE` | Solicitudes de Habeas Data, opt-out de mensajes promocionales. |
| **19** | `GREETING` | LOW | ROUTINE | `AI_ASSISTANT_PIPELINE` | "Hola", "Buenos días", saludos iniciales de apertura. |
| **20** | `AMBIGUOUS_QUERY` | LOW | ROUTINE | `AI_ASSISTANT_PIPELINE` | Mensajes monosilábicos, signos de interrogación o imprecisos. |
| **21** | `STATUS_RECEIPT` | LOW | STATUS_NOTIFICATION | `STATUS_RECEIPT` | Recibos técnicos de entrega del proveedor Meta (sent, delivered, read). |
| **22** | `UNKNOWN_EVENT` | LOW | TECHNICAL_FALLBACK | `AI_ASSISTANT_PIPELINE` | Tipos de mensaje no soportados (stickers, contactos vCard). |

---

## 2. REGLAS DE PRECEDENCIA Y DESAMBIGUACIÓN
1. **Regla de Emergencia Soberana:** La presencia de cualquier término de alarma médica sobrepasa cualquier otra intención y bloquea la IA de inmediato.
2. **Regla de Cancelación sobre Agendamiento:** Solicitudes que contengan palabras de modificación/cancelación se evalúan antes de las de agendamiento para evitar registrar nuevas citas erróneas.
3. **Regla Comercial Combinada:** Cuando un mensaje solicita precio y a la vez pide cita, predomina `APPOINTMENT_REQUEST` para avanzar en el embudo comercial.
