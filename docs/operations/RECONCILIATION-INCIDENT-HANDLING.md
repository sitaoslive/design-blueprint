# VET FREEDOM OS — RUNBOOK: GESTIÓN DE INCIDENTES DE CONCILIACIÓN
## Clasificación de Severidades, Canales de Alerta y Escalado a VET-CORE-19

---

### 1. Matriz de Severidad de Incidentes de Integración

Cuando una discrepancia o error de integración supera los umbrales de tolerancia normales, se declara un Incidente Operativo:

| Severidad | Criterio de Activación | Impacto en el Negocio | Canal de Notificación | Tiempo de Notificación |
| :--- | :--- | :--- | :--- | :--- |
| **SEV-1 (CRITICAL)** | Caída total de conectores principales, manipulación de documentos médicos, fuga de datos | Riesgo legal inminente o parálisis total de citas | WhatsApp Prioritario + SMS + Dashboard Rojo | **Inmediato (< 5 min)** |
| **SEV-2 (HIGH)** | Webhooks caídos > 1h, transacciones bancarias no conciliadas > $500.000 COP, discrepancia en OKVET | Desfase operativo severo | WhatsApp a Coordinación + Alerta en Lovable | **< 15 min** |
| **SEV-3 (MEDIUM)** | Retraso en sincronización de Google Calendar, 5% de mensajes rebotados en WhatsApp | Lentitud o reprogramaciones menores | Notificación en Centro de Control | **< 1 Hora** |
| **SEV-4 (LOW)** | Advertencias de cuotas de API al 80%, formatos no estándar | Mínimo / Cosmético | Resumen en reporte ejecutivo diario | **En reporte diario** |

---

### 2. Protocolo de Escalado hacia VET-CORE-19 (Exception Monitoring)

1. **Detección Automática**:
   El motor VET-CORE-18 detecta la condición anómala (ej. 3 fallos continuos de autenticación OAuth en Google Calendar o 10 webhooks de Wompi con firma rechazada).
2. **Generación de Alerta Estructurada**:
   Se emite un evento `system.incident.created` hacia la tabla de excepciones de VET-CORE-19.
3. **Pausa Preventiva de Tareas**:
   Si el conector comprometido es de escritura, se conmuta temporalmente a modo `READ_ONLY` o `MAINTENANCE` para salvaguardar la integridad de los datos.
4. **Intervención y Cierre**:
   El equipo técnico subsana la causa raíz (ej. rota el token de acceso) y marca el incidente como resuelto, permitiendo que el motor de conciliación vuelva a correr para verificar la estabilización.
