# PLAN DE DESPLIEGUE CONTROLADO Y ROLLBACK (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Procedimiento de Cambio Seguro (17 Pasos Obligatorios)
1. **Inspección de Versión Actual:** Verificar hash Git y migración activa en Supabase.
2. **Documentación del Cambio:** Redactar especificación y notas de la versión.
3. **Identificación de Dependencias:** Validar compatibilidad entre Lovable, Supabase y n8n.
4. **Comprobación de Compatibilidad Retroactiva:** Asegurar que los contratos de API anteriores sigan funcionando.
5. **Verificación de Respaldo Previo Reciente:** Validar existencia de backup verificado < 2 horas.
6. **Preparación del Script de Reversión (Rollback):** Generar SQL inverso o procedimiento de downgrade.
7. **Pruebas en Entorno de Desarrollo (QA):** Ejecución exhaustiva en `vet-freedom-os-dev`.
8. **Ejecución de Regresión Técnica:** Correr suites de pruebas (T01 a T80, QA01 a QA25).
9. **Solicitud Formal de Aprobación:** Presentar resumen de impacto al Dr. Luis Eduardo Ríos.
10. **Programación de Ventana de Mantenimiento:** Registrar ventana en `integration_maintenance_windows`.
11. **Ejecución del Cambio Autorizado:** Aplicación controlada de la migración DDL o workflow.
12. **Verificación de Servicios Core:** Confirmar estado operativo de Supabase y n8n.
13. **Verificación de Workflows:** Ejecutar smoke test de conexión.
14. **Verificación de Integridad de Datos:** Comprobar 0 violaciones de clave foránea.
15. **Confirmación de Integraciones Externas:** Probar webhook de WhatsApp y Calendar.
16. **Registro del Resultado:** Bitácora en `integration_maintenance_windows` (`COMPLETED` o `ROLLED_BACK`).
17. **Cierre Formal de Mantenimiento:** Restablecer monitoreo estricto en `VET-CORE-20`.

---

## 2. Protocolo de Rollback Inmediato
Si durante o inmediatamente después del despliegue se detecta una degradación crítica (P0/P1):
- **Criterio de Disparo:** Falla en más del 5% de solicitudes, caída de webhook principal o violación de integridad referencial.
- **Acción Inmediata:**
  1. Activar estado `EMERGENCY_ROLLBACK_TRIGGERED` en `VET-CORE-21`.
  2. Revertir cambios de código en Git (`git revert`).
  3. Si hubo cambios DDL destructivos, restaurar el snapshot previo generado en el Paso 5.
  4. Reactivar el monitoreo y notificar al Director del estado de contingencia.
