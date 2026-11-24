# VET FREEDOM OS — MASTER DATABASE ARCHITECTURE
## Arquitectura Maestra de Base de Datos PostgreSQL / Supabase
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Director Médico:** Dr. Luis Eduardo Ríos  
**Infraestructura:** Supabase Cloud (PostgreSQL 17.12.0, AWS us-east-1)  
**ID de Proyecto Verificado:** `sznvahhocgnhsqhksygq` (`vet-freedom-os-dev`)  
**Entorno:** DEVELOPMENT / QA  
**Fecha de Actualización:** 2026-11-21  

---

## 1. RESUMEN EJECUTIVO Y PRINCIPIOS DE DISEÑO

El backend de base de datos de Vet Freedom OS constituye el núcleo transaccional, de autorización y persistencia del ecosistema operativo de Vet Life. Siguiendo el principio de **Soberanía de Datos** y las regulaciones colombianas (Ley 576 de 2000 del Código de Ética Médico Veterinaria y Ley 1581 de 2012 de Protección de Datos Personales), la base de datos implementa:

1. **Aislamiento Multi-Inquilino Estricto:** Toda tabla de negocio está vinculada a `organization_id` con políticas de seguridad a nivel de fila (Row Level Security - RLS).
2. **Defensa en Profundidad:** RLS activo al 100% (270+ tablas en esquema `public`), revocación de permisos `EXECUTE` al rol `anon` en funciones `SECURITY DEFINER`, y validación exhaustiva de precondiciones y locks en RPCs.
3. **Registro Clínico Oficial Separado (OKVET Assisted Bridge):** OKVET permanece como la autoridad clínica oficial. La base de datos opera como sistema de orquestación, agenda y experiencia al cliente, interactuando con OKVET mediante un puente asistido por operador humano, sin invención de endpoints inexistentes.
4. **Patrón Transaccional Outbox/Inbox:** Garantiza consistencia eventual y desacoplamiento con la plataforma n8n y microservicios externos.
5. **Control de Concurrencia Optimista y Pesimista:** `appointment_holds` con token de sesión de 15 minutos y locks de fila `SELECT FOR UPDATE` para evitar sobreventa o solapamiento de profesionales.

---

## 2. TOPOLOGÍA DE INFRAESTRUCTURA Y CONECTIVIDAD

```
+-----------------------------------------------------------------------------------+
|                              SUPABASE CLOUD (AWS us-east-1)                       |
|                                                                                   |
|  +--------------------+   +-----------------------+   +------------------------+  |
|  |    Supabase Auth   |   |   PostgreSQL 17.12.0  |   |    Supabase Storage    |  |
|  |  (JWT, RLS Roles)  |   |  270+ Tablas, 620+ FK |   | 3 Private S3 Buckets   |  |
|  +---------+----------+   +-----------+-----------+   +-----------+------------+  |
|            |                          |                           |               |
+------------|--------------------------|---------------------------|---------------+
             |                          |                           |
             v                          v                           v
+------------------------+  +-----------------------+  +----------------------------+
|  Lovable Frontend SPA  |  |    n8n Orchestrator   |  | Operador Humano / OKVET    |
|  (React/TypeScript)    |  | (21 CORE Workflows)   |  | (Puente de Conciliación)   |
+------------------------+  +-----------------------+  +----------------------------+
```

### Parámetros Verificados del Cluster
- **Host de Conexión:** `aws-0-us-east-1.pooler.supabase.com`
- **Puerto:** `6543` (Transaction Pooler - PgBouncer) / `5432` (Session Mode)
- **SSL Obligatorio:** `sslmode=require`
- **Default Organization Seed:** `11111111-1111-1111-1111-111111111111`
- **Esquemas Operativos:**
  - `public`: Entidades de negocio, lógica y tablas transaccionales.
  - `auth`: Identidades de usuario gestionadas por Supabase GoTrue.
  - `storage`: Metadatos de archivos y control de acceso por bucket.
  - `vault`: Secretos encriptados (cuando aplica).

---

## 3. MAPA DE DOMINIOS DE NEGOCIO (25 MÓDULOS)

La base de datos se estructura en 25 módulos funcionales interconectados:

| # | Dominio Funcional | Tablas Representativas | Responsabilidad Primaria |
|---|-------------------|------------------------|--------------------------|
| 01 | Rutas y Logística | `operational_zones`, `clusters`, `route_locations` | Optimización de desplazamientos veterinarios en Bogotá |
| 02 | Ausencias y Novedades | `staff_leaves`, `staff_absences`, `shift_exceptions` | Control de disponibilidad con reserva de privacidad médica |
| 03 | Coberturas y Reemplazos | `shift_replacements`, `staff_shift_assignments` | Gestión auditada de relevos de turno domiciliario |
| 04 | Simulador de Capacidad | `capacity_simulations`, `simulation_scenarios` | Modelado de demanda sin alteración de citas reales |
| 05 | Reprogramación Inteligente | `appointment_reschedule_proposals`, `reschedule_reasons` | Oferta proactiva de slots viables al cliente |
| 06 | Adherencia a Tratamientos | `patient_treatments`, `treatment_administrations` | Seguimiento posconsulta y alertas de dosificación |
| 07 | Salud Preventiva | `preventive_plans`, `vaccination_schedules` | Ciclo de vida vacunal y antiparasitario por paciente |
| 08 | Directorio de Especialistas | `external_specialists`, `specialist_rates` | Red de interconsulta con tarifas acordadas en COP |
| 09 | Interconsultas y Agendamiento | `specialist_availability`, `referral_appointments` | Franjas horarias y slots de profesionales externos |
| 10 | Confirmación de Especialistas | `specialist_confirmations`, `referral_holds` | Validación formal de aceptación antes del servicio |
| 11 | Informes de Interconsulta | `specialist_medical_reports`, `report_attachments` | Recepción y anclaje de contrarremisiones médicas |
| 12 | Compromisos Posvisita | `post_visit_commitments`, `commitment_tasks` | Tareas asignadas al equipo de soporte posconsulta |
| 13 | Documentación y Consentimientos | `medical_documents`, `signed_consent_records` | Almacenamiento seguro y firmado en buckets privados |
| 14 | Cuidadores y Delegaciones | `delegated_caretakers`, `caretaker_permissions` | Acceso granular a familiares o cuidadores de mascotas |
| 15 | Pagos y Cobranzas | `financial_transactions`, `invoices`, `payment_proofs` | Conciliación de comprobantes, transferencias y pasarelas |
| 16 | Recibos y Conciliación | `payment_receipts`, `bank_reconciliation_batches` | Validación contable auditada contra extractos |
| 17 | Inventario Móvil | `mobile_inventories`, `vehicle_stock_ledgers` | Trazabilidad inmutable de fármacos en vehículos |
| 18 | Cadena de Frío y Maletines | `cold_chain_logs`, `backpack_checklists` | Control de temperatura de biológicos y checklist |
| 19 | Protocolos y POEs | `clinical_sop_library`, `sop_version_history` | Procedimientos estandarizados y guías clínicas |
| 20 | Calidad y CSAT / NPS | `customer_satisfaction_surveys`, `service_ratings` | Métricas de satisfacción del tutor de la mascota |
| 21 | Protección Emocional y Duelo | `grief_support_cases`, `memorial_records` | Supresión de campañas y acompañamiento compasivo |
| 22 | Asistente Móvil Veterinario | `mobile_assistant_sessions`, `quick_queries` | Consultas operativas rápidas y métricas de bolsillo |
| 23 | Inteligencia Diaria | `daily_executive_snapshots`, `operational_kpis` | Resumen inmutable diario para toma de decisiones |
| 24 | Rentabilidad Semanal | `weekly_profitability_reports`, `founder_autonomy_kpis` | Métricas financieras en COP y horas liberadas |
| 25 | Auditoría y Reconciliación | `audit_logs`, `reconciliation_runs`, `discrepancies` | Consistencia global, trazabilidad y outbox/inbox |

---

## 4. INTEGRIDAD REFERENCIAL Y REGLAS DE CASCADE

- **Claves Primarias:** UUID v4 (`gen_random_uuid()`) en todas las entidades.
- **Relaciones Padre-Hijo Seguras:** Las eliminaciones en cascada (`ON DELETE CASCADE`) se reservan exclusivamente a entidades dependientes no críticas (ej. items de checklist o mapeos temporales).
- **Restricciones Restrictivas (`ON DELETE RESTRICT`):** Aplicadas a `patients`, `clients`, `appointments`, `medical_records`, `invoices` y `financial_transactions` para prevenir pérdida de datos históricos bajo normatividad legal.
- **Soft Deletes:** Tablas críticas incorporan `deleted_at timestamptz NULL` o banderas de estado para auditoría forense perpetua.

---

## 5. EXTENSIONES POSTGRES ACTIVAS Y CONFIGURACIÓN

- `pgcrypto` / `uuid-ossp`: Generación segura de UUIDs y funciones criptográficas.
- `pg_trgm`: Búsqueda difusa y autocompletado en directorios de clientes, pacientes y vademécum.
- `btree_gist`: Restricciones de exclusión temporal y espacial en agendamiento (`EXCLUDE USING gist ... WITH =`).
- `vector` (pgvector): Habilitado para búsqueda semántica futura en base de conocimiento SOP y protocolos clínicos.
- `pg_stat_statements`: Monitoreo de rendimiento y optimización de planes de ejecución.
