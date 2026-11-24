import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Stethoscope,
  Heart,
  Calendar,
  MapPin,
  Clock,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Car,
  FileText,
  Users,
  MessageCircle,
  ChevronRight,
  Star,
  Award,
  Lock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function DrLuisClinicLanding() {
  const coverageZones = [
    { name: "Medellín Centro & Sur", areas: "El Poblado, Laureles, Belén, Conquistadores, Guayabal" },
    { name: "Valle de Aburrá Sur", areas: "Envigado, Sabaneta, Itagüí, La Estrella" },
    { name: "Oriente Antioqueño", areas: "Rionegro, Llanogrande, Guarne, El Retiro, Marinilla, La Ceja" },
  ];

  const clinicalServices = [
    {
      title: "Consulta Médica General",
      description: "Evaluación clínica integral, anamnesis, constantes vitales y diagnóstico en la comodidad de tu sala.",
      badge: "Más Solicitado",
      to: "/cliente/reservar",
    },
    {
      title: "Vacunación & Desparasitación",
      description: "Esquemas completos para cachorros, adultos y seniors con certificación oficial y carnet digital.",
      badge: "Preventivo",
      to: "/cliente/reservar",
    },
    {
      title: "Toma de Muestras & Laboratorio",
      description: "Hemogramas, perfiles bioquímicos, urianálisis y coprológicos sin el estrés de traslados.",
      badge: "Diagnóstico",
      to: "/cliente/reservar",
    },
    {
      title: "Curaciones & Manejo Posoperatorio",
      description: "Cuidado de heridas complejas, retiro de puntos, vendajes y terapia analgésica supervisada.",
      badge: "Cuidados",
      to: "/cliente/reservar",
    },
    {
      title: "Control de Enfermedades Crónicas",
      description: "Monitoreo renal, cardíaco, endocrino y geriátrico con ajuste continuo de medicación.",
      badge: "Seguimiento",
      to: "/cliente/reservar",
    },
    {
      title: "Triaje Inmediato & Orientación",
      description: "Canal prioritario por WhatsApp para clasificar signos de alarma y coordinar despacho médico urgente.",
      badge: "Prioritario",
      to: "/contacto",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      
      {/* Dynamic Ambient Background Lights (Emerald & Teal Medical Aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[450px] bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent blur-[120px] opacity-90" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[400px] bg-gradient-to-bl from-teal-500/15 via-emerald-600/10 to-transparent blur-[120px] opacity-80" />
        <div className="absolute bottom-10 left-1/3 w-[500px] h-[350px] bg-gradient-to-tr from-cyan-500/10 via-emerald-500/5 to-transparent blur-[100px] opacity-70" />
      </div>

      {/* Top Clinical Announcement Bar */}
      <div className="relative z-20 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/20 px-4 py-2 text-center text-xs text-emerald-300 flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="font-medium">
          Dirección Médica Oficial · <strong>Dr. Luis Eduardo Ríos</strong> · Tarjeta Profesional COMVEZCOL habilitada (Ley 576 de 2000)
        </span>
        <span className="hidden sm:inline text-emerald-500">|</span>
        <span className="hidden sm:inline font-mono text-[11px] text-emerald-400">
          Medellín & Oriente Antioqueño
        </span>
      </div>

      {/* Navigation Header */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Clinic Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition">
              <Stethoscope className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-wider uppercase">
                  Vet Life
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  A Domicilio
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
                Dr. Luis Eduardo Ríos · Medicina Veterinaria
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/servicios"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition hidden md:inline"
            >
              Servicios
            </Link>

            <Link
              to="/zonas"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition hidden md:inline"
            >
              Zonas
            </Link>

            <Link
              to="/como-funciona"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition hidden lg:inline"
            >
              Cómo Funciona
            </Link>

            <Link
              to="/contacto"
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-emerald-400 hover:bg-slate-900 transition hidden sm:inline"
            >
              Contacto
            </Link>

            {/* Portal Tutor / Carnet */}
            <Link
              to="/cliente"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 text-emerald-400" />
              <span>Portal Tutor</span>
            </Link>

            {/* Main Action: Reservar */}
            <Link
              to="/cliente/reservar"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition hover:scale-105"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Cita</span>
            </Link>

            {/* Acceso Médico Dr. Luis */}
            <Link
              to="/luis"
              title="Acceso Exclusivo Director Médico Dr. Luis Ríos"
              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative z-10 pt-12 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center space-y-6">
        
        {/* Top Clinical Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Atención Veterinaria Personalizada en tu Hogar</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-mono text-[11px]">Citas Disponibles Hoy</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
          Cuidado Veterinario de Élite para tu Mascota,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
            Directo en tu Hogar
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Sin salas de espera ni el estrés del tráfico. El <strong>Dr. Luis Eduardo Ríos</strong> y su equipo médico se trasladan hasta tu domicilio con todo el instrumental clínico para una atención cálida, humana y rigurosa.
        </p>

        {/* Action Buttons Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/cliente/reservar"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-500/25 transition hover:scale-105 active:scale-[0.99]"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Cita a Domicilio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/cliente"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 shadow-md transition"
          >
            <Heart className="w-4 h-4 text-emerald-400" />
            <span>Portal del Tutor & Pasaporte</span>
          </Link>

          <a
            href="https://wa.me/573001234567?text=Hola%20Dr.%20Luis%2C%20necesito%20una%20consulta%20veterinaria%20a%20domicilio%20para%20mi%20mascota"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 font-bold text-sm flex items-center justify-center gap-2 border border-emerald-500/40 transition"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Triaje Directo</span>
          </a>
        </div>

        {/* Four Key Clinical Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 max-w-5xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md">
            <Car className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="font-bold text-white text-sm">100% a Domicilio</div>
            <div className="text-xs text-slate-400">Sin traslados que alteren a perros o gatos.</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="font-bold text-white text-sm">Ley 576 de 2000</div>
            <div className="text-xs text-slate-400">Médico habilitado COMVEZCOL y recetas oficiales.</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md">
            <Clock className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="font-bold text-white text-sm">Seguimiento en Vivo</div>
            <div className="text-xs text-slate-400">Enlace estilo Uber para saber cuándo llega el médico.</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/60 border border-emerald-500/20 backdrop-blur-md">
            <FileText className="w-5 h-5 text-emerald-400 mb-2" />
            <div className="font-bold text-white text-sm">Historial OKVET</div>
            <div className="text-xs text-slate-400">Registro clínico digital permanente e interoperable.</div>
          </div>
        </div>

      </section>

      {/* Clinical Services Grid */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full space-y-8">
        <div className="text-center space-y-3">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-bold px-3 py-1">
            PORTAFOLIO MÉDICO EN CASA
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Servicios Clínicos Especializados a Domicilio
          </h2>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Llevamos el consultorio hasta la sala de tu casa con equipamiento completo para diagnóstico y tratamiento inmediato.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinicalServices.map((service, index) => (
            <div
              key={index}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/40 transition group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {service.badge}
                  </span>
                  <Stethoscope className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {service.description}
                </p>
              </div>

              <Link
                to={service.to as never}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 pt-2 border-t border-slate-800/80"
              >
                <span>Solicitar este servicio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Coverage Zones Spotlight */}
      <section className="relative z-10 bg-slate-900/40 border-t border-b border-slate-800/80 py-16 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-300 border-teal-500/30 text-xs font-bold px-3 py-1">
              RUTAS & COBERTURA
            </Badge>
            <h2 className="text-3xl font-black text-white">
              ¿Dónde atiende el Dr. Luis Eduardo Ríos?
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Rutas médicas organizadas por sectores para garantizar puntualidad y tiempos óptimos de respuesta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {coverageZones.map((zone, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-950/80 border border-emerald-500/20 p-5 space-y-2 shadow-lg"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{zone.name}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {zone.areas}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              to="/zonas"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-400 hover:underline"
            >
              <span>Consultar mapa interactivo y tiempos de llegada (/zonas)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Doctor Bio & Medical Guarantee */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 p-8 sm:p-12 shadow-2xl flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-slate-950 shadow-xl shadow-emerald-500/20 shrink-0">
            <Award className="w-12 h-12 text-slate-950" />
          </div>

          <div className="space-y-4 text-left">
            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                Director Médico & Fundador
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Dr. Luis Eduardo Ríos
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Médico Veterinario · Tarjeta Profesional COMVEZCOL · Especialista en Medicina Menor & Urgencias
              </p>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              «Mi compromiso es devolver la tranquilidad a los hogares. La medicina veterinaria debe ser comprensiva, científica y accesible en el entorno natural de la mascota, donde el estrés desaparece y el diagnóstico es más certero.»
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/cliente/reservar"
                className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
              >
                <span>Agendar con el Dr. Luis</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/luis"
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-2 border border-slate-700 transition"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portal Clínico Dr. Luis (/luis)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 px-6 py-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
              🐾
            </div>
            <span>Vet Life · Dr. Luis Eduardo Ríos © 2026 · Medicina Veterinaria a Domicilio</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/servicios" className="hover:text-emerald-400 transition">
              Servicios
            </Link>
            <Link to="/zonas" className="hover:text-emerald-400 transition">
              Zonas
            </Link>
            <Link to="/cliente/reservar" className="hover:text-emerald-400 transition font-bold text-emerald-400">
              Agendar Cita
            </Link>
            <Link to="/cliente" className="hover:text-emerald-400 transition">
              Portal del Tutor
            </Link>
            <Link to="/privacidad" className="hover:text-slate-400 transition">
              Privacidad
            </Link>
            <Link to="/terminos" className="hover:text-slate-400 transition">
              Términos
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
