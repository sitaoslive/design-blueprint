# VET FREEDOM OS — MÁQUINA DE ESTADOS DE CONCILIACIÓN
## Ciclo de Vida de Corridas, Discrepancias y Reparaciones

---

### 1. Ciclo de Vida de una Corrida de Conciliación (`integration_reconciliation_runs`)

Cada ejecución del motor VET-CORE-18 (programada a las 02:00 AM, gatillada por webhook o manual) transiciona a través de estados formalmente controlados:

```mermaid
stateDiagram-v2
    [*] --> PENDING: Scheduler / Trigger dispara corrida
    PENDING --> RUNNING: claim_reconciliation_run()<br/>Advisory lock adquirido
    
    RUNNING --> EVALUATING: Conectores y snapshots cargados
    
    EVALUATING --> CLEAN: 0 discrepancias detectadas
    EVALUATING --> DISCREPANCIES_FOUND: 1+ discrepancias identificadas
    
    DISCREPANCIES_FOUND --> REPAIRING: Reparaciones seguras en curso
    REPAIRING --> COMPLETED: Reparaciones finalizadas y tareas creadas
    CLEAN --> COMPLETED: Reporte limpio auditado
    
    RUNNING --> FAILED: Error de base de datos o timeout crítico
    EVALUATING --> FAILED: Error fatal en motor de reglas
    REPAIRING --> FAILED: Fallo no recuperable en ejecución
    
    COMPLETED --> [*]
    FAILED --> [*]
```

- **Mecanismo Concurrente**: `claim_reconciliation_run` utiliza `pg_try_advisory_xact_lock(hashtext('vet_reconciliation_run_lock'))` para garantizar que dos workers o schedulers paralelos no compitan ni corrompan el estado.

---

### 2. Ciclo de Vida de una Discrepancia (`integration_reconciliation_discrepancies`)

Toda desviación detectada se registra como una fila inmutable en `integration_reconciliation_discrepancies` y sigue la siguiente máquina de estados:

```mermaid
stateDiagram-v2
    [*] --> OPEN: Detectada por motor de reglas
    
    OPEN --> UNDER_REVIEW: En análisis por clasificador o auditor
    
    UNDER_REVIEW --> SAFE_REPAIR_PROPOSED: Clasificada como segura (auto-reparable)
    UNDER_REVIEW --> HUMAN_APPROVAL_PENDING: Requiere aprobación (clínica / citas / dinero)
    UNDER_REVIEW --> DISMISSED: Falso positivo o latencia asíncrona esperada
    
    SAFE_REPAIR_PROPOSED --> REPAIR_EXECUTED: execute_authorized_safe_repair()
    HUMAN_APPROVAL_PENDING --> REPAIR_EXECUTED: Aprobada por Dr. Ríos / Coordinador
    HUMAN_APPROVAL_PENDING --> REJECTED: Rechazada por operador humano
    
    REPAIR_EXECUTED --> RESOLVED_VERIFIED: verify_reconciliation_result() OK
    REPAIR_EXECUTED --> REPAIR_FAILED: Fallo de verificación post-ejecución
    
    REPAIR_FAILED --> OPEN: Re-evaluación en siguiente ciclo
    REJECTED --> DISMISSED: Cierre con justificación auditada
    RESOLVED_VERIFIED --> [*]
    DISMISSED --> [*]
```

---

### 3. Matriz de Transiciones Permitidas y Prohibidas

| Estado Origen | Estado Destino Permitido | Estados Prohibidos | Criterio de Bloqueo |
| :--- | :--- | :--- | :--- |
| `OPEN` | `UNDER_REVIEW`, `DISMISSED` | `RESOLVED_VERIFIED`, `REPAIR_EXECUTED` | No se puede marcar como resuelta sin haber sido evaluada ni reparada. |
| `UNDER_REVIEW` | `SAFE_REPAIR_PROPOSED`, `HUMAN_APPROVAL_PENDING`, `DISMISSED` | `REPAIR_EXECUTED` | Requiere propuesta previa y autorización formal. |
| `HUMAN_APPROVAL_PENDING` | `REPAIR_EXECUTED` (si aprobada), `REJECTED` | `SAFE_REPAIR_PROPOSED` | Una vez escalada a humano, no puede ser degradada a auto-reparación por IA. |
| `REPAIR_EXECUTED` | `RESOLVED_VERIFIED`, `REPAIR_FAILED` | `OPEN`, `DISMISSED` | Requiere verificación instrumental obligatoria post-ejecución. |
| `RESOLVED_VERIFIED` | *(Ninguno - Estado Terminal)* | Cualquier cambio de estado | La auditoría es inmutable (append-only). |
