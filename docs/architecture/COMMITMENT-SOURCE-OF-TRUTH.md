# VET FREEDOM OS — COMMITMENT SOURCE OF TRUTH HIERARCHY
## Jerarquía de Fuentes de Verdad, Autoridad Médica y Reconciliación de Contradicciones
**Módulo:** VET-CORE-12 | POST-VISIT COMMITMENTS  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Estándar:** WFX-005, WFX-006 y WFX-018  

---

## 1. Pirámide Canónica de Fuentes de Verdad

```mermaid
flowchart TD
    subgraph Nivel1["NIVEL 1: Fuente Clínica Oficial Inviolable"]
        OKVET["OKVET (Historia Clínica Oficial)<br/>- Diagnósticos definitivos<br/>- Fórmulas y recetas médicas<br/>- Paraclínicos certificados<br/>- Registro médico-legal"]
    end

    subgraph Nivel2["NIVEL 2: Fuente Operativa y de Autorización"]
        Supa["Supabase PostgreSQL 17<br/>- post_visit_cases & commitments<br/>- Máquinas de estados y cierres<br/>- Permisos RLS y firmas COMVEZCOL<br/>- Auditoría inmutable de cambios"]
    end

    subgraph Nivel3["NIVEL 3: Capa de Orquestación y Automatización"]
        N8N["n8n Cloud (Orquestador Reactivo)<br/>- Enrutamiento de eventos<br/>- Cron de detección de vencimientos (5m)<br/>- Safe Mode sender (send_enabled: false)"]
    end

    subgraph Nivel4["NIVEL 4: Interfaces y Mensajería Informal"]
        UI["Lovable UI + WhatsApp Inbound<br/>- Notas operativas de staff<br/>- Conversaciones con tutores<br/>- Inferencias de IA (PROPOSED / INFERRED)"]
    end

    OKVET -->|Prima sobre| Supa
    Supa -->|Gobierna a| N8N
    N8N -->|Canaliza hacia| UI
```

---

## 2. Clasificación de Procedencia del Dato (`source_provenance`)

1. **`VERIFIED`:** Información originada en un acto médico directo o refrendada por historia clínica oficial en OKVET.
2. **`REPORTED`:** Información comunicada por el cliente o tutor (ej. "el perro vomitó la pasta"). Se registra como hecho comunicado, no como diagnóstico.
3. **`INFERRED`:** Candidatos extraídos por IA a partir de texto o transcripciones. **Axioma:** Una inferencia de IA **NUNCA** se convierte automáticamente en orden clínica ni en obligación contractual sin validación humana.
4. **`PENDING_CONFIRMATION`:** Obligaciones registradas de forma preliminar que requieren cotejo con la clínica externa.
5. **`STALE`:** Datos con más de 365 días de antigüedad sin actualización que exigen revalidación obligatoria (WFX-006).
6. **`CONFLICTING`:** Discrepancia explícita entre lo anotado informalmente y el registro oficial de OKVET (WFX-018).

---

## 3. Protocolo de Reconciliación de Contradicciones (WFX-018)

Si surge una discordancia (ejemplo: nota en chat indica *"dar 10 gotas"* mientras la historia oficial en OKVET indica *"dar 5 gotas"*):
- El compromiso se marca inmediatamente como `source_provenance = 'CONFLICTING'`.
- Se suspende de forma automática cualquier recordatorio programado hacia el tutor.
- Se genera una tarea de alta prioridad (`HIGH`) para el médico veterinario tratante.
- La historia en OKVET prevalece legal y clínicamente; la corrección se asienta con auditoría en `post_visit_audit`.
