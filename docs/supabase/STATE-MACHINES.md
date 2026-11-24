# VET FREEDOM OS — STATE MACHINES SPECIFICATION
## Máquinas de Estados y Transiciones de Negocio en Supabase
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Base de Datos:** PostgreSQL 17.12.0  
**Fecha:** 2026-11-21  

---

## 1. MÁQUINA DE ESTADOS DE CITAS DOMICILIARIAS (`appointments`)

El ciclo de vida de una cita médica veterinaria sigue una máquina de estados determinista, gobernada por triggers y validaciones a nivel de base de datos para impedir saltos ilegales.

```mermaid
stateDiagram-v2
    [*] --> REQUESTED : Cliente o Soporte inicia solicitud
    REQUESTED --> PENDING_OKVET_CONFIRMATION : Hold atómico exitoso (15m)
    REQUESTED --> CANCELLED : Cancelación anticipada

    PENDING_OKVET_CONFIRMATION --> CONFIRMED : submit_okvet_human_confirmation()
    PENDING_OKVET_CONFIRMATION --> CANCELLED : Hold expira o rechazo
    PENDING_OKVET_CONFIRMATION --> RESCHEDULED : Ajuste de horario

    CONFIRMED --> EN_ROUTE : Veterinario inicia traslado (GPS)
    CONFIRMED --> RESCHEDULED : Solicitud formal de cambio
    CONFIRMED --> CANCELLED : Cancelación justificada

    EN_ROUTE --> ARRIVED : Veterinario llega al domicilio
    ARRIVED --> IN_PROGRESS : Inicio de consulta médica
    IN_PROGRESS --> COMPLETED : Consulta terminada y registros listos
    
    COMPLETED --> [*]
    CANCELLED --> [*]
    RESCHEDULED --> PENDING_OKVET_CONFIRMATION : Nueva propuesta aceptada
```

### Tabla de Transiciones Válidas de Citas
| Estado Origen | Estado Destino Permitido | Actor Autorizado | Precondiciones Obligatorias |
|---------------|--------------------------|-------------------|-----------------------------|
| `REQUESTED` | `PENDING_OKVET_CONFIRMATION` | Sistema / Soporte | Hold provisional activo creado |
| `REQUESTED` | `CANCELLED` | Cliente / Soporte | Motivo de cancelación registrado |
| `PENDING_OKVET_CONFIRMATION` | `CONFIRMED` | Operador Humano (`support`/`director`) | RPC `submit_okvet_human_confirmation` con ID de OKVET y evidencia |
| `PENDING_OKVET_CONFIRMATION` | `CANCELLED` | Soporte / Sistema | Expiración de hold o cliente no confirma |
| `PENDING_OKVET_CONFIRMATION` | `RESCHEDULED` | Soporte / Cliente | Selección de nuevo slot disponible |
| `CONFIRMED` | `EN_ROUTE` | Veterinario Asignado | Fecha y hora de cita vigente; checklist de maletín verificado |
| `EN_ROUTE` | `ARRIVED` | Veterinario Asignado | Coordenadas de llegada registradas |
| `ARRIVED` | `IN_PROGRESS` | Veterinario Asignado | Validación de identidad de mascota en domicilio |
| `IN_PROGRESS` | `COMPLETED` | Veterinario Asignado | Procedimientos completados; compromisos posvisita creados |
| `CONFIRMED` | `NO_SHOW` | Veterinario Asignado | Espera mínima cumplida en domicilio sin respuesta del tutor |

---

## 2. MÁQUINA DE ESTADOS DE RESERVA TEMPORAL (`appointment_holds`)

```mermaid
stateDiagram-v2
    [*] --> HELD : create_appointment_hold() (TTL = 15 min)
    HELD --> CONSUMED : Cita confirmada exitosamente
    HELD --> EXPIRED : Supera expires_at sin confirmación
    HELD --> RELEASED : Usuario abandona o cancela reserva
    
    CONSUMED --> [*]
    EXPIRED --> [*]
    RELEASED --> [*]
```

- **Regla de Concurrencia:** Durante el estado `HELD`, el rango horario del profesional veterinario queda bloqueado para cualquier otra solicitud de reserva.
- **Función de Limpieza:** `expire_stale_appointment_holds()` se ejecuta periódicamente o ante cada consulta de disponibilidad para marcar `is_released = true` en holds que superen `expires_at`.

---

## 3. MÁQUINA DE ESTADOS DE INTERCONSULTAS (`referral_appointments`)

```mermaid
stateDiagram-v2
    [*] --> REFERRAL_REQUESTED : Consulta general deriva a especialista
    REFERRAL_REQUESTED --> SPECIALIST_OFFERED : Notificación y franjas enviadas
    SPECIALIST_OFFERED --> SPECIALIST_ACCEPTED : Especialista confirma aceptación y arancel
    SPECIALIST_OFFERED --> SPECIALIST_DECLINED : Especialista no disponible
    SPECIALIST_ACCEPTED --> IN_PROGRESS : Inicio de atención especializada
    IN_PROGRESS --> REPORT_RECEIVED : Informe médico y contrarremisión subidos
    REPORT_RECEIVED --> CLOSED : Revisión por Director / Médico Tratante
    
    SPECIALIST_DECLINED --> REFERRAL_REQUESTED : Reasignación a otro especialista
```

---

## 4. MÁQUINA DE ESTADOS FINANCIERA (`financial_transactions`)

```mermaid
stateDiagram-v2
    [*] --> REPORTED : Cliente reporta transferencia / pasarela
    REPORTED --> UNDER_REVIEW : Finanzas recibe comprobante en staging
    UNDER_REVIEW --> RECONCILED : Verificación bancaria exitosa contra extracto
    UNDER_REVIEW --> REJECTED : Comprobante inválido o monto erróneo
    RECONCILED --> RECEIPT_ISSUED : Recibo oficial generado y despachado
    RECONCILED --> REFUND_REQUESTED : Incidencia justificada de devolución
    REFUND_REQUESTED --> REFUNDED : Devolución procesada y soportada
```

- **Aislamiento:** La transición a `RECONCILED` requiere autorización explícita de un usuario con rol `finance_reconciliation` o `director`.
- **Inmutabilidad:** Una vez en `RECEIPT_ISSUED`, el registro financiero es inmutable; cualquier corrección exige una transacción de ajuste compensatorio.
