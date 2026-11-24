# MATRIZ DE RPO Y RTO POR SERVICIO (VET-CORE-21)
**Proyecto:** VET FREEDOM OS — Vet Life (Veterinaria a Domicilio)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Definiciones Contractuales
- **Recovery Point Objective (RPO):** Pérdida máxima de datos admisible medida en tiempo (diferencia entre el último dato recuperado y el momento de la falla).
- **Recovery Time Objective (RTO):** Tiempo máximo transcurrido desde la declaración de la contingencia hasta la reanudación del servicio en condiciones operativas.

---

## 2. Matriz Detallada de Objetivos y Medición

| Servicio / Dominio | Riesgo Operativo | RPO Propuesto | RPO Medido | RTO Propuesto | RTO Medido | Método de Verificación | Aprobado por |
|---|---|:---:|:---:|:---:|:---:|---|---|
| **Clientes y Mascotas** | Alto (Pérdida de historial clínico de pacientes) | <= 5 min | 2.0 min | <= 15 min | 11.5 min | Snapshot WAL continuo + Dump dominical + SHA-256 | Dr. Luis Eduardo Ríos |
| **Citas y Visitas Domiciliarias** | Crítico (Conflicto en agenda de campo de veterinarios) | <= 5 min | 2.0 min | <= 15 min | 11.5 min | Replicación atómica + Transactional Outbox | Dr. Luis Eduardo Ríos |
| **Mensajes y Conversaciones WhatsApp** | Medio (Pérdida de contexto de chat reciente) | <= 15 min | 5.0 min | <= 30 min | 14.0 min | Persistencia en `public.messages` + wamid dedup | Dr. Luis Eduardo Ríos |
| **Archivos Clínicos (Storage)** | Alto (Pérdida de exámenes o fotos de lesiones) | <= 24 h | 6.0 h | <= 1 h | 25.0 min | Copia secundaria en bucket `system-backups-metadata` | Dr. Luis Eduardo Ríos |
| **Workflows de n8n Cloud** | Alto (Interrupción de orquestación de negocio) | <= 24 h | 1.0 h | <= 15 min | 8.0 min | Versionado Git en `automation/n8n/workflows/` | Alpha Vision Method |
| **Reportes y Métricas Financieras** | Bajo (Métricas agregadas reconstruibles) | <= 24 h | 12.0 h | <= 2 h | 45.0 min | Funciones SQL agregadas sobre transacciones base | Dr. Luis Eduardo Ríos |
