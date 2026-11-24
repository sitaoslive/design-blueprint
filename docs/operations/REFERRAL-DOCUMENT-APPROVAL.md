# VET FREEDOM OS — REFERRAL DOCUMENT APPROVAL SOP
## Procedimiento Operativo: Elaboración, Revisión y Aprobación de Resúmenes Clínicos de Remisión
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Tabla:** `specialist_referral_documents`  

---

## 1. Contenido Obligatorio del Resumen de Remisión

Todo documento clínico preparado para remisión a un especialista debe contener:

1. **Datos de Filiación:** Nombre del paciente, especie, raza, edad, sexo, estado reproductivo y nombre del tutor.
2. **Motivo de Remisión e Indicación Clínica:** Descripción precisa del hallazgo clínico o sospecha diagnóstica (ej. *Soplo cardíaco holosistólico grado III/VI apexiano izquierdo*).
3. **Anamnesis Relevante y Evolución:** Síntomas observados en el domicilio (ej. tos nocturna, síncope, intolerancia al ejercicio).
4. **Tratamientos Previos y Actuales:** Fármacos administrados, dosis, frecuencia y última administración.
5. **Estudios Previos Adjuntos:** Hemogramas, perfiles bioquímicos o radiografías previas.
6. **Firma y Registro del Veterinario Tratante:** Identificación completa del médico de Vet Life con tarjeta profesional.

---

## 2. Aprobación y Bloqueo de Borradores

- **Estado DRAFT:** El personal administrativo puede preparar la plantilla y consolidar los exámenes, pero el documento permanece estrictamente bloqueado para descarga por terceros.
- **Aprobación Obligatoria:** Solo un usuario con rol `veterinarian` puede llamar a la función de aprobación y cambiar el estado a `APPROVED`.
- **Rechazo con Causa:** Si el veterinario detecta discrepancias en la dosis o en la indicación, rechaza el documento indicando el motivo (`rejected_reason`), forzando una nueva versión corregida.
