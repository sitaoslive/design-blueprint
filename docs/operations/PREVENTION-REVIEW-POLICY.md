# Política de Revisión y Validación Clínica Preventiva (VET-CORE-10)

## 1. Fundamento de Cuidado Individualizado
Vet Life — Veterinaria a Domicilio y el Dr. Luis Eduardo Ríos rechazan categóricamente los planes de vacunación y desparasitación automatizados basados en tablas genéricas universales por edad o peso.

Cada plan de medicina preventiva debe ser diseñado o ratificado de forma individualizada considerando:
1. Especie (canina / felina) y raza.
2. Estilo de vida (mascota estrictamente indoor, acceso a parques, viajes rurales, convivencia con otros animales).
3. Zona geográfica y carga endémica en Bogotá / Sabana.
4. Historial clínico previo, reacciones adversas pasadas, comorbilidades y estado inmunológico.

## 2. Prohibiciones Clínicas Terminantes
- **Cero Dosificación por IA:** Ningún modelo de lenguaje, automatización n8n o webhook puede calcular dosis de antiparasitarios o vacunas en función del peso reportado por el tutor.
- **Cero Prescripción Automática:** El sistema nunca debe sugerir principios activos ni marcas comerciales a los tutores sin una orden médica explícita firmada en OKVET.
- **Cero Modificación No Autorizada:** Ningún evento preventivo puede alterarse en fechas o suprimirse sin registro del veterinario tratante.

## 3. Umbral de Caducidad y Revalidación (Freshness Rule > 365 Días)
- Toda información preventiva con una antigüedad mayor a 365 días se clasifica como `STALE_REVALIDATION_REQUIRED`.
- El sistema suspende el despacho de recordatorios automatizados hasta que un veterinario examine al paciente físicamente o valide su historial serológico/clínico.

## 4. Procedimiento de Aprobación de Planes
1. **Creación en Borrador:** El plan nace en estado `DRAFT`.
2. **Revisión Médica:** El médico veterinario colegiado revisa el historial en OKVET y define los antígenos y periodicidades.
3. **Firma y Aprobación:** Al invocar `create_approved_preventive_plan`, el estado pasa a `APPROVED` y se crea la versión inmutable `v1`.
4. **Modificaciones Posteriores:** Cualquier cambio requiere una nueva versión (`update_preventive_plan_version`) con justificación clínica obligatoria.
