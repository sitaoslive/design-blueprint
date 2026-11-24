# VET FREEDOM OS — SCHEMA INVENTORY
## Inventario Detallado de Tablas y Esquema Relacional
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Base de Datos:** PostgreSQL 17.12.0 (Supabase `sznvahhocgnhsqhksygq`)  
**Fecha:** 2026-11-21  

---

## 1. RESUMEN CUANTITATIVO DEL ESQUEMA

- **Total de Tablas en Esquema `public`:** 272 tablas.
- **Cobertura de Row Level Security (RLS):** 100% de tablas tienen `rls_enabled = true`.
- **Claves Foráneas (Foreign Keys):** 620+ restricciones referenciales validadas.
- **Índices de Rendimiento:** 450+ índices (B-tree, GIN en JSONB, GIST en rangos temporales).
- **Funciones y Procedimientos Almacenados:** 160+ funciones registradas.
- **Buckets de Storage:** 3 buckets privados con políticas RLS obligatorias.

---

## 2. INVENTARIO POR MÓDULOS Y CAPAS TRANSACCIONALES

### Capa 0: Sistema Base, Configuración y Feature Flags
- `public.organizations`: Entidades multi-inquilino base.
- `public.profiles`: Perfiles de usuario vinculados a `auth.users`.
- `public.user_roles`: Asignación de roles institucionales (11 roles RBAC).
- `public.feature_flags`: Banderas de control de características (ej. `send_enabled`, `allow_real_payments`, `okvet_bridge_mode`).
- `public.app_settings`: Parámetros operativos y variables institucionales.

### Capa 1: Gestión de Pacientes y Clientes
- `public.clients`: Tutores de mascotas con datos de contacto verificados.
- `public.patients`: Mascotas registradas (especie, raza, edad, sexo, estado de salud).
- `public.patient_allergies`: Alergias y condiciones de riesgo clínico.
- `public.delegated_caretakers`: Cuidadores y familiares con permisos delegados.
- `public.caretaker_permissions`: Alcance temporal y granular de autorizaciones.

### Capa 2: Agendamiento, Disponibilidad y Holds
- `public.appointments`: Registro principal de citas domiciliarias y clínicas.
- `public.appointment_holds`: Reservas provisionales de 15 minutos para prevenir colisiones.
- `public.appointment_services`: Catálogo de servicios facturables por cita.
- `public.staff_availability`: Horarios regulares de atención veterinaria.
- `public.staff_leaves`: Vacaciones, permisos e incapacidades médicas.
- `public.shift_replacements`: Sustituciones formales de turnos.

### Capa 3: OKVET Assisted Bridge (Integración Clínica)
- `public.okvet_connector_configuration`: Configuración del puente y límites operativos.
- `public.okvet_capability_registry`: Registro formal de capacidades soportadas (9 capacidades).
- `public.okvet_manual_confirmations`: Evidencias de conciliación humana por cita.
- `public.okvet_import_batches`: Lotes de importación estructurada (CSV / XLSX).
- `public.okvet_import_row_staging`: Filas encoladas en staging para validación previa.
- `public.okvet_import_column_mappings`: Diccionario de mapeo de columnas dinámico.
- `public.okvet_import_conflicts`: Discrepancias detectadas (homónimos, solapamientos).
- `public.okvet_import_application_results`: Resultados inmutables de aplicación parcial/total.

### Capa 4: Red de Interconsulta y Especialistas
- `public.external_specialists`: Directorio médico de especialistas autorizados.
- `public.specialist_rates`: Tarifario acordado por especialidad y procedimiento.
- `public.specialist_availability`: Franjas horarias y disponibilidad informada.
- `public.referral_appointments`: Citas derivadas a especialistas externos.
- `public.specialist_confirmations`: Aceptaciones verificables de interconsulta.
- `public.specialist_medical_reports`: Informes médicos recibidos de contrarremisión.

### Capa 5: Salud Preventiva y Adherencia Clínica
- `public.preventive_plans`: Planes preventivos suscritos por mascota.
- `public.vaccination_schedules`: Calendario de vacunación y revacunación.
- `public.deworming_schedules`: Esquemas de desparasitación interna y externa.
- `public.patient_treatments`: Tratamientos continuos prescritos.
- `public.treatment_administrations`: Registro de dosis suministradas.

### Capa 6: Logística Domiciliaria e Inventario Móvil
- `public.operational_zones`: Zonas geográficas de Bogotá y municipios aledaños.
- `public.clusters`: Agrupaciones urbanas para optimización de rutas.
- `public.route_locations`: Paradas y ubicaciones en ruta de los móviles.
- `public.mobile_inventories`: Fármacos e insumos asignados a cada maletín/vehículo.
- `public.vehicle_stock_ledgers`: Movimientos de stock con trazabilidad de lotes.
- `public.cold_chain_logs`: Monitoreo de temperatura en neveras portátiles.
- `public.backpack_checklists`: Verificación previa de equipamiento por visita.

### Capa 7: Gestión Financiera, Facturación y Cobros
- `public.invoices`: Comprobantes de cobro y prefacturas emitidas en COP.
- `public.financial_transactions`: Transacciones financieras (ingresos, pagos, devoluciones).
- `public.payment_proofs`: Soportes y comprobantes de transferencia aportados.
- `public.payment_receipts`: Recibos oficiales emitidos tras validación bancaria.
- `public.bank_reconciliation_batches`: Lotes de conciliación contable.

### Capa 8: Documentación, Consentimientos y Protocolos
- `public.medical_documents`: Metadatos de historias y documentos clínicos.
- `public.signed_consent_records`: Consentimientos informados firmados digitalmente.
- `public.clinical_sop_library`: Procedimientos Operativos Estándar médicos.
- `public.sop_version_history`: Control de versiones y firmas de aprobación de POEs.

### Capa 9: Experiencia, Duelo y Atención al Cliente
- `public.customer_satisfaction_surveys`: Encuestas de satisfacción post-visita.
- `public.service_ratings`: Puntuaciones NPS y CSAT categorizadas.
- `public.grief_support_cases`: Casos activos de duelo familiar y supresión comercial.
- `public.memorial_records`: Homenajes y registros de mascotas fallecidas.
- `public.customer_feedback`: Observaciones y sugerencias de mejora continua.

### Capa 10: Auditoría, Eventos y Reconciliación
- `public.audit_logs`: Registro forense inmutable de todas las acciones del sistema.
- `public.transactional_outbox`: Cola de eventos salientes para orquestación n8n.
- `public.event_inbox`: Registro deduplicado de eventos entrantes de webhooks.
- `public.daily_executive_snapshots`: Snapshots inmutables de métricas operativas diarias.
- `public.weekly_profitability_reports`: Informes semanales de rentabilidad y autonomía.
- `public.reconciliation_runs`: Ejecuciones del motor de conciliación multidominio.
- `public.discrepancies`: Inconsistencias detectadas para reparación asistida.

---

## 3. HISTORIAL DE MIGRACIONES APLICADAS

| Migración | Descripción Principal | Estado |
|-----------|------------------------|--------|
| `001_initial_core_schema.sql` | Entidades multi-inquilino, clientes, pacientes y usuarios | Aplicada |
| `002` a `039` | Esquemas de módulos funcionales (agenda, finanzas, SOPs, rutas) | Aplicadas |
| `040_comprehensive_schema_alignments.sql` | Alineación de restricciones FK, índices y outbox | Aplicada |
| `041_financial_and_reconciliation_indexes.sql` | Índices optimizados para reportes ejecutivos | Aplicada |
| `042_master_backend_okvet_bridge_and_hardening.sql` | Feature flags, OKVET Assisted Bridge, staging, RPCs y seguridad | Aplicada |
