# VET FREEDOM OS — POST-VISIT CHECKLIST RUNBOOK
## Protocolo Operativo y Clínico de Checklist al Finalizar Visitas Domiciliarias
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS & CONTINUITY HUB  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Herramienta:** Lovable Interface + Supabase RPC `record_post_visit_checklist`  

---

## 1. Propósito del Checklist Post-Visita

El checklist post-visita garantiza que ningún detalle clínico, documental, operativo o de servicio sea omitido antes de que el médico veterinario abandone el domicilio del paciente. Asegura la captura estructurada de compromisos y previene olvidos en la entrega de recetas, cobros, muestras biológicas o indicaciones al tutor.

---

## 2. Tipología de Checklists según Tipo de Servicio

Cada tipo de servicio veterinario activa una plantilla obligatoria de verificación:

### A. Consulta General y Control de Salud
1. **Examen Físico Completo:** Constatación y registro de constantes vitales (temperatura, peso, frecuencia cardíaca, respiratoria, TRC).
2. **Explicación del Diagnóstico:** Comunicación clara del diagnóstico presuntivo o diferencial al tutor.
3. **Plan Terapéutico Entregado:** Emisión física o digital de la fórmula médica y explicación de posología.
4. **Muestras Tomadas:** Identificación, rotulado y conservación de tubos o frotis recogidos.
5. **Cierre Financiero:** Confirmación de método de pago y registro del comprobante.
6. **Compromisos Posteriores:** Registro explícito de llamadas de control o envío de exámenes.

### B. Vacunación y Medicina Preventiva
1. **Verificación de Cadena de Frío:** Registro del lote, laboratorio y fecha de vencimiento del biológico en la libreta sanitaria y en Supabase.
2. **Evaluación Pre-Vacunal:** Confirmación de ausencia de hipertermia o síntomas que contraindiquen la aplicación.
3. **Instrucciones Post-Vacunales:** Advertencia sobre posibles reacciones secundarias esperadas y signos de alarma.
4. **Programación de Próxima Dosis:** Fijación de fecha límite para refuerzo o desparasitación subsecuente.

### C. Procedimientos y Cirugía Menor Ambulatoria
1. **Recuperación Anestésica:** Verificación de signos vitales estables, reflejos deglutorios y capacidad de bipedestación o confort.
2. **Cuidado de Heridas:** Instrucciones escritas sobre limpieza, collar isabelino y analgésicos.
3. **Canal de Emergencia:** Suministro de línea directa de seguimiento para las siguientes 24 horas.
4. **Compromiso de Retiro de Puntos:** Programación de cita de revisión a los 8–10 días.

---

## 3. Estructura de Datos y Persistencia

El almacenamiento se realiza en las tablas `public.post_visit_checklists` y `public.post_visit_checklist_items`:

```sql
SELECT public.record_post_visit_checklist(
    p_visit_id := 'c0a80120-0000-0000-0000-000000000001',
    p_veterinarian_id := 'c0a80101-0000-0000-0000-000000000001',
    p_items := '[
        {"item_code": "CLINICAL_EXAM", "category": "CLINICAL", "is_mandatory": true, "status": "COMPLETED", "notes": "Examen normal"},
        {"item_code": "PRESCRIPTION_ISSUED", "category": "CLINICAL", "is_mandatory": true, "status": "COMPLETED", "notes": "Fórmula entregada"},
        {"item_code": "SAMPLES_COLLECTED", "category": "LOGISTICAL", "is_mandatory": false, "status": "NOT_APPLICABLE", "notes": "No requirió muestras"},
        {"item_code": "PAYMENT_CONFIRMED", "category": "ADMINISTRATIVE", "is_mandatory": true, "status": "COMPLETED", "notes": "Transferencia recibida"}
    ]'::jsonb,
    p_closure_notes := 'Visita concluida sin novedades clínicas adversas.'
);
```

---

## 4. Política ante Checklist Incompleto

Si el médico veterinario debe retirarse del domicilio con ítems obligatorios sin completar:
1. El checklist se guarda en estado `INCOMPLETE_FLAGGED`.
2. Se genera automáticamente un incidente en `post_visit_commitment_escalations`.
3. El caso post-visita permanece abierto en estado `PENDING_CHECKLIST_RESOLUTION`.
4. El sistema restringe el cierre definitivo de continuidad hasta que el profesional responsable complete o exonere formalmente los puntos omitidos.
