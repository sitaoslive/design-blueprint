# VET FREEDOM OS — SPECIALIST REPORT REVIEW SOP
## Procedimiento Operativo: Recepción, Revisión y Dictamen Clínico de Informes de Especialistas
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tablas:** `specialist_report_receipts`, `specialist_report_reviews`, `specialist_referral_commitments`  

---

## 1. Protocolo de Recepción del Informe Externo

Cuando el especialista concluye la consulta o estudio paraclínico:

1. **Recepción Segura:** El informe se radica a través del buzón clínico o correo oficial y se almacena en el bucket privado `referral-documents`.
2. **Validación de Identidad:** El coordinador verifica que el nombre del paciente y del tutor en el encabezado coincidan con la remisión activa.
3. **Registro en Base de Datos:** Se asienta el registro en `specialist_report_receipts` y el caso transita a `REPORT_RECEIVED`.

---

## 2. Dictamen Veterinario Obligatorio (`record_and_review_specialist_report`)

El médico veterinario tratante de Vet Life realiza la lectura crítica del informe y dictamina formalmente una de las siguientes opciones:

- `ACCEPTED_COMPLIANT`: Informe completo, diagnóstico claro y plan de tratamiento compatible.
- `ACCEPTED_WITH_OBSERVATIONS`: Informe aceptado pero se requieren aclaraciones menores con el especialista.
- `REJECTED_INCONCLUSIVE`: Estudio incompleto o muestra no representativa que amerita repetición.
- `REQUIRES_SECOND_OPINION`: Hallazgos discordantes con la clínica del paciente que requieren valoración adicional.

---

## 3. Derivación a Compromisos de Continuidad

Tras dictaminar el informe, el veterinario define los compromisos obligatorios en `specialist_referral_commitments`:
- Iniciar o ajustar medicamentos prescritos por el especialista.
- Programar control domiciliario por Vet Life a los 15 días.
- Programar ecografía de control en 6 meses.
- Capacitar al tutor sobre signos de alarma.
