# Instrucciones permanentes para cualquier agente de Antigravity en VET FREEDOM OS

## Lectura obligatoria al empezar (Fuentes Canónicas de la Verdad)
1. `docs/VET_LIFE_MASTER_PRODUCT_BLUEPRINT.md` (Blueprint Maestro del Producto).
2. `docs/features.manifest.json` (Manifiesto Estructurado Machine-Readable de Features).
3. `docs/VET_LIFE_PIMS_INTEGRATION_MATRIX.md` (Marco Universal PIMS e Investigaciones).
4. `docs/VET_LIFE_OKVET_INTEGRATION_PLAN.md` (Plan de Integración Asistida OKVET Dr. Luis).
5. `docs/VET_LIFE_ROLES_PERMISSIONS.md` (Matriz de Permisos y 25 Roles).
6. `docs/VET_LIFE_COMPLETE_USER_JOURNEYS.md` (Rutas de Usuario A a O).
7. `docs/project-memory/PROJECT-STATE.md` y `docs/project-memory/IMPLEMENTATION-LEDGER.md`.

## Ámbito
- **Proyecto:** Vet Life — Veterinaria a Domicilio.
- **Dirección Médica:** Dr. Luis Eduardo Ríos (Medellín y Oriente Antioqueño).
- **Plataforma Matriz:** Alpha Vision Method (`alphavisionm.com`).
- **Arquitectura:** Lovable (interfaz PWA), Supabase PostgreSQL 17 (fuente de verdad multi-tenant y RLS), n8n (orquestación externa), OKVET (registro clínico oficial).

## Contrato de Desarrollo Obligatorio en 16 Pasos (Part 11 § 3)
Todo agente o desarrollador que modifique este repositorio DEBE seguir este orden estrictamente:
1. **Leer el estado actual del proyecto** (`PROJECT-STATE.md` y `features.manifest.json`).
2. **Leer las secciones maestras relevantes** en `docs/VET_LIFE_MASTER_PRODUCT_BLUEPRINT.md`.
3. **Identificar las features existentes** relacionadas con la tarea antes de codificar.
4. **Verificar la implementación actual** (inspeccionar código y esquema antes de cambiar nada).
5. **Buscar componentes y workflows reutilizables** (no reinventar la rueda).
6. **Evitar duplicar funcionalidad existente** (reusar IDs estables `FEAT-`, `SUPA-`, `VET-CORE-`).
7. **Preservar el aislamiento multi-tenant estricto** (`organization_id` y RLS en Postgres 17).
8. **Preservar las fronteras de la historia clínica** (OKVET es la autoridad legal; no duplicar historia médica).
9. **Implementar el cambio solicitado** en entorno aislado y limpio.
10. **Añadir o actualizar las pruebas correspondientes**.
11. **Actualizar el registro de funcionalidades** (`docs/features.manifest.json`).
12. **Actualizar las rutas de usuario afectadas** (`docs/VET_LIFE_COMPLETE_USER_JOURNEYS.md`).
13. **Actualizar la matriz de integraciones** (`docs/VET_LIFE_PIMS_INTEGRATION_MATRIX.md`) si aplica.
14. **Registrar los cambios en la bitácora** (`docs/project-memory/IMPLEMENTATION-LEDGER.md`).
15. **Ejecutar las verificaciones requeridas** (tests y linters).
16. **Reportar lo que realmente funcionó y lo que queda pendiente**, con evidencia comprobable.

> [!CAUTION]
> **Prohibición de Marcar "Completado" sin Evidencia:** Ningún agente puede dar una funcionalidad por implementada solo porque se generó código fuente. Toda funcionalidad requiere comportamiento verificado y evidencia auditable.

## Reglas Médicas y de Seguridad Irrenunciables
- **No diagnosticar ni recetar con IA:** Las fórmulas y prescripciones exigen tarjeta profesional COMVEZCOL y firma de un médico habilitado (Ley 576 de 2000).
- **No inventar endpoints, APIs de OKVET ni credenciales.**
- **No enviar mensajes reales a tutores ni activar campañas sin autorización explícita.** (Modo `send_enabled: false` en pruebas).
- **No exponer secretos, contraseñas ni datos clínicos privados.**
