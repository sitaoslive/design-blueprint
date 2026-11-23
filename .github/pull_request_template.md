## 📋 Pull Request — VET FREEDOM OS Governance

### 1. Requerimiento y Trazabilidad
- **Feature ID / Requirement ID**: `FEAT-`
- **Módulo Afectado**: [ ] DB-CORE [ ] SCHEDULING [ ] CLINICAL [ ] LOGISTICS [ ] FINANCE [ ] CX [ ] PIMS-OKVET [ ] WHITE-LABEL [ ] SAAS-GROWTH
- **Resumen del Cambio**:

---

### 2. Alcance de Roles y Pantallas
- **Roles Afectados**:
  - [ ] Platform Super Admin
  - [ ] Dr. Luis (Dirección Médica)
  - [ ] Coordinación / Despacho
  - [ ] Recepción
  - [ ] Auxiliar Veterinario
  - [ ] Médico Especialista
  - [ ] Cliente / Tutor de Mascota
  - [ ] Cuidador Temporal
- **Rutas / Pantallas Afectadas**: (ej. `/luis`, `/cliente`, `/admin/estudio-diseno`, etc.)

---

### 3. Impacto en Base de Datos e Integraciones
- **Migración DDL Incluida**: [ ] Sí [ ] No (Si es Sí, especificar archivo: `supabase/migrations/XXX.sql`)
- **Políticas RLS Auditadas**: [ ] Sí [ ] No aplica (Garantizar aislamiento multi-tenant por `organization_id`)
- **Integraciones Externas Afectadas**: [ ] Ninguna [ ] OKVET [ ] WhatsApp Meta API [ ] Google Calendar [ ] Waze / Google Maps

---

### 4. Seguridad Clínica y Protección de Datos (COMVEZCOL & Habeas Data)
- **¿Modifica historias clínicas o fórmulas médicas?**: [ ] Sí [ ] No
- **¿Afecta prescripciones o dosificaciones?**: [ ] Sí [ ] No
- **Validación de Identidad Médica**: El Dr. Luis Eduardo Ríos (`COMVEZCOL-001`) es la autoridad médica exclusiva. No se permite diagnóstico ni prescripción automatizada por IA.
- **Protección de Datos Privados**: No se exponen números telefónicos, cédulas o datos clínicos fuera del tenant correspondiente.

---

### 5. Lista de Verificación Documental Obligatoria (Part 10 & 11)
- [ ] `docs/features.manifest.json` actualizado con el nuevo estado / evidencia.
- [ ] `docs/VET_LIFE_FEATURE_REGISTRY.md` actualizado.
- [ ] `docs/VET_LIFE_IMPLEMENTATION_LEDGER.md` registrado con el nuevo commit.
- [ ] Pruebas unitarias o de integración ejecutadas y adjuntadas abajo.

---

### 6. Evidencia de Pruebas y Rollback
- **Resultados de Pruebas Automatizadas**:
- **Pruebas Manuales Requeridas**:
- **Plan de Reversión (Rollback)**:
