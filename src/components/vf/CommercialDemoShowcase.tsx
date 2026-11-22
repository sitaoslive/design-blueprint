/**
 * VET FREEDOM OS — DEMO COMERCIAL BILINGÜE & SHOWCASE INTERACTIVO
 * Diseñado para presentar y vender la plataforma a otras clínicas veterinarias.
 * Soporta cambio instantáneo entre Español e Inglés [ES | EN],
 * simuladores interactivos en vivo y guía de instalación PWA para iPhone y Android.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  PawPrint,
  MapPin,
  Clock,
  Sparkles,
  ShieldAlert,
  Smartphone,
  Globe,
  Download,
  CheckCircle2,
  Calendar,
  FileText,
  Users,
  Inbox,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Share2,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { Btn, Card, PageTitle } from "./ui";
import { DemoProfiles } from "./DemoProfiles";
import { LiveTeamMap } from "@/features/live-dispatch/components/LiveLocation";
import { PetPrescriptionCard } from "@/features/prescriptions/components/PetPrescriptionCard";
import { fireEmergencyAlert } from "./EmergencyAlertBanner";

type Language = "es" | "en";

const TEXT = {
  es: {
    heroBadge: "Plataforma Inteligente para Clínicas y Veterinaria Domiciliaria",
    heroTitle: "El Sistema Operativo que Transforma tu Práctica Veterinaria",
    heroSubtitle:
      "Automatiza el conserje de WhatsApp, visualiza a tus veterinarios y auxiliares en tiempo real, controla el tiempo exacto de cada consulta y entrega fórmulas médicas oficiales sin trabajo manual.",
    ctaExploreRoles: "Probar Perfiles Interactivos",
    ctaInstallApp: "Instalar en Celular (iPhone / Android)",
    pwaTitle: "Disponible como Aplicación Móvil (PWA)",
    pwaDesc: "Instálala en menos de 10 segundos en iOS y Android sin pasar por App Store ni Google Play.",
    iosInstructions: "En iPhone / iPad: Abre en Safari, presiona el botón Compartir 􀈂 y selecciona «Añadir a pantalla de inicio» ⊞.",
    androidInstructions: "En Android: Abre en Chrome, toca los tres puntos ⋮ en la esquina superior y selecciona «Instalar aplicación» ⬇️.",
    installButton: "Instalar Aplicación Ahora",
    installCopied: "Enlace copiado para abrir en tu celular",
    pillarsTitle: "Las 5 Tecnologías Clave de Vet Freedom OS",
    pillar1Title: "Rastreo GPS en Vivo de Auxiliares y Veterinarios",
    pillar1Desc: "Coordinación y clientes ven en el mapa la ubicación en ruta de los auxiliares y doctores, con velocidad (km/h) y hora estimada de llegada (ETA) exacta.",
    pillar2Title: "Cronómetro de Consulta y Cascada de Retrasos",
    pillar2Desc: "Registra los minutos de atención presencial. Si una consulta se extiende, el sistema recalcula automáticamente y avisa por WhatsApp al siguiente paciente.",
    pillar3Title: "Bóveda Digital de Fórmulas OKVET",
    pillar3Desc: "Prescripciones firmadas con posología estructurada y enlace seguro temporal (24h) enviado por WhatsApp al tutor, sin descargar ni adjuntar PDFs a mano.",
    pillar4Title: "Conserje IA de WhatsApp 24/7 con Triaje",
    pillar4Desc: "Atiende pacientes día y noche, clasifica urgencias, agenda citas y responde dudas sobre tratamientos y vacunas sin saturar a tus médicos.",
    pillar5Title: "Sirena de Urgencia Vital en Celular y Apple Watch",
    pillar5Desc: "Alertas críticas con sonido de alta penetración y vibración táctil en el teléfono y reloj inteligente de los doctores en turno.",
    simulatorsTitle: "Pruébalo en Vivo Ahora Mismo",
    simulatorsSubtitle: "Simuladores funcionales e interactivos con datos sintéticos aislados.",
    tabGps: "1. Rastreo GPS Flota",
    tabTimer: "2. Cronómetro de Consulta",
    tabPrescription: "3. Fórmulas Médicas",
    tabEmergency: "4. Sirena de Urgencia",
    stopwatchTitle: "Cronómetro de Atención Médica Domiciliaria",
    stopwatchDesc: "Simulación de consulta en curso con Luna en Usaquén, Bogotá.",
    stopwatchStart: "Iniciar Consulta",
    stopwatchPause: "Pausar",
    stopwatchReset: "Reiniciar",
    stopwatchStatusOk: "Puntualidad en rango óptimo",
    stopwatchStatusWarning: "⚠️ Tiempo planificado superado: aviso WhatsApp emitido a siguiente cita",
    emergencyTesterTitle: "Prueba de Alarma Sonora y Háptica de Urgencia",
    emergencyTesterDesc: "Haz clic para escuchar el tono de sirena médica dual y sentir la vibración que despierta y alerta al doctor y su Apple Watch.",
    emergencyBtnTrigger: "🚨 Tocar Alarma de Urgencia Vital",
    rolesTitle: "¿Cómo quieres explorar la plataforma?",
    rolesSubtitle: "Entra con un clic en cualquiera de los roles operativos sin ingresar contraseña.",
  },
  en: {
    heroBadge: "Intelligent Operating System for Veterinary Clinics & Mobile Practices",
    heroTitle: "The All-in-One Operating System for Modern Veterinary Care",
    heroSubtitle:
      "Automate your 24/7 WhatsApp concierge, track mobile vets & vet nurses in real-time, monitor clinical visit duration, and deliver official prescriptions automatically.",
    ctaExploreRoles: "Test Interactive Profiles",
    ctaInstallApp: "Install on Mobile (iPhone / Android)",
    pwaTitle: "Downloadable as a Native Mobile App (PWA)",
    pwaDesc: "Install in under 10 seconds on iOS and Android without app store downloads.",
    iosInstructions: "On iPhone / iPad: Open Safari, tap the Share icon 􀈂 and select «Add to Home Screen» ⊞.",
    androidInstructions: "On Android: Open Chrome, tap the menu ⋮ and select «Install app» ⬇️.",
    installButton: "Install Mobile App Now",
    installCopied: "Link copied to open on your smartphone",
    pillarsTitle: "5 Breakthrough Capabilities of Vet Freedom OS",
    pillar1Title: "Live GPS Tracking for Vets & Vet Nurses",
    pillar1Desc: "Operations and pet parents see the field team moving on the map in real-time with vehicle speed (km/h) and traffic-aware arrival ETA.",
    pillar2Title: "Visit Stopwatch & Automated Delay Cascades",
    pillar2Desc: "Tracks clinical face-to-face duration. If an exam runs over, it automatically recalculates and notifies the next client via WhatsApp.",
    pillar3Title: "Digital Prescription & Posology Vault",
    pillar3Desc: "Certified digital prescriptions with structured dosage and secure 24-hour temporary PDF download links dispatched via WhatsApp.",
    pillar4Title: "24/7 AI WhatsApp Concierge & Triage",
    pillar4Desc: "Answers pet parents around the clock, triages urgent symptoms, books visits, and handles pricing without interrupting your veterinarians.",
    pillar5Title: "Vital Emergency Siren for Phone & Apple Watch",
    pillar5Desc: "High-urgency dual-tone siren and haptic wrist vibration alerting on-call veterinarians on their smartphone and smartwatch.",
    simulatorsTitle: "Interactive Live Simulators",
    simulatorsSubtitle: "Fully functional, isolated interactive sandboxes with synthetic data.",
    tabGps: "1. Live Fleet GPS",
    tabTimer: "2. Visit Stopwatch",
    tabPrescription: "3. Digital Prescriptions",
    tabEmergency: "4. Emergency Siren",
    stopwatchTitle: "In-Clinic & Home Visit Clinical Timer",
    stopwatchDesc: "Live simulated appointment with Luna in Bogotá.",
    stopwatchStart: "Start Visit",
    stopwatchPause: "Pause",
    stopwatchReset: "Reset",
    stopwatchStatusOk: "Punctuality on optimal schedule",
    stopwatchStatusWarning: "⚠️ Scheduled duration exceeded: delay notification cascaded to next patient",
    emergencyTesterTitle: "Emergency Sound & Watch Haptics Test",
    emergencyTesterDesc: "Click to hear the dual-tone clinical siren and trigger the wrist vibration pattern designed to alert the on-call doctor.",
    emergencyBtnTrigger: "🚨 Trigger Vital Emergency Siren",
    rolesTitle: "Explore Any Operational Perspective",
    rolesSubtitle: "One tap enters each specialized workspace with sample data — no password required.",
  },
};

export function CommercialDemoShowcase() {
  const [lang, setLang] = useState<Language>("es");
  const [tab, setTab] = useState<"gps" | "timer" | "prescription" | "emergency">("gps");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Cronómetro interactivo de consulta
  const [seconds, setSeconds] = useState(24 * 60 + 35); // 24:35
  const [running, setRunning] = useState(false);
  const plannedMinutes = 45;

  const t = TEXT[lang];

  useEffect(() => {
    let interval: number | null = null;
    if (running) {
      interval = window.setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [running]);

  useEffect(() => {
    // Escuchar evento PWA instalable
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        toast.success(lang === "es" ? "¡Aplicación instalada exitosamente!" : "App successfully installed!");
      }
      setDeferredPrompt(null);
    } else {
      navigator.clipboard.writeText(window.location.origin + "/demo");
      toast.info(t.installCopied);
    }
  };

  const elapsedMin = Math.floor(seconds / 60);
  const elapsedSec = seconds % 60;
  const isOverrun = elapsedMin >= plannedMinutes;
  const progressPct = Math.min(100, Math.round((elapsedMin / plannedMinutes) * 100));

  return (
    <div className="space-y-8">
      {/* Selector de Idioma Flotante */}
      <div className="flex items-center justify-between rounded-3xl bg-secondary/80 p-3 shadow-sm border border-border">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Language / Idioma
          </span>
        </div>
        <div className="inline-flex rounded-full bg-card p-1 shadow-inner border border-border">
          <button
            onClick={() => setLang("es")}
            className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
              lang === "es" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🇪🇸 Español
          </button>
          <button
            onClick={() => setLang("en")}
            className={`rounded-full px-4 py-1.5 text-xs font-extrabold transition ${
              lang === "en" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            🇺🇸 English
          </button>
        </div>
      </div>

      {/* Hero Comercial */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-primary p-6 text-white shadow-xl sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-wider backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" />
            {t.heroBadge}
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
            {t.heroTitle}
          </h1>
          <p className="mt-4 text-base font-medium leading-relaxed text-white/90 sm:text-lg">
            {t.heroSubtitle}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#simuladores"
              className="rounded-full bg-white px-6 py-3 text-sm font-extrabold text-primary shadow-lg transition hover:bg-white/90"
            >
              {t.simulatorsTitle} ↓
            </a>
            <a
              href="#instalar-pwa"
              className="rounded-full border-2 border-white/80 bg-white/10 px-6 py-3 text-sm font-extrabold text-white backdrop-blur transition hover:bg-white/20"
            >
              <Smartphone className="inline mr-1.5 h-4 w-4" />
              {t.ctaInstallApp}
            </a>
          </div>
        </div>
      </section>

      {/* Las 5 Tecnologías Clave */}
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-black text-foreground">{t.pillarsTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {lang === "es"
              ? "Diseñado por veterinarios para solucionar los 5 cuellos de botella de cualquier clínica o servicio a domicilio."
              : "Built by veterinary doctors to solve the 5 biggest operational bottlenecks in private practice."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Pilar 1 */}
          <Card className="border-t-4 border-t-primary">
            <div className="flex items-center gap-2 text-primary">
              <MapPin className="h-5 w-5" />
              <b className="text-base">{t.pillar1Title}</b>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.pillar1Desc}</p>
          </Card>

          {/* Pilar 2 */}
          <Card className="border-t-4 border-t-amber-500">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
              <b className="text-base">{t.pillar2Title}</b>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.pillar2Desc}</p>
          </Card>

          {/* Pilar 3 */}
          <Card className="border-t-4 border-t-sky-500">
            <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
              <FileText className="h-5 w-5" />
              <b className="text-base">{t.pillar3Title}</b>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.pillar3Desc}</p>
          </Card>

          {/* Pilar 4 */}
          <Card className="border-t-4 border-t-purple-500">
            <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Inbox className="h-5 w-5" />
              <b className="text-base">{t.pillar4Title}</b>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.pillar4Desc}</p>
          </Card>

          {/* Pilar 5 */}
          <Card className="border-t-4 border-t-red-500 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <ShieldAlert className="h-5 w-5" />
              <b className="text-base">{t.pillar5Title}</b>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{t.pillar5Desc}</p>
          </Card>
        </div>
      </section>

      {/* Simuladores Interactivos en Vivo */}
      <section id="simuladores" className="space-y-4 pt-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-black text-foreground">{t.simulatorsTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.simulatorsSubtitle}</p>
          </div>
        </div>

        {/* Pestañas de Simuladores */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-secondary/80 p-1.5 border border-border">
          <button
            onClick={() => setTab("gps")}
            className={`flex-1 min-w-[130px] rounded-xl py-2 px-3 text-xs font-bold transition ${
              tab === "gps" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.tabGps}
          </button>
          <button
            onClick={() => setTab("timer")}
            className={`flex-1 min-w-[130px] rounded-xl py-2 px-3 text-xs font-bold transition ${
              tab === "timer" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.tabTimer}
          </button>
          <button
            onClick={() => setTab("prescription")}
            className={`flex-1 min-w-[130px] rounded-xl py-2 px-3 text-xs font-bold transition ${
              tab === "prescription" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.tabPrescription}
          </button>
          <button
            onClick={() => setTab("emergency")}
            className={`flex-1 min-w-[130px] rounded-xl py-2 px-3 text-xs font-bold transition ${
              tab === "emergency" ? "bg-red-600 text-white shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.tabEmergency}
          </button>
        </div>

        {/* Vista del Simulador Seleccionado */}
        <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
          {tab === "gps" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-foreground">{t.pillar1Title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {lang === "es"
                      ? "Flota veterinaria activa en Bogotá (Usaquén, Cedritos y Chicó). Coordenadas con telemetría viva."
                      : "Active veterinary fleet in Bogotá. Real-time telemetry and animated coordinates."}
                  </p>
                </div>
                <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  Live GPS
                </span>
              </div>
              <LiveTeamMap />
            </div>
          )}

          {tab === "timer" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-foreground">{t.stopwatchTitle}</h3>
                <p className="text-xs text-muted-foreground">{t.stopwatchDesc}</p>
              </div>

              {/* Display Digital de Cronómetro */}
              <div className="rounded-3xl bg-secondary/80 p-6 text-center border border-border">
                <div className="text-5xl font-black tracking-tight text-foreground sm:text-6xl font-mono">
                  {String(elapsedMin).padStart(2, "0")}:{String(elapsedSec).padStart(2, "0")}
                </div>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {lang === "es" ? "Minutos Transcurridos / Tiempo Planificado: 45 min" : "Elapsed Minutes / Target Duration: 45 min"}
                </p>

                {/* Barra de Progreso */}
                <div className="mx-auto mt-4 h-3 w-full max-w-md overflow-hidden rounded-full bg-border">
                  <div
                    className={`h-full transition-all duration-300 ${isOverrun ? "bg-amber-500" : "bg-primary"}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Estado y Cascada */}
                <p className={`mt-3 text-xs font-bold ${isOverrun ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {isOverrun ? t.stopwatchStatusWarning : t.stopwatchStatusOk}
                </p>

                {/* Controles de Cronómetro */}
                <div className="mt-6 flex justify-center gap-3">
                  <Btn
                    onClick={() => setRunning(!running)}
                    className={running ? "bg-amber-600 hover:bg-amber-700" : ""}
                  >
                    {running ? <Pause className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
                    {running ? t.stopwatchPause : t.stopwatchStart}
                  </Btn>
                  <Btn
                    variant="outline"
                    onClick={() => {
                      setRunning(false);
                      setSeconds(0);
                    }}
                  >
                    <RotateCcw className="mr-1.5 h-4 w-4" />
                    {t.stopwatchReset}
                  </Btn>
                  <Btn
                    variant="soft"
                    onClick={() => setSeconds((s) => s + 5 * 60)}
                  >
                    +5 min
                  </Btn>
                </div>
              </div>
            </div>
          )}

          {tab === "prescription" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-foreground">{t.pillar3Title}</h3>
                <p className="text-xs text-muted-foreground">
                  {lang === "es"
                    ? "Prescripción médica oficial vinculada a OKVET con firma COMVEZCOL-001 y enlace de descarga firmado 24h."
                    : "Official certified veterinary prescription with licensed posology and 24-hr signed PDF download link."}
                </p>
              </div>
              <PetPrescriptionCard petId="luna" petName="Luna" />
            </div>
          )}

          {tab === "emergency" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                <ShieldAlert className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="text-xl font-black text-foreground">{t.emergencyTesterTitle}</h3>
              <p className="mx-auto max-w-lg text-sm text-muted-foreground">
                {t.emergencyTesterDesc}
              </p>

              <div className="pt-2">
                <button
                  onClick={() => {
                    fireEmergencyAlert(
                      "Luna",
                      lang === "es"
                        ? "Dificultad respiratoria súbita y vómito severo en Usaquén"
                        : "Acute dyspnea and severe vomiting in Usaquén"
                    );
                    toast.success(
                      lang === "es"
                        ? "🚨 Sirena médica activada: sonando y vibrando en este dispositivo."
                        : "🚨 Emergency siren triggered: ringing and vibrating on this device."
                    );
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-red-600 px-6 py-4 text-base font-black text-white shadow-xl transition active:scale-95 hover:bg-red-700"
                >
                  <Volume2 className="h-5 w-5" />
                  {t.emergencyBtnTrigger}
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                <p>
                  <b>{lang === "es" ? "Compatibilidad garantizada:" : "Full cross-device support:"}</b>{" "}
                  {lang === "es"
                    ? "iPhone (iOS Safari), Android (Chrome / Samsung), Apple Watch (vía notificaciones espejo) y navegadores de escritorio."
                    : "iPhone (iOS Safari), Android (Chrome), Apple Watch (via OS notification mirror), and modern desktop browsers."}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Explorador de Perfiles Operativos */}
      <section className="space-y-4 pt-4">
        <div>
          <h2 className="text-2xl font-black text-foreground">{t.rolesTitle}</h2>
          <p className="text-sm text-muted-foreground">{t.rolesSubtitle}</p>
        </div>
        <DemoProfiles />
      </section>

      {/* Instalación PWA (Android / iPhone) */}
      <section id="instalar-pwa" className="rounded-3xl border-2 border-primary/30 bg-primary/5 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary p-3 text-white">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-foreground">{t.pwaTitle}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t.pwaDesc}</p>
            </div>
          </div>
          <Btn onClick={handleInstallClick} className="shrink-0">
            <Smartphone className="mr-2 h-4 w-4" />
            {t.installButton}
          </Btn>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* Instrucciones iOS */}
          <div className="rounded-2xl bg-card p-4 border border-border">
            <b className="flex items-center gap-2 text-sm text-primary">
              <Share2 className="h-4 w-4" />
              iPhone & iPad (Apple iOS)
            </b>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t.iosInstructions}
            </p>
          </div>

          {/* Instrucciones Android */}
          <div className="rounded-2xl bg-card p-4 border border-border">
            <b className="flex items-center gap-2 text-sm text-primary">
              <ExternalLink className="h-4 w-4" />
              Android (Google Chrome / Galaxy)
            </b>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {t.androidInstructions}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
