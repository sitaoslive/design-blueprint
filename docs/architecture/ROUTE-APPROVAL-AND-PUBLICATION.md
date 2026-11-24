# VET FREEDOM OS — PROTOCOLO DE APROBACIÓN Y PUBLICACIÓN DE RUTAS
**Módulo:** VET-CORE-08 | Route Approval and Publication Protocol  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. El Flujo de Aprobación

Toda jornada de visitas domiciliarias debe pasar por un proceso formal de aprobación antes de ser visible para los veterinarios en ruta:

```
[CITAS CONFIRMADAS EN OKVET]
          │
          ▼
[PROPUESTA GENERADA (DRAFT)] ───► Almacenada en route_plan_versions (v1)
          │
          ▼
[REVISIÓN DE COORDINACIÓN] ─────► Panel de Lovable UI
          │
    ┌─────┴─────┐
    ▼           ▼
[RECHAZADA]  [APROBADA (APPROVED)] ───► approve_route_proposal
                    │
                    ▼
           [PUBLICACIÓN (PUBLISHED)] ──► publish_authorized_route
                    │
                    ▼
          [OUTBOX: route.published] ──► Notificación al Veterinario
```

---

## 2. Reglas de Validación Previas a la Publicación

La función atómica `publish_authorized_route` valida en PostgreSQL:
1. **Ruta en Estado `APPROVED`:** No se pueden publicar borradores ni propuestas simuladas directamente.
2. **Chequeo de Citas Canceladas:** Si un tutor canceló su cita entre la hora de preparación de la ruta y la hora de publicación, la publicación es **bloqueada** (`ROUTE_CONTAINS_CANCELLED_APPOINTMENTS`), obligando a re-evaluar la ruta.
3. **Supersedencia Inmediata:** Si ya existía una ruta publicada para el mismo veterinario y fecha, pasa automáticamente a `SUPERSEDED`, garantizando que el profesional solo vea una ruta activa a la vez.
4. **Activación de la Primera Parada:** La parada #1 pasa automáticamente a estado `READY` y las subsecuentes quedan en `PLANNED`.
