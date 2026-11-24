# Gestión de Conflictos de Datos Preventivos (VET-CORE-10)

## 1. Naturaleza de los Conflictos
En medicina veterinaria a domicilio surgen discrepancias frecuentes entre:
1. Registros oficiales previos en OKVET.
2. Afirmaciones verbales o por chat de los tutores (ej. "ya lo vacunaron en otra veterinaria hace 2 meses").
3. Libretas sanitarias físicas con sellos incompletos o ilegibles.
4. Datos migrados de bases históricas (`IMPORT_CSV`).

## 2. Detección Automática de Conflictos
El procedimiento `reconcile_preventive_source_record` detecta discrepancias en fechas de revacunación y estado previo:
- Si un reporte entrante colisiona con un evento programado activo, el estado del registro fuente se asigna a `CONFLICT_DETECTED`.
- El evento preventivo asociado entra en suspensión temporal de comunicaciones para evitar enviar mensajes que confundan al tutor o contradigan la realidad.

## 3. Principio de Cero Resolución por IA
- **PROHIBICIÓN:** Ningún modelo de lenguaje artificial ni automatización de n8n está autorizado para arbitrar o decidir cuál de los dos registros es verídico.
- Todo conflicto debe ser revisado de forma personal por el Dr. Luis Eduardo Ríos o el médico veterinario a cargo del caso.

## 4. Opciones de Resolución Clínica
El veterinario dispone de las siguientes vías formales en el panel Lovable / Supabase:
1. **Inspección Física de Carnet:** Verificación del carnet original con firma y sello del colega veterinario.
2. **Titulación de Anticuerpos (Serología):** Para determinar si el paciente cuenta con inmunidad activa contra parvovirus/moquillo antes de decidir revacunar.
3. **Reinicio de Esquema / Refuerzo Seguro:** Si existe duda razonable sobre la validez de la aplicación previa y no hay riesgo clínico de revacunación.
4. **Registro de Resolución:** Una vez resuelto, se asienta la justificación clínica y se reactiva la programación correspondiente.
