# Procedimiento de Despacho y Entrega del Reporte Ejecutivo (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Mecanismo de Despacho en n8n

El workflow `VET-CORE-16` enruta la entrega a través de dos nodos de asignación estructurada:

### 1. Despacho Urgente (`Dispatch Urgent Attention Brief`):
- Se activa cuando `requires_attention === true` (Semáforo Rojo o Amarillo).
- Enrutamiento: `DR_LUIS_PRIORITY_CHANNEL`.
- Prioridad: `ATTENTION_REQUIRED`.
- Parámetros de seguridad: `send_enabled: false`, `qa_mode: true`.

### 2. Despacho Estándar (`Dispatch Standard Executive Brief`):
- Se activa cuando la operación es nominal (Semáforo Verde).
- Enrutamiento: `DR_LUIS_MORNING_DIGEST`.
- Prioridad: `NORMAL`.
- Parámetros de seguridad: `send_enabled: false`, `qa_mode: true`.

---

## 2. Auditoría de Despacho en Supabase

Cada intento de entrega (incluso simulado en QA) registra una fila en:
- `executive_report_delivery_requests`: Parámetros del mensaje, hash del snapshot, canal de destino.
- `executive_report_delivery_results`: Timestamp, estado (`SIMULATED_SUCCESS` en QA, `DELIVERED` en producción), respuesta del conector.
