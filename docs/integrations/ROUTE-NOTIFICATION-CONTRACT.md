# VET FREEDOM OS — CONTRATOS DE NOTIFICACIONES DE RUTAS HACIA CORE-03
**Módulo:** VET-CORE-08 | Route Notifications Contract (Hacia CORE-03)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Principio de Separación: CORE-08 Nunca Envía Mensajes Directos

VET-CORE-08 se limita a evaluar la elegibilidad de la notificación, formatear el payload y encolar la solicitud hacia **VET-CORE-03 (WhatsApp Outbound)**.
Todas las emisiones de prueba y desarrollo se ejecutan en **Safe Mode (`send_enabled = false`)** para garantizar cero mensajes accidentales a tutores reales.

---

## 2. Plantillas Meta Pre-Aprobadas Utilizadas

| Evento | Plantilla Meta | Propósito | Parámetros Inyectados |
| :--- | :--- | :--- | :--- |
| `route.stop_en_route` | `vet_route_eta_notification` | Avisar al tutor que el veterinario está en camino. | `{{1}}`: Nombre tutor, `{{2}}`: Nombre mascota, `{{3}}`: Nombre doctor, `{{4}}`: Franja estimada llegada. |
| `route.delay_detected` | `vet_route_delay_notice` | Informar de un retraso superior a 15 min por tráfico o incidente. | `{{1}}`: Nombre tutor, `{{2}}`: Mascota, `{{3}}`: Minutos retraso, `{{4}}`: Causa general prudente. |
| `route.stop_arrived` | `vet_route_arrived_notice` | Avisar llegada a portería o puerta del domicilio. | `{{1}}`: Nombre tutor, `{{2}}`: Doctor en portería/puerta. |

---

## 3. Prevención de Duplicados y Fatiga de Mensajes
- Para una misma parada, solo se permite un único aviso `vet_route_eta_notification`.
- Si se detectan múltiples incrementos de retraso menores a 10 min, no se reenvían alertas sucesivas; solo se emite una nueva alerta si el retraso total se incrementa en más de 20 minutos respecto al aviso previo.
- Si la cita fue cancelada o el tutor tiene supresión por duelo (`BEREAVEMENT_ACTIVE`), cualquier intento de notificación es suprimido de raíz.
