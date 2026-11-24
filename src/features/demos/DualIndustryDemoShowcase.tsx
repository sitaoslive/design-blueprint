import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  Stethoscope,
  Wrench,
  Columns,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Play,
  RotateCcw,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Crown,
  Eye,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CommercialDemoShowcase } from "@/components/vf/CommercialDemoShowcase";
import { ContractorSalesDemo } from "@/features/contractors/ContractorSalesDemo";
import { ContractorI18nProvider } from "@/features/contractors/context/ContractorI18nContext";

export type DemoMode = "VET" | "CONTRACTORS" | "SPLIT";

export function DualIndustryDemoShowcase() {
  const [activeMode, setActiveMode] = useState<DemoMode>("VET");

  // Read URL query params on mount if present (e.g., ?active=contractors or ?active=split)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const activeParam = params.get("active")?.toUpperCase();
      if (activeParam === "CONTRACTORS" || activeParam === "CONTRACTOR") {
        setActiveMode("CONTRACTORS");
      } else if (activeParam === "SPLIT" || activeParam === "BOTH") {
        setActiveMode("SPLIT");
      } else if (activeParam === "VET") {
        setActiveMode("VET");
      }
    }
  }, []);

  const handleModeChange = (mode: DemoMode) => {
    setActiveMode(mode);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("active", mode.toLowerCase());
      window.history.replaceState({}, "", url.toString());
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
      {/* Dynamic Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div
          className={`absolute top-0 left-1/4 w-[600px] h-[500px] bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent blur-[140px] transition-opacity duration-700 ${
            activeMode === "CONTRACTORS" ? "opacity-20" : "opacity-90"
          }`}
        />
        <div
          className={`absolute top-0 right-1/4 w-[600px] h-[500px] bg-gradient-to-bl from-amber-500/15 via-orange-500/10 to-transparent blur-[140px] transition-opacity duration-700 ${
            activeMode === "VET" ? "opacity-20" : "opacity-90"
          }`}
        />
      </div>

      {/* Sovereign Header Navigation */}
      <header className="relative z-20 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl sticky top-0 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Platform Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
              <Crown className="w-4 h-4 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm tracking-wider uppercase">
                  Alpha Vision Method
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline">
                  Demo Hub Dual
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden md:block">
                Demostrador Interactivo: Veterinaria & Contratistas
              </p>
            </div>
          </Link>

          {/* Quick Mode Switcher in Header */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-inner">
            <button
              type="button"
              onClick={() => handleModeChange("VET")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeMode === "VET"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Veterinaria</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange("SPLIT")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeMode === "SPLIT"
                  ? "bg-slate-700 text-white shadow-md font-extrabold border border-slate-600"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lado a Lado</span>
              <span className="sm:hidden">Ambos</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange("CONTRACTORS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeMode === "CONTRACTORS"
                  ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 font-extrabold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Contratistas</span>
            </button>
          </div>

          {/* External Links */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/demo-interactiva"
              className="text-xs font-semibold text-slate-400 hover:text-purple-400 transition flex items-center gap-1"
            >
              <Play className="w-3 h-3 text-purple-400 fill-purple-400" />
              <span>Sala de Cine</span>
            </Link>
            <Link
              to="/"
              className="text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Top Dual Hero Showcase Bar */}
      <section className="relative z-10 pt-8 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="text-center space-y-2">
          <Badge className="bg-slate-900 text-slate-300 border-slate-800 text-xs font-semibold px-3 py-1 gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>SALA DE DEMOSTRACIÓN DUAL INTERACTIVA</span>
          </Badge>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Explora la Demo Completa de Cada Industria
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Haz clic en la tarjeta de la izquierda para ver la demo veterinaria, o en la derecha para ver la de contratistas. También puedes activar la <strong>vista lado a lado</strong>.
          </p>
        </div>

        {/* Side-by-Side Clickable Showcase Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 pt-2">
          
          {/* Card 1: VET FREEDOM OS */}
          <div
            onClick={() => handleModeChange("VET")}
            className={`rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between border ${
              activeMode === "VET"
                ? "bg-slate-900/90 border-emerald-500 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/50 scale-[1.01]"
                : "bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900/70"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[11px] font-bold gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                  INDUSTRIA 1: CLÍNICAS VETERINARIAS
                </Badge>
                {activeMode === "VET" && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Demo Activa
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Vet Freedom OS
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Sistema operativo para medicina veterinaria a domicilio y clínicas. Rastreo vehicular en vivo estilo Uber, triaje WhatsApp, recetas COMVEZCOL y portal del tutor.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                <div>
                  <div className="font-mono font-bold text-white">$1.48M COP</div>
                  <div className="text-[10px] text-slate-400">Día Dr. Luis</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-emerald-400">4 Roles</div>
                  <div className="text-[10px] text-slate-400">Simulador</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-white">GPS Vivo</div>
                  <div className="text-[10px] text-slate-400">Estilo Uber</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button
                variant={activeMode === "VET" ? "default" : "outline"}
                size="sm"
                className={
                  activeMode === "VET"
                    ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs"
                    : "border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40 text-xs"
                }
              >
                <span>{activeMode === "VET" ? "Mostrando Esta Demo" : "Hacer Clic para Ver Demo"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
              <span className="text-[11px] text-slate-400 font-mono">/vet</span>
            </div>
          </div>

          {/* Card 2: CONTRACTOR FIELD SERVICE OS */}
          <div
            onClick={() => handleModeChange("CONTRACTORS")}
            className={`rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-300 relative overflow-hidden flex flex-col justify-between border ${
              activeMode === "CONTRACTORS"
                ? "bg-slate-900/90 border-amber-500 shadow-xl shadow-amber-500/20 ring-2 ring-amber-500/50 scale-[1.01]"
                : "bg-slate-900/50 border-slate-800 hover:border-amber-500/50 hover:bg-slate-900/70"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[11px] font-bold gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" />
                  INDUSTRIA 2: SERVICIOS & CONTRATISTAS
                </Badge>
                {activeMode === "CONTRACTORS" && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Demo Activa
                  </span>
                )}
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  Contractor Field Service OS
                </h2>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Sistema operativo para oficios y servicios de campo (HVAC, plomería, electricidad y pintura). Cotizador Bueno/Mejor/Excelente con markup, Kanban de prospectos y bóveda de fotos.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                <div>
                  <div className="font-mono font-bold text-white">$58.5M</div>
                  <div className="text-[10px] text-slate-400">Pipeline Obra</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-amber-400">8 Pasos</div>
                  <div className="text-[10px] text-slate-400">Flujo Completo</div>
                </div>
                <div>
                  <div className="font-mono font-bold text-white">Bilingüe</div>
                  <div className="text-[10px] text-slate-400">EN / ES</div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <Button
                variant={activeMode === "CONTRACTORS" ? "default" : "outline"}
                size="sm"
                className={
                  activeMode === "CONTRACTORS"
                    ? "bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                    : "border-amber-500/40 text-amber-300 hover:bg-amber-950/40 text-xs"
                }
              >
                <span>{activeMode === "CONTRACTORS" ? "Mostrando Esta Demo" : "Hacer Clic para Ver Demo"}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
              <span className="text-[11px] text-slate-400 font-mono">/contractors</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Interactive Demo Presentation Stage */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-20 pt-4">
        
        {/* ======================================================== */}
        {/* CASE 1: VET FREEDOM OS DEMO ONLY */}
        {/* ======================================================== */}
        {activeMode === "VET" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Mostrando: Demo Comercial Vet Freedom OS
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interactúa con el mapa en vivo, selector de 4 roles, modal anti-no-show y carnet digital.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleModeChange("CONTRACTORS")}
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Contratistas →</span>
              </button>
            </div>

            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
              <CommercialDemoShowcase />
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CASE 2: CONTRACTOR FIELD SERVICE OS DEMO ONLY */}
        {/* ======================================================== */}
        {activeMode === "CONTRACTORS" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Mostrando: Demo Comercial Contractor Field Service OS
                  </h3>
                  <p className="text-xs text-slate-400">
                    Interactúa con los 8 pasos interactivos: portal del cliente, cotizador con markup, despacho y cobro.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleModeChange("VET")}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Ver Veterinaria →</span>
              </button>
            </div>

            <div className="bg-slate-900/80 rounded-3xl border border-slate-800 p-4 sm:p-8 shadow-2xl backdrop-blur-xl">
              <ContractorI18nProvider>
                <ContractorSalesDemo />
              </ContractorI18nProvider>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* CASE 3: SPLIT VIEW (LADO A LADO) */}
        {/* ======================================================== */}
        {activeMode === "SPLIT" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-center">
              <span className="text-xs font-bold text-slate-300">
                ⚖️ Vista Dividida Lado a Lado: Ambas plataformas activas simultáneamente
              </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
              
              {/* Left Column: Vet */}
              <div className="bg-slate-900/80 rounded-3xl border border-emerald-500/30 p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <Stethoscope className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-extrabold text-white text-base">
                    Vet Freedom OS (Veterinaria)
                  </h3>
                </div>
                <CommercialDemoShowcase />
              </div>

              {/* Right Column: Contractors */}
              <div className="bg-slate-900/80 rounded-3xl border border-amber-500/30 p-4 sm:p-6 shadow-xl">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                  <Wrench className="w-5 h-5 text-amber-400" />
                  <h3 className="font-extrabold text-white text-base">
                    Contractor Field Service OS (Contratistas)
                  </h3>
                </div>
                <ContractorI18nProvider>
                  <ContractorSalesDemo />
                </ContractorI18nProvider>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Floating Bottom Quick Switcher */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 bg-slate-950/90 border border-slate-700/80 p-1.5 rounded-2xl shadow-2xl backdrop-blur-xl">
          <button
            type="button"
            onClick={() => handleModeChange("VET")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeMode === "VET"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Vet Freedom OS</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("SPLIT")}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeMode === "SPLIT"
                ? "bg-slate-700 text-white shadow-lg"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Columns className="w-4 h-4" />
            <span className="hidden sm:inline">Lado a Lado</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("CONTRACTORS")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeMode === "CONTRACTORS"
                ? "bg-amber-400 text-slate-950 shadow-lg shadow-amber-400/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Contractor OS</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 px-6 py-8 text-center text-xs text-slate-500">
        <p>Alpha Vision Method © 2026 · Sistemas Operativos Verticales para Negocios Reales</p>
      </footer>

    </div>
  );
}
