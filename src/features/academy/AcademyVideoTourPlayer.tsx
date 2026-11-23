import React, { useState, useEffect, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Subtitles,
  ExternalLink,
  Clock,
  Film,
  Sparkles,
  CheckCircle2,
  Monitor,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  Stethoscope,
  Activity,
  PhoneCall,
  Navigation,
  PawPrint,
  ShieldCheck,
  Building2,
  FileText,
  DollarSign,
  Car,
  QrCode,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Card, StatusBadge, Btn } from "@/components/vf/ui";
import { PersonaId } from "./InteractiveProductAcademy";

export interface VideoScene {
  startSec: number;
  endSec: number;
  sceneTitle: string;
  captionEs: string;
  captionEn: string;
  highlightAction: string;
  screenRoute: string;
  mockUI: {
    header: string;
    badge: string;
    metricLabel: string;
    metricValue: string;
    details: string[];
    actionButtonText: string;
  };
}

export interface VideoTourItem {
  id: string;
  title: string;
  roleSubtitle: string;
  personaId: PersonaId;
  totalDurationSec: number;
  badge: string;
  icon: React.ElementType;
  accentColor: string;
  summaryEs: string;
  summaryEn: string;
  scenes: VideoScene[];
}

export const VIDEO_TOURS: VideoTourItem[] = [
  {
    id: "tour-luis",
    title: "Dr. Luis Eduardo Ríos: Dirección Médica & Soberanía",
    roleSubtitle: "Director Médico & Propietario · Vet Life Medellín",
    personaId: "luis",
    totalDurationSec: 120,
    badge: "Rol Principal",
    icon: Stethoscope,
    accentColor: "from-emerald-600 to-teal-800",
    summaryEs: "Video-tour de la jornada ejecutiva: Briefing matutino en COP, comando de agendamiento por voz, consulta domiciliaria y liquidación de comisiones.",
    summaryEn: "Executive daily tour: Morning briefing in COP, voice appointment booking, in-home consultation, and commission settlement.",
    scenes: [
      {
        startSec: 0,
        endSec: 30,
        sceneTitle: "01. Briefing Ejecutivo Matutino (07:00 AM)",
        captionEs: "El Dr. Luis inicia su día revisando en un solo panel los ingresos proyectados en COP, citas prioritarias en Medellín y Oriente, y pacientes críticos.",
        captionEn: "Dr. Luis starts his day reviewing projected COP revenue, priority visits across Medellín and Oriente, and critical patients in a unified view.",
        highlightAction: "Supervisando 46 pacientes reales y 5 citas programadas",
        screenRoute: "/luis",
        mockUI: {
          header: "Centro Ejecutivo · Dr. Luis Eduardo Ríos",
          badge: "Medellín & Oriente Antioqueño",
          metricLabel: "Ingresos Estimados Hoy",
          metricValue: "$1.480.000 COP",
          details: [
            "5 Visitas Domiciliarias (El Poblado, Envigado, Rionegro)",
            "46 Expedientes OKVET Vinculados",
            "Cero Tareas Administrativas Pendientes",
          ],
          actionButtonText: "Ver Agenda del Día",
        },
      },
      {
        startSec: 30,
        endSec: 60,
        sceneTitle: "02. Asistente Ejecutivo por Voz en Español",
        captionEs: "Dicta directamente: 'Agendar control para Luna el jueves a las 10am en El Poblado'. El sistema calcula buffers de viaje y previene choques de agenda.",
        captionEn: "He dictates: 'Schedule checkup for Luna on Thursday at 10am in El Poblado'. The AI engine computes traffic buffers and prevents conflicts.",
        highlightAction: "Comando de voz reconocido con precisión clínica (es-CO)",
        screenRoute: "/luis/asistente",
        mockUI: {
          header: "Asistente Ejecutivo · Control por Voz",
          badge: "Reconocimiento Activo",
          metricLabel: "Tiempo de Agendamiento",
          metricValue: "12 segundos",
          details: [
            "Voz: 'Control postoperatorio para paciente Luna'",
            "Ruta: Buffer de 35 min desde El Retiro",
            "Confirmación WhatsApp encolada en outbox",
          ],
          actionButtonText: "Dictar Siguiente Comando",
        },
      },
      {
        startSec: 60,
        endSec: 90,
        sceneTitle: "03. Consulta Presencial & Receta Oficial Ley 576",
        captionEs: "En el hogar del paciente, registra la evolución SOAP, el cronómetro de consulta y emite la fórmula médica oficial con matrícula COMVEZCOL-001.",
        captionEn: "At the patient's home, records SOAP evolution, activates visit timer, and generates official prescription with COMVEZCOL-001 registration.",
        highlightAction: "Fórmula médica firmada con enlace efímero de 24h",
        screenRoute: "/luis/cita/demo-cita-1",
        mockUI: {
          header: "Consulta Presencial · Paciente Luna (Golden Retriever)",
          badge: "En Consulta · Minuto 24:15",
          metricLabel: "Fórmula Médica Emitida",
          metricValue: "COMVEZCOL-001 Firmada",
          details: [
            "Meloxicam 0.5% Gotas (3 gotas c/24h x 5 días)",
            "Enlace seguro de descarga PDF generado para el tutor",
            "Cronómetro de consulta sincronizado",
          ],
          actionButtonText: "Finalizar y Cobrar",
        },
      },
      {
        startSec: 90,
        endSec: 120,
        sceneTitle: "04. Split de Comisiones Médicas & Modo Libertad",
        captionEs: "Al cierre del día, liquida comisiones con las veterinarias de planta (Dra. Valeria) y activa el Modo Ausencia para delegación completa.",
        captionEn: "At end of day, settles commission splits with staff veterinarians and activates Absence Mode for autonomous delegation.",
        highlightAction: "Conciliación automática: lo cobrado en calle vs pasarela",
        screenRoute: "/luis/comisiones",
        mockUI: {
          header: "Liquidación Médica · Dra. Valeria Gómez",
          badge: "Corte Quincenal",
          metricLabel: "Comisión Neta Liquidada",
          metricValue: "$1.840.000 COP (50%)",
          details: [
            "12 Consultas Presenciales Realizadas",
            "Modo Ausencia del Dr. Luis: Activo con Reemplazo",
            "Clínica operando 100% de forma autónoma",
          ],
          actionButtonText: "Descargar Balance PDF",
        },
      },
    ],
  },
  {
    id: "tour-valeria",
    title: "Dra. Valeria Gómez: Veterinaria de Planta en Ruta",
    roleSubtitle: "Veterinaria Domiciliaria · Oriente Antioqueño",
    personaId: "vet",
    totalDurationSec: 110,
    badge: "Atención Clínica",
    icon: Activity,
    accentColor: "from-blue-600 to-indigo-800",
    summaryEs: "Video-tour de la consulta en campo: Check-in domiciliario, cronómetro presencial, historia clínica SOAP y emisión de fórmulas Ley 576.",
    summaryEn: "Field clinical visit tour: Home check-in, on-site consultation timer, SOAP medical records, and legal prescription delivery.",
    scenes: [
      {
        startSec: 0,
        endSec: 35,
        sceneTitle: "01. Rutas Optimizadas en Oriente Antioqueño",
        captionEs: "La Dra. Valeria abre su app móvil y visualiza sus paradas del día en Rionegro y Llanogrande, ordenadas geográficamente con notas de acceso.",
        captionEn: "Dr. Valeria opens her mobile app to view scheduled visits across Rionegro and Llanogrande, optimized by location with gated access notes.",
        highlightAction: "Navegación inteligente con tiempo estimado de llegada (ETA)",
        screenRoute: "/equipo",
        mockUI: {
          header: "Ruta del Día · Dra. Valeria Gómez",
          badge: "Oriente Antioqueño",
          metricLabel: "Próxima Parada",
          metricValue: "Llanogrande (18 min)",
          details: [
            "Paciente: Simba (Gato Persa - 3 años)",
            "Motivo: Vacunación anual y desparasitación",
            "Código de portería y timbre registrados",
          ],
          actionButtonText: "Iniciar Desplazamiento",
        },
      },
      {
        startSec: 35,
        endSec: 75,
        sceneTitle: "02. Check-in & Cronómetro de Consulta Activa",
        captionEs: "Al llegar, pulsa Check-in. El cronómetro de 45 minutos inicia y emite alertas visuales para evitar retrasos en cascada con los siguientes pacientes.",
        captionEn: "Upon arrival, she taps Check-in. The 45-minute consultation timer alerts her to prevent cascade delays on subsequent visits.",
        highlightAction: "Cronómetro activo con alertas hápticas y de audio",
        screenRoute: "/equipo",
        mockUI: {
          header: "Consulta Activa · Paciente Simba",
          badge: "Tiempo Transcurrido: 28:40 / 45:00",
          metricLabel: "Estado de la Consulta",
          metricValue: "A Tiempo (Verde)",
          details: [
            "Exploración física completa: Temperatura 38.5°C, FC 140 lpm",
            "Vacuna Triple Felina aplicada exitosamente",
            "Alerta automática a la siguiente tutora en 15 min",
          ],
          actionButtonText: "Registrar Procedimientos",
        },
      },
      {
        startSec: 75,
        endSec: 110,
        sceneTitle: "03. Prescripción Digital COMVEZCOL & Cobro Nequi",
        captionEs: "Genera la receta con su matrícula profesional y posología detallada. La tutora paga en 1 toque por Nequi y la factura se concilia en segundos.",
        captionEn: "Generates prescription with legal COMVEZCOL license and posology. The pet owner pays via Nequi, automatically clearing the balance.",
        highlightAction: "Fórmula y recibo electrónico despachados al WhatsApp del tutor",
        screenRoute: "/equipo",
        mockUI: {
          header: "Cierre Clínico & Cobro · Paciente Simba",
          badge: "Fórmula Firmada",
          metricLabel: "Saldo por Cobrar",
          metricValue: "$120.000 COP (Pagado Nequi)",
          details: [
            "Fórmula COMVEZCOL-28491 registrada en OKVET",
            "Recibo de pago conciliado a saldo $0 COP",
            "Carné digital de vacunación actualizado",
          ],
          actionButtonText: "Completar Visita y Salir",
        },
      },
    ],
  },
  {
    id: "tour-reception",
    title: "Camila Restrepo: Recepción, Triaje & Protección de Agenda",
    roleSubtitle: "Coordinación de Entrada · Triage Clínico",
    personaId: "reception",
    totalDurationSec: 100,
    badge: "Filtro & Triage",
    icon: PhoneCall,
    accentColor: "from-amber-600 to-orange-800",
    summaryEs: "Video-tour de triaje: Clasificación de urgencias vs consultas rutinarias, cobro de anticipos de $50.000 COP y asignación sin cruces de agenda.",
    summaryEn: "Triage tour: Emergency vs routine filtering, $50,000 COP deposit collection, and conflict-free calendar booking.",
    scenes: [
      {
        startSec: 0,
        endSec: 50,
        sceneTitle: "01. Detección Inteligente de Urgencias & Tele-Triaje",
        captionEs: "Camila recibe solicitudes de WhatsApp. La IA clasifica automáticamente si es una emergencia vital o si califica para tele-triaje nocturno ($25.000 COP).",
        captionEn: "Camila receives inbound WhatsApp requests. AI auto-flags whether it is a critical emergency or qualifies for night tele-triage ($25k COP).",
        highlightAction: "Clasificación asistida sin emitir diagnósticos médicos",
        screenRoute: "/coordinacion",
        mockUI: {
          header: "Bandeja de Entrada · WhatsApp Clínico",
          badge: "3 Solicitudes Nuevas",
          metricLabel: "Triaje Asistido",
          metricValue: "Prioridad Media",
          details: [
            "Paciente: Mateo (Bulldog Francés - Vómito leve)",
            "Tele-triaje nocturno pagado ($25.000 COP)",
            "Nota de voz del tutor analizada y resumida",
          ],
          actionButtonText: "Responder con Enlace Seguro",
        },
      },
      {
        startSec: 50,
        endSec: 100,
        sceneTitle: "02. Cobro de Anticipo & Asignación de Franja",
        captionEs: "Para asegurar la visita, Camila envía el link de anticipo de $50.000 COP. Al confirmarse el pago, la agenda bloquea el espacio en Google Calendar.",
        captionEn: "To secure the slot, Camila dispatches the $50k COP deposit link. Upon payment, Google Calendar locks the slot with traffic buffers.",
        highlightAction: "Cero ausencias injustificadas gracias al anticipo asegurado",
        screenRoute: "/coordinacion",
        mockUI: {
          header: "Bloqueo de Cita · Google Calendar Sync",
          badge: "Anticipo Confirmado",
          metricLabel: "Depósito Recaudado",
          metricValue: "$50.000 COP (Wompi / Nequi)",
          details: [
            "Asignado a: Dr. Luis Eduardo Ríos (Jueves 10:00 AM)",
            "Buffer de viaje: 30 min desde El Poblado",
            "WhatsApp de confirmación programado 24h antes",
          ],
          actionButtonText: "Confirmar y Enviar",
        },
      },
    ],
  },
  {
    id: "tour-coordinator",
    title: "Andrés Felipe: Despacho Inteligente & Telemetría GPS",
    roleSubtitle: "Logística & Rutas en Vivo · Medellín & Oriente",
    personaId: "coordinator",
    totalDurationSec: 105,
    badge: "Logística & GPS",
    icon: Navigation,
    accentColor: "from-purple-600 to-indigo-900",
    summaryEs: "Video-tour de logística: Mapa Leaflet en vivo, telemetría GPS de auxiliares en ruta, alertas de congestión y rebalanceo de paradas.",
    summaryEn: "Logistics tour: Live Leaflet map, GPS telemetry of field staff, traffic delay alerts, and real-time route rebalancing.",
    scenes: [
      {
        startSec: 0,
        endSec: 50,
        sceneTitle: "01. Telemetría GPS en Vivo de Auxiliares",
        captionEs: "Andrés monitorea en el mapa interactivo la ubicación exacta, velocidad y ETA de cada veterinario y auxiliar móvil en Medellín y el Valle de San Nicolás.",
        captionEn: "Andrés monitors real-time GPS coordinates, speed, and ETA of each field veterinarian and assistant across Medellín and Oriente.",
        highlightAction: "Seguimiento en vivo sobre mapa Leaflet con velocidad y batería",
        screenRoute: "/coordinacion",
        mockUI: {
          header: "Centro de Despacho & Flota Móvil",
          badge: "4 Unidades en Ruta",
          metricLabel: "Unidad Móvil 02 (Valeria)",
          metricValue: "En Movimiento · 42 km/h",
          details: [
            "Ubicación: Autopista Medellín-Bogotá km 14",
            "ETA a destino: 14 minutos (Simba - Llanogrande)",
            "Estado de batería del dispositivo: 88%",
          ],
          actionButtonText: "Ver Telemetría en Vivo",
        },
      },
      {
        startSec: 50,
        endSec: 105,
        sceneTitle: "02. Alertas de Congestión & Rebalanceo de Citas",
        captionEs: "Ante un taco imprevisto en Las Palmas, el motor de cascada notifica a Andrés y reasigna automáticamente la visita al auxiliar más cercano.",
        captionEn: "When traffic halts on Las Palmas, the cascade engine notifies Andrés and rebalances the stop to the nearest available unit.",
        highlightAction: "Protección proactiva de la puntualidad del servicio",
        screenRoute: "/coordinacion",
        mockUI: {
          header: "Alerta de Tráfico · Vía Las Palmas",
          badge: "Demora Prevista: +25 min",
          metricLabel: "Rebalanceo Sugerido",
          metricValue: "Asignar a Auxiliar Martín (a 6 min)",
          details: [
            "Cita de las 14:00 protegida sin demorar al cliente",
            "Notificación cortés enviada por WhatsApp al tutor",
            "Ruta recalculada con Google Distance Matrix",
          ],
          actionButtonText: "Aprobar Rebalanceo",
        },
      },
    ],
  },
  {
    id: "tour-client",
    title: "Carolina Gómez: Experiencia Familiar & Pasaporte QR",
    roleSubtitle: "Tutora de Luna 🐕 y Max 🐈 · El Poblado, Medellín",
    personaId: "client",
    totalDurationSec: 95,
    badge: "Familia & Tutor",
    icon: PawPrint,
    accentColor: "from-rose-600 to-pink-800",
    summaryEs: "Video-tour de la tutora: Agendamiento en 1-toque, seguimiento de llegada en tiempo real, carné digital, pasaporte QR y pago sin efectivo.",
    summaryEn: "Pet owner tour: 1-Tap booking, real-time arrival tracking, digital vaccine passport QR, and frictionless cashless checkout.",
    scenes: [
      {
        startSec: 0,
        endSec: 45,
        sceneTitle: "01. Seguimiento en Tiempo Real del Veterinario",
        captionEs: "Carolina recibe un mensaje de WhatsApp cuando la Dra. Valeria sale hacia su casa. Abre el portal y ve el vehículo aproximándose con ETA exacto.",
        captionEn: "Carolina receives a WhatsApp alert when Dr. Valeria departs. She opens her portal to view real-time vehicle progress with exact ETA.",
        highlightAction: "Seguimiento en vivo sin exponer el teléfono privado del profesional",
        screenRoute: "/cliente",
        mockUI: {
          header: "Tu Veterinaria está en Camino · Vet Life",
          badge: "Llegada en 12 minutos",
          metricLabel: "Médica Asignada",
          metricValue: "Dra. Valeria Gómez (COMVEZCOL)",
          details: [
            "Vehículo: Moto Asistencia Vet Life #02",
            "Destino: Calle 10 # 32-15, El Poblado",
            "Equipo listo para consulta y vacunación",
          ],
          actionButtonText: "Ver Mapa en Vivo",
        },
      },
      {
        startSec: 45,
        endSec: 95,
        sceneTitle: "02. Pasaporte Digital QR & Pago en 1 Toque",
        captionEs: "Accede al carné digital de Luna con código QR para guarderías o viajes, descarga la fórmula médica y paga el saldo en 1 toque con Nequi.",
        captionEn: "Accesses Luna's digital vaccine card with QR code for boarding/travel, downloads official prescription, and pays balance via Nequi.",
        highlightAction: "Historial médico completo en la palma de la mano",
        screenRoute: "/cliente/pasaporte/demo-luna",
        mockUI: {
          header: "Pasaporte Digital QR · Luna (Golden Retriever)",
          badge: "Vacunas al Día",
          metricLabel: "Próxima Desparasitación",
          metricValue: "15 de Diciembre (Programada)",
          details: [
            "Rabia, Séxtuple y KC vigentes con sello digital",
            "Fórmula médica activa descargable en PDF",
            "Pago liquidado $120.000 COP · Saldo $0",
          ],
          actionButtonText: "Compartir Pasaporte QR",
        },
      },
    ],
  },
  {
    id: "tour-superadmin",
    title: "Alpha Vision Operator: Super Admin & Onboarding Multi-Clínica",
    roleSubtitle: "Plataforma Matriz SaaS · Gestión Multi-Tenant",
    personaId: "superadmin",
    totalDurationSec: 130,
    badge: "SaaS Multi-Clínica",
    icon: ShieldCheck,
    accentColor: "from-slate-700 to-slate-900",
    summaryEs: "Video-tour de administración: Owner Command Center, aprovisionamiento de nueva clínica en 5 pasos, e inspección de entitlements B2B.",
    summaryEn: "Super admin tour: Owner Command Center, 5-step new clinic provisioning, and 33-feature B2B entitlements inspector.",
    scenes: [
      {
        startSec: 0,
        endSec: 45,
        sceneTitle: "01. Owner Command Center & Métricas de Red",
        captionEs: "El Super Admin supervisa las clínicas activas en Colombia, licencias de 30 días, consumo de IA Claude 3.5 Haiku y salud de PostgreSQL 17.",
        captionEn: "Super Admin oversees active clinics, 30-day trials, Claude 3.5 Haiku AI usage, and PostgreSQL 17 database health.",
        highlightAction: "Centro de control ejecutivo multi-inquilino en tiempo real",
        screenRoute: "/admin",
        mockUI: {
          header: "Owner Command Center · Alpha Vision Platform",
          badge: "Salud del Sistema: 100%",
          metricLabel: "Clínicas en la Plataforma",
          metricValue: "Vet Life (Activa) + San Roque (Trial)",
          details: [
            "330+ Tablas PostgreSQL 17 con 100% RLS",
            "Consumo de IA: $0.12 USD (Prompt Caching activo)",
            "Cuotas WhatsApp: 300 / 1.500 / 5.000 msgs",
          ],
          actionButtonText: "Ver Salud de Infraestructura",
        },
      },
      {
        startSec: 45,
        endSec: 90,
        sceneTitle: "02. Onboarding Guiado de una Nueva Clínica en 5 Pasos",
        captionEs: "Demuestra cómo dar de alta una nueva clínica (ej. San Roque en Envigado): subdominio propio, catálogo, WhatsApp y prueba de 30 días.",
        captionEn: "Demonstrates provisioning a new clinic: dedicated subdomain, service catalog, WhatsApp binding, and 30-day trial.",
        highlightAction: "Aislamiento atómico con RPC register_new_veterinary_organization",
        screenRoute: "/onboarding",
        mockUI: {
          header: "Asistente de Onboarding · Nueva Clínica",
          badge: "Paso 5 de 5",
          metricLabel: "Subdominio Asignado",
          metricValue: "sanroque.alphavisionm.com",
          details: [
            "Esquema multi-tenant aislado con RLS en Postgres 17",
            "Catálogo de servicios y tarifas configurado",
            "Periodo de prueba de 30 días activado sin tarjeta",
          ],
          actionButtonText: "Aprobar y Enviar Enlace",
        },
      },
      {
        startSec: 90,
        endSec: 130,
        sceneTitle: "03. Alta de Veterinarios, COMVEZCOL & Comisiones",
        captionEs: "Configuración de nuevos profesionales médicos con número COMVEZCOL, porcentaje de comisión (50%), Google Calendar y zona de patrullaje.",
        captionEn: "Onboarding new veterinary staff with COMVEZCOL license, commission rate (50%), Google Calendar, and assigned route.",
        highlightAction: "Cumplimiento estricto Ley 576 de 2000 y split quincenal",
        screenRoute: "/admin/readiness",
        mockUI: {
          header: "Gestión de Equipo Médico · Matrícula COMVEZCOL",
          badge: "Personal Clínico",
          metricLabel: "Comisión Pactada",
          metricValue: "50% Consulta Presencial",
          details: [
            "Dra. Valeria Gómez (COMVEZCOL-28491) vinculada",
            "Google Calendar enlazado en modo BUSY_ONLY",
            "Liquidación automática en /luis/comisiones",
          ],
          actionButtonText: "Guardar y Emitir Credenciales",
        },
      },
    ],
  },
];

export function AcademyVideoTourPlayer({
  defaultPersonaId = "luis",
  lang = "es",
}: {
  defaultPersonaId?: PersonaId;
  lang?: "es" | "en";
}) {
  const [selectedTourId, setSelectedTourId] = useState<string>("tour-" + defaultPersonaId);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showCaptions, setShowCaptions] = useState<boolean>(true);
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);

  // Sync when default persona changes
  useEffect(() => {
    setSelectedTourId("tour-" + defaultPersonaId);
    setCurrentTimeSec(0);
    setIsPlaying(false);
  }, [defaultPersonaId]);

  const activeTour = VIDEO_TOURS.find((t) => t.id === selectedTourId) ?? VIDEO_TOURS[0]!;

  // Current scene based on currentTimeSec
  const currentScene =
    activeTour.scenes.find(
      (s) => currentTimeSec >= s.startSec && currentTimeSec < s.endSec
    ) ?? activeTour.scenes[activeTour.scenes.length - 1]!;

  // Animation / Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeSec((prev) => {
          if (prev >= activeTour.totalDurationSec) {
            setIsPlaying(false);
            return activeTour.totalDurationSec;
          }
          return prev + 1;
        });
      }, 1000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, activeTour.totalDurationSec]);

  const togglePlay = () => {
    if (currentTimeSec >= activeTour.totalDurationSec) {
      setCurrentTimeSec(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = (currentTimeSec / activeTour.totalDurationSec) * 100;

  return (
    <div className="space-y-6">
      {/* Video Selector Tabs Bar */}
      <div className="flex flex-col gap-3 rounded-3xl border border-primary/20 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          <div>
            <h4 className="text-sm font-black text-foreground">
              {lang === "es" ? "Sala de Cine & Video-Tours Interactivos" : "Interactive Cinema & Video Tours"}
            </h4>
            <span className="text-xs text-muted-foreground">
              {lang === "es"
                ? "Selecciona el rol para ver su jornada en video con simulación de interfaz en tiempo real"
                : "Select a role to watch their daily journey video with real-time screen simulation"}
            </span>
          </div>
        </div>

        {/* Quick selector buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
          {VIDEO_TOURS.map((tour) => {
            const TourIcon = tour.icon;
            const isSelected = tour.id === selectedTourId;
            return (
              <button
                key={tour.id}
                onClick={() => {
                  setSelectedTourId(tour.id);
                  setCurrentTimeSec(0);
                  setIsPlaying(false);
                }}
                className={`flex items-center gap-1.5 rounded-2xl px-3 py-1.5 text-xs font-bold transition ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                <TourIcon className="h-3.5 w-3.5" />
                <span>{tour.title.split(":")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CINEMATIC VIDEO PLAYER CANVAS */}
      <div
        className={`relative overflow-hidden rounded-[2.5rem] border-2 border-primary/40 bg-slate-950 text-white shadow-2xl transition-all ${
          isFullScreen ? "fixed inset-4 z-50 rounded-3xl" : "w-full"
        }`}
      >
        {/* Top Video Header Bar */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br ${activeTour.accentColor} text-white shadow-md`}>
              <activeTour.icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black uppercase text-primary-foreground">
                  {activeTour.badge}
                </span>
                <span className="text-xs text-slate-400">· {currentScene.sceneTitle}</span>
              </div>
              <h3 className="text-base font-black text-white">{activeTour.title}</h3>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              to={currentScene.screenRoute}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-white/20"
            >
              <span>{lang === "es" ? "Abrir Esta Pantalla" : "Open Screen"}</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
              title={isFullScreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Video Screen Content (Simulated Live Interface) */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-900 p-6 sm:p-10 flex flex-col justify-between">
          {/* Animated Background Mesh */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-slate-900/60 to-slate-950 pointer-events-none" />

          {/* Top Scene Tracker */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-2xl bg-black/40 px-3.5 py-1.5 border border-white/10 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-emerald-400">
                {currentScene.highlightAction}
              </span>
            </div>

            <span className="rounded-xl bg-white/10 px-3 py-1 font-mono text-xs text-slate-300">
              {formatTime(currentTimeSec)} / {formatTime(activeTour.totalDurationSec)}
            </span>
          </div>

          {/* Central Mock Screen Display (Interactive Video Simulation) */}
          <div className="relative z-10 mx-auto max-w-2xl w-full rounded-3xl border border-white/20 bg-slate-800/90 p-6 sm:p-8 shadow-2xl backdrop-blur-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-300">
                  {currentScene.mockUI.badge}
                </span>
                <h4 className="mt-1 text-lg font-black text-white">{currentScene.mockUI.header}</h4>
              </div>
              <div className="text-right">
                <span className="block text-[10px] font-bold uppercase text-slate-400">
                  {currentScene.mockUI.metricLabel}
                </span>
                <b className="text-base font-black text-emerald-400">{currentScene.mockUI.metricValue}</b>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {currentScene.mockUI.details.map((detail, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/10">
              <span className="text-[11px] text-slate-400">
                Ruta activa: <code className="font-mono text-primary-foreground">{currentScene.screenRoute}</code>
              </span>
              <Link
                to={currentScene.screenRoute}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-black text-white shadow-button transition hover:bg-primary/90"
              >
                <span>{currentScene.mockUI.actionButtonText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Subtitles & Captions Overlay (Voiceover narration) */}
          {showCaptions && (
            <div className="relative z-10 mx-auto max-w-3xl rounded-2xl bg-black/80 px-6 py-3 border border-white/20 text-center backdrop-blur-md">
              <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
                {lang === "es" ? currentScene.captionEs : currentScene.captionEn}
              </p>
            </div>
          )}
        </div>

        {/* Video Scrubber & Playback Controls Bar */}
        <div className="border-t border-white/10 bg-slate-950/90 px-6 py-4 backdrop-blur-md space-y-3">
          {/* Progress Timeline Scrubber */}
          <div className="relative h-2 w-full rounded-full bg-slate-800 cursor-pointer overflow-hidden"
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const pos = (e.clientX - rect.left) / rect.width;
                 setCurrentTimeSec(Math.floor(pos * activeTour.totalDurationSec));
               }}
          >
            <div
              className="h-full bg-gradient-to-r from-primary to-emerald-400 transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Controls Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="flex items-center justify-center h-10 w-10 rounded-2xl bg-primary text-white shadow-button hover:bg-primary/90 transition"
                title={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>

              <button
                onClick={handleRestart}
                className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
                title="Reiniciar video"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <span className="font-mono text-xs text-slate-300">
                {formatTime(currentTimeSec)} / {formatTime(activeTour.totalDurationSec)}
              </span>
            </div>

            {/* Middle: Scene Markers Indicators */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px]">
              {activeTour.scenes.map((sc, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentTimeSec(sc.startSec)}
                  className={`rounded-lg px-2.5 py-1 font-bold transition ${
                    currentTimeSec >= sc.startSec && currentTimeSec < sc.endSec
                      ? "bg-primary text-white"
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  Escena {i + 1}
                </button>
              ))}
            </div>

            {/* Right: Audio, Speed & Captions */}
            <div className="flex items-center gap-2">
              {/* Playback speed selector */}
              <div className="flex items-center rounded-xl bg-white/10 p-1">
                {[1, 1.25, 1.5].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`rounded-lg px-2 py-0.5 text-[10px] font-bold transition ${
                      playbackSpeed === spd ? "bg-primary text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              {/* Subtitles Toggle */}
              <button
                onClick={() => setShowCaptions(!showCaptions)}
                className={`grid h-8 w-8 place-items-center rounded-xl transition ${
                  showCaptions ? "bg-primary text-white" : "bg-white/10 text-slate-400"
                }`}
                title="Activar/Desactivar Subtítulos"
              >
                <Subtitles className="h-4 w-4" />
              </button>

              {/* Mute toggle */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
                title={isMuted ? "Activar audio" : "Silenciar"}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3 SPECIALIZED MASTERCLASS VIDEO GUIDES (Direct Answers to Common User Questions) */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h4 className="text-base font-black text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>{lang === "es" ? "Video-Masterclasses Especializadas" : "Specialized Video Masterclasses"}</span>
            </h4>
            <span className="text-xs text-muted-foreground">
              {lang === "es"
                ? "Respuestas visuales a las operaciones avanzadas más consultadas"
                : "Visual walkthroughs of the most consulted advanced workflows"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Card 1: Puente OKVET */}
          <Card className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-sm hover:border-primary/40 transition">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-600">
                04:00 Min · Clínico
              </span>
              <Film className="h-4 w-4 text-emerald-600" />
            </div>
            <h5 className="text-sm font-black text-foreground">
              ¿Cómo funciona el Puente OKVET (46 Pacientes & 43 Fórmulas)?
            </h5>
            <p className="text-xs text-muted-foreground">
              Demostración paso a paso de la ingesta de expedientes sin duplicidad, validación COMVEZCOL y entrega segura de fórmulas médicas por WhatsApp.
            </p>
            <button
              onClick={() => {
                setSelectedTourId("tour-luis");
                setCurrentTimeSec(60);
                setIsPlaying(true);
                toast.success("Cargando video de consulta y puente OKVET...");
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Ver Video Tutorial</span>
            </button>
          </Card>

          {/* Card 2: Onboarding de Nueva Clínica */}
          <Card className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-sm hover:border-primary/40 transition">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black text-primary">
                03:20 Min · Multi-Tenant
              </span>
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <h5 className="text-sm font-black text-foreground">
              ¿Cómo Crear una Nueva Clínica en 5 Pasos (/onboarding)?
            </h5>
            <p className="text-xs text-muted-foreground">
              Explicación visual del asistente guiado: reserva de subdominio (sanroque.alphavisionm.com), catálogo de tarifas, WhatsApp y prueba de 30 días.
            </p>
            <button
              onClick={() => {
                setSelectedTourId("tour-superadmin");
                setCurrentTimeSec(45);
                setIsPlaying(true);
                toast.success("Cargando video de onboarding multi-clínica...");
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Ver Video Tutorial</span>
            </button>
          </Card>

          {/* Card 3: Alta de Veterinarios & Comisiones */}
          <Card className="rounded-3xl border border-border bg-card p-5 space-y-3 shadow-sm hover:border-primary/40 transition">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-black text-purple-600">
                02:55 Min · Finanzas & Personal
              </span>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </div>
            <h5 className="text-sm font-black text-foreground">
              ¿Cómo Agregar Veterinarios, COMVEZCOL y Liquidar Comisiones?
            </h5>
            <p className="text-xs text-muted-foreground">
              Asignación del rol veterinario, vinculación de tarjeta COMVEZCOL, agenda Google Calendar y split del 50% en `/luis/comisiones`.
            </p>
            <button
              onClick={() => {
                setSelectedTourId("tour-superadmin");
                setCurrentTimeSec(90);
                setIsPlaying(true);
                toast.success("Cargando video de alta médica y split de comisiones...");
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Ver Video Tutorial</span>
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
