import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Stethoscope,
  Activity,
  PhoneCall,
  Navigation,
  PawPrint,
  ShieldCheck,
  Play,
  Compass,
  FlaskConical,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  DollarSign,
  Car,
  Search,
  ExternalLink,
  ChevronRight,
  QrCode,
  ShieldAlert,
  Send,
  HelpCircle,
  Eye,
  Check,
  RefreshCw,
  Award,
  BookOpen,
  Calendar,
  AlertTriangle,
  User,
  Sliders,
  Smartphone,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { enterDemo } from "@/lib/vf/session";
import { AcademyVideoTourPlayer } from "./AcademyVideoTourPlayer";

export type AcademyMode = "watch" | "guide" | "practice";
export type PersonaId = "luis" | "vet" | "reception" | "coordinator" | "client" | "superadmin";

interface PersonaConfig {
  id: PersonaId;
  name: string;
  roleTitle: string;
  badge: string;
  avatarBg: string;
  accentColor: string;
  icon: React.ElementType;
  primaryRoute: string;
  description: string;
  mission: string;
  kpis: { label: string; value: string }[];
  watchSteps: {
    title: string;
    description: string;
    screen: string;
    benefit: string;
  }[];
  guideChecklist: {
    step: number;
    title: string;
    action: string;
    route: string;
    tip: string;
  }[];
}

const PERSONAS: PersonaConfig[] = [
  {
    id: "luis",
    name: "Dr. Luis Eduardo Ríos",
    roleTitle: "Fundador & Director Médico COMVEZCOL",
    badge: "Dirección Médica & Propietario",
    avatarBg: "bg-emerald-600 text-white",
    accentColor: "emerald",
    icon: Stethoscope,
    primaryRoute: "/luis",
    description: "Soberanía de tiempo, libertad operativa y control clínico total sin carga administrativa.",
    mission: "Garantizar medicina veterinaria domiciliaria de máxima calidad con rigor ético, delegación inteligente y rentabilidad.",
    kpis: [
      { label: "Pacientes OKVET Activos", value: "46" },
      { label: "Fórmulas Firmadas COMVEZCOL", value: "43" },
      { label: "Tiempo Administrativo Ahorrado", value: "3.5h/día" },
    ],
    watchSteps: [
      {
        title: "1. Briefing Ejecutivo Matutino (07:00 AM)",
        description: "Revisa en una sola pantalla los ingresos proyectados en COP, citas del día en Medellín/Oriente y pacientes prioritarios.",
        screen: "/luis",
        benefit: "Cero incertidumbre al iniciar la jornada.",
      },
      {
        title: "2. Asistente Ejecutivo por Voz en Español",
        description: "Dicta instrucciones clínicas por voz: 'Agendar control para Luna el jueves a las 10am en El Poblado'.",
        screen: "/luis/asistente",
        benefit: "Agendamiento con cálculo de tráfico sin tocar el teclado.",
      },
      {
        title: "3. Consulta y Prescripción Médica Oficial",
        description: "Registra la evolución SOAP y emite la fórmula con tarjeta COMVEZCOL y enlace temporal firmado de 24h.",
        screen: "/luis/cita/demo-cita-1",
        benefit: "100% apego a la Ley 576 de 2000. Cero riesgo de falsificación.",
      },
      {
        title: "4. Hub Financiero y Modo Libertad",
        description: "Supervisa márgenes de consulta domiciliaria, split de comisiones de auxiliares y activa delegación de ausencia.",
        screen: "/luis/comisiones",
        benefit: "El negocio opera de manera autónoma cuando Luis no está de turno.",
      },
    ],
    guideChecklist: [
      {
        step: 1,
        title: "Explorar el Centro Ejecutivo",
        action: "Ir a /luis y revisar las 5 tarjetas de resumen del día.",
        route: "/luis",
        tip: "Observa cómo se alternan los modos 'Dueño' y 'Veterinario' con un solo clic.",
      },
      {
        step: 2,
        title: "Ver Expedientes Reales de OKVET",
        action: "Abrir la lista de 46 pacientes en /luis/pacientes.",
        route: "/luis/pacientes",
        tip: "Nota que los datos provienen del PIMS oficial del Dr. Luis sin duplicación.",
      },
      {
        step: 3,
        title: "Probar el Asistente de Voz",
        action: "Abrir el chat ejecutivo en /luis/asistente.",
        route: "/luis/asistente",
        tip: "Puedes dictar o pulsar los chips de sugerencia rápida para simular citas.",
      },
      {
        step: 4,
        title: "Supervisar Split de Comisiones Médicas",
        action: "Revisar la dispersión en /luis/comisiones.",
        route: "/luis/comisiones",
        tip: "Muestra el cruce entre pagos en calle recibidos por auxiliares y pagos en pasarela.",
      },
    ],
  },
  {
    id: "vet",
    name: "Dra. Valeria Gómez",
    roleTitle: "Médica Veterinaria de Consulta Domiciliaria",
    badge: "Veterinaria de Planta",
    avatarBg: "bg-teal-600 text-white",
    accentColor: "teal",
    icon: Activity,
    primaryRoute: "/luis",
    description: "Atención médica domiciliaria enfocada en el bienestar del paciente y rigor diagnóstico.",
    mission: "Brindar una consulta cálida, sin estrés de traslados, con historia clínica digital y prescripción médica legal.",
    kpis: [
      { label: "Consultas Realizadas", value: "128" },
      { label: "Puntualidad de Ruta", value: "97.4%" },
      { label: "Satisfacción Tutores", value: "4.9/5" },
    ],
    watchSteps: [
      {
        title: "1. Consulta de la Agenda Asignada",
        description: "Visualiza la secuencia óptima de paradas domiciliarias con direcciones georreferenciadas y notas de acceso.",
        screen: "/equipo/agenda",
        benefit: "Rutas organizadas que minimizan tiempos de viaje en el Oriente Antioqueño.",
      },
      {
        title: "2. Cronómetro Activo de Consulta",
        description: "Inicia el temporizador de 45 minutos al entrar al domicilio. Monitorea el tiempo y activa alarmas sonoras.",
        screen: "/luis/cita/demo-cita-1",
        benefit: "Evita que las consultas se extiendan sin control de cascada de retrasos.",
      },
      {
        title: "3. Expediente Clínico y Emisión de Fórmulas",
        description: "Revisa antecedentes de vacunas de Luna y prescribe el tratamiento con validación COMVEZCOL instantánea.",
        screen: "/cliente/mascotas/p1",
        benefit: "El tutor recibe la fórmula en PDF de inmediato en su WhatsApp.",
      },
      {
        title: "4. Compromisos Post-Visita",
        description: "Registra seguimiento telefónico en 48h y solicitud de exámenes de laboratorio para confirmación diagnóstica.",
        screen: "/luis",
        benefit: "Cero pacientes olvidados; continuidad clínica garantizada.",
      },
    ],
    guideChecklist: [
      {
        step: 1,
        title: "Revisar Paciente y Alergias",
        action: "Abrir la ficha de un paciente en /cliente/mascotas/p1.",
        route: "/cliente/mascotas/p1",
        tip: "Verifica las restricciones clínicas y las fórmulas activas vigentes.",
      },
      {
        step: 2,
        title: "Simular Inicio de Consulta",
        action: "Iniciar el cronómetro en la pantalla de cita.",
        route: "/luis",
        tip: "El cronómetro previene retrasos en cadena para los siguientes pacientes.",
      },
      {
        step: 3,
        title: "Emitir Fórmula Médica Firmada",
        action: "Prescribir medicamento con validación COMVEZCOL.",
        route: "/luis",
        tip: "La ley colombiana exige matrícula profesional activa; la IA no prescribe.",
      },
    ],
  },
  {
    id: "reception",
    name: "Camila Restrepo",
    roleTitle: "Coordinadora de Recepción & Triage",
    badge: "Front Desk & Admisiones",
    avatarBg: "bg-amber-600 text-white",
    accentColor: "amber",
    icon: PhoneCall,
    primaryRoute: "/recepcion",
    description: "Atención inmediata de llamadas y WhatsApp, triaje de urgencias y agendamiento sin fricción.",
    mission: "Convertir cada consulta en una cita confirmada, evitando huecos en la agenda y protegiendo el tiempo médico.",
    kpis: [
      { label: "Tiempo de Respuesta WABA", value: "< 2 min" },
      { label: "Tasa de Citas Confirmadas", value: "94.2%" },
      { label: "Anticipos Anti-No-Show", value: "100%" },
    ],
    watchSteps: [
      {
        title: "1. Triage Inteligente de Urgencias",
        description: "Clasifica solicitudes inbound: emergencias P0 (intoxicación, trauma) se escalan de inmediato al médico.",
        screen: "/recepcion",
        benefit: "Atención oportuna de pacientes críticos con protocolo de triaje.",
      },
      {
        title: "2. Verificación de Cupos y Conflicto",
        description: "El sistema valida disponibilidad en Google Calendar y calcula buffers de tráfico antes de ofrecer un horario.",
        screen: "/recepcion",
        benefit: "Cero sobre-agendamientos ni citas imposibles de cumplir.",
      },
      {
        title: "3. Retención Provisional y Cobro de Anticipo",
        description: "Genera un hold de 15 minutos y envía enlace de pago Nequi/Wompi para asegurar la visita.",
        screen: "/cliente/reservar",
        benefit: "Eliminación casi total de citas canceladas a última hora (no-shows).",
      },
      {
        title: "4. Confirmación Automática Multicanal",
        description: "Tras verificar el anticipo, n8n envía plantilla Meta aprobada con datos de preparación de la mascota.",
        screen: "/recepcion",
        benefit: "El tutor sabe exactamente cómo esperar al veterinario en casa.",
      },
    ],
    guideChecklist: [
      {
        step: 1,
        title: "Revisar Bandeja de Entrada",
        action: "Ir a /recepcion y ver las solicitudes pendientes.",
        route: "/recepcion",
        tip: "Identifica rápidamente pacientes nuevos vs recurrentes.",
      },
      {
        step: 2,
        title: "Agendar Nueva Cita a Domicilio",
        action: "Abrir el asistente de agendamiento en /cliente/reservar.",
        route: "/cliente/reservar",
        tip: "Prueba seleccionando diferentes zonas (El Poblado, Envigado, Rionegro).",
      },
      {
        step: 3,
        title: "Verificar Anticipo de Cita",
        action: "Inspeccionar las solicitudes con pago de depósito.",
        route: "/recepcion",
        tip: "El anticipo se descuenta automáticamente del total facturado.",
      },
    ],
  },
  {
    id: "coordinator",
    name: "Andrés Felipe",
    roleTitle: "Coordinador de Logística & Despacho en Vivo",
    badge: "Operaciones & Rutas",
    avatarBg: "bg-blue-600 text-white",
    accentColor: "blue",
    icon: Navigation,
    primaryRoute: "/operaciones",
    description: "Supervisión de rutas en tiempo real, control de tiempos de traslado y comunicación proactiva.",
    mission: "Maximizar el número de visitas efectivas al día garantizando que ningún cliente quede esperando sin información.",
    kpis: [
      { label: "Eficiencia de Ruta", value: "+28%" },
      { label: "Notificaciones de Retraso", value: "100% Proactivas" },
      { label: "Visitas Completadas/Día", value: "6.8 prom" },
    ],
    watchSteps: [
      {
        title: "1. Optimización de Secuencia de Paradas",
        description: "Agrupa visitas por corredores viales (Medellín Sur, Rionegro, La Ceja) para reducir kilómetros muertos.",
        screen: "/operaciones",
        benefit: "Menor desgaste de vehículos y menor tiempo en congestión vehicular.",
      },
      {
        title: "2. Telemetría GPS en Vivo de Auxiliares",
        description: "Monitorea la ubicación y velocidad del equipo en calle sobre el mapa en tiempo real.",
        screen: "/operaciones",
        benefit: "Coordinación precisa de llegadas sin llamar al veterinario mientras conduce.",
      },
      {
        title: "3. Motor de Cascada y Predicción de ETA",
        description: "Si una consulta en Llanogrande se prolonga 15 min, el sistema recalcula los tiempos de las siguientes citas.",
        screen: "/operaciones",
        benefit: "Aviso preventivo automático al siguiente cliente antes de que pregunte.",
      },
      {
        title: "4. Despacho de Enlace de Tracking al Tutor",
        description: "Al iniciar el desplazamiento, se activa el enlace efímero seguro (/t/:token) con vista estilo Uber.",
        screen: "/t/demo-tracking-token",
        benefit: "Tranquilidad total para la familia que espera en su hogar.",
      },
    ],
    guideChecklist: [
      {
        step: 1,
        title: "Abrir Centro de Operaciones",
        action: "Ir a /operaciones y observar el mapa de rutas.",
        route: "/operaciones",
        tip: "Visualiza el estado de cada vehículo y el avance de la jornada.",
      },
      {
        step: 2,
        title: "Probar el Tracking en Vivo",
        action: "Abrir la vista de seguimiento público en /t/demo-tracking-token.",
        route: "/t/demo-tracking-token",
        tip: "Nota que por privacidad sólo se muestra el mapa cuando el estado es 'en_camino'.",
      },
      {
        step: 3,
        title: "Evaluar Políticas de Retraso",
        action: "Revisar los incidentes de demora registrados.",
        route: "/operaciones",
        tip: "El sistema no altera la hora oficial de la cita; envía un ETA estimado.",
      },
    ],
  },
  {
    id: "client",
    name: "Carolina Gómez (Tutora de Luna 🐕 y Max 🐈)",
    roleTitle: "Tutora de Familia · Experiencia del Cliente",
    badge: "Tutor / Propietario de Mascota",
    avatarBg: "bg-rose-500 text-white",
    accentColor: "rose",
    icon: PawPrint,
    primaryRoute: "/cliente",
    description: "Atención domiciliaria sin estrés en la comodidad del hogar, con expediente y carné digital al día.",
    mission: "Mantener a sus mascotas sanas y felices con atención personalizada, puntual y transparente del Dr. Luis.",
    kpis: [
      { label: "Mascotas Registradas", value: "2 (Luna & Max)" },
      { label: "Carné Vacunal", value: "Al día (100%)" },
      { label: "Fórmulas Descargadas", value: "4 PDFs" },
    ],
    watchSteps: [
      {
        title: "1. Portal Familiar Cálido e Intuitivo",
        description: "Diseño móvil premium en tono marfil cálido (#FAF7F0) con tarjetas hero de Luna y Max.",
        screen: "/cliente",
        benefit: "Toda la información veterinaria organizada en el teléfono sin carpetas de papel.",
      },
      {
        title: "2. Carné Digital y Pasaporte Sanitario QR",
        description: "Historial completo de vacunas, desparasitaciones y pasaporte de viaje con QR criptográfico verificable.",
        screen: "/cliente/pasaporte/p1",
        benefit: "Válido para viajes nacionales e internacionales con firma COMVEZCOL.",
      },
      {
        title: "3. Rastreo del Veterinario en Camino",
        description: "Notificación de WhatsApp cuando el Dr. Luis sale hacia su casa, con mapa animado y tiempo exacto de llegada.",
        screen: "/t/demo-tracking-token",
        benefit: "La familia sabe el momento exacto para tener a la mascota lista.",
      },
      {
        title: "4. Bóveda de Fórmulas Oficiales y Pagos",
        description: "Descarga de fórmulas médicas con posología clara y pago sin contacto vía Nequi, Bancolombia o tarjeta.",
        screen: "/cliente/mascotas/p1",
        benefit: "Cero dudas sobre medicamentos y pago rápido sin efectivo exacto.",
      },
    ],
    guideChecklist: [
      {
        step: 1,
        title: "Visitar el Portal Familiar",
        action: "Ir a /cliente y alternar entre Luna y Max.",
        route: "/cliente",
        tip: "Revisa las tareas de cuidado diario y la próxima fecha de vacunación.",
      },
      {
        step: 2,
        title: "Ver el Pasaporte Sanitario QR",
        action: "Abrir /cliente/pasaporte/p1 para ver el carné con QR.",
        route: "/cliente/pasaporte/p1",
        tip: "Cualquier autoridad o clínica puede escanear el QR para verificar autenticidad.",
      },
      {
        step: 3,
        title: "Descargar Fórmula Médica en PDF",
        action: "Revisar las recetas médicas en la ficha del paciente.",
        route: "/cliente/mascotas/p1",
        tip: "Incluye firma digital del Dr. Luis Eduardo Ríos y posología detallada.",
      },
      {
        step: 4,
        title: "Compartir con la Familia (Hogar)",
        action: "Gestionar cuidadores en /cliente/hogar.",
        route: "/cliente/hogar",
        tip: "Permite que la pareja o hijos también vean los horarios de medicamentos.",
      },
    ],
  },
  {
    id: "superadmin",
    name: "Alpha Vision SaaS Operator",
    roleTitle: "Super Administrador de la Plataforma",
    badge: "Operador de Red Multi-Tenant",
    avatarBg: "bg-slate-800 text-white",
    accentColor: "slate",
    icon: ShieldCheck,
    primaryRoute: "/admin",
    description: "Gobernanza comercial, telemetría de base de datos, motor de entitlements y marca blanca de la red.",
    mission: "Garantizar alta disponibilidad, aislamiento estricto RLS y crecimiento comercial del ecosistema SaaS.",
    kpis: [
      { label: "Clínicas Activas", value: "2 (Vet Life + San Roque)" },
      { label: "PostgreSQL 17 RLS", value: "100% Blindado" },
      { label: "MRR Recurrente", value: "$389.000 COP" },
    ],
    watchSteps: [
      {
        title: "1. Owner Command Center con KPIs en Vivo",
        description: "Monitorea métricas de ingresos, pacientes activos de OKVET, estado de pruebas y semáforos de salud.",
        screen: "/admin",
        benefit: "Visibilidad inmediata de la salud financiera y técnica de la red.",
      },
      {
        title: "2. Asistente 'Ask Antigravity' (IA Optimizada)",
        description: "Consulta métricas complejas en lenguaje natural sin desperdicio de tokens gracias al caché efímero de Claude.",
        screen: "/admin",
        benefit: "Inteligencia de negocios sin costos elevados de API.",
      },
      {
        title: "3. Onboarding Guiado en 5 Pasos para Nuevas Clínicas",
        description: "Aprovisiona una nueva clínica veterinaria con subdominio instantáneo en alphavisionm.com en menos de 3 minutos.",
        screen: "/onboarding",
        benefit: "Expansión comercial automatizada sin soporte manual intensivo.",
      },
      {
        title: "4. Estudio White-Label y Motor de Entitlements",
        description: "Personaliza colores, tokens CSS y audita los 33 features canónicos en /admin/inspeccionar-entitlements.",
        screen: "/admin/estudio-diseno",
        benefit: "Cada clínica tiene su propia identidad visual sin tocar código fuente.",
      },
    ],
    guideChecklist: [
      {
        step: 1,
        title: "Revisar el Owner Command Center",
        action: "Ir a /admin y consultar los semáforos de salud de Postgres 17.",
        route: "/admin",
        tip: "Verifica que el estado de Supabase y Lovable esté en verde operativo.",
      },
      {
        step: 2,
        title: "Inspeccionar el Motor de Entitlements",
        action: "Abrir /admin/inspeccionar-entitlements.",
        route: "/admin/inspeccionar-entitlements",
        tip: "Comprueba las 5 condiciones de acceso que valida la RPC en PostgreSQL.",
      },
      {
        step: 3,
        title: "Probar el Estudio White-Label",
        action: "Abrir /admin/estudio-diseno y alternar paletas de color.",
        route: "/admin/estudio-diseno",
        tip: "Modifica tokens CSS en tiempo real con vista previa en simulador móvil.",
      },
      {
        step: 4,
        title: "Asistente de Onboarding para Clínicas",
        action: "Recorrer el asistente de 5 pasos en /onboarding.",
        route: "/onboarding",
        tip: "Genera subdominios wildcard instantáneos *.alphavisionm.com.",
      },
    ],
  },
];

interface ShowMeHowQuestion {
  questionEs: string;
  questionEn: string;
  category: "citas" | "clinica" | "okvet" | "rutas" | "finanzas" | "admin" | "onboarding" | "preventa";
  answerEs: string;
  answerEn: string;
  stepsEs: string[];
  stepsEn: string[];
  deepLink: string;
  linkLabelEs: string;
  linkLabelEn: string;
}

const SHOW_ME_HOW_QUESTIONS: ShowMeHowQuestion[] = [
  {
    questionEs: "¿Cómo creo una nueva cita a domicilio?",
    questionEn: "How do I create a new in-home appointment?",
    category: "citas",
    answerEs: "El agendamiento calcula disponibilidad médica en Google Calendar, evalúa el tiempo de traslado según tráfico y reserva un cupo provisional con anticipo opcional.",
    answerEn: "Scheduling checks doctor availability on Google Calendar, estimates drive time with traffic buffers, and holds an appointment with an optional anti-no-show deposit.",
    stepsEs: [
      "1. Ingresa a la pantalla de agendamiento (/cliente/reservar o /luis/nueva-cita).",
      "2. Selecciona la mascota, el tipo de servicio (vacunación, consulta general, control).",
      "3. Elige la zona de atención (El Poblado, Envigado, Rionegro, etc.).",
      "4. Escoge un horario recomendado con buffer de traslado.",
      "5. Confirma los datos del tutor y envía el enlace de confirmación por WhatsApp.",
    ],
    stepsEn: [
      "1. Go to scheduling (/cliente/reservar or /luis/nueva-cita).",
      "2. Select pet and service type (vaccination, wellness exam, checkup).",
      "3. Choose coverage zone (El Poblado, Envigado, Rionegro, etc.).",
      "4. Pick a recommended time slot with traffic buffers.",
      "5. Confirm owner info and send WhatsApp confirmation link.",
    ],
    deepLink: "/cliente/reservar",
    linkLabelEs: "Abrir Agendador de Citas",
    linkLabelEn: "Open Appointment Booking",
  },
  {
    questionEs: "¿Dónde veo el historial clínico y las fórmulas médicas de una mascota?",
    questionEn: "Where do I find medical records and prescriptions for a pet?",
    category: "clinica",
    answerEs: "El expediente 360 reúne los registros importados de OKVET, vacunas vigentes, restricciones clínicas y las fórmulas médicas oficiales firmadas con COMVEZCOL.",
    answerEn: "The 360 pet record aggregates OKVET clinical history, active vaccines, alerts, and official medical prescriptions signed under COMVEZCOL regulations.",
    stepsEs: [
      "1. Dirígete a la ficha de la mascota (/cliente/mascotas/p1 o /luis/pacientes).",
      "2. En la sección 'Fórmulas Médicas Vigentes' verás la posología y el botón de descarga en PDF.",
      "3. Cada fórmula incluye un enlace efímero de 24h firmado criptográficamente.",
      "4. En 'Línea de Vida Sanitaria' puedes revisar los controles de vacunas y desparasitación.",
    ],
    stepsEn: [
      "1. Navigate to the pet details (/cliente/mascotas/p1 or /luis/pacientes).",
      "2. Check the 'Active Medical Prescriptions' card for dosage and PDF download.",
      "3. Each prescription includes a cryptographically signed 24h ephemeral token.",
      "4. Review vaccine and deworming milestones in the Health Records Timeline.",
    ],
    deepLink: "/cliente/mascotas/p1",
    linkLabelEs: "Ver Expediente de Luna",
    linkLabelEn: "View Luna's Medical Record",
  },
  {
    questionEs: "¿Cómo activo el rastreo GPS en tiempo real cuando salgo hacia el domicilio?",
    questionEn: "How do I activate live GPS tracking when heading to a client's home?",
    category: "rutas",
    answerEs: "El rastreo en vivo se activa automáticamente al cambiar el estado de la visita a 'en_desplazamiento'. El tutor recibe un enlace efímero seguro (/t/:token) con mapa interactivo estilo Uber.",
    answerEn: "Live tracking starts automatically when the visit state transitions to 'en_desplazamiento'. The client receives an ephemeral link (/t/:token) with an interactive Uber-like map.",
    stepsEs: [
      "1. En la agenda de campo, localiza la siguiente cita a realizar.",
      "2. Pulsa 'Iniciar Desplazamiento' (o 'Voy en Camino').",
      "3. El sistema inicia la sesión de telemetría y envía la plantilla de WhatsApp al cliente.",
      "4. Por privacidad, la ubicación del médico sólo es visible mientras esté en camino.",
      "5. Al pulsar 'He Llegado', el mapa se congela y se activa el cronómetro de consulta.",
    ],
    stepsEn: [
      "1. Locate your next assigned appointment in the field agenda.",
      "2. Tap 'Start Trip' (or 'En Route').",
      "3. Telemetry begins and n8n notifies the client via approved WhatsApp template.",
      "4. For safety, location is strictly shared while en route and hidden upon arrival.",
      "5. Tapping 'Arrived' freezes GPS and starts the consultation timer.",
    ],
    deepLink: "/t/demo-tracking-token",
    linkLabelEs: "Ver Demo de Rastreo en Vivo",
    linkLabelEn: "View Live Tracking Demo",
  },
  {
    questionEs: "¿Cómo concilio o importo pacientes y fórmulas con OKVET?",
    questionEn: "How do I reconcile or import patients and prescriptions with OKVET?",
    category: "okvet",
    answerEs: "OKVET es la autoridad médica legal del Dr. Luis. Vet Life cuenta con un puente asistido de importación por lotes para conciliar tutores, pacientes y recetas sin duplicación.",
    answerEn: "OKVET is the authoritative clinical record for Dr. Luis. Vet Life provides an assisted batch bridge to ingest owners, pets, and prescriptions without duplicate history.",
    stepsEs: [
      "1. Ingresa a Más Módulos del Dr. Luis (/luis) y selecciona 'OKVET Cloud Bridge'.",
      "2. Carga el archivo de exportación de OKVET (XLSX o CSV).",
      "3. El sistema valida homónimos, identifica pacientes nuevos y mapea cédulas.",
      "4. Pulsa 'Ejecutar Importación Asistida' para actualizar la base de datos de Supabase.",
      "5. Los 46 pacientes reales del Dr. Luis quedan sincronizados de inmediato.",
    ],
    stepsEn: [
      "1. Open Dr. Luis's More Menu (/luis) and tap 'OKVET Cloud Bridge'.",
      "2. Upload your official OKVET export file (XLSX or CSV).",
      "3. The engine detects homonyms, flags new patients, and matches national IDs.",
      "4. Click 'Execute Assisted Import' to update the Supabase database.",
      "5. All 46 of Dr. Luis's real patients are synced instantly.",
    ],
    deepLink: "/luis",
    linkLabelEs: "Ir al Centro Ejecutivo del Dr. Luis",
    linkLabelEn: "Go to Dr. Luis Executive Center",
  },
  {
    questionEs: "¿Cómo funciona la compuerta de prescripción médica Ley 576 de 2000?",
    questionEn: "How does the Colombian Law 576 COMVEZCOL prescription gate work?",
    category: "clinica",
    answerEs: "La Ley 576 de 2000 prohíbe que sistemas automatizados o inteligencias artificiales receten medicamentos. En Vet Life, cada fórmula requiere verificación de matrícula COMVEZCOL y firma de un médico habilitado.",
    answerEn: "Colombian Law 576 of 2000 prohibits automated or AI systems from prescribing treatments. Every prescription in Vet Life requires verified COMVEZCOL credentials and doctor signature.",
    stepsEs: [
      "1. La IA puede sugerir dosis informativas, pero jamás emitir la receta final.",
      "2. El médico veterinario habilitado revisa el paciente presencialmente.",
      "3. Se genera un registro inmutable con tarjeta profesional (ej: Dr. Luis COMVEZCOL-001).",
      "4. Se calcula un hash criptográfico SHA-256 para evitar adulteraciones posteriores.",
      "5. El documento se entrega al tutor mediante enlace temporal con vencimiento a las 24 horas.",
    ],
    stepsEn: [
      "1. AI may provide dosage suggestions, but can never issue an official prescription.",
      "2. A licensed veterinarian examines the patient in person.",
      "3. An immutable record is created with veterinary registration (e.g., COMVEZCOL-001).",
      "4. A SHA-256 cryptographic hash is generated to protect document integrity.",
      "5. The signed PDF is dispatched to the client with an expiring 24h temporary token.",
    ],
    deepLink: "/cliente/mascotas/p1",
    linkLabelEs: "Ver Fórmulas con COMVEZCOL",
    linkLabelEn: "View Prescriptions with COMVEZCOL",
  },
  {
    questionEs: "¿Cómo personalizo los colores y logo de mi clínica en el Estudio White-Label?",
    questionEn: "How do I customize colors and branding for my clinic in the White-Label Studio?",
    category: "admin",
    answerEs: "El Visual White-Label Studio permite inyectar tokens CSS de diseño dinámicos en tiempo real sin recompilar el código fuente. Puedes elegir entre 8 colecciones arquitectónicas o crear tu propia paleta.",
    answerEn: "The Visual White-Label Studio injects dynamic CSS design tokens at runtime without recompiling source code. Choose from 8 design collections or craft your own palette.",
    stepsEs: [
      "1. Entra como Administrador y navega a /admin/estudio-diseno.",
      "2. Selecciona una colección prediseñada (Esmeralda Botánica, Champagne Gold, Lavanda Calma, etc.).",
      "3. Ajusta el color primario, el radio de esquinas de tarjetas y la tipografía.",
      "4. Observa el simulador de iPhone en vivo a la derecha para ver cómo lo verá el cliente.",
      "5. Pulsa 'Guardar y Publicar Marca' para persistir los cambios en la base de datos de tu clínica.",
    ],
    stepsEn: [
      "1. Sign in as Admin and navigate to /admin/estudio-diseno.",
      "2. Pick an architectural collection (Botanical Emerald, Champagne Gold, Calm Lavender).",
      "3. Customize primary colors, border radii, and font pairings.",
      "4. Test the live iPhone mockup on the right to preview the client experience.",
      "5. Tap 'Save & Publish Brand' to store tokens in your clinic database.",
    ],
    deepLink: "/admin/estudio-diseno",
    linkLabelEs: "Abrir Estudio de Diseño",
    linkLabelEn: "Open White-Label Studio",
  },
  {
    questionEs: "¿Cómo calcula el sistema el split de comisiones entre médicos y auxiliares?",
    questionEn: "How does the commission split work between doctors and technicians?",
    category: "finanzas",
    answerEs: "El motor de dispersión financiera cruza los servicios completados en calle con los pagos recibidos en pasarela y el efectivo cobrado en domicilio, liquidando porcentajes acordados automáticamente.",
    answerEn: "The financial settlement engine reconciles completed in-home visits against gateway payments and cash collected on-site, computing configured revenue splits automatically.",
    stepsEs: [
      "1. Abre /luis/comisiones desde el menú del Dr. Luis.",
      "2. El sistema muestra el recaudo total del periodo, desglosado por profesional.",
      "3. Aplica los porcentajes configurados (ej: 60% clínica, 40% veterinario de planta, bono por traslado).",
      "4. Concilia retenciones en la fuente y pagos en efectivo reportados en calle.",
      "5. Permite emitir el acta de liquidación para dispersión bancaria.",
    ],
    stepsEn: [
      "1. Open /luis/comisiones from Dr. Luis's executive hub.",
      "2. The dashboard summarizes total revenue broken down per field specialist.",
      "3. Applies configured splits (e.g., 60% clinic, 40% visiting vet, travel bonus).",
      "4. Deducts tax withholdings and reconciles cash collected in the field.",
      "5. Generates the final settlement report ready for payroll transfer.",
    ],
    deepLink: "/luis/comisiones",
    linkLabelEs: "Ver Liquidación de Comisiones",
    linkLabelEn: "View Commission Settlement",
  },
  {
    questionEs: "¿Cómo hago el onboarding completo de un nuevo cliente o clínica?",
    questionEn: "How do I perform complete onboarding for a new client or veterinary clinic?",
    category: "onboarding",
    answerEs: "El onboarding guiado en 5 pasos permite dar de alta una nueva clínica o negocio en menos de 3 minutos: reserva de subdominio instantáneo (*.alphavisionm.com), configuración de tarifas en COP, vinculación de WhatsApp y activación de 30 días de prueba gratuita.",
    answerEn: "The 5-step guided onboarding sets up a new clinic or service business in under 3 minutes: instant dedicated subdomain (*.alphavisionm.com), COP service fee catalog, WhatsApp integration, and 30-day free trial provisioning.",
    stepsEs: [
      "1. Ingresa al Asistente de Onboarding (/onboarding o /registro-clinica).",
      "2. Paso 1 (Datos de la Clínica): Ingresa el nombre comercial, NIT y elige el subdominio dedicado (ej: sanroque.alphavisionm.com).",
      "3. Paso 2 (Identidad & Colores): Selecciona la paleta de colores de marca o sube el logo oficial para la personalización PWA.",
      "4. Paso 3 (Catálogo de Tarifas): Define las tarifas base de consulta domiciliaria ($120.000 COP), vacunación y recargo nocturno.",
      "5. Paso 4 (Canal de WhatsApp): Vincula el número telefónico para envío automático de recordatorios y confirmación de citas.",
      "6. Paso 5 (Activación Instantánea): Haz clic en 'Activar Mi Prueba de 30 Días' para aprovisionar el esquema PostgreSQL 17 multi-tenant.",
    ],
    stepsEn: [
      "1. Navigate to the Guided Onboarding Wizard (/onboarding or /registro-clinica).",
      "2. Step 1 (Clinic Profile): Enter legal name, tax ID, and choose your custom subdomain (e.g., sanroque.alphavisionm.com).",
      "3. Step 2 (Visual Branding): Select your primary color palette or upload the clinic logo for PWA white-labeling.",
      "4. Step 3 (Service Pricing): Configure in-home consultation fees ($120,000 COP), vaccine schedules, and night surcharges.",
      "5. Step 4 (WhatsApp Integration): Connect the official phone number for automated appointment confirmations.",
      "6. Step 5 (Instant Provisioning): Click 'Activate 30-Day Free Trial' to provision the PostgreSQL 17 multi-tenant schema.",
    ],
    deepLink: "/onboarding",
    linkLabelEs: "Abrir Asistente de Onboarding",
    linkLabelEn: "Launch Onboarding Wizard",
  },
  {
    questionEs: "¿Cómo generar demos y accesos de preventa para prospectos?",
    questionEn: "How do I generate interactive demo links and presales trials for prospects?",
    category: "preventa",
    answerEs: "El panel de Demos e Invitaciones (/admin/demos-invitaciones) permite al equipo comercial generar enlaces únicos de prueba (/try/:token), precargar datos de ejemplo de Medellín y Rionegro, y crear simulaciones de impacto financiero para cerrar ventas de software.",
    answerEn: "The Demos & Invitations panel (/admin/demos-invitaciones) empowers sales teams to issue unique prospect demo tokens (/try/:token), preload sample patient journeys for Medellin/Rionegro, and model ROI impact to close software subscriptions.",
    stepsEs: [
      "1. Inicia sesión como Super Admin y dirígete a /admin/demos-invitaciones.",
      "2. En la sección 'Generar Enlace Único de Preventa', ingresa el nombre de la clínica o contratista prospecto (ej: 'Clínica Veterinaria El Poblado').",
      "3. Selecciona la vertical de negocio: Veterinaria Domiciliaria (Vet Freedom) o Servicios de Construcción/Contratistas (Alpha Service OS).",
      "4. Escoge la duración del enlace (24 horas para llamadas de preventa o 30 días para pruebas guiadas sin tarjeta).",
      "5. Haz clic en 'Generar Enlace Seguro' y copia el link (/try/:token) o envíalo directamente por WhatsApp con el mensaje precargado.",
      "6. Durante la llamada comercial, guía al prospecto a través de /demo-interactiva para mostrarle el flujo real de ingresos y agenda.",
    ],
    stepsEn: [
      "1. Sign in as Super Admin and open /admin/demos-invitaciones.",
      "2. Under 'Generate Presales Demo Link', enter the prospect clinic or contractor name (e.g., 'El Poblado Vet Clinic').",
      "3. Select the target business vertical: In-Home Veterinary (Vet Freedom) or Field Contractor (Alpha Service OS).",
      "4. Select token lifespan (24 hours for live sales calls or 30 days for cardless self-serve trials).",
      "5. Click 'Generate Secure Link', copy the custom URL (/try/:token) or share it directly via WhatsApp with the pre-filled pitch.",
      "6. During the demo call, walk the prospect through /demo-interactiva to demonstrate live scheduling and revenue splits.",
    ],
    deepLink: "/admin/demos-invitaciones",
    linkLabelEs: "Abrir Generador de Demos",
    linkLabelEn: "Open Demo Generator",
  },
];

export function InteractiveProductAcademy() {
  const navigate = useNavigate();
  const [selectedPersonaId, setSelectedPersonaId] = useState<PersonaId>("luis");
  const [mode, setMode] = useState<AcademyMode>("watch");
  const [lang, setLang] = useState<"es" | "en">("es");

  // Show Me How Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeQuestion, setActiveQuestion] = useState<ShowMeHowQuestion | null>(null);

  // Synthetic Practice Sandbox States
  const [sandboxStep, setSandboxStep] = useState<number>(1);
  const [simbaAppointmentBooked, setSimbaAppointmentBooked] = useState(false);
  const [consultationTimerRunning, setConsultationTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [prescriptionGenerated, setPrescriptionGenerated] = useState(false);
  const [gpsTrackingSimulated, setGpsTrackingSimulated] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

  const activePersona: PersonaConfig = PERSONAS.find((p) => p.id === selectedPersonaId) ?? PERSONAS[0]!;

  // Timer effect for synthetic consultation
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (consultationTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [consultationTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSwitchPersonaRole = (persona: PersonaConfig) => {
    setSelectedPersonaId(persona.id);
    toast.info(
      lang === "es"
        ? `Explorando como: ${persona.name} (${persona.roleTitle})`
        : `Switched perspective to: ${persona.name} (${persona.roleTitle})`
    );
  };

  const handleLaunchLiveRole = (persona: PersonaConfig) => {
    // Map to system demo profiles
    if (persona.id === "luis") enterDemo("luis", "Dr. Luis Eduardo Ríos");
    else if (persona.id === "client") enterDemo("cliente", "Carolina Gómez (Luna 🐕)");
    else if (persona.id === "reception") enterDemo("recepcion", "Camila Restrepo");
    else if (persona.id === "coordinator") enterDemo("auxiliar", "Andrés Felipe");
    else if (persona.id === "superadmin") enterDemo("administrador", "Laura Peña");
    else enterDemo("veterinario", "Dra. Valeria Gómez");

    toast.success(
      lang === "es"
        ? `Ingresando al sistema en vivo con rol ${persona.badge}...`
        : `Entering live environment as ${persona.badge}...`
    );
    void navigate({ to: persona.primaryRoute as never });
  };

  // Filtered Show Me How questions
  const filteredQuestions = SHOW_ME_HOW_QUESTIONS.filter((q) => {
    const matchesCategory = selectedCategory === "all" || q.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesQuery =
      q.questionEs.toLowerCase().includes(query) ||
      q.questionEn.toLowerCase().includes(query) ||
      q.answerEs.toLowerCase().includes(query) ||
      q.answerEn.toLowerCase().includes(query);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      {/* Top Banner & Language Selector */}
      <div className="flex flex-col gap-4 rounded-3xl border border-primary/20 bg-gradient-to-br from-card to-primary/5 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black tracking-wide text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {lang === "es"
                ? "ACADEMIA INTERACTIVA DE PRODUCTO · ALPHA VISION METHOD"
                : "INTERACTIVE PRODUCT ACADEMY · ALPHA VISION METHOD"}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-black text-foreground sm:text-3xl">
            {lang === "es" ? "Vive la Plataforma Completa" : "Experience the Complete Platform"}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {lang === "es"
              ? "Aprende, experimenta y domina Vet Freedom OS a través de los ojos del Dr. Luis Eduardo Ríos, su equipo clínico, recepcionistas, coordinadores, tutores y administradores."
              : "Learn, explore and master Vet Freedom OS through the eyes of Dr. Luis Eduardo Ríos, his clinical staff, receptionists, dispatchers, pet owners and system administrators."}
          </p>
        </div>

        {/* Action Controls & Language Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-2xl border border-border bg-background p-1 text-xs font-bold shadow-sm">
            <button
              onClick={() => setLang("es")}
              className={`rounded-xl px-3 py-1.5 transition ${lang === "es" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              🇨🇴 ES
            </button>
            <button
              onClick={() => setLang("en")}
              className={`rounded-xl px-3 py-1.5 transition ${lang === "en" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              🇺🇸 EN
            </button>
          </div>

          <Link
            to="/demo"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition hover:bg-accent"
          >
            <Smartphone className="h-3.5 w-3.5 text-primary" />
            <span>{lang === "es" ? "Demo Comercial" : "Commercial Demo"}</span>
          </Link>
        </div>
      </div>

      {/* 1. ROLE SWITCHER BAR: "Vive la Plataforma Completa" */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-foreground">
              {lang === "es" ? "1. Selecciona la Perspectiva / Rol de Usuario" : "1. Select Role & Perspective"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lang === "es"
                ? "Conmuta de inmediato para experimentar los flujos de trabajo específicos de cada actor del sistema."
                : "Switch perspective to experience the specific daily workflow for each stakeholder."}
            </p>
          </div>
          <span className="text-xs font-bold text-primary">
            {PERSONAS.length} {lang === "es" ? "Roles Especializados" : "Specialized Roles"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {PERSONAS.map((persona) => {
            const Icon = persona.icon;
            const isSelected = selectedPersonaId === persona.id;
            return (
              <button
                key={persona.id}
                onClick={() => handleSwitchPersonaRole(persona)}
                className={`flex flex-col items-start justify-between rounded-3xl p-4 text-left transition-all ${
                  isSelected
                    ? "border-2 border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                    : "border border-border bg-card hover:border-primary/40 hover:bg-accent"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <div className={`grid h-10 w-10 place-items-center rounded-2xl shadow-sm ${persona.avatarBg}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {isSelected && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <span className="block text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    {persona.badge}
                  </span>
                  <b className="mt-0.5 block text-sm font-extrabold text-foreground">
                    {persona.name.split(" ")[0]} {persona.name.split(" ")[1] || ""}
                  </b>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ACTIVE PERSONA HERO CARD */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-3xl shadow-md ${activePersona.avatarBg}`}>
              {React.createElement(activePersona.icon, { className: "h-8 w-8" })}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-black uppercase text-primary">
                  {activePersona.badge}
                </span>
                <span className="text-xs text-muted-foreground">· {activePersona.roleTitle}</span>
              </div>
              <h3 className="mt-1 text-2xl font-black text-foreground">{activePersona.name}</h3>
              <p className="mt-1 max-w-2xl text-xs font-medium text-muted-foreground">
                <b className="text-foreground">{lang === "es" ? "Misión:" : "Mission:"}</b> {activePersona.mission}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleLaunchLiveRole(activePersona)}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-button transition hover:bg-primary/90"
            >
              <span>{lang === "es" ? "Entrar al Sistema como este Perfil" : "Launch Live System as this Role"}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Role KPIs */}
        <div className="mt-6 grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-3">
          {activePersona.kpis.map((kpi, idx) => (
            <div key={idx} className="rounded-2xl bg-secondary/50 p-3">
              <span className="block text-[11px] font-bold text-muted-foreground">{kpi.label}</span>
              <b className="mt-0.5 block text-lg font-black text-foreground">{kpi.value}</b>
            </div>
          ))}
        </div>
      </section>

      {/* 2. MODE SELECTOR: Watch, Guide Me, Practice Safely */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-foreground">
              {lang === "es" ? "2. Selecciona el Modo de Experiencia" : "2. Choose Learning & Practice Mode"}
            </h2>
            <p className="text-xs text-muted-foreground">
              {lang === "es"
                ? "Mira cómo funciona, sigue un recorrido paso a paso o practica en el sandbox aislado con datos sintéticos."
                : "Watch the workflow, follow guided step-by-step instructions, or practice safely in the synthetic sandbox."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            onClick={() => setMode("watch")}
            className={`flex items-center gap-3 rounded-3xl p-4 text-left transition ${
              mode === "watch"
                ? "border-2 border-primary bg-primary/10 shadow-sm"
                : "border border-border bg-card hover:bg-accent"
            }`}
          >
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${mode === "watch" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
              <Play className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <b className="block text-sm font-extrabold text-foreground">
                  {lang === "es" ? "Modo 1: Video-Tours (Ver)" : "Mode 1: Video Tours"}
                </b>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-600 uppercase">
                  HD Video
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {lang === "es" ? "Simulador en video de la jornada real" : "Real daily journey video simulation"}
              </span>
            </div>
          </button>

          <button
            onClick={() => setMode("guide")}
            className={`flex items-center gap-3 rounded-3xl p-4 text-left transition ${
              mode === "guide"
                ? "border-2 border-primary bg-primary/10 shadow-sm"
                : "border border-border bg-card hover:bg-accent"
            }`}
          >
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${mode === "guide" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <b className="block text-sm font-extrabold text-foreground">
                {lang === "es" ? "Modo 2: Guíame (Guide Me)" : "Mode 2: Guide Me"}
              </b>
              <span className="text-xs text-muted-foreground">
                {lang === "es" ? "Paso a paso con accesos directos" : "Interactive checklist with deep links"}
              </span>
            </div>
          </button>

          <button
            onClick={() => setMode("practice")}
            className={`flex items-center gap-3 rounded-3xl p-4 text-left transition ${
              mode === "practice"
                ? "border-2 border-primary bg-primary/10 shadow-sm"
                : "border border-border bg-card hover:bg-accent"
            }`}
          >
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${mode === "practice" ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
              <FlaskConical className="h-6 w-6" />
            </div>
            <div>
              <b className="block text-sm font-extrabold text-foreground">
                {lang === "es" ? "Modo 3: Práctica Segura (Sandbox)" : "Mode 3: Practice Safely"}
              </b>
              <span className="text-xs text-muted-foreground">
                {lang === "es" ? "Simulador interactivo con datos sintéticos" : "Interactive sandbox with synthetic data"}
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* MODE 1: WATCH (CINEMATIC VIDEO TOURS & VISUAL FLOW) */}
      {mode === "watch" && (
        <section className="space-y-8">
          {/* Cinematic Interactive Video Player */}
          <AcademyVideoTourPlayer defaultPersonaId={selectedPersonaId} lang={lang} />

          {/* Core Milestones Breakdown Card Grid */}
          <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-primary">
                  {lang === "es" ? "Desglose de Hitos Operativos" : "Operational Milestones"}
                </span>
                <h3 className="text-xl font-black text-foreground">
                  {lang === "es"
                    ? `4 Momentos Clave de ${activePersona.name}`
                    : `4 Key Moments for ${activePersona.name}`}
                </h3>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-muted-foreground">
                4 {lang === "es" ? "Hitos Principales" : "Core Milestones"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {activePersona.watchSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="relative flex flex-col justify-between rounded-3xl border border-border bg-secondary/30 p-5 transition hover:border-primary/30"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <b className="text-sm font-extrabold text-foreground">{step.title}</b>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                        Paso {idx + 1}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>

                  <div className="mt-4 border-t border-border/60 pt-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ✔ {step.benefit}
                      </span>
                      <Link
                        to={step.screen as never}
                        className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                      >
                        <span>{lang === "es" ? "Ver pantalla" : "View screen"}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MODE 2: GUIDE ME (STEP-BY-STEP CHECKLIST) */}
      {mode === "guide" && (
        <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                {lang === "es" ? "Tour Interactivo Guiado" : "Interactive Guided Tour"}
              </span>
              <h3 className="text-xl font-black text-foreground">
                {lang === "es"
                  ? `Lista de Tareas Recomendadas para ${activePersona.badge}`
                  : `Recommended Task Checklist for ${activePersona.badge}`}
              </h3>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              {lang === "es" ? "Paso a Paso" : "Step-by-Step"}
            </span>
          </div>

          <div className="space-y-3">
            {activePersona.guideChecklist.map((item) => (
              <div
                key={item.step}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 transition sm:flex-row sm:items-center sm:justify-between hover:bg-secondary/20"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-xs font-black text-primary">
                    {item.step}
                  </div>
                  <div>
                    <b className="block text-sm font-extrabold text-foreground">{item.title}</b>
                    <p className="mt-0.5 text-xs text-muted-foreground">{item.action}</p>
                    <span className="mt-1 block text-[11px] font-semibold text-primary">
                      💡 {item.tip}
                    </span>
                  </div>
                </div>

                <Link
                  to={item.route as never}
                  className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-button transition hover:bg-primary/90"
                >
                  <span>{lang === "es" ? "Ir a la pantalla" : "Go to screen"}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* MODE 3: PRACTICE SAFELY (SYNTHETIC SANDBOX) */}
      {mode === "practice" && (
        <section className="space-y-6 rounded-3xl border border-primary/30 bg-gradient-to-br from-card to-primary/5 p-6 shadow-sm">
          <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-black text-foreground">
                  {lang === "es" ? "Sandbox de Práctica Segura (Datos Sintéticos)" : "Safe Practice Sandbox (Synthetic Data)"}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground">
                {lang === "es"
                  ? "Experimenta con pacientes y visitas simuladas sin alterar la base de datos real ni notificar a clientes."
                  : "Interact with simulated patients and visits without touching real database records or notifying clients."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <ShieldCheck className="h-3 w-3" />
                <span>{lang === "es" ? "Modo Seguro Activo (send_enabled: false)" : "Safe Mode Active (send_enabled: false)"}</span>
              </span>
            </div>
          </div>

          {/* Synthetic Patient Card */}
          <div className="flex flex-col gap-4 rounded-2xl bg-secondary/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white font-black text-lg">
                🐕
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <b className="text-base font-extrabold text-foreground">Simba (Paciente Sintético)</b>
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    Golden Retriever · 3 Años
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Tutor: Mateo Henao · El Poblado, Medellín · Motivo: Consulta Domiciliaria General ($120.000 COP)
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setSimbaAppointmentBooked(false);
                setConsultationTimerRunning(false);
                setTimerSeconds(0);
                setPrescriptionGenerated(false);
                setGpsTrackingSimulated(false);
                setPaymentCompleted(false);
                toast.info("Sandbox reiniciado con éxito.");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{lang === "es" ? "Reiniciar Sandbox" : "Reset Sandbox"}</span>
            </button>
          </div>

          {/* Interactive Simulation Milestones */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Step 1: Agendar Cita */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Paso 1
                </span>
                <b className="mt-1 block text-sm font-extrabold text-foreground">
                  {lang === "es" ? "Agendar Cita en Agenda" : "Book In-Home Appointment"}
                </b>
                <p className="mt-1 text-xs text-muted-foreground">
                  {simbaAppointmentBooked
                    ? "✔ Cita confirmada para las 10:00 AM en El Poblado con buffer de 15m."
                    : "Simula el registro de la cita sin generar registros reales en Supabase."}
                </p>
              </div>
              <button
                disabled={simbaAppointmentBooked}
                onClick={() => {
                  setSimbaAppointmentBooked(true);
                  toast.success("Cita de Simba agendada a las 10:00 AM en El Poblado");
                }}
                className={`mt-4 rounded-xl py-2 text-xs font-bold transition ${
                  simbaAppointmentBooked
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {simbaAppointmentBooked ? "✔ Cita Agendada" : "Agendar Cita de Simba"}
              </button>
            </div>

            {/* Step 2: Cronómetro de Consulta */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    Paso 2
                  </span>
                  {consultationTimerRunning && (
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  )}
                </div>
                <b className="mt-1 block text-sm font-extrabold text-foreground">
                  {lang === "es" ? "Cronómetro Presencial" : "Consultation Stopwatch"}
                </b>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tiempo transcurrido:{" "}
                  <b className="font-mono text-sm text-foreground">{formatTimer(timerSeconds)}</b>
                </p>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  disabled={!simbaAppointmentBooked}
                  onClick={() => {
                    setConsultationTimerRunning(!consultationTimerRunning);
                    toast.info(consultationTimerRunning ? "Cronómetro pausado" : "Cronómetro iniciado");
                  }}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    consultationTimerRunning
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  }`}
                >
                  {consultationTimerRunning ? "Pausar" : "Iniciar Consulta"}
                </button>
              </div>
            </div>

            {/* Step 3: Fórmulas COMVEZCOL */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Paso 3
                </span>
                <b className="mt-1 block text-sm font-extrabold text-foreground">
                  {lang === "es" ? "Receta Médica COMVEZCOL" : "Official Prescription"}
                </b>
                <p className="mt-1 text-xs text-muted-foreground">
                  {prescriptionGenerated
                    ? "✔ Hash SHA-256 generado con matrícula COMVEZCOL-001 (Dr. Luis)."
                    : "Genera una receta legal firmada con posología estructurada."}
                </p>
              </div>
              <button
                disabled={!simbaAppointmentBooked || prescriptionGenerated}
                onClick={() => {
                  setPrescriptionGenerated(true);
                  toast.success("Fórmula médica generada con firma COMVEZCOL-001");
                }}
                className={`mt-4 rounded-xl py-2 text-xs font-bold transition ${
                  prescriptionGenerated
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                }`}
              >
                {prescriptionGenerated ? "✔ Receta Firmada" : "Emitir Fórmula"}
              </button>
            </div>

            {/* Step 4: Pago en Línea Nequi */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4">
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                  Paso 4
                </span>
                <b className="mt-1 block text-sm font-extrabold text-foreground">
                  {lang === "es" ? "Cobro & Conciliación" : "Payment & Settlement"}
                </b>
                <p className="mt-1 text-xs text-muted-foreground">
                  {paymentCompleted
                    ? "✔ Recibo digital $120.000 COP conciliado a saldo $0."
                    : "Simula el pago instantáneo vía Nequi / Wompi del tutor."}
                </p>
              </div>
              <button
                disabled={!prescriptionGenerated || paymentCompleted}
                onClick={() => {
                  setPaymentCompleted(true);
                  toast.success("Pago de $120.000 COP recibido y conciliado");
                }}
                className={`mt-4 rounded-xl py-2 text-xs font-bold transition ${
                  paymentCompleted
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                }`}
              >
                {paymentCompleted ? "✔ Pago Conciliado" : "Simular Pago Nequi"}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 3. SHOW ME HOW AI CONCIERGE ASSISTANT */}
      <section className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-black text-foreground">
                {lang === "es"
                  ? "3. Asistente Inteligente 'Enséñame Cómo' (Show Me How)"
                  : "3. 'Show Me How' Contextual AI Guide"}
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              {lang === "es"
                ? "Escribe cualquier pregunta operativa o pulsa una de las consultas frecuentes para ver instrucciones paso a paso con accesos directos."
                : "Type any operational question or select a frequent inquiry to see step-by-step guidance with direct deep links."}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "es" ? "Buscar respuesta..." : "Search guidance..."}
              className="w-full rounded-2xl border border-border bg-background py-2 pl-9 pr-3 text-xs font-medium text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-1.5 border-b border-border pb-3 text-xs font-bold">
          {[
            { id: "all", labelEs: "Todas", labelEn: "All" },
            { id: "onboarding", labelEs: "🚀 Onboarding Clientes", labelEn: "🚀 Client Onboarding" },
            { id: "preventa", labelEs: "🎯 Demos & Preventa", labelEn: "🎯 Demos & Presales" },
            { id: "citas", labelEs: "📅 Citas & Agenda", labelEn: "📅 Appointments" },
            { id: "clinica", labelEs: "🩺 Fórmulas & Clínica", labelEn: "🩺 Clinical & Rx" },
            { id: "okvet", labelEs: "🔄 OKVET Bridge", labelEn: "🔄 OKVET Bridge" },
            { id: "rutas", labelEs: "🚗 Rutas & GPS", labelEn: "🚗 Routes & GPS" },
            { id: "finanzas", labelEs: "💰 Finanzas & Split", labelEn: "💰 Finance & Splits" },
            { id: "admin", labelEs: "⚙️ White-Label & Admin", labelEn: "⚙️ Branding & Admin" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-full px-3 py-1 transition ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === "es" ? cat.labelEs : cat.labelEn}
            </button>
          ))}
        </div>

        {/* Questions Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {filteredQuestions.map((q, idx) => {
            const isExpanded = activeQuestion === q;
            return (
              <div
                key={idx}
                className={`rounded-2xl border p-4 transition ${
                  isExpanded
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/40 hover:bg-secondary/20"
                }`}
              >
                <button
                  onClick={() => setActiveQuestion(isExpanded ? null : q)}
                  className="flex w-full items-start justify-between text-left"
                >
                  <b className="text-sm font-extrabold text-foreground">
                    {lang === "es" ? q.questionEs : q.questionEn}
                  </b>
                  <ChevronRight
                    className={`h-4 w-4 shrink-0 text-primary transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </button>

                <p className="mt-2 text-xs text-muted-foreground">
                  {lang === "es" ? q.answerEs : q.answerEn}
                </p>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-border/80 pt-3">
                    <b className="block text-[11px] font-black uppercase text-foreground">
                      {lang === "es" ? "Instrucciones Paso a Paso:" : "Step-by-Step Instructions:"}
                    </b>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      {(lang === "es" ? q.stepsEs : q.stepsEn).map((st, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-2">
                      <Link
                        to={q.deepLink as never}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-button transition hover:bg-primary/90"
                      >
                        <span>{lang === "es" ? q.linkLabelEs : q.linkLabelEn}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer Navigation Back to Core Apps */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-border bg-secondary/40 p-6 sm:flex-row">
        <div>
          <b className="block text-sm font-black text-foreground">
            {lang === "es" ? "¿Listo para operar en vivo?" : "Ready to operate live?"}
          </b>
          <span className="text-xs text-muted-foreground">
            {lang === "es"
              ? "Regresa al portal del Dr. Luis, revisa el portal familiar o consulta el Centro de Comando del Administrador."
              : "Return to Dr. Luis's hub, review the family portal or inspect the Super Admin Command Center."}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/luis"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-button transition hover:bg-primary/90"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            <span>Acceso Dr. Luis</span>
          </Link>

          <Link
            to="/cliente"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition hover:bg-accent"
          >
            <PawPrint className="h-3.5 w-3.5 text-primary" />
            <span>Portal Familiar</span>
          </Link>

          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition hover:bg-accent"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Super Admin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
