# VET FREEDOM OS — RUNBOOK OPERATIVO ANTE CAMBIOS Y REOPTIMIZACIÓN DE RUTA
**Módulo:** VET-CORE-08 | Route Change & Dynamic Reoptimization Runbook (WF-046 / RTE-14)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Causas Válidas de Cambio de Ruta

Una ruta publicada puede requerir reordenamiento o modificación por:
1. **Emergencia Médica Vital (P0):** Paciente en riesgo inminente que requiere intercalar una visita urgente.
2. **Incapacidad o Indisposición del Profesional:** Veterinario indispuesto a mitad de jornada.
3. **Falla Mecánica del Móvil o Bloqueo Vial Completo:** Imposibilidad física de acceder a una zona.
4. **Cancelación Voluntaria por el Tutor:** Notificada durante la jornada.

---

## 2. Reglas del Proceso de Cambio

1. **Inmutabilidad de Paradas Realizadas:** Las paradas que ya tienen estado `ARRIVED`, `SERVICE_STARTED` o `SERVICE_COMPLETED` no pueden ser alteradas ni eliminadas de la ruta.
2. **Veto a Desplazamiento de Visitas Protegidas:** Las visitas con `is_clinically_protected = true` no pueden ser pospuestas sin consulta expresa con el veterinario a cargo del caso.
3. **Versionado Monotónico (v1 -> v2):** La ruta no se sobreescribe. Se crea un snapshot de la versión anterior en `route_plan_versions` y se publica la nueva versión con `route_version = route_version + 1`.
4. **Invalidación de Avisos Previos:** Cualquier solicitud de aviso encolada para las paradas reorganizadas es recalculada antes de enviar.
