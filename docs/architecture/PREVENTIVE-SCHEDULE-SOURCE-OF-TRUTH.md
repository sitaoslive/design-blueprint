# VET FREEDOM OS — PREVENTIVE SCHEDULE SOURCE OF TRUTH
## Fuentes de Verdad y Cálculo Individualizado de Fechas
**Módulo:** VET-CORE-10  
**Procedimiento Almacenado:** `generate_preventive_event()`  

---

## 1. Jerarquía de Fuentes de Información

Para determinar la fecha de un próximo refuerzo o control preventivo:
1. **Primer Nivel (Máxima Autoridad):** Registro y prescripción activa en OKVET firmada por médico veterinario (`source_system = 'OKVET'`).
2. **Segundo Nivel:** Plan preventivo formalizado en Supabase con firma de profesional habilitado (`status = 'APPROVED'`).
3. **Tercer Nivel (Sujeto a Revalidación):** Importación autorizada de datos históricos previos (`confidence_status = 'PENDING_AUDIT'`).
4. **Nivel No Autorizado:** Comentarios de clientes en WhatsApp o inferencias algorítmicas (`UNVERIFIED`).

---

## 2. Cálculo de Ventanas de Tolerancia

Todo evento preventivo posee:
- `approved_due_at`: Fecha exacta recomendada por el veterinario.
- `approved_window_start`: Límite inferior de tolerancia (ej. $\text{due} - 7\text{d}$).
- `approved_window_end`: Límite superior de tolerancia (ej. $\text{due} + 7\text{d}$).

Las citas solo pueden agendarse dentro de esta franja de tolerancia para garantizar la efectividad inmunológica y la seguridad del biológico.
