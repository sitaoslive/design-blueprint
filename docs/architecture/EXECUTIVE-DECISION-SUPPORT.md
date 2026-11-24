# Soporte de Decisiones y Delegación Inteligente (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Filosofía: Proteger el Tiempo de la Dirección Médica

El éxito del Método Alpha Vision radica en permitir que el Dr. Luis Eduardo Ríos se concentre en decisiones estratégicas y de alta complejidad clínica, delegando la rutina operativa en un equipo empoderado con reglas claras.

El sistema clasifica cada hallazgo del día en dos categorías mutuamente excluyentes:
1. **Decisiones Reservadas para el Dr. Luis Ríos.**
2. **Delegación Inteligente de Acciones Operativas.**

---

## 2. Matriz de Decisiones Reservadas para el Dr. Luis

Cualquier evento que cumpla con los siguientes criterios se escala directamente en el bloque 3 del brief matutino:

| Tipo de Decisión | Criterio de Disparo | Plazo Máximo de Resolución | Recomendación Pre-calculada |
| :--- | :--- | :--- | :--- |
| **Turno sin Cobertura Veterinaria** | Médico ausente sin reemplazo automático asignado. | 07:30 AM | Activar veterinario de guardia o reprogramar 2 visitas no prioritarias. |
| **Contingencia Financiera** | Pasarela caída o discrepancia de cuadre > $500.000 COP. | 10:00 AM | Autorizar verificación manual de extractos bancarios en PDF. |
| **Reclamación Grave de Tutor** | Queja formal por presunta mala praxis o insatisfacción crítica. | 08:30 AM | Llamada directa de la Dirección Médica al tutor antes de mediodía. |
| **Excepción en Protocolo Clínico** | Solicitud de medicamento controlado o eutanasia en domicilio. | Inmediato | Revisión de historia clínica completa y consentimiento presencial. |
| **Aprobación de Gasto / Devolución** | Devolución de dinero a tutor o compra de urgencia de insumos. | 12:00 PM | Autorizar nota crédito si la justificación médica fue validada. |

---

## 3. Matriz de Delegación Inteligente

Las siguientes tareas se despachan automáticamente a los roles responsables, requiriendo del Dr. Luis únicamente supervisión de cierre:

| Rol Asignatario | Responsabilidad Operativa | Métrica / Evidencia Esperada |
| :--- | :--- | :--- |
| **Coordinación Operativa** | Verificación de salida puntual de vehículos a las 08:00 AM. | Check-in en primera parada antes de las 08:45 AM. |
| **Médicos Veterinarios de Ruta** | Cierre clínico y firma de registro en OKVET tras cada visita. | `okvet_clinical_record_id` registrado antes de 2 horas. |
| **Coordinación de Especialistas** | Seguimiento a remisiones de pacientes que requieren ecografía o cardiología. | Agendamiento verificado con especialista externo (CORE-11). |
| **Facturación y Cobranza** | Conciliación de comprobantes de transferencia reportados por tutores. | Solicitudes en estado `PAID_VERIFIED` antes de las 11:00 AM. |
| **Atención al Cliente** | Envío de encuestas de CSAT y seguimiento a compromisos post-visita. | Compromisos cerrados en < 24h (CORE-12). |

---

## 4. Prioridades de Mañana Derivadas de Hechos Reales

El sistema genera las prioridades del día siguiente basándose exclusivamente en:
- Citas ya agendadas y confirmadas en el sistema.
- Compromisos post-visita pendientes con fecha límite mañana.
- Insumos y vacunas requeridos según las especies y motivos de consulta previstos.
- Cero invención o proyección especulativa de pacientes no existentes.
