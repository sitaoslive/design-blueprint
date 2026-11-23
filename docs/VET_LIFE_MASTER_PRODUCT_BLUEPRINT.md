# VET LIFE / VET FREEDOM OS — MASTER PRODUCT BLUEPRINT
**Plataforma:** VET FREEDOM OS  
**Primer Cliente Operativo:** Dr. Luis Eduardo Ríos — Vet Life: Veterinaria a Domicilio (Medellín & Oriente Antioqueño)  
**Empresa Matriz / Plataforma SaaS:** Alpha Vision Method (`alphavisionm.com`)  
**Fecha de Publicación Oficial:** 2026-11-23  
**Versión de Especificación:** 10.0 & 11.0 Master Governance  

---

## 1. Visión del Producto
Vet Life / Vet Freedom OS es el sistema operativo inteligente que transforma la práctica veterinaria moderna en Colombia y Latinoamérica. A diferencia del software tradicional (que suele ser un archivador pasivo de historias clínicas y facturas), Vet Life actúa como la **capa operativa, logística y de experiencia del cliente** que conecta en tiempo real a veterinarios independientes, clínicas, auxiliares y tutores de mascotas con rigor médico, calidez y automatización controlada.

## 2. Objetivos de Negocio
1. **Autonomía para el Médico Fundador:** Reducir la dependencia operativa del Dr. Luis Eduardo Ríos mediante despacho inteligente, asistente ejecutiva por voz y delegación protocolizada.
2. **Monetización y Crecimiento B2B:** Operar un modelo SaaS multi-tenant comercializado por Alpha Vision Method con planes de $189.000 COP/mes (Veterinario Solitario), $389.000 COP/mes (Clínica Domiciliaria) y $1.190.000 COP/mes (Red / Marca Blanca), con 30 días de prueba gratuita.
3. **Cero Fricción para el Tutor:** Entregar a las familias un portal móvil PWA ("My Pet Life") donde consultan el carné digital de vacunación, fórmulas médicas firmadas y agendan visitas a domicilio sin barreras.

## 3. Posicionamiento del Producto
Vet Life no busca reemplazar a la fuerza los sistemas de gestión existentes (PIMS como OKVET, Vetesoft o ezyVet), sino convertirse en la **superficie inteligente de interacción**:
- **PIMS Tradicional:** Registro clínico legal y contabilidad histórica.
- **Vet Freedom OS:** Asistente operativo móvil, telemetría Waze de auxiliares en ruta, conserje de WhatsApp automatizado, control de tiempos de consulta y experiencia premium para el tutor.

## 4. Mercados Objetivo
- **Fase 1 (En Producción):** Colombia — Valle de Aburrá (Medellín, Poblado, Envigado, Sabaneta, Laureles, Belén) y Oriente Antioqueño (Llanogrande, Rionegro, El Retiro, La Ceja, Guarne, Marinilla).
- **Fase 2:** Principales ciudades de Colombia (Bogotá, Cali, Barranquilla, Bucaramanga) mediante veterinarios independientes y clínicas a domicilio.
- **Fase 3:** Mercados hispanohablantes de LATAM (México, Chile, Argentina, Perú) y clínicas bilingües en Estados Unidos.

## 5. Estrategia de Integración con Softwares Veterinarios
**Filosofía de Cero Disrupción:** Una clínica existente no suspende su operación.
- **Descubrir:** Identificar qué PIMS utiliza la clínica (OKVET, Vetesoft, papel o Excel).
- **Autorizar:** Establecer la fuente de verdad (Source of Truth) de cada dato.
- **Conectar en Modo Observador:** Lectura controlada sin sobrescritura autónoma.
- **Reconciliar:** Resolver discrepancias de mascotas y tutores con intervención humana.
- **Expandir:** Activar automatizaciones una vez probada la coherencia de datos.

## 6. Arquitectura de la Plataforma
- **Frontend PWA:** React 18, Vite, TanStack Start/Router, TailwindCSS y OKLCH Colors alojado en Lovable / Cloudflare Pages.
- **Backend & Base de Datos:** Supabase PostgreSQL 17.12.0 (`sznvahhocgnhsqhksygq`) con 47 migraciones DDL, 100% Row-Level Security (RLS) forzado y 86 tablas relacionales.
- **Orquestación de Procesos:** Instancia n8n Cloud (`alphavision.app.n8n.cloud`) con 21 workflows desacoplados mediante `transactional_outbox`.
- **Integración Clínica Oficial:** Conector asistido OKVET (`https://sys.okvet.co/`) para pacientes y fórmulas.

## 7. Módulos de la Aplicación
1. **MOD-01 a MOD-05:** Núcleo transaccional, bus de eventos, herramientas tipadas y outbox.
2. **MOD-06:** Sincronización de Google Calendar con privacidad BUSY_ONLY.
3. **MOD-07:** Asistente Ejecutiva del Dr. Luis (consultas en lenguaje natural en COP).
4. **MOD-08:** Memorias Empresariales desacopladas (CEM, Operaciones, Dirección).
5. **MOD-09:** Motor de Reglas de Delegación por competencias veterinarias.
6. **MOD-10:** Rastreador de Promesas de Servicio y compromisos post-visita.
7. **MOD-11 y MOD-12:** Continuidad de Turnos (Handover) y Gestión de Capacidad.
8. **MOD-13:** Guardián de Experiencia del Cliente y Protocolo de Duelo.
9. **MOD-14 y MOD-15:** Operaciones Degradadas y Monitoreo de Salud Técnica (7 servicios).
10. **MOD-16 a MOD-21:** Conciliación de Contradicciones, Finanzas, Reportes Ejecutivos y Respaldos.

## 8. Perfiles de Usuario (25 Perfiles)
- **Plataforma:** Platform Super Admin, Sales / Growth, Customer Success, Technical Operations.
- **Organización:** Organization Owner, Medical Director, Branch Administrator, Clinic Manager, Finance/Billing Admin.
- **Clínico y Operativo:** Veterinario, Especialista, Veterinario de Relevo, Auxiliar/Técnico, Recepcionista, Coordinador de Despacho, Gestor de Inventario, Laboratorista, Coordinador de Remisiones.
- **Tutores:** Tutor Principal (Owner), Tutor Secundario Autorizado, Cuidador Temporal.
- **Comercial:** Visitante Demo Pública, Prospecto Demo Personalizada, Dueño en Prueba (Trial), Miembro Invitado.

## 9. Permisos por Perfil
La autorización sigue el principio de mínimo privilegio (`least_privilege`):
- Los roles de finanzas no acceden a notas clínicas privadas.
- Los auxiliares no emiten diagnósticos ni firman fórmulas.
- La IA no diagnostica ni receta autónomamente.
- Las historias clínicas oficiales son gobernadas exclusivamente por profesionales matriculados ante COMVEZCOL (Ley 576 de 2000).

## 10. Funcionalidades por Perfil
- **Dr. Luis:** Agenda unificada, asistente por voz, Waze/Google Maps para visitas domiciliarias en Llanogrande y Medellín, revisión de fórmulas OKVET y liquidación de honorarios.
- **Auxiliar Veterinario:** Hoja de ruta diaria, preparación de maletín clínico, registro de llegada a domicilio, cronómetro de consulta y reporte de incidentes.
- **Tutor de Mascota:** Carné digital, historial de vacunas, agendamiento de visitas, geolocalización del equipo en camino y pago de servicios.

## 11. Navegación y Estructura de Pantallas
- `/` — Landing Page SaaS Alpha Vision & Acceso Directo Vet Life Medellín.
- `/luis` — Centro Ejecutivo del Dr. Luis Eduardo Ríos.
- `/cliente` — Portal de Familias y Carné de Mascotas.
- `/cliente/reservar` — Flujo de agendamiento a domicilio por zonas.
- `/admin` — Panel de Control Administrativo.
- `/admin/estudio-diseno` — Estudio White-Label interactivo con las 8 colecciones.
- `/registro-clinica` — Onboarding B2B con planes comerciales y 30 días de prueba.
- `/demo` — Simulador comercial interactivo con perfiles y roles.
- `/t/:token` — Portal público de seguimiento en tiempo real ("estilo Uber").

## 12. Rutas de Usuario (User Journeys)
Ver especificación detallada en [`docs/VET_LIFE_COMPLETE_USER_JOURNEYS.md`](./VET_LIFE_COMPLETE_USER_JOURNEYS.md).

## 13. Arquitectura del Flujo Clínico
La consulta domiciliaria sigue 5 fases inmutables registradas en `visit_timing_records`:
1. `TRAVEL_STARTED`: Inicio de desplazamiento del equipo.
2. `ARRIVED`: Llegada a la casa del paciente.
3. `SERVICE_STARTED`: Inicio de atención clínica.
4. `ESTIMATED_FINISH_UPDATED`: Ajuste de tiempo según complejidad.
5. `SERVICE_FINISHED`: Cierre de atención y emisión de checklist de compromisos.

## 14. Arquitectura de Agendamiento
- Bloqueos pesimistas (`appointment_holds`) de 15 minutos para evitar solapamientos simultáneos.
- Ventanas de amortiguación (buffers) de 30 a 45 minutos para trayectos en Medellín (Las Palmas, Autopista Sur, Regional) y el Oriente Antioqueño.
- Puerta de confirmación asistida contra OKVET antes de dar una cita por firme.

## 15. Modelo de Identidad de Paciente y Tutor
- Mascota identificada por UUID estable de Vet Freedom OS.
- Mapeo externo de ID de OKVET (`okvet_id`), número de microchip y fotografía.
- Tutor vinculado mediante cédula y número de teléfono WhatsApp validado con formato internacional E.164 (`+57`).

## 16. Portal de Familias ("My Pet Life")
Ver especificación completa en [`docs/VET_LIFE_PET_OWNER_EXPERIENCE.md`](./VET_LIFE_PET_OWNER_EXPERIENCE.md).

## 17. Procedencia de la Información Clínica
Cada dato registrado cuenta con una marca de procedencia inmutable:
- `VERIFIED_CLINICAL`: Emitido o firmado por un veterinario con tarjeta profesional.
- `IMPORTED_DOCUMENT`: Documento PDF o resultado de laboratorio adjunto.
- `OWNER_REPORTED`: Información suministrada por el tutor (peso aproximado, hábitos).
- `AI_DRAFT_PENDING_REVIEW`: Borrador generado por IA pendiente de aprobación médica.

## 18. Agentes de IA y sus Responsabilidades
Ver especificación completa en [`docs/VET_LIFE_AI_AGENTS.md`](./VET_LIFE_AI_AGENTS.md).

## 19. Memoria de IA y Enrutamiento de Modelos
- Enrutamiento por complejidad: Tareas ligeras con modelos flash; análisis clínicos profundos con modelos pro.
- Supresión obligatoria de IA en protocolos de duelo y quejas graves.
- Presupuesto mensual de tokens por organización con corte automático ante excesos.

## 20. Arquitectura de Automatización n8n
Ver catálogo completo en [`docs/VET_LIFE_AUTOMATION_CATALOG.md`](./VET_LIFE_AUTOMATION_CATALOG.md).

## 21. Modelo de Base de Datos
Ver detalle de entidades y seguridad en [`docs/VET_LIFE_DATA_MODEL.md`](./VET_LIFE_DATA_MODEL.md).

## 22. Integraciones Externas
- **OKVET:** Historias clínicas oficiales, tutores y prescripciones estructuradas.
- **WhatsApp Meta Cloud API:** Notificaciones transaccionales y conserje guiado.
- **Google Calendar:** Agenda médica con privacidad BUSY_ONLY.
- **Waze / Google Maps:** Enlaces deterministas de navegación para auxiliares.

## 23. Planes y Suscripciones Comerciales
Ver desglose financiero en [`docs/VET_LIFE_BUSINESS_MODEL.md`](./VET_LIFE_BUSINESS_MODEL.md).

## 24. Proceso de Prueba Gratuita de 30 Días
Al registrarse en `/registro-clinica`:
1. Creación automática de la organización en Supabase con `trial_ends_at = now() + interval '30 days'`.
2. Asignación inmediata del plan seleccionado con todas sus funcionalidades activas.
3. Recordatorios automáticos en los días 20, 27 y 29 mediante WhatsApp y correo electrónico.
4. Finalización sin pérdida de datos: si no se suscribe, la cuenta entra en modo de solo lectura por 90 días.

## 25. Arquitectura de Demos Pública y Privada
- **Demo Pública (`/demo`):** Datos sintéticos 100% ficticios. Permite alternar entre los roles de Administrador, Recepcionista, Auxiliar y Cliente para evaluar el software sin riesgo.
- **Entorno Privado del Dr. Luis (`/luis`):** Conectado al tenant real con sus pacientes importados de OKVET y citas reales en Medellín y Oriente.

## 26. Onboarding de Nuevas Clínicas
Flujo de 3 pasos:
1. Datos de la veterinaria (nombre, NIT, tipo de práctica: domicilio o clínica fija).
2. Selección de software actual (OKVET, Vetesoft, Excel o ninguno).
3. Personalización visual inicial (selección de una de las 8 colecciones).

## 27. Invitaciones a Usuarios y Tutores
Generador de códigos efímeros (ej. `VET-ABCD-2026`) que permiten a un tutor vincularse a su mascota sin contraseñas engorrosas, recibiendo el link directo por WhatsApp.

## 28. Marca Blanca y Personalización Visual
8 colecciones maestras inspiradas en las mejores apps de bienestar animal:
1. **Botanical Luxe:** Salvia y marfil cálido (Vet Life · Dr. Luis Ríos).
2. **Warm Companion:** Terracota, vainilla y crema.
3. **Midnight Clinical:** Azul medianoche y teal hospitalario.
4. **Mint Precision:** Menta brillante, blanco quirúrgico y alta eficiencia.
5. **Apricot Joy:** Albaricoque, amarillo alegre y ambiente familiar.
6. **Ivory Heritage:** Tipografía editorial y lujo discreto.
7. **Urban Slate:** Pizarra oscura y minimalismo para alto volumen.
8. **Orchid Soft:** Lavanda suave y medicina integrativa.

## 29. Capacidades de Super Admin
Panel exclusivo de Alpha Vision Method para gestionar organizaciones, suspender tenants morosos, inspeccionar errores en el outbox y revisar métricas agregadas de uso.

## 30. Monitoreo de Errores y Despliegues
- Integración continua vía GitHub Actions (`ci.yml` y `documentation-governance.yml`).
- Registro inmutable en `audit_logs` y tabla de incidentes `integration_incidents`.
- Fail-closed: ante discrepancias o esquemas faltantes, el sistema degrada con seguridad sin exponer datos.

## 31. Requisitos de Seguridad y Privacidad
- Cumplimiento de la Ley 1581 de 2012 (Habeas Data Colombia).
- Cumplimiento de la Ley 576 de 2000 (Código de Ética Médico Veterinaria de Colombia).
- Row-Level Security estricto: un tenant jamás puede leer datos de otra organización.

## 32. Funcionalidades Existentes y Verificadas
- 47 migraciones aplicadas en Supabase Postgres 17.
- 46 pacientes, 41 tutores y 43 prescripciones reales de OKVET ingestadas.
- 21 workflows de n8n diseñados y estructurados.
- 86 rutas y pantallas operativas en TanStack Start / Lovable.
- PWA instalable con manifest standalone para iOS y Android.
- 8 colecciones registradas en el Estudio de Diseño.

## 33. Funcionalidades Planificadas Pendientes
- Conexión a pasarela de pagos en vivo (Wompi / Bold / PSE) para cobro de anticipos anti-no-show.
- Token de producción de WhatsApp Business API (actualmente opera en modo sandbox seguro).

## 34. Cobertura de Pruebas
Ver reporte consolidado en [`docs/VET_LIFE_TEST_COVERAGE.md`](./VET_LIFE_TEST_COVERAGE.md).

## 35. Limitaciones Actuales
- La sincronización con OKVET es unidireccional asistida (ingesta de pacientes y fórmulas) ya que OKVET no ofrece webhooks públicos de escritura.
- El mapa en vivo opera con telemetría basada en estados (`en_camino`, `llegada`) mientras se conecta la clave de producción de Google Maps.

## 36. Registro de Decisiones Técnicas
Documentado formalmente en [`docs/project-memory/DECISIONS.md`](./project-memory/DECISIONS.md) (Decisiones D-001 a D-043).

## 37. Dependencias del Sistema
- Supabase (Auth, PostgreSQL 17, Storage, Realtime).
- n8n Cloud (Webhooks y procesamiento asíncrono).
- Lovable / Cloudflare Pages (Hosting del frontend PWA).
- Alpha Vision Method (Dominio raíz y gobernanza técnica).

## 38. Hoja de Ruta de Desarrollo
Ver fases de ejecución en [`docs/VET_LIFE_ROADMAP.md`](./VET_LIFE_ROADMAP.md).

## 39. Oportunidades Futuras
- Conectores universales para clínicas en EE. UU. (ezyVet, Provet Cloud, Covetrus).
- Pasaporte digital de viaje internacional para mascotas con QR verificable.

## 40. Procedimientos de Mantenimiento y Gobernanza Documental
Todo cambio en el código fuente exige actualizar `docs/features.manifest.json`, el `IMPLEMENTATION_LEDGER` y la documentación canónica correspondiente, verificado automáticamente por GitHub Actions antes de cada fusión.
