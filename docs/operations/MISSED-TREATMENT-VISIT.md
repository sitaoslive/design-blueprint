# VET FREEDOM OS — MISSED TREATMENT VISIT PROTOCOL
## Protocolo Ante Visitas Fallidas, Inasistencias y Abandono Terapéutico
**Módulo:** VET-CORE-09  
**Axioma Operativo:** CERO Compensación Automática, CERO Ajuste de Dosis por IA  

---

## 1. Clasificación del Incidente de Inasistencia

| Tipo de Fallo | Causa Raíz | Severidad Clínica | Acción Inmediata |
| :--- | :--- | :--- | :--- |
| `CLIENT_NO_SHOW` | Tutor ausente en domicilio | `CRITICAL_THERAPY_INTERRUPTION` | Marcar `MISSED_REQUIRES_REVIEW` + Alerta Coordinación |
| `CLIENT_CANCELLATION_LATE` | Tutor cancela < 2h antes | `MODERATE_DELAY` | Registro de motivo + Notificar Veterinario Titular |
| `VET_EMERGENCY_OVERRUN` | Cirugía/urgencia previa retrasada | `MODERATE_DELAY` | Contactar al tutor para reprogramar en franja de tolerancia |
| `LOGISTIC_UNREACHABLE` | Bloqueo vial / fuerza mayor | `LOW_IMPACT` | Reprogramar dentro de la ventana de tolerancia |
| `PATIENT_UNSTABLE` | Paciente descompensado en casa | `CRITICAL_THERAPY_INTERRUPTION` | Escalamiento inmediato a Urgencia Médica Domiciliaria |

---

## 2. Diagrama de Flujo y Resguardo de Seguridad

```mermaid
flowchart TD
    Missed["Inasistencia o Cancelación Detectada"] --> Mark["Transición a MISSED_REQUIRES_REVIEW"]
    Mark --> Block["BLOQUEO ESTRICTO: Cero auto-dosis / Cero auto-calendario"]
    Mark --> Inc["Crear Registro en recurring_care_missed_incidents"]
    Inc --> Alert["Alerta Prioritaria a Coordinador Clínico & Vet"]
    Alert --> VetEval["Evaluación por Médico Veterinario Titular"]
    VetEval --> Decision{"Decisión Médica"}
    Decision -- Reprogramar dentro de margen seguro --> Resched["RESCHEDULE_APPROVED"]
    Decision -- Ajustar frecuencia o fármaco --> Version["Nueva Versión de Plan (v2)"]
    Decision -- Descontinuar tratamiento --> Term["DISCONTINUED_CLINICAL"]
```
