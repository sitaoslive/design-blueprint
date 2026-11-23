# VET LIFE — OKVET INTEGRATION & RECONCILIATION PLAN
**Caso de Referencia Oficial:** Dr. Luis Eduardo Ríos — Vet Life: Veterinaria a Domicilio  
**Ubicación:** Medellín & Oriente Antioqueño (El Poblado, Laureles, Envigado, Sabaneta, Belén, Llanogrande, Rionegro, El Retiro, La Ceja, Guarne, Marinilla)  
**Sistema de Registro Clínico Oficial:** OKVET (`https://sys.okvet.co/`)  
**Fecha de Verificación:** 2026-11-23  

---

## 1. Principio Rector: OKVET como Fuente Legal Inmutable
Bajo la Ley 576 de 2000 (Código de Ética Médico Veterinaria de Colombia) y los requerimientos del Dr. Luis:
- **OKVET es la única fuente de verdad para historias clínicas oficiales.**
- Vet Freedom OS **NO duplica ni reemplaza la historia clínica de OKVET.**
- Vet Freedom OS actúa como la **capa de telemetría de campo, asistente de despacho, conserje de WhatsApp y portal para familias.**

---

## 2. Respuestas Deterministas a las 18 Preguntas de Integración (Part 10 § 8)

1. **¿Expone OKVET una API pública oficial?**  
   *No.* OKVET no cuenta con documentación pública de API REST abierta para terceros. Su arquitectura opera mediante interfaz web basada en sesiones autenticadas.
2. **¿Existe un programa de partners de API?**  
   *En gestión comercial.* No existe un portal de desarrolladores autoservicio.
3. **¿Podemos obtener acceso de solo lectura aprobado?**  
   *Sí, mediante exportaciones autorizadas y sesiones de usuario delegado del Dr. Luis.*
4. **¿Se pueden recuperar las identidades de pacientes existentes?**  
   *Sí.* Verificado con la ingesta exitosa de **46 mascotas reales** del Dr. Luis.
5. **¿Se pueden recuperar las citas existentes?**  
   *Sí, mediante exportación del módulo de agenda de OKVET y conciliación con Google Calendar.*
6. **¿Se pueden crear citas externas en OKVET automáticamente?**  
   *No por webhook directo.* Toda nueva solicitud generada en Vet Life entra como solicitud pendiente (`appointment_requests`) y requiere que el personal la confirme en OKVET antes de emitir la confirmación definitiva (Migración 042 / RPC `verify_and_confirm_appointment_okvet`).
7. **¿Se puede recuperar la información de vacunación?**  
   *Sí, a través de los historiales clínicos exportados.*
8. **¿Se pueden recuperar los registros de medicamentos y recetas?**  
   *Sí.* Verificado con la extracción de **43 prescripciones médicas oficiales** emitidas por el Dr. Luis (`COMVEZCOL-001`).
9. **¿Se pueden recuperar historias clínicas autorizadas?**  
   *Sí, en formato PDF oficial o resúmenes autorizados por el Dr. Luis.*
10. **¿Están disponibles los resultados de laboratorio?**  
    *Sí, como archivos adjuntos asociados a la historia del paciente.*
11. **¿Se admiten exportaciones de datos?**  
    *Sí. OKVET permite exportación en formato tabular (CSV / Excel) de tutores, pacientes y cuentas médicas.*
12. **¿Tiene la app OkPet mecanismos de integración documentados?**  
    *No.* OkPet es una app propietaria cerrada orientada al cliente de OKVET. Vet Life aporta una experiencia PWA personalizada para la marca Vet Life sin exigir descargar una app genérica.
13. **¿Qué información se puede compartir con el tutor?**  
    *Carné digital de vacunación, fórmulas médicas firmadas por el Dr. Luis, fechas de desparasitación, estado de citas y enlaces de seguimiento en ruta.*
14. **¿Cómo se gestionan los permisos de los tutores?**  
    *A través del número de teléfono WhatsApp validado y códigos efímeros de vinculación (`VET-XXXX-2026`).*
15. **¿Cómo se rastrean los cambios y discrepancias?**  
    *Mediante la tabla `okvet_snapshot_metadata` y el motor de discrepancias de la migración 039 (`integration_reconciliation_runs`).*
16. **¿Qué restricciones contractuales aplican?**  
    *La clínica es la propietaria legal de sus datos. No se realiza ingeniería inversa destructiva ni scraping que sature los servidores de OKVET.*
17. **¿Qué sucede si el conector o la conexión se interrumpe?**  
    *El sistema entra en modo degradado seguro (`MOD-14`). La app sigue funcionando para agendamiento local y rutas; los cambios quedan en cola en `transactional_outbox`.*
18. **¿Cuál es la ruta de soporte y escalamiento?**  
    *Revisión manual asistida por la coordinación de Vet Life antes de cualquier intervención.*

---

## 3. Flujo Operativo Diario del Dr. Luis Ríos con OKVET
1. **07:30 AM — Inicio de Jornada en Vet Life:**  
   El Dr. Luis abre su Centro Ejecutivo (`/luis`). Revisa el snapshot del día: 4 visitas programadas en El Poblado, Envigado y Llanogrande.
2. **08:15 AM — Despacho y Navegación:**  
   El auxiliar toca "Iniciar Desplazamiento". Se genera el token de seguimiento para el cliente (`/t/:token`) y se abre Waze con la ruta optimizada.
3. **09:00 AM — Atención en Domicilio:**  
   El Dr. Luis atiende a Toby (Golden Retriever). Registra signos vitales y administra vacuna séxtuple con lote verificado.
4. **09:45 AM — Emisión de Fórmula Oficial:**  
   El Dr. Luis genera la prescripción médica en OKVET. El puente de Vet Life detecta el PDF oficial, valida la tarjeta profesional COMVEZCOL y emite un token efímero firmado por WhatsApp para la familia.
5. **06:00 PM — Cierre y Conciliación:**  
   El sistema compara las citas ejecutadas con el registro de OKVET. Si no hay discrepancias, marca la jornada como conciliada al 100%.

---

## 4. Evidencia Instrumental Verificada en Supabase
- **Base de Datos:** Supabase PostgreSQL 17.12.0 (`sznvahhocgnhsqhksygq`).
- **Migración 042:** Tablas `okvet_connector_configuration`, `okvet_manual_confirmations`, `okvet_import_batches`.
- **Migración 046:** Tabla `prescriptions` con soporte JSONB (`medications: [{ name, dose, frequency, duration }]`).
- **Datos Reales Ingestados:**
  - 41 tutores con teléfono E.164 y cédula.
  - 46 mascotas vinculadas por especie y raza.
  - 43 fórmulas médicas con diagnóstico y posología estructurada.
