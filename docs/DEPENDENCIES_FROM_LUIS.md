# VET FREEDOM OS — LISTA DE DEPENDENCIAS Y DATOS REQUERIDOS DEL DR. LUIS
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Sección Normativa:** 20 del Prompt Maestro de Implementación  

---

## 1. Presentación
Para culminar el pase a producción y activar los despachos en tiempo real con clientes reales de Vet Life, se requiere la provisión formal de los siguientes accesos empresariales, parámetros operativos y definiciones de gobierno clínico por parte del Dr. Luis Eduardo Ríos.

---

## 2. Checklist de Incorporación Empresarial

### 2.1 Accesos Empresariales e Integraciones Externas
- [ ] **WhatsApp Business Platform (Meta Cloud API):**
  - Identificador de Meta Business Manager.
  - WABA ID (WhatsApp Business Account ID).
  - Número de teléfono oficial de Vet Life verificado (+57...).
  - Token de acceso permanente para la conexión segura en n8n Credentials Vault.
- [ ] **OKVET:**
  - Definición formal del procedimiento asistido de reconciliación para el coordinador.
  - Nombramiento del responsable interno de validación de historias clínicas.
- [ ] **Google Calendar:**
  - Aprobación de las cuentas de Google Workspace de los veterinarios en ruta para autenticación OAuth individual en modo `BUSY_ONLY`.
- [ ] **Google Maps Platform:**
  - Proyecto de Google Cloud con facturación activa y API Key con permisos para Distance Matrix y Geocoding API.
- [ ] **Dominio y Correo Empresarial:**
  - Dominio oficial configurado con registros SPF, DKIM y DMARC para el despacho de correos transaccionales y documentos aprobados.

### 2.2 Información Operativa de Vet Life
- [ ] **Roster Oficial del Personal:**
  - Nombres completos, documentos de identidad y números telefónicos de contacto interno.
  - Roles asignados (Médicos Veterinarios, Auxiliares, Coordinación, Finanzas, Recepción).
  - Horarios habituales de turnos y esquemas de descanso semanal.
  - Designación formal de médicos de respaldo para contingencias.
- [ ] **Catálogo de Servicios y Tarifas Oficiales en COP:**
  - Lista de precios aprobados para consultas domiciliarias diurnas, nocturnas y festivas.
  - Tarifas de vacunación, desparasitación, perfiles de laboratorio y procedimientos menores.
  - Duración estándar estimada por tipo de servicio (ej. 45 min consulta, 30 min vacuna).
- [ ] **Zonificación Domiciliaria en Bogotá:**
  - Definición de coberturas prioritarias (Usaquén, Suba, Chapinero, etc.).
  - Ventana estándar de colchón para traslados y tráfico (recomendado: 30 a 45 minutos).

### 2.3 Definiciones de Gobierno Clínico
- [ ] **Matrículas Profesionales (COMVEZCOL):**
  - Registro de matrículas de los médicos veterinarios autorizados para prescribir y atender.
- [ ] **Protocolo de Triage y Urgencias Vitales:**
  - Lista de síntomas de exclusión de atención domiciliaria (dificultad respiratoria severa, hemorragias profusas, convulsión activa) que exigen derivación inmediata a clínica de urgencias.
- [ ] **Criterios de Visitas no Aplazables:**
  - Definición de tratamientos que bajo ninguna circunstancia pueden ser reprogramados de forma automatizada (ej. insulinoterapia, post-quirúrgicos inmediatos).
- [ ] **Directorio de Especialistas Homologados:**
  - Red de especialistas externos avalados por el Dr. Luis (Cardiología, Neurología, Oftalmología, Oncología) con sus canales de coordinación preferentes.

### 2.4 Datos de Prueba para Certificación Pre-Producción
- [ ] **2 Contactos Telefónicos de Prueba:**
  - Números pertenecientes al equipo interno para recibir mensajes de simulación de WhatsApp antes de abrir la línea pública.
- [ ] **Validación de Plantillas Meta HSM:**
  - Aprobación del texto de las plantillas transaccionales oficiales en español colombiano:
    - `vet_appointment_request_received`
    - `vet_appointment_confirmed_official`
    - `vet_appointment_reminder_24h`
    - `vet_route_eta_notification`
    - `vet_route_delay_notice`
    - `vet_cx_nps_survey`
