import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Wrench,
  CheckCircle2,
  Calendar,
  DollarSign,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  PhoneCall,
  Hammer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PlatformTenant } from "@/features/system-administration/application/platformControlPlane";

export function WhiteLabelContractorLanding({ tenant }: { tenant?: PlatformTenant | undefined }) {
  const companyName = tenant?.display_name || "Contractor Field Services Pro";
  const niche = tenant?.exact_niche || "Servicios de Campo, Instalaciones & Mantenimiento";
  const currency = tenant?.currency || "USD";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
      {/* Dynamic Ambient Background (Amber & Industrial Aesthetic) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[450px] bg-gradient-to-br from-amber-500/10 via-transparent to-transparent blur-[120px] opacity-80" />
        <div className="absolute top-1/2 right-1/4 w-[500px] h-[400px] bg-gradient-to-bl from-orange-500/10 via-transparent to-transparent blur-[120px] opacity-70" />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Wrench className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-wider uppercase">
                {companyName}
              </span>
              <p className="text-[11px] text-slate-400 font-mono">
                {niche} · Contractor OS
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            <Link
              to="/contractors/jobs"
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200"
            >
              Mis Trabajos
            </Link>

            <Link
              to="/contractors/estimates/new"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Solicitar Cotización</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Servicios Profesionales de Campo con Garantía y Rapidez</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Bienvenido a <span className="text-amber-400">{companyName}</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Especialistas en {niche}. Cotizaciones claras, trabajo garantizado y seguimiento fotográfico en tiempo real de cada obra.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to="/contractors/estimates/new"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition hover:scale-105"
          >
            <FileText className="w-4 h-4" />
            <span>Solicitar Cotización Digital</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/contractors/jobs"
            className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Consultar Estado de Obra</span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 px-6 py-8 mt-auto text-center text-xs text-slate-500">
        <p>{companyName} · Desarrollado sobre Contractor Field Service OS · Alpha Vision Method</p>
      </footer>
    </div>
  );
}
