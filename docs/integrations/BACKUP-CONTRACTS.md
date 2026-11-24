# CONTRATOS DE INTEGRACIÓN DE RESPALDO Y MANTENIMIENTO (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Versión de Contrato:** `VET-BACKUP-v1.0`  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Esquema del Contrato Universal de Salida

Todo flujo de ejecución de `VET-CORE-21` emite un payload determinista bajo el contrato `VET-BACKUP-v1.0`:

```json
{
  "contract_version": "VET-BACKUP-v1.0",
  "backup_id": "bkp-1795202611-abcde",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "environment": "DEVELOPMENT",
  "resolution_path": "BACKUP_VERIFIED_OK",
  "overall_status": "SUCCESS",
  "is_successful": true,
  "restorability_verified": true,
  "highest_severity": "P3",
  "assigned_role": "TECH_SUPPORT",
  "executive_headline_es": "Respaldo de base de datos verificado y restaurabilidad confirmada (100% íntegro).",
  "issues_count": 0,
  "issues_detected": [],
  "audit_metrics": {
    "backup_size_bytes": 18450000,
    "backup_size_mb": "17.60",
    "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "fk_violations": 0,
    "rls_unprotected_tables": 0,
    "tables_restored_tested": 98,
    "purged_old_events": 42,
    "maintenance_window_active": false
  },
  "p0_director_alert": false,
  "suppress_core20_alerts": false,
  "coordinated_at": "2026-11-21T06:05:00.000Z"
}
```

---

## 2. Contrato de Entrada para Disparo Bajo Demanda

Endpoint: `POST https://alphavision.app.n8n.cloud/webhook/maintenance/trigger`

```json
{
  "action_type": "ON_DEMAND_BACKUP",
  "organization_id": "11111111-1111-1111-1111-111111111111",
  "environment": "DEVELOPMENT",
  "params": {
    "maintenance_window_active": false,
    "backup_size_bytes": 18450000,
    "checksum_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "restore_test_status": "PASSED"
  }
}
```

---

## 3. Matriz de Rutas de Resolución

| `overall_status` | `resolution_path` | `highest_severity` | Destino / Acción |
|---|---|---|---|
| `SUCCESS` | `BACKUP_VERIFIED_OK` | `P3` | Registro nominal en Supabase. |
| `MAINTENANCE_WINDOW_ACTIVE` | `MAINTENANCE_WINDOW_COORDINATED` | `P3` | Flag `suppress_core20_alerts = true` enviado a CORE-20. |
| `CRITICAL` | `BACKUP_INTEGRITY_FAILURE_P0` | `P0` | Notificación inmediata al Dr. Luis Eduardo Ríos. |
| `ERROR` / Fallback | `EMERGENCY_ROLLBACK_TRIGGERED` | `P0` | Protocolo DRP y conmutación de emergencia. |
