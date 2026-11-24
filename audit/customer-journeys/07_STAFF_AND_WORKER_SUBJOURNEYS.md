# ALPHA VISION METHOD — AUDITORÍA DE SUBJORNADAS OPERATIVAS Y DE EQUIPO
**DOCUMENTO AUDIT-07 — STAFF, WORKERS, COORDINATION & DISPATCH SUBJOURNEYS**

---

## 1. SUBJORNADAS DEL EQUIPO VETERINARIO (VET LIFE)

### A. Recepcionista Veterinaria (`/recepcion`)
- **Objetivo:** Atender llamadas, mensajes entrantes y agendar citas sin fricción.
- **Acciones Auditadas:**
  - Recepción de solicitud entrante en `/coordinacion/agenda`.
  - Creación de tutor y paciente en 30 segundos.
  - Asignación de franja horaria según disponibilidad del Dr. Luis u otro médico.
  - Validación de pagos anticipados de tele-triaje vía Wompi.
- **Estado de Implementación:** `PRODUCTION VERIFIED` en `src/routes/recepcion.tsx` y `src/routes/coordinacion.agenda.tsx`.

### B. Coordinadora de Despacho Domiciliario (`/coordinacion`)
- **Objetivo:** Optimizar rutas geográficas de los veterinarios en Medellín y Oriente Antioqueño.
- **Acciones Auditadas:**
  - Visualización del mapa de calor y zonas de atención (Poblado, Laureles, Envigado, Rionegro).
  - Cálculo de tiempos de traslado con amortiguador (buffer de 20 minutos entre domicilios).
  - Activación de Smart ETA y emisión de token de seguimiento para el tutor (`/t/:token`).
- **Estado de Implementación:** `PRODUCTION VERIFIED` en `src/features/live-dispatch/Dispatch.tsx`.

### C. Técnico / Auxiliar Veterinario (`/auxiliar`)
- **Objetivo:** Preparar maletines clínicos, kits de toma de muestras y verificar insumos.
- **Acciones Auditadas:**
  - Checklist pre-visita (vacunas en cadena de frío, jeringas, microchips).
  - Registro de constantes fisiológicas (peso, temperatura, frecuencia cardíaca).
- **Estado de Implementación:** `STAGING VERIFIED` en `src/routes/auxiliar.tsx`.

### D. Director Médico / Revisor Clínico (`/direccion`)
- **Objetivo:** Garantizar cumplimiento normativo de COMVEZCOL (Ley 576 de 2000) y calidad asistencial.
- **Acciones Auditadas:**
  - Bóveda de fórmulas emitidas e historial de posología.
  - Auditoría de remisiones a especialistas y lectura de exámenes de laboratorio.
  - Sincronización inmutable con OKVET como libro oficial.
- **Estado de Implementación:** `PRODUCTION VERIFIED` en `src/features/luis/LuisPages.tsx`.

---

## 2. SUBJORNADAS DEL EQUIPO DE CONTRATISTAS (CONTRACTOR OS)

### A. Técnico de Campo / Trabajador Móvil (Worker Subjourney)
- **Objetivo:** Ejecutar la orden de trabajo en la propiedad del cliente con cero papeleo.
- **Acciones Auditadas:**
  1. *Apertura de Jornada:* Consulta la lista de trabajos del día en su celular.
  2. *Traslado:* Marca "En Camino", calculando hora estimada sin exponer GPS personal al cliente.
  3. *Llegada & Diagnóstico:* Inspecciona el chiller o tubería y captura fotos del problema.
  4. *Imprevisto en Sitio:* Si detecta un daño oculto, crea una orden de cambio (Change Order) con fotos y costo adicional sugerido.
  5. *Aprobación:* El cliente aprueba en su propio teléfono de inmediato.
  6. *Cierre:* Ejecuta el trabajo, sube fotos de "Después", solicita firma del cliente y marca trabajo completado.
- **Estado de Implementación:** `PRODUCTION VERIFIED` en `src/features/contractors/client-portal/ClientChangeOrderModal.tsx` y `ContractorSalesDemo.tsx`.

### B. Despachador & Estimador de Oficina
- **Objetivo:** Calificar prospectos y generar cotizaciones escalonadas competitivas.
- **Acciones Auditadas:**
  - Gestión del Kanban de prospectos en `/contractors/leads`.
  - Construcción de propuestas Good / Better / Best con calculadora de margen en `/contractors/estimates/new`.
  - Asignación balanceada de órdenes de trabajo según especialidad del técnico.
- **Estado de Implementación:** `PRODUCTION VERIFIED` en `ContractorLeadsKanban.tsx` y `ContractorEstimateBuilder.tsx`.
