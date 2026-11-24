# ALPHA VISION METHOD — PROPUESTA DEL ONBOARDING IDEAL REDISEÑADO
**DOCUMENTO AUDIT-18 — STREAMLINED ONBOARDING ARCHITECTURE ACROSS 9 PERSONAS**

---

## 1. PRINCIPIOS RECTORES DEL REDISEÑO

El objetivo del rediseño no es añadir más pantallas, sino **reducir el esfuerzo cognitivo, eliminar bifurcaciones innecesarias y acelerar el tiempo hasta el primer valor (TTFV < 3 minutos)**.

---

## 2. ESPECIFICACIÓN DE LOS 9 FLUJOS IDEALES DE ONBOARDING

### Flujo 1: Veterinario Independiente (Solo Vet)
- **Paso 1 (Identidad Rápida):** Nombre, WhatsApp, Ciudad y Nombre de fantasía (ej. *Dra. Valeria Domiciliaria*). Subdominio auto-generado (`valeria.alphavisionm.com`).
- **Paso 2 (Plan):** Pre-seleccionado *Veterinario Solitario* ($189.000 COP) con 30 días de prueba sin tarjeta.
- **Paso 3 (Primer Paciente en 1-Tap):** Botón *"Registrar mi primer paciente"*.
- **Primer Valor:** Emisión inmediata de una fórmula médica con su número COMVEZCOL y código QR verificable.

### Flujo 2: Clínica Veterinaria Multi-Médico
- **Paso 1 (Empresa):** Razón social, NIT, Ciudad, Modalidad (Consultorio + Domicilios).
- **Paso 2 (Plan):** Pre-seleccionado *Clínica Domiciliaria Pro* ($389.000 COP) para 5 veterinarios.
- **Paso 3 (Equipo):** Enlace de invitación rápida vía WhatsApp para sus colegas médicos y recepcionista.
- **Primer Valor:** Asignación de la primera cita en el tablero de coordinación y prueba de Smart ETA.

### Flujo 3: Tutor de Mascotas (Pet Owner Guest Booking)
- **Flujo en 1 Sola Pantalla:**
  1. ¿Quién es tu mascota? [ Nombre: Toby | Especie: Perro ] *(Inline, sin redirección)*.
  2. ¿Qué necesita? [ Consulta a Domicilio | Vacuna | Control ].
  3. ¿Dónde y cuándo? [ Dirección | Selector de franja horaria ].
- **Primer Valor:** Recibe confirmación instantánea por WhatsApp y enlace a su tracking `/t/:token`.

### Flujo 4: Dueño de Empresa Contratista
- **Paso 1 (Nicho de Oficio):** Selecciona su especialidad (ej. *HVAC Residencial y Comercial*).
- **Paso 2 (Precios Base Sugeridos):** El sistema carga automáticamente las 5 reparaciones más comunes con márgenes sugeridos (ej. mantenimiento preventivo $180 USD, recarga de refrigerante $290 USD, cambio de capacitor $150 USD).
- **Paso 3 (Presupuesto de Muestra):** Genera su primera cotización con los 3 niveles Bueno/Mejor/Excelente en 1 clic.
- **Primer Valor:** Visualiza su cotización lista para ser enviada por mensaje de texto al cliente.

### Flujo 5: Trabajador de Campo / Técnico de Cuadrilla
- **Flujo Móvil Ultra-Ligero (30 segundos):**
  1. Abre el enlace SMS enviado por el dueño.
  2. Confirma su nombre y teléfono.
  3. Se instala el icono PWA en su pantalla de inicio.
- **Primer Valor:** Aparece su primera orden de trabajo con dirección 1-tap en Waze y lista de chequeo de herramientas.

### Flujo 6: Cliente Final del Contratista
- **Flujo de Autoservicio:**
  1. Abre el portal con la marca de la empresa (`/contractors/portal/:token`).
  2. Revisa la propuesta escalonada, elige el paquete con 3 años de garantía y firma con el dedo.
- **Primer Valor:** Recibe confirmación de fecha de inicio de obra y recibo digital en su celular.

### Flujo 7: Cliente Recurrente (Tutor o Empresa de Mantenimiento)
- **Reagendamiento en 1 Clic:**
  - Al abrir el portal, el sistema reconoce el perfil, mascota o propiedad.
  - Botón: *"Repetir última consulta"* o *"Programar mantenimiento semestral"*.

### Flujo 8: Empresa Migrando desde Otro Sistema (PIMS / OKVET / CSV)
- **Migración Asistida:**
  - Selector de origen: OKVET, VetCloud, CSV de Excel.
  - Carga el archivo o conecta credenciales y el procesador en background (`OkvetBatchImporter.tsx`) valida 100 registros en <10 segundos sin duplicar pacientes homónimos.

### Flujo 9: Super Admin Activando Cuentas
- **Flujo de 1 Clic en `/admin`:**
  - Ingresa a la división `05. Centro de Activaciones`.
  - Revisa la empresa solicitante.
  - Clic en *"Aprobar Trial de 30 Días"*: n8n y Supabase activan el subdominio, asignan el plan y sincronizan GoHighLevel instantáneamente.
