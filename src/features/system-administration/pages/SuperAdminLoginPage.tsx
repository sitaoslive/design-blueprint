import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Crown,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Building2,
  Wrench,
  ArrowRight,
  Lock,
  Mail,
  CheckCircle2,
  Zap,
  Globe,
  Sliders,
  GraduationCap,
  Layers,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { enterDemo } from "@/lib/vf/session";

interface SuperAdminLoginPageProps {
  nextUrl?: string | undefined;
}

export function SuperAdminLoginPage({ nextUrl }: SuperAdminLoginPageProps) {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@alphavisionm.com");
  const [password, setPassword] = useState("");
  const [masterPin, setMasterPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"master_key" | "email_login">("master_key");

  const targetUrl = nextUrl && nextUrl.startsWith("/admin") ? nextUrl : "/admin";

  // 1-Click Sovereign Master Access for Platform Owner
  const handleSovereignOwnerAccess = (ownerName = "Dueña de la Plataforma · Alpha Vision") => {
    setIsLoading(true);
    try {
      enterDemo("administrador", ownerName);
      toast.success("¡Bienvenida, Dueña de la Plataforma!", {
        description: "Acceso Soberano Master activado con privilegios totales.",
      });
      setTimeout(() => {
        nav({ to: targetUrl as "/" });
      }, 400);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo iniciar la sesión soberana.");
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Supabase Auth Login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Por favor ingresa tu correo y contraseña.");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      enterDemo("administrador", (data.user?.user_metadata?.["full_name"] as string | undefined) || "Dueña de Plataforma");
      toast.success("Autenticación Supabase completada con éxito.");
      nav({ to: targetUrl as "/" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al autenticar credenciales.";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-b from-amber-500/15 via-emerald-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[350px] bg-gradient-to-tl from-cyan-500/10 via-amber-500/5 to-transparent blur-3xl opacity-60" />
      </div>

      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition">
              <Crown className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base tracking-wider uppercase">
                  Alpha Vision Method
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Master Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">Sovereign Cloud & Multi-Tenant Operating Systems</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/vet"
              className="text-xs text-slate-400 hover:text-emerald-400 transition font-medium hidden sm:inline"
            >
              Vet OS (/vet)
            </Link>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <Link
              to="/contractors"
              className="text-xs text-slate-400 hover:text-amber-400 transition font-medium hidden sm:inline"
            >
              Contractors (/contractors)
            </Link>
            <Link
              to="/"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 transition"
            >
              ← Volver al Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Context & Powers of the Platform Owner */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide">
              <Crown className="w-3.5 h-3.5" />
              ACCESO EXCLUSIVO: PROPIETARIA DE LA PLATAFORMA
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Control Total y Soberanía sobre{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500">
                  Toda la Plataforma
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                Este portal está diseñado específicamente para ti, como dueña y administradora suprema de Alpha Vision.
                Aquí no entran clientes ni veterinarios comunes; desde este centro gobiernas ambas industrias.
              </p>
            </div>

            {/* Platform Owner Superpowers */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    1. Agregar y Dar de Alta Nuevas Clínicas
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Crea inquilinos en 5 pasos (<span className="text-emerald-300 font-mono">/onboarding</span>), asigna subdominios, logo, colores y WhatsApp.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    2. Activar Claves, Licencias y Pruebas de 30 Días
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Emite tokens de prueba, desbloquea módulos Pro y gestiona entitlements en tiempo real.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    3. Control Cruzado: Contractors & Vets
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Supervisa las métricas comerciales de Vet Life (<span className="text-cyan-300 font-mono">/luis</span>) y las obras de contratistas (<span className="text-cyan-300 font-mono">/contractors</span>).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    4. Academia Exclusiva de Super Admin
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Aprende cómo escalar el SaaS, monetizar licencias y dar soporte técnico maestro (<span className="text-purple-300 font-mono">/admin/academia</span>).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Super Admin Login Box */}
          <div className="lg:col-span-6">
            <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-xl relative overflow-hidden">
              
              {/* Corner Badge */}
              <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500/20 to-transparent px-4 py-2 border-b border-l border-amber-500/20 rounded-bl-2xl">
                <span className="text-[11px] font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  NIVEL: SUPER ADMIN
                </span>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                  <span className="text-xs font-bold tracking-widest uppercase">Compuerta de Seguridad Soberana</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Ingreso a tu Centro de Mando</h2>
                <p className="text-xs text-slate-400">
                  Elige tu método de entrada favorito para tomar el control inmediato.
                </p>
              </div>

              {/* Mode Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => setActiveTab("master_key")}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    activeTab === "master_key"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Clave Soberana (1-Clic)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("email_login")}
                  className={`py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                    activeTab === "email_login"
                      ? "bg-slate-800 text-white shadow"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Correo y Clave</span>
                </button>
              </div>

              {/* Tab 1: Master Key / 1-Click Sovereign Access */}
              {activeTab === "master_key" && (
                <div className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-amber-300">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Acceso Rápido Autorizado para la Propietaria
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Este botón activa tu sesión de <strong>Super Administradora Soberana</strong> con acceso ilimitado a:
                      nuevas clínicas, contratistas, claves de licencia y centro de mando.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleSovereignOwnerAccess("Dueña de Plataforma · Alpha Vision")}
                      className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-xl shadow-amber-500/25 transition active:scale-[0.99] disabled:opacity-50"
                    >
                      <Crown className="w-5 h-5" />
                      <span>{isLoading ? "Autenticando..." : "👑 Entrar como Dueña de la Plataforma"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <p className="text-[11px] text-center text-slate-500 font-mono">
                      Token criptográfico: SOVEREIGN-OWNER-ALPHA-VISION-2026
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Standard Supabase Auth Form */}
              {activeTab === "email_login" && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Correo Electrónico de Propietaria</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@alphavisionm.com"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Contraseña Maestra</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition active:scale-[0.99] disabled:opacity-50"
                  >
                    <span>{isLoading ? "Iniciando..." : "Ingresar con Correo"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Direct Access Shortcut Grid */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                  Accesos Directos del Centro de Mando:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      enterDemo("administrador", "Dueña de Plataforma");
                      nav({ to: "/onboarding" });
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-between text-left transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      Alta Nueva Clínica
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      enterDemo("administrador", "Dueña de Plataforma");
                      nav({ to: "/admin/inspeccionar-entitlements" });
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-between text-left transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      Activar Claves
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      enterDemo("administrador", "Dueña de Plataforma");
                      nav({ to: "/admin/academia" });
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-between text-left transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" />
                      Academia Dueña
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      enterDemo("administrador", "Dueña de Plataforma");
                      nav({ to: "/contractors" });
                    }}
                    className="p-2.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center justify-between text-left transition"
                  >
                    <span className="flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-blue-400" />
                      Ver Contractors
                    </span>
                    <ChevronRight className="w-3 h-3 text-slate-600" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500 font-mono">
        Alpha Vision Method © 2026 · Plataforma Matriz Soberana · Vet Freedom OS & Contractor Field Service OS
      </footer>
    </div>
  );
}
