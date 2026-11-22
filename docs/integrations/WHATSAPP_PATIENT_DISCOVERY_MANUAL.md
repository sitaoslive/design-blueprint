# MANUAL OPERATIVO Y TÉCNICO: MOTOR DE DESCUBRIMIENTO DE PACIENTES WHATSAPP Y CONCILIACIÓN OKVET
## VET FREEDOM OS — PROMPT 18 (VERSIÓN 18.0)
### Dirección Médica: Dr. Luis Eduardo Ríos | Dirección Estratégica: Alpha Vision Method
### Fecha de Certificación: 22 de Noviembre de 2026

---

## 1. RESUMEN EJECUTIVO

El **Motor de Descubrimiento de Pacientes WhatsApp y Conciliación OKVET** (`WA-PATIENT-05D`) es un sistema inteligente, auditable y seguro diseñado para Vet Life — Veterinaria a Domicilio. Su objetivo es detectar pacientes caninos mencionados en conversaciones comerciales autorizadas de WhatsApp que no figuren en los registros clínicos oficiales de OKVET Cloud, presentando un resumen consolidado al Dr. Luis Eduardo Ríos cada 5 días para su revisión y decisión humana.

El motor **nunca** crea pacientes clínicos automáticamente ni diagnostica con IA; actúa como un radar operativo de alta precisión que protege los ingresos de la clínica, garantiza la continuidad de la atención médica veterinaria y asiste al equipo de recepción en la regularización formal de historias clínicas.

---

## 2. REGLAS DE ORO IRRENUNCIABLES

1. **Sin Creación Desatendida de Pacientes:** La inteligencia artificial y las automatizaciones tienen prohibido crear o modificar pacientes o historias clínicas en OKVET Cloud sin la aprobación explícita y humana del Dr. Luis Eduardo Ríos.
2. **Sin Scraping ni Acceso a Cuentas Personales:** Solo se ingieren mensajes provenientes de la WhatsApp Cloud API comercial autorizada o archivos de exportación de chat (`.txt` o `.zip`) provistos explícitamente por el equipo.
3. **Protección ante Datos OKVET Desactualizados (Regla de los 5 Días):** Si el último snapshot exportado de OKVET supera los 5 días de antigüedad o está marcado como obsoleto (`is_stale = true`), el sistema jamás afirmará que un paciente "no está registrado". En su lugar, emitirá el estado `OKVET_SNAPSHOT_STALE` (`NOT_VERIFIABLE_AGAINST_CURRENT_OKVET_DATA`).
4. **Regla Anti-Homónimos:** Nunca se fusionan ni descartan pacientes por simple coincidencia de nombre (ej. "Luna" o "Max"). Dos perros con el mismo nombre y diferentes números de teléfono se tratan rigurosamente como pacientes independientes.
5. **Modo Seguro Activo (`send_enabled: false`):** La automatización no envía mensajes comerciales ni confirmaciones salientes no solicitadas a los clientes sin autorización previa.
6. **Redacción Estricta de Privacidad (PII):** Los fragmentos de chat almacenados como evidencia son sanitizados automáticamente, redactando números de tarjetas, cédulas de ciudadanía colombianas (C.C.), cuentas bancarias (Nequi, Daviplata, Bancolombia) y contraseñas.

---

## 3. ARQUITECTURA GENERAL DEL SISTEMA

El motor opera bajo una arquitectura desacoplada de cinco capas:

```
[ WhatsApp Cloud API / Chat Export ]
                 │
                 ▼
[ Ingesta Autorizada (whatsapp_authorized_messages) ]
                 │
                 ▼
[ n8n Workflow WA-PATIENT-05D (Cada 5 días 09:00 COT) ]
  ├── Bloqueo Distribuido (acquire_patient_discovery_lock)
  ├── Clasificador de Conversaciones (VeterinaryConversationClassifier)
  ├── Extractor de Pacientes Caninos (PetCandidateExtractionService)
  ├── Verificador de Frescura OKVET (okvet_snapshot_metadata)
  └── Conciliador de Identidad (OkvetPatientReconciliationEngine)
                 │
                 ▼
[ Repositorio Supabase (sznvahhocgnhsqhksygq) ]
  ├── whatsapp_patient_candidates
  ├── whatsapp_candidate_evidence
  ├── whatsapp_discovery_alerts
  └── whatsapp_patient_match_decisions
                 │
                 ▼
[ Panel de Control de Luis en Lovable ]
  └── Ruta: /admin/pacientes/descubrimiento (Sin 6to botón en barra inferior)
```

---

## 4. ESPECIFICACIÓN DE LA BASE DE DATOS (MIGRACIÓN 045)

La migración `045_whatsapp_patient_discovery_and_reconciliation.sql` añade 9 tablas empresariales con Row Level Security (RLS) estricto y funciones atómicas de acceso restringido:

| Tabla / Objeto | Propósito |
|---|---|
| `okvet_snapshot_metadata` | Metadatos y control de obsolescencia (&gt;5d) de exportaciones OKVET. |
| `whatsapp_authorized_messages` | Ingesta segura de mensajes comerciales autorizados. |
| `whatsapp_scan_runs` | Bitácora de ejecuciones del ciclo rodante de 5 días. |
| `whatsapp_message_checkpoints` | Cursor temporal durable para evitar re-procesamiento redundante. |
| `whatsapp_patient_candidates` | Pacientes caninos detectados con score de confianza y estado. |
| `whatsapp_candidate_evidence` | Fragmentos mínimos de conversación con PII redactada. |
| `whatsapp_patient_match_decisions` | Bitácora inmutable de decisiones tomadas por el Dr. Luis. |
| `whatsapp_discovery_alerts` | Notificaciones ejecutivas para el Dr. Luis en el panel de control. |
| `whatsapp_discovery_execution_locks` | Bloqueo distribuido para prevenir ejecuciones concurrentes. |

### Funciones RPC Atómicas (Revocadas a `anon`)
- `acquire_patient_discovery_lock(org_id, duration_seconds, locked_by)`
- `release_patient_discovery_lock(org_id)`
- `record_patient_discovery_decision(candidate_id, decision, decided_by, linked_pet_id, linked_okvet_id, notes)`
- `get_patient_discovery_dashboard_metrics(org_id)`

---

## 5. WORKFLOW n8n CLOUD (`WA-PATIENT-05D`)

- **Nombre:** `WA-PATIENT-05D | Autonomous WhatsApp Patient Discovery & OKVET Reconciliation Engine`
- **ID en n8n Cloud:** `IRnxi32jnYdWxsjj`
- **Carpeta:** `Vet Freedom OS` (`EWfSa40jLDxPUOKX`)
- **Frecuencia:** Cada 5 días a las 09:00 America/Bogota (`0 9 */5 * *`)
- **Total Nodos:** 22 nodos construidos bajo el Workflow SDK oficial.
- **Ruta Webhook:** `/webhook/discovery/wa-patient-scan`
- **Ruta Local:** `automation/n8n/workflows/WA-PATIENT-05D.json`

---

## 6. PANEL DE CONTROL DE LUIS (`/admin/pacientes/descubrimiento`)

El panel está integrado directamente en la suite administrativa de Lovable sin alterar la barra de navegación de 5 pestañas del usuario.

### Acciones del Dr. Luis Eduardo Ríos:
1. **`YA_EXISTE_OKVET`:** El paciente ya figura en OKVET con otro identificador o alias. Se vincula formalmente sin duplicar registros.
2. **`NO_ESTA_REGISTRADO`:** El paciente es confirmado como nuevo o no registrado. El sistema genera de forma atómica una tarea operativa (`operational_tasks`) para que recepción lo dé de alta de forma asistida en OKVET Cloud.
3. **`NO_ES_PACIENTE`:** Consulta de un tercero, compra de insumos o mención accidental. Se descarta y archiva el caso.
4. **`REVISAR_DESPUES`:** Pospone la decisión para una revisión clínica o consulta posterior con el tutor.
5. **`PEDIR_MAS_INFO`:** Solicita al equipo de recepción contactar al tutor para precisar datos clínicos (edad, peso, historial).

---

## 7. SUITE DE PRUEBAS DE ACEPTACIÓN (TEST-001..TEST-032 + E2E)

La suite de pruebas automatizada `tests/test_whatsapp_patient_discovery_t01_to_t32.js` certificó el 100% de cumplimiento (32/32 tests aprobados):

- **TEST-001 a TEST-007:** Ingesta autorizada, deduplicación, parseo de chats colombianos (corchetes y guiones), exclusión de mensajes de cifrado y multilínea.
- **TEST-008 a TEST-017:** Clasificación de especies (canino vs felino), detección de 7 intenciones clínicas (`VACCINATION`, `CONSULTATION`, `CONTROL`, `MEDICATION`, `EMERGENCY`, `SPECIALIST`, `NEW_PATIENT`) y rechazo de spam o facturación no clínica.
- **TEST-018 a TEST-023:** Extracción de pacientes únicos, listas múltiples ("Luna, Max y Toby"), conteos no resueltos ("tengo 2 perros"), mención de veterinarios, redacción de PII (cédulas, tarjetas, cuentas) y claves idempotentes SHA256.
- **TEST-024 a TEST-029:** Reconciliación frente a snapshots OKVET, protección ante datos antiguos (>5d), coincidencia exacta, ambigüedad por nuevo perro de cliente conocido y preservación de homónimos.
- **TEST-030 a TEST-032:** Registro inmutable de decisiones del Dr. Luis, generación de tareas operativas y salvaguarda de modo seguro.
- **Escenario E2E:** Carolina Gómez (+573105550199) consultando por Luna (refuerzo séxtuple) y Max (inapetente). Ambos fueron clasificados y puestos a disposición de Luis para su alta asistida.

---

## 8. REGISTRO DE DECISIONES DE ARQUITECTURA (DECISIONS.md)

### Decisión D-038: Motor de Descubrimiento Autónomo de Pacientes WhatsApp y Conciliación con OKVET
- **Fecha:** 22 de Noviembre de 2026.
- **Estado:** APROBADO Y VALIDADO EN QA.
- **Impacto:** Cero modificaciones no autorizadas en historias clínicas de OKVET; asistencia ejecutiva automatizada cada 5 días para el Dr. Luis Eduardo Ríos con plena trazabilidad en Supabase y Lovable.
