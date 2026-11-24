# POLÍTICA DE ESCALAMIENTO Y PRIORIDADES DE ALERTAS — VET FREEDOM OS
**Ecosistema:** Vet Life — Veterinaria a Domicilio  
**Clasificación de Incidentes:** P0 a P3  

---

## 1. Niveles de Severidad y Tiempos de Respuesta

| Nivel | Definición | Ejemplos Operativos | Rol Responsable | SLA Máximo |
|:---:|---|---|:---:|:---:|
| **P0** | **Crítico / Seguridad / Continuidad** | Caída total de n8n, Supabase inaccesible, alteración de firma HMAC, brecha de datos. | **DIRECTOR (Dr. Luis)** | < 15 minutos |
| **P1** | **Operación Seriamente Afectada** | WhatsApp bloqueado en horario laboral, Dead Letter Queue con fallos clínicos, médico ausente sin reasignación. | **COORDINATOR** | < 1 hora |
| **P2** | **Degradación Significativa** | Rate limit transitorio, cuota de IA > 90%, cobros pendientes sin verificar > 5, latencia elevada. | **TECH_SUPPORT / FINANCE** | < 4 horas |
| **P3** | **Incidente Menor / Informativo** | Evento duplicado suprimido, jitter transitorio resuelto en reintento, sincronización rutinaria completada. | **TECH_SUPPORT** | Próximo ciclo |

---

## 2. Reglas de Supresión y Anti-Fatiga de Alertas

1. **Deduplicación por Fingerprint:** Si un servicio emite 50 fallos en 5 minutos por la misma causa raíz, se agrupan bajo un único incidente activo incrementando `occurrence_count`.
2. **Ventanas de Mantenimiento (`MAINTENANCE`):** Durante ventanas aprobadas por Dirección, se silencian las alertas P1..P3. Las alertas P0 de seguridad nunca son silenciadas.
3. **Estabilidad antes de Cierre:** Un incidente no se marca como `RESOLVED` tras una única comprobación exitosa; requiere 3 ciclos de monitoreo consecutivos en estado `HEALTHY`.
