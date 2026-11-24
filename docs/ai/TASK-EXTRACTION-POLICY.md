# VET FREEDOM OS — POLÍTICA DE EXTRACCIÓN DE TAREAS POR IA
**Módulo:** VET-CORE-07 | AI Task Extraction & Safety Governance  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Alcance y Seguridad en la Inferencia de IA

Los modelos de lenguaje (LLMs) integrados en VET-CORE-02 (WhatsApp Inbound) analizan conversaciones entre clientes y el equipo para detectar solicitudes, dudas o compromisos. Para salvaguardar la operación médica y la responsabilidad legal de Vet Life, se establecen las siguientes políticas:

1. **Inferencia como Propuesta:** Las tareas extraídas por IA ingresan a la base de datos con categoría y prioridad sugeridas, pero sujetas a validación del coordinador o flujo automatizado de reglas duras.
2. **Prohibición de Tareas Clínicas Autónomas:** La IA **nunca** puede generar tareas de modificación de dosis de medicamentos, suspensión de tratamientos o diagnóstico clínico. Si un cliente describe síntomas de empeoramiento, la IA genera exclusivamente una tarea de tipo `EMERGENCY_COVERAGE` o `CLINICAL_CHECK` para que un veterinario humano valore al paciente.
3. **Filtrado de Expresiones Tentativas:** Expresiones ambiguas o de cortesía ("quizás la otra semana", "ojalá podamos agendar") no deben generar compromisos en `operational_commitments`. Sólo las afirmaciones con intención clara y datos concretos son procesadas.
