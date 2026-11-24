# VET FREEDOM OS — POLÍTICA DE EXTRACCIÓN DE COMPROMISOS POST-VISITA POR IA
## Gobernanza de Inferencia, Salvaguarda Anti-Alucinación y Validación Humana
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS & CONTINUITY HUB  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Regla WFX:** WFX-009 (Hallucination Guard) & WFX-005/006 (Source Provenance)  

---

## 1. Alcance y Principios de Seguridad

El análisis de transcripciones de audio, notas de campo del veterinario o mensajes del tutor mediante modelos de lenguaje (LLM) tiene como único propósito asistir al equipo en la detección oportuna de tareas y promesas operativas post-atención.

Bajo ninguna circunstancia la inteligencia artificial asume decisiones médicas ni adquiere compromisos vinculantes sin la mediación humana expresa.

---

## 2. Salvaguardas Estrictas de Extracción (AI Guardrails)

1. **Clasificación Automática como `INFERRED`:**
   - Todo compromiso, tarea o promesa extraída por IA se rotula invariablemente con `source_provenance = 'INFERRED'` y `human_validated = false`.
   - Se bloquea su despacho automático hacia cualquier canal externo hasta que el médico tratante ratifique su validez.
2. **Prohibición Absoluta de Inferencia Clínica:**
   - La IA tiene prohibido:
     - Diagnosticar patologías o interpretar resultados de laboratorio.
     - Prescribir medicamentos, sugerir cambios de dosis o recetar terapias.
     - Dar por cerrado un caso médico sin firma veterinaria.
3. **Filtrado de Falsos Positivos y Cortesía:**
   - Frases de cordialidad como *"que el perrito mejore"*, *"quedamos en contacto"*, o *"estaremos atentos"* deben ser descartadas y no generar compromisos en la base de datos.
   - Solo afirmaciones con acción concreta, responsable inferible y marco temporal razonable se estructuran como promesas tentativas.

---

## 3. Esquema Estructurado de Inferencia JSON

Cuando el pipeline de IA analiza el contenido de una visita, debe emitir una estructura rigurosamente tipada:

```json
{
  "detected_commitments": [
    {
      "action_description": "Enviar orden médica para ecografía abdominal",
      "category": "CLINICAL",
      "target_role": "VETERINARIAN",
      "due_in_hours": 24,
      "source_excerpt": "Mañana en la mañana te preparo la orden de la ecografía",
      "confidence_score": 0.94,
      "human_validation_required": true
    }
  ]
}
```

Si el `confidence_score` es inferior a 0.85, la inferencia se descarta silenciosamente para prevenir ruido y falsas alertas operativas.
