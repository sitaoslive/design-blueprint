# Reconciliación con OKVET para Cuidados Preventivos (VET-CORE-10)

## 1. Principio Rector de Autoridad Clínica
OKVET es el registro clínico oficial para Vet Life — Veterinaria a Domicilio. Ninguna comunicación, recordatorio o programación preventiva puede contradecir la historia clínica oficial documentada en OKVET.

## 2. Tipos de Procedencia de Datos (Data Provenance)
Cada registro preventivo (`preventive_care_source_records`) cuenta con procedencia estrictamente catalogada:
1. `OKVET`: Datos importados o sincronizados desde el sistema clínico oficial OKVET. Tienen máxima prioridad de veracidad histórica.
2. `VET_CLINICAL_ORDER`: Orden clínica directa emitida y firmada por un médico veterinario colegiado dentro del sistema Vet Freedom OS.
3. `IMPORT_CSV`: Migración histórica de expedientes previos a la digitalización integral.
4. `CLIENT_REPORTED`: Información suministrada verbalmente o por mensajería por el tutor/propietario del paciente (ej. "le puse la vacuna hace 6 meses en otra clínica").

## 3. Reglas de Validación y Certificación
- **Certificación de Aplicación (`VERIFIED_APPLIED`):**
  - Solo los registros con procedencia `OKVET` o `VET_CLINICAL_ORDER` firmados por un veterinario colegiado con número de matrícula profesional válida pueden marcar un evento como formalmente aplicado.
  - Una declaración `CLIENT_REPORTED` **NUNCA** certifica una aplicación clínica ni genera un certificado de vacunación oficial. Se cataloga como `UNVERIFIED_HISTORY` hasta revisión física y serológica si aplica.
- **Caducidad de Datos Históricos (Freshness Threshold):**
  - Registros con antigüedad superior a 365 días (`stale > 365d`) no generan automáticamente recordatorios de revacunación sin previa confirmación de vigencia por parte del Dr. Luis Eduardo Ríos o el veterinario tratante.

## 4. Detección y Gestión de Conflictos
Cuando se detecta una discrepancia entre OKVET y un reporte del cliente o plan local:
1. Se congela la emisión automática de recordatorios para ese antígeno o desparasitante.
2. Se genera un registro de conflicto con estado `AUDIT_PENDING`.
3. Se notifica al panel administrativo de Lovable para revisión del equipo clínico.
4. Una vez auditado por el veterinario, se emite una resolución formal (`RESOLVED_OKVET_PRIORITY` o `RESOLVED_NEW_TITRATION_ORDER`).

## 5. Esquema de Reconciliación Bidireccional
```
[ OKVET Registro Clínico ] 
           │
           ▼
[ preventive_care_source_records ] ──(Procedencia OKVET / VET_ORDER)──┐
           │                                                           │
           ▼                                                           ▼
[ Reconciliación / Freshness Check ] ──────────────► [ preventive_care_events ]
           ▲                                                           │
           │                                                           ▼
[ Declaración Tutor CLIENT_REPORTED ]               [ Notificaciones Seguras CORE-03 ]
```
