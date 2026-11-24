# Fuente de Verdad para Datos Ejecutivos (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. Principio Fundamental: Supabase como Fuente Única de Verdad

En la arquitectura de VET FREEDOM OS, **Supabase PostgreSQL** es la única fuente oficial e incontrovertible de verdad para el reporte ejecutivo diario. Ni los mensajes informales de chat, ni las planillas locales, ni las conjeturas de IA pueden sustituir el estado registrado en base de datos.

### Jerarquía de Fuentes de Verdad

| Dominio Operativo | Fuente Primaria de Verdad | Mecanismo de Sincronización | Tolerancia de Frescura |
| :--- | :--- | :--- | :--- |
| **Citas & Agendamiento** | `appointments`, `appointment_slots` | Eventos transaccionales locales | Tiempo Real (< 1 min) |
| **Visitas Operativas** | `visits` (`check_in_at`, `check_out_at`) | App móvil veterinaria | Tiempo Real (< 2 min) |
| **Cierre Clínico Oficial** | `visits.okvet_clinical_record_id` | Sincronización API OKVET | Ventana diaria (06:00 - 23:00) |
| **Personal & Ausencias** | `staff_profiles`, `staff_absences` | Portal de coordinación | Diario (antes de 07:00 AM) |
| **Rutas & Logística** | `routes`, `route_stops` | Tracking por puntos de control | En ruta activa (< 5 min) |
| **Planes Recurrentes** | `recurring_care_plans`, `recurring_visits` | Generador automático CORE-09 | Diario 05:00 AM |
| **Plan Preventivo** | `preventive_schedules`, `vaccine_applications` | Módulo preventivo CORE-10 | Diario 05:30 AM |
| **Remisiones Especialistas** | `specialist_referrals`, `specialist_bookings` | Módulo de remisiones CORE-11 | Horario hábil |
| **Compromisos Post-Visita** | `post_visit_commitments` | Módulo compromisos CORE-12 | Al finalizar cada visita |
| **Documentos Aprobados** | `approved_documents` | Firma digital veterinaria CORE-13 | Inmediato tras cierre |
| **Finanzas & Pagos** | `payment_transactions`, `reconciliations` | Webhook pasarelas / Extractos CORE-14 | En línea / Conciliación 10:00 AM |
| **Experiencia & CSAT** | `customer_feedback`, `bereavement_records` | Encuestas automatizadas CORE-15 | Post-entrega / Notificación tutor |

---

## 2. Prevención de Duplicidad y Datos Contradictorios

1. **Visita Completada vs Cierre Clínico:**  
   Una visita con `check_out_at NOT NULL` se computa como **operativamente completada**, pero NO como clínicamente cerrada hasta que `okvet_clinical_record_id` esté poblado. Esta distinción es visible para el Dr. Luis en el brief.
2. **Recaudo Verificado vs Recaudo No Verificado:**  
   Bajo ninguna circunstancia se suman transferencias bancarias sin conciliar al total de "Caja Verificada". Permanecen categorizadas como `UNVERIFIED_PAYMENTS` con su correspondiente conteo y valor para seguimiento del área contable.
3. **Manejo de Tiempos y Cortes:**  
   El día local para Vet Life está delimitado entre las `00:00:00` y las `24:00:00` de la zona horaria `America/Bogota`. Las consultas transaccionales convierten internamente las marcas UTC a la fecha calendario local de Bogotá.

---

## 3. Protocolo ante Falla de Fuentes Externas

Si un conector externo (ej. pasarela de pagos o API de OKVET) experimenta una indisponibilidad o timeout:
- El estado de la métrica se clasifica como `SOURCE_UNAVAILABLE`.
- El reporte matutino **no asume valor 0**, sino que resalta el estado de contingencia.
- Se genera una alerta de nivel `HIGH_PRIORITY` o `CRITICAL_OPERATIONAL` según la severidad del servicio afectado.
