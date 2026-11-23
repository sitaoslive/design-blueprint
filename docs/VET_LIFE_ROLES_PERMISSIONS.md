# VET LIFE — MASTER ROLES & PERMISSIONS SPECIFICATION
**Plataforma:** VET FREEDOM OS  
**Autor:** Alpha Vision Method / Security & Compliance Architecture  
**Fecha:** 2026-11-23  

---

## 1. Principio de Mínimo Privilegio (Least Privilege)
Todo acceso en Vet Freedom OS está restringido al alcance de la organización (`organization_id`) mediante políticas RLS en PostgreSQL 17.
Ningún usuario de una clínica puede leer ni modificar registros de otra clínica.
La autoridad profesional médica (Ley 576 de 2000) no se confunde con la titularidad comercial de la organización.

---

## 2. Los 25 Perfiles de Usuario del Sistema

### Categoría I: Roles de Plataforma (Alpha Vision Method)
1. **Platform Super Admin:** Gestión global de tenants, monitor de incidentes, catálogos de integraciones y facturación general de licencias SaaS. No tiene acceso arbitrario a notas médicas privadas.
2. **Platform Sales / Growth:** Gestión de prospectos, enlaces de demostración personalizada y embudo de conversión de pruebas gratuitas.
3. **Platform Customer Success:** Asistencia de onboarding, diagnóstico de configuración de tenants y soporte técnico de primer nivel sin ver historiales confidenciales.
4. **Platform Technical Operations:** Monitoreo de infraestructura, salud de n8n, métricas de latencia de Supabase y despliegues controlados.

### Categoría II: Roles de Organización (Clínica / Veterinaria)
5. **Organization Owner:** Dueño de la clínica o veterinario titular. Configura suscripción, sedes, servicios, tarifas y personal.
6. **Medical Director:** Dirección médica responsable ante COMVEZCOL. Gobierna protocolos clínicos, aprueba vademécums y supervisa la calidad asistencial.
7. **Branch Administrator:** Gestión operativa de una sede física o zona de cobertura específica (ej. Sede Llanogrande vs Sede Poblado).
8. **Clinic Manager:** Control de KPIs de citas, eficiencia de rutas, rendimiento del equipo y resolución de quejas administrativas.
9. **Finance / Billing Administrator:** Facturación electrónica DIAN, liquidación de honorarios, cobros y conciliación de anticipos.

### Categoría III: Roles Clínicos y Operativos
10. **Veterinario:** Consulta clínica, elaboración de planes terapéuticos, administración de medicamentos, prescripciones oficiales y seguimiento post-visita.
11. **Especialista Veterinario:** Atención por remisión en áreas como cardiología, dermatología, ortopedia o nefrología.
12. **Veterinario de Relevo (Relief / Visiting):** Acceso temporal con fecha de expiración automática a citas asignadas en guardias o vacaciones.
13. **Auxiliar / Técnico Veterinario:** Asistencia en ruta domiciliaria, preparación de maletines, registro de signos vitales y cronómetro de visita.
14. **Recepcionista:** Asignación inicial de solicitudes, búsqueda de pacientes, check-in y envío de enlaces de invitación a familias.
15. **Coordinador de Despacho (Dispatch):** Planificación de rutas diarias, asignación de vehículos, gestión de retrasos y telemetría en tiempo real.
16. **Gestor de Inventario:** Control de stock de medicamentos, cadena de frío (2-8°C), lotes y alertas de caducidad.
17. **Laboratorista / Diagnóstico:** Recepción de muestras biológicas y carga de informes de patología o imágenes con firma digital.
18. **Coordinador de Remisiones:** Intercambio seguro de historias clínicas con centros especializados externos y seguimiento de contra-remisión.

### Categoría IV: Roles del Tutor de Mascota
19. **Tutor Principal (Primary Pet Owner):** Responsable legal de la mascota. Accede a carné digital, autoriza procedimientos, agenda citas y gestiona pagos.
20. **Tutor Secundario Autorizado:** Miembro del hogar con permisos delegados para agendar citas o consultar carné.
21. **Cuidador Temporal (Temporary Caregiver):** Acceso acotado por fecha a instrucciones de alimentación, suministros y contacto de urgencia.

### Categoría V: Roles Comerciales y Demostración
22. **Visitante Demo Pública (`/demo`):** Acceso de solo lectura o simulación en memoria sin tocar datos de producción.
23. **Prospecto Demo Personalizada:** Entorno sintético temporal preparado para una clínica interesada.
24. **Dueño de Clínica en Prueba (Trial Owner):** Cuenta de 30 días de evaluación con todas las funciones de su plan activadas.
25. **Miembro de Equipo Invitado:** Usuario en proceso de vinculación previa confirmación de identidad.

---

## 3. Matriz Granular de Autorización por Módulo

| Módulo del Sistema | Super Admin | Médico Titular (Dr. Luis) | Coordinador | Auxiliar | Recepción | Tutor (Cliente) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Historias Clínicas y Fórmulas** | 🚫 Prohibido | ✍️ Total / Firma | 👁️ Solo Lectura | 👁️ Lectura Parcial | 🚫 Prohibido | 👁️ Sus Mascotas |
| **Gestión de Agenda y Despacho** | 👁️ Global | ✍️ Propia / Total | ✍️ Total Rutas | 👁️ Asignada | ✍️ Asignar Citas | ✍️ Solicitar |
| **Telemetría GPS en Ruta** | 👁️ Global | 👁️ Tiempo Real | ✍️ Despacho | 📍 Emite Posición | 👁️ Estimaciones | 👁️ Solo en Camino |
| **Facturación y Cobros COP** | 👁️ Métricas | ✍️ Verificación | 👁️ Montos | 💳 Registrar Cobro | 💳 Generar Cobro | 💳 Pagar en Línea |
| **Prescripciones Médicas** | 🚫 Prohibido | ✍️ Firma Digital | 🚫 Prohibido | 🚫 Prohibido | 🚫 Prohibido | 📥 Descargar PDF |
| **Estudio White-Label / Marca** | ✍️ Configuración | ✍️ Su Clínica | 🚫 Prohibido | 🚫 Prohibido | 🚫 Prohibido | 🚫 Prohibido |
| **Supervisión de IA / Outbox** | ✍️ Auditoría | 👁️ Sus Tareas | 👁️ Incidentes | 🚫 Prohibido | 🚫 Prohibido | 🚫 Prohibido |

---

## 4. Guardarraíles Médicos y Legales Inviolables
1. **La IA nunca receta ni diagnostica:** El campo `prescriptions.signed_by` requiere obligatoriamente una cédula y matrícula profesional COMVEZCOL válida.
2. **Aislamiento Multi-Tenant (RLS):** Toda consulta SQL lleva implícito `where organization_id = auth.current_org_id()`. Intentos de acceso cruzado disparan una excepción `403 FORBIDDEN` inmediata.
3. **Cero Retención de Secretos:** Las contraseñas se gestionan mediante Supabase Auth con hashing scrypt; ningún token de sesión o webhook privado se almacena en texto plano.
