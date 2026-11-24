# Política de Revisiones y Datos Tardíos (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Tratamiento de Datos Tardíos (Late-Arriving Data)

Un dato tardío es cualquier registro operativo o financiero que arriba a la base de datos después de la congelación del snapshot matutino (ej. después de las 06:00 AM).

### Reglas Invariables:
1. **No Destrucción del Pasado:** El registro del Snapshot `v1` jamás se modifica ni se sobreescribe.
2. **Generación de Versión Incremental:** La función `create_daily_report_version` incrementa el puntero a `v2`, `v3`, etc.
3. **Indicador `is_current`:** Solo una versión permanece como `is_current = true` para consultas activas del dashboard.
4. **Trazabilidad de la Causa:** Cada nueva versión debe documentar su `trigger_reason`:
   - `LATE_CLINICAL_CLOSURE_OKVET`
   - `BANK_RECONCILIATION_UPDATE`
   - `MANUAL_AUDIT_CORRECTION`
   - `SYSTEM_REPLAY_RECOVERY`

---

## 2. Cálculo Automático de Discrepancias (Diffs)

Al generarse una nueva versión, el sistema calcula un diff estructurado:

```json
{
  "previous_version": 1,
  "new_version": 2,
  "changes": [
    {
      "domain": "VISITS",
      "metric": "visits_completed",
      "from_value": 8,
      "to_value": 9,
      "diff": "+1",
      "reason": "OKVET clinical note closed at 22:45"
    },
    {
      "domain": "FINANCES",
      "metric": "verified_revenue_cop",
      "from_value": 2450000,
      "to_value": 2635000,
      "diff": "+185000",
      "reason": "Bank transfer cleared"
    }
  ],
  "authorized_by": "vet-luis-rios",
  "applied_at": "2026-11-21T18:30:00-05:00"
}
```
