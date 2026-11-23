# VET LIFE — COMPLETE USER JOURNEYS (RUTAS INTEGRALES DE USUARIO)
**Plataforma:** VET FREEDOM OS  
**Autor:** Alpha Vision Method / Experience Architecture  
**Fecha:** 2026-11-23  

---

## 1. Visión y Metodología
Cada ruta de usuario documenta el ciclo de vida de un perfil desde su descubrimiento, autenticación y primera acción útil hasta su operación diaria, contingencias y soporte.

---

## 2. Las 15 Rutas Maestras de Usuario (Journeys A a O)

### Journey A — Nuevo Veterinario Independiente
1. **Descubrimiento:** Encuentra la web de Alpha Vision (`alphavisionm.com`).
2. **Exploración:** Prueba la demo interactiva en `/demo`.
3. **Selección:** Escoge el plan *Veterinario Solitario* ($189.000 COP/mes) con 30 días de prueba.
4. **Onboarding:** En `/registro-clinica` registra sus datos y selecciona el tema *Botanical Luxe*.
5. **Configuración Inicial:** Define zonas de cobertura, tarifas y conecta su Google Calendar.
6. **Primera Acción Útil:** Envía un enlace de invitación por WhatsApp a su primer cliente.
7. **Jornada Diaria:** Atiende consultas en su celular, consulta su asistente por voz y liquida el día.
8. **Conversión:** Al día 28 activa su tarjeta para el pago recurrente mensual.

### Journey B — Clínica Existente con OKVET (Caso de Referencia Dr. Luis)
1. **Punto de Partida:** La clínica ya opera con OKVET para sus historias clínicas legales.
2. **Registro:** El Dr. Luis activa Vet Freedom OS seleccionando *Clínica Domiciliaria* ($389.000 COP/mes).
3. **Ingesta Segura:** Se ejecuta la ingesta idempotente de 46 pacientes y 41 tutores desde OKVET (Migración 046).
4. **Operación en Modo Dual:**
   - La historia clínica se gestiona en OKVET.
   - Vet Life orquesta las rutas de Waze, el seguimiento por WhatsApp de los auxiliares en camino y el portal del tutor.
5. **Conciliación Diaria:** El sistema concilia las citas cerradas sin duplicar facturas ni alterar diagnósticos.

### Journey C — Red Veterinaria Multi-Sede
1. **Ingreso:** Contrata el plan *Red / Marca Blanca* ($1.190.000 COP/mes).
2. **Configuración:** Crea 3 sedes (Sede Poblado, Sede Envigado, Sede Rionegro) bajo un mismo tenant.
3. **Asignación:** Vincula médicos a cada sede con calendarios y stock de medicamentos independientes.
4. **Marca Blanca:** Aplica su propio subdominio (`redvet.alphavisionm.com`) y paleta *Midnight Clinical*.

### Journey D — Dr. Luis Eduardo Ríos (Director Médico y Médico de Campo)
1. **07:00 AM:** Abre su panel ejecutivo (`/luis`).
2. **Revisión Matutina:** Consulta la asistente por voz: *"¿Qué citas tengo hoy en Llanogrande?"*.
3. **Despacho:** Revisa la ruta sugerida de 5 paradas optimizada por tiempos de tráfico.
4. **Consulta Domiciliaria:** Atiende a pacientes reales (Toby, Rosy), verifica lote de vacunas y prescribe medicamentos.
5. **Seguimiento:** Al cerrar la visita, se disparan automáticamente los recordatorios de cuidado post-atención.

### Journey E — Veterinario Empleado
1. **Invitación:** Recibe credencial temporal por correo/WhatsApp.
2. **Ingreso:** Abre su panel móvil (`/equipo`).
3. **Atención:** Solo ve los pacientes asignados para su jornada.
4. **Cierre:** Firma las notas clínicas con su matrícula profesional y entrega el turno al siguiente médico.

### Journey F — Recepcionista
1. **Inicio:** Abre el panel de recepción (`/recepcion`).
2. **Gestión:** Recibe solicitudes entrantes de WhatsApp canalizadas por el bot.
3. **Confirmación:** Valida disponibilidad del Dr. Luis, agenda la cita en OKVET y confirma a la familia.
4. **Check-in:** Registra la llegada de pacientes en sede física o da luz verde para salida de domicilios.

### Journey G — Coordinador de Despacho y Rutas
1. **Inicio:** Abre el módulo logístico (`/coordinacion`).
2. **Monitoreo:** Observa el mapa en vivo con auxiliares en trayecto (`/t/:token`).
3. **Gestión de Tráfico:** Si hay congestión en la Autopista Sur, reordena paradas y avisa a los clientes con ETA recalculado.

### Journey H — Médico Especialista (Cardiología / Dermatología)
1. **Remisión:** Recibe una solicitud de interconsulta con el historial filtrado del paciente.
2. **Evaluación:** Revisa ecocardiograma adjunto en la bóveda segura de Supabase Storage.
3. **Informe:** Carga su concepto especializado y lo devuelve con firma digital al Dr. Luis.

### Journey I — Tutor de Mascota Invitado
1. **Notificación:** Recibe un WhatsApp del Dr. Luis: *"Tu carné digital de Toby está listo en Vet Life"*.
2. **Instalación:** Toca el enlace `luis.alphavisionm.com`, instala la PWA en su pantalla de inicio en 5 segundos.
3. **Uso:** Consulta la fórmula médica firmada, activa recordatorios de desparasitación y solicita su próxima visita.

### Journey J — Nuevo Tutor Autoservicio
1. **Registro:** Ingresa a `/cliente/bienvenida` desde Medellín o Rionegro.
2. **Ficha:** Registra a su gato, sube foto y solicita una consulta general a domicilio.
3. **Atención:** Recibe la visita del Dr. Luis y su carné digital queda vinculado permanentemente.

### Journey K — Hogar con Múltiples Mascotas
1. **Gestión:** Una familia con 2 perros y 1 gato alterna entre perfiles con un toque.
2. **Ahorro Logístico:** Agenda una sola visita domiciliaria combinada para vacunar a todos sus animales el mismo sábado.

### Journey L — Tutor que Cambia de Sede o Ciudad
1. **Portabilidad:** Se muda de El Poblado a Llanogrande.
2. **Actualización:** Cambia su dirección en `/cliente/perfil`. El sistema reasigna automáticamente su cobertura sin perder su historia médica.

### Journey M — Administrador de Plataforma (Alpha Vision Method)
1. **Monitoreo:** Abre `/admin` con perfil Super Admin.
2. **Control:** Supervisa el consumo mensual de tokens de IA, latencias de n8n y estado de salud de los 7 servicios.
3. **Facturación:** Revisa el cobro de licencias SaaS a las clínicas clientes.

### Journey N — Agente de Crecimiento y Ventas B2B
1. **Demo:** Genera un enlace demo temporal para un director de clínica en Bogotá.
2. **Presentación:** Muestra el showcase bilingüe y las 8 colecciones en `/demo`.
3. **Cierre:** Guía al cliente hacia el plan de $389.000 COP con 30 días de prueba.

### Journey O — Especialista de Éxito del Cliente (Customer Success)
1. **Diagnóstico:** Detecta que una clínica no ha terminado de configurar sus zonas de cobertura.
2. **Acompañamiento:** Se comunica para brindar soporte técnico y asegurar la adopción fluida de la plataforma.
