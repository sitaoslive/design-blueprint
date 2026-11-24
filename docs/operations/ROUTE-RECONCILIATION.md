# VET FREEDOM OS — PROCEDIMIENTO DE RECONCILIACIÓN DE RUTAS
**Módulo:** VET-CORE-08 | Route Reconciliation & Partial Failure Recovery (WF3-017 / RTE-15)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Detección de Fallas Parciales en Reoptimización

Cuando un cambio de ruta involucra múltiples sistemas externos (Supabase -> OKVET -> Google Calendar -> Notificación WhatsApp):
- Un fallo en cualquiera de los pasos intermedios marca la operación como `RECONCILIATION_REQUIRED`.
- El sistema **no reintenta ciegamente todas las acciones** desde el inicio para evitar duplicar cancelaciones, citas o mensajes.

---

## 2. Matriz de Reconciliación

| Paso | Estado Observado | Acción Correctiva Automática |
| :--- | :--- | :--- |
| **Supabase Route v2** | `SUCCEEDED` | Preservar registro en base de datos. |
| **Sincronización OKVET** | `FAILED` | Crear tarea prioritaria en VET-CORE-07 para radicación asistida. |
| **Google Calendar** | `PENDING` | Reintentar sincronización vía VET-CORE-06. |
| **Notificación WhatsApp** | `FAILED` | Enrutar a VET-CORE-19 (Error & Retry Handler con backoff exponencial). |
