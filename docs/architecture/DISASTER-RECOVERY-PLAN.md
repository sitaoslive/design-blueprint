# PLAN DE RECUPERACIÓN ANTE DESASTRES (DRP) — VET FREEDOM OS
**Proyecto:** Vet Life — Veterinaria a Domicilio  
**Responsable Máximo:** Dr. Luis Eduardo Ríos  
**Arquitectura:** Google Antigravity + Supabase + n8n Cloud + Lovable + GitHub  
**Versión:** 2.0 (Oficial)  
**Zona Horaria:** `America/Bogota` (UTC-5)  

---

## 1. Declaración de Misión y Filosofía de Resiliencia
Este Plan de Recuperación ante Desastres (DRP) establece las políticas, procedimientos y salvaguardas técnicas para restablecer la totalidad del ecosistema tecnológico de Vet Life ante contingencias mayores:
- Fallo total de región en el proveedor de nube (Supabase / AWS / n8n Cloud).
- Corrupción lógica masiva de base de datos o error humano en migraciones.
- Falla catastrófica de conectividad externa (WhatsApp Cloud API / Google Calendar).
- Compromiso de seguridad o incidente de integridad de datos.

---

## 2. Métricas Comprometidas de Continuidad (RPO y RTO)

| Métrica | Meta Operativa Comprometida | Mecanismo de Garantía |
|---|---|---|
| **RPO (Recovery Point Objective)** | **<= 5 minutos** | Continuous WAL Archiving y PITR (Point-in-Time Recovery) en Supabase. |
| **RTO (Recovery Time Objective)** | **<= 15 minutos** | Restauración automatizada de esquemas DDL (001 a 025), reanudación de colas y verificación de integridad. |

---

## 3. Matriz de Clasificación de Criticidad de Servicios

| Nivel de Servicio | Componentes Incluidos | RPO Objetivo | RTO Objetivo | Estrategia de Respaldo |
|---|---|:---:|:---:|---|
| **NIVEL 1 — CRÍTICO** | Autenticación, clientes (`public.owners`), mascotas (`public.pets`), citas (`public.appointments`), historial clínico, permisos RLS. | <= 5 min | <= 15 min | WAL continuo + Dump lógico dominical + Snapshots pre-cambio. |
| **NIVEL 2 — OPERATIVO** | Agendas de veterinarios, turnos, rutas domiciliarias, remisiones, compromisos post-visita, mensajes de WhatsApp. | <= 15 min | <= 30 min | Replicación relacional + transactional outbox idempotente. |
| **NIVEL 3 — SOPORTE** | Reportes ejecutivos diarios/semanales, métricas agregadas de negocio, telemetría de monitoreo. | <= 24 h | <= 2 h | Reconstruible automáticamente mediante funciones agregadas. |
| **NIVEL 4 — RECONSTRUIBLE** | Cachés, tokens temporales, archivos temporales de exportación. | N/A | Inmediato | Regeneración bajo demanda. |

---

## 4. Secuencia Segura de Restauración (20 Pasos Obligatorios)

1. **Declaración del Incidente:** Confirmación formal del fallo por el Dr. Luis Eduardo Ríos o el Ingeniero SRE.
2. **Aislamiento Total de Tráfico:** Detener triggers webhooks y tráfico externo para congelar escrituras.
3. **Selección del Respaldo Autorizado:** Localizar el último manifest válido con checksum SHA-256 verificado en `integration_backup_records`.
4. **Validación Criptográfica:** Comprobar integridad de hash SHA-256 del archivo de respaldo.
5. **Creación del Entorno Aislado (Sandbox):** Desplegar base de datos de contingencia temporal.
6. **Inyección de Secretos de Prueba:** Utilizar credenciales sandbox (`send_enabled: false`).
7. **Restauración del Esquema DDL:** Aplicar migraciones 001 a 025 verificando 0 errores de sintaxis.
8. **Restauración de Datos Sintéticos / Permitidos:** Carga consistente respetando claves foráneas.
9. **Restauración de Storage:** Comprobar buckets privados `medical-records` y `referral-documents`.
10. **Reconstrucción de Políticas RLS:** Auditar que el 100% de tablas (98/98) tengan `rowsecurity = true`.
11. **Auditoría de Roles de Usuario:** Verificar que los 11 roles mantengan privilegios mínimos.
12. **Restauración de Workflows n8n:** Importar los 22 workflows desde `automation/n8n/workflows/` con `active: false`.
13. **Verificación de Referencias de Credenciales:** Enlazar credenciales de servicio mediante procedimiento controlado.
14. **Auditoría de Integridad Referencial:** Ejecutar `SELECT public.verify_backup_restorability(...)` comprobando 0 violaciones FK.
15. **Ejecución de Suite de Smoke Tests:** Correr `tests/audit_workflows_wiring.js` y `VET-QA-001`.
16. **Medición del Tiempo de Recuperación Real (RTO):** Registrar minutos transcurridos en bitácora.
17. **Cálculo de Pérdida Potencial de Datos (RPO):** Comparar último timestamp consistente con la hora del fallo.
18. **Aprobación de Reanudación:** Firma y confirmación explícita del Director médico.
19. **Reanudación Controlada:** Conmutación de DNS/URLs y habilitación progresiva de triggers.
20. **Conservación de Evidencia:** Archivar logs forenses en `docs/tests/` y cerrar la incidencia.

---

## 5. Prevención de Duplicados Post-Restauración (Regla de Oro)
Para evitar que un sistema restaurado reenvíe mensajes ya entregados, duplique cobros o genere citas repetidas:

```
BACKUP RESTAURADO
      |
      v
AISLAMIENTO (send_enabled: false)
      |
      v
INVENTARIO DE EVENTOS PENDIENTES (transactional_outbox)
      |
      v
CONCILIACIÓN CON PROVEEDORES (Meta WhatsApp / WABA / Pasarelas)
      |
      v
IDENTIFICACIÓN DE EFECTOS EXTERNOS YA EJECUTADOS
      |
      v
ACTUALIZACIÓN DE ESTADOS (Marcar como PROCESSED eventos ya despachados)
      |
      v
APROBACIÓN DE REANUDACIÓN POR EL DR. LUIS EDUARDO RÍOS
      |
      v
PROCESAMIENTO CONTROLADO
```
