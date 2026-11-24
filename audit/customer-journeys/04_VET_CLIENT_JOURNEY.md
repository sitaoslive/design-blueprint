# ALPHA VISION METHOD — AUDITORÍA DE LA JORNADA B: TUTOR DE MASCOTAS (CLIENTE VETERINARIO)
**DOCUMENTO AUDIT-04 — PET OWNER LIFETIME EXPERIENCE & CARE JOURNEY**

---

## 1. PUNTOS DE ENTRADA Y PRIMER CONTACTO

El tutor de mascotas interactúa con Vet Freedom OS mediante múltiples canales:
1. **Subdominio de la Clínica (`luis.alphavisionm.com`):** Acceso directo para agendar cita domiciliaria.
2. **Invitación por WhatsApp Business API (WABA):** Enlace directo para confirmar visita o descargar prescripción.
3. **Código QR en Carné Físico / Pasaporte:** Escaneo para acceder al certificado oficial de salud en `/cliente/pasaporte/:id`.
4. **Portal Web General (`alphavisionm.com/cliente`):** Inicio de sesión para tutores existentes.

### Principio Fundamental Evaluado:
- **Agendamiento Sin Descarga Obligatoria:** Verificado exitosamente. Un tutor puede agendar desde el navegador de su teléfono sin instalar aplicaciones pesadas ni registrarse en tiendas de apps.

---

## 2. AUDITORÍA DEL ONBOARDING DEL TUTOR (B01 - B18)

| Paso | Requisito de la Especificación | Implementación Observada en Código | Estado de Verificación | Observación de UX / Fricción |
|---|---|---|---|---|
| **B01** | Identificación de la clínica | Subdominio `luis.alphavisionm.com` carga colores e identidad | `PRODUCTION VERIFIED` | El tutor reconoce de inmediato al Dr. Luis. |
| **B02** | Modo de entrada flexible | Modo invitado o cuenta existente | `PRODUCTION VERIFIED` | Acceso directo a `/cliente/reservar`. |
| **B03** | Verificación de identidad | Validación de WhatsApp o correo electrónico | `PRODUCTION VERIFIED` | Código SMS/OTP o link mágico sin fricción. |
| **B04** | Perfil del tutor | Nombre, teléfono, dirección de residencia | `PRODUCTION VERIFIED` | Captura dirección para el servicio domiciliario. |
| **B05** | Registro de mascota | Nombre, especie, raza, edad, alergias | `PRODUCTION VERIFIED` | Almacenado en `pets` con `tenant_id` aislado. |
| **B06** | Múltiples mascotas | Selector de mascota en agendamiento | `PRODUCTION VERIFIED` | `usePets()` soporta listas de pacientes. |
| **B07** | Guardia y privacidad | Relación de tutor primario protegida | `PRODUCTION VERIFIED` | RLS impide ver mascotas de otros tutores. |
| **B08** | Selección de servicio | Consulta general, vacunas, desparasitación | `PRODUCTION VERIFIED` | Botones táctiles grandes de selección 1-tap. |
| **B09** | Modalidad de atención | Atención domiciliaria en casa | `PRODUCTION VERIFIED` | Configurado por defecto para Vet Life. |
| **B10** | Disponibilidad en tiempo real | Slots disponibles sin colisión | `PRODUCTION VERIFIED` | Bloques horarios (ej. Jueves 09:00, 16:00). |
| **B11** | Intake / Motivo de consulta | Preguntas clave y síntomas de la mascota | `STAGING VERIFIED` | Flujo integrado en WABA y web. |
| **B12** | Consentimiento informado | Autorización de tratamiento médico | `STAGING VERIFIED` | Mapeado en `consent_records`. |
| **B13** | Confirmación de solicitud | Pantalla de confirmación con estado de espera | `PRODUCTION VERIFIED` | Muestra estado `pendiente` con feedback visual. |
| **B14** | Activación opcional de PWA | Opción de guardar icono en pantalla de inicio | `PRODUCTION VERIFIED` | Banner no intrusivo; no bloquea el uso. |
| **B15** | Dashboard del tutor | Pantalla principal `/cliente/hogar` | `PRODUCTION VERIFIED` | Tarjetas de mascotas, citas próximas y tareas. |
| **B16** | Primera visita en casa | Notificación de llegada estimada (Smart ETA) | `PRODUCTION VERIFIED` | Visualización en `/t/:token` sin exponer GPS. |
| **B17** | Documentos post-consulta | Fórmulas médicas y pasaporte de salud | `PRODUCTION VERIFIED` | `/cliente/pasaporte/$id` con QR oficial. |
| **B18** | Reagendamiento en 1-clic | Agendar próxima cita con datos precargados | `PRODUCTION VERIFIED` | Reutiliza perfil y mascota sin reescribir datos. |

---

## 3. FRICCIONES OBSERVADAS EN LA EXPERIENCIA DEL TUTOR (UX REGISTER)

1. **Fricción B-01 (Desvío de Mascota en Agendamiento Inicial):**
   - *Hallazgo:* En `/cliente/reservar`, si el tutor entra por primera vez y aún no tiene mascotas en el store local, el sistema muestra el mensaje *"Primero registra tu mascota →"* que lo redirige a `/cliente/mascotas`.
   - *Impacto:* Rompe la inercia del agendamiento.
   - *Solución Recomendada:* Incluir un campo *"Nombre de tu mascota"* en línea dentro del mismo formulario de agendamiento para nuevos usuarios (Guest Booking inline).
2. **Fricción B-02 (Aislamiento Multi-Clínica):**
   - *Hallazgo:* Un tutor que atienda un perro con el Dr. Luis y un gato con una clínica aliada no debe cruzar historias clínicas entre organizaciones.
   - *Verificación:* Confirmado. Las políticas de RLS en `pets` y `prescriptions` filtran estrictamente por `(tenant_id, owner_id)`.
