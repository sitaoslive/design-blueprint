# VET FREEDOM OS — RUNBOOK OPERATIVO ANTE RETRASOS EN RUTA
**Módulo:** VET-CORE-08 | Route Delay Management Runbook (WF-045 / RTE-12)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Detección y Umbrales de Retraso

En la geografía urbana de Bogotá, las demoras por tráfico, lluvia o cierres viales son frecuentes. Para gestionar las expectativas del cliente sin generar zozobra ni saturación de mensajes:

| Rango de Demora | Clasificación | Acción del Sistema | Comunicación al Cliente |
| :--- | :--- | :--- | :--- |
| **0 a 14 minutos** | Retraso Leve | Absorbido por el buffer de 15 min entre visitas. | **NINGUNA**. No se envía mensaje para evitar fatiga de alertas. |
| **15 a 30 minutos** | Retraso Moderado | Registro en `route_delay_events`; n8n encola aviso en CORE-03. | Plantilla `vet_route_delay_notice` con tono empático y franja prudente. |
| **> 30 minutos** | Retraso Crítico | Alerta prioritaria en consola de Coordinación; evalúa reasignación. | Llamada o mensaje personalizado de la coordinación ofreciendo alternativas. |

---

## 2. Pautas de Comunicación Cautelosa
- **CERO invención de horas exactas:** Jamás decir "llegará a las 11:23 AM". Utilizar franjas prudentes: "El doctor se encuentra en camino con una demora aproximada de 20 minutos debido a la congestión en la zona".
- **CERO culpar al profesional:** El tono es institucional, profesional y comprensivo hacia el paciente que espera.
