import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Stethoscope,
  Heart,
  Calendar,
  MapPin,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PlatformTenant } from "@/features/system-administration/application/platformControlPlane";

export function WhiteLabelVetClinicLanding({ tenant }: { tenant?: PlatformTenant | undefined }) {
  const clinicName = tenant?.display_name || "Clínica Veterinaria Afiliada";
  const niche = tenant?.exact_niche || "Medicina Veterinaria General & Domicilios";
  const location = tenant?.country || "Colombia";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      
      {/* Dynamic Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[450px] bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent blur-[120px] opacity-80" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[400px] bg-gradient-to-bl from-teal-500/10 via-transparent to-transparent blur-[120px] opacity-70" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Stethoscope className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wider uppercase">
                {clinicName}
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                {niche} · Red Vet Life
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/cliente"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
            >
              Portal Tutor
            </Link>

            <Link
              to="/cliente/reservar"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Agendar Cita</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Atención Veterinaria Profesional y de Confianza</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Bienvenido a <span className="text-emerald-400">{clinicName}</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Atención integral y calidez para tu mascota con los más altos estándares clínicos y tecnología de seguimiento digital.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/cliente/reservar"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition hover:scale-105"
          >
            <Calendar className="w-4 h-4" />
            <span>Agendar Cita en Línea</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/cliente"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <Heart className="w-4 h-4 text-emerald-400" />
            <span>Consultar Mis Mascotas</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 px-6 py-8 mt-auto text-center text-xs text-slate-500">
        <p>{clinicName} · Desarrollado sobre Vet Freedom OS · Alpha Vision Method</p>
      </footer>
    </div>
  );
}
