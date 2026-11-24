# VET FREEDOM OS — RECURRENCE GENERATION
## Generación Determinística de Ocurrencias y Cálculo de Ventanas
**Módulo:** VET-CORE-09  
**Procedimiento Almacenado:** `generate_plan_occurrences()`  

---

## 1. Algoritmo de Generación Determinística

La generación de ocurrencias no utiliza cron jobs especulativos ni loops asíncronos no controlados. Se ejecuta a través de la función PL/pgSQL `generate_plan_occurrences(p_plan_id, p_performed_by)`.

### Fórmula de Cálculo:
Para cada secuencia $s \in [1, N]$:
$$ \text{target\_date}_s = \text{start\_date} + (s - 1) \times \text{cadence\_interval\_days} $$

```
Si is_window_strict == true:
    window_start_date = target_date
    window_end_date = target_date
Si is_window_strict == false:
    window_start_date = target_date - window_tolerance_days_before
    window_end_date = target_date + window_tolerance_days_after
```

---

## 2. Idempotencia y Clave de Unicidad Lógica

Para evitar colisiones o duplicación de citas ante reintentos o reconexiones de n8n, se aplica una restricción única estricta a nivel de base de datos:

```sql
CONSTRAINT uq_plan_version_sequence UNIQUE (plan_id, plan_version, occurrence_sequence)
```

La sentencia `ON CONFLICT (plan_id, plan_version, occurrence_sequence) DO NOTHING;` garantiza que múltiples ejecuciones del generador sean completamente seguras y retornen el conteo exacto de ocurrencias nuevas generadas.

---

## 3. Nomenclatura Homologada de Ocurrencias

Cada sesión recibe un código identificador secuencial para comunicación y trazabilidad:
`{plan_code}-S{sequence_padded}` (Ejemplo: `REC-2026-8412-S01`, `REC-2026-8412-S02`).
