/**
 * ALPHA VISION METHOD — SUPER ADMIN MAESTRO & OWNER COMMAND CENTER (VERSION 9.0)
 * Control Central Unificado para las dos unidades de negocio:
 *   1. VET LIFE / VET FREEDOM OS
 *   2. ALPHA SERVICE OS / CONTRACTOR OS
 *
 * Divisiones y Módulos:
 *   - Visión Global Consolidada (Dual Master Cards)
 *   - División Vet Life (Directorio y Operaciones Clínicas)
 *   - División Contractor OS (Directorio y Operaciones de Oficios)
 *   - Centro de Activaciones de Cuentas (Máquina de 15 Estados)
 *   - Gestor Global de Dominios (Subdominios, DNS, SSL y Enrutamiento)
 *   - CRM Comercial GoHighLevel (Pipelines Diferenciados y Sincronización)
 *   - Detalle de Organización en 10 Pestañas
 */

import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Crown,
  Building2,
  Users,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Activity,
  Send,
  Copy,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Wrench,
  Globe,
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  UserCheck,
  Layers,
  Lock,
  Workflow,
  FileText,
  Check,
  X,
  Compass,
  Rocket,
  ArrowRight,
  Database,
  BarChart3,
  Sliders,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { Card, PageTitle, Btn } from "@/components/vf/ui";
import { askClaude, type ClaudeMessage } from "@/lib/ai/claudeClient";
import { ManualPaymentModal } from "@/features/system-administration/components/ManualPaymentModal";
import {
  getPlatformTenants,
  getPlatformDomains,
  transitionTenantAccountStatus,
  provisionPlatformTenant,
  suggestAvailableSlugs,
  resolveTenantByHostname,
  syncTenantToGhl,
  GHL_PIPELINES,
  type PlatformTenant,
  type PlatformDomain,
  type PlatformAccountStatus,
  type SaaSProductType,
  type HostnameResolutionResult,
} from "@/features/system-administration/application/platformControlPlane";

type AdminDivision =
  | "GLOBAL_DASHBOARD"
  | "VET_DIVISION"
  | "CONTRACTOR_DIVISION"
  | "ACTIVATIONS"
  | "DOMAINS"
  | "GHL_CRM";

type OrgTab =
  | "OVERVIEW"
  | "ACCOUNT"
  | "SUBSCRIPTION"
  | "DOMAIN"
  | "USERS"
  | "INTEGRATIONS"
  | "CRM"
  | "ACTIVITY"
  | "SUPPORT"
  | "SECURITY";

export function OwnerCommandCenter() {
  const [activeDivision, setActiveDivision] = useState<AdminDivision>("GLOBAL_DASHBOARD");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<PlatformTenant | null>(null);
  const [selectedOrgTab, setSelectedOrgTab] = useState<OrgTab>("OVERVIEW");

  // Filtros de directorio
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlatformAccountStatus | "ALL">("ALL");

  // Estado del Asistente Claude
  const [prompt, setPrompt] = useState("");
  const [chatLog, setChatLog] = useState<
    Array<{ sender: "user" | "ai"; text: string; actionUrl?: string; actionLabel?: string }>
  >([
    {
      sender: "ai",
      text: "¡Bienvenida a tu Centro de Mando Alpha Vision! Puedo ayudarte a activar cuentas, verificar subdominios, consultar métricas de Vet Life o Contractor OS y auditar la sincronización con GoHighLevel.",
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Simulador de Enrutamiento de Dominios en vivo
  const [testHostname, setTestHostname] = useState("luis.alphavisionm.com");
  const [resolutionResult, setResolutionResult] = useState<HostnameResolutionResult | null>(null);

  // Formulario rápido para nueva empresa
  const [showQuickProvision, setShowQuickProvision] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newOrgProduct, setNewOrgProduct] = useState<SaaSProductType>("VET_LIFE");
  const [newOrgIndustry, setNewOrgIndustry] = useState("VETERINARY");
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Cargar datos del Control Plane
  const allTenants = getPlatformTenants({
    searchQuery,
    account_status: statusFilter,
  });

  const vetTenants = allTenants.filter((t) => t.product_type === "VET_LIFE");
  const contractorTenants = allTenants.filter((t) => t.product_type === "CONTRACTOR_OS");
  const allDomains = getPlatformDomains();

  // Métricas agregadas
  const activeTenantsCount = allTenants.filter(
    (t) => t.account_status === "ACTIVE_PAID" || t.account_status === "ACTIVE_TRIAL"
  ).length;
  const trialTenantsCount = allTenants.filter((t) => t.account_status === "ACTIVE_TRIAL").length;
  const pendingActivationCount = allTenants.filter(
    (t) => t.account_status === "TRIAL_ELIGIBLE" || t.account_status === "WAITING_FOR_REVIEW"
  ).length;

  const vetMrrCop = vetTenants.reduce((acc, t) => acc + (t.plan_price_cop || 0), 0);
  const contractorMrrUsd = contractorTenants.reduce((acc, t) => acc + (t.plan_price_usd || 0), 0);

  // Handlers
  const handleTransitionStatus = async (
    tenantId: string,
    newStatus: PlatformAccountStatus,
    reason: string
  ) => {
    try {
      const res = await transitionTenantAccountStatus(tenantId, newStatus, reason);
      toast.success(`Cuenta actualizada a: ${newStatus}`);
      if (selectedTenant && selectedTenant.id === tenantId) {
        setSelectedTenant(res.tenant);
      }
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar estado");
    }
  };

  const handleTestResolution = async () => {
    try {
      const res = await resolveTenantByHostname(testHostname);
      setResolutionResult(res);
      toast.success(`Resolución exitosa: ${res.resolution_type}`);
    } catch (err: any) {
      toast.error(err?.message || "Error al resolver hostname");
    }
  };

  const handleCreateQuickTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgSlug) {
      toast.error("Por favor completa el nombre y el subdominio deseado.");
      return;
    }
    setIsProvisioning(true);
    try {
      const res = await provisionPlatformTenant({
        legal_name: newOrgName,
        display_name: newOrgName,
        requested_slug: newOrgSlug,
        product_type: newOrgProduct,
        industry: newOrgIndustry,
      });
      toast.success(`Empresa aprovisionada exitosamente: ${res.tenant.hostname}`);
      setShowQuickProvision(false);
      setNewOrgName("");
      setNewOrgSlug("");
    } catch (err: any) {
      toast.error(err?.message || "Error al aprovisionar");
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleSyncGhl = (tenantId: string, stageName: string) => {
    try {
      syncTenantToGhl(tenantId, stageName);
      toast.success(`Sincronizado con GHL en etapa: ${stageName}`);
    } catch {
      toast.error("Error al sincronizar con GHL");
    }
  };

  const handleCopyTrial = () => {
    const url = `${window.location.origin}/try/demo-trial-san-roque`;
    navigator.clipboard.writeText(url);
    toast.success("Enlace de prueba de 30 días copiado al portapapeles");
  };

  const handleSendPrompt = async (userText: string) => {
    const query = userText.trim();
    if (!query) return;

    setChatLog((prev) => [...prev, { sender: "user", text: query }]);
    setPrompt("");
    setIsAiLoading(true);

    try {
      const historyForClaude: ClaudeMessage[] = chatLog.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const claudeRes = await askClaude(query, historyForClaude);
      setChatLog((prev) => [...prev, { sender: "ai", text: claudeRes.text }]);
    } catch {
      setChatLog((prev) => [
        ...prev,
        { sender: "ai", text: "Hubo un error al procesar tu consulta con el asistente de plataforma." },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* =========================================================================
          1. SOVEREIGN MASTER BANNER (ACCESO EXCLUSIVO DE LA DUEÑA)
          ========================================================================= */}
      <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-r from-amber-950/80 via-neutral-900 to-amber-950/80 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Crown className="h-7 w-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black tracking-widest text-amber-400 uppercase">
                  Alpha Vision Method · Sovereign Platform Control Plane
                </span>
                <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                  👑 Mando Dueña
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
                Super Admin Maestro — Dos Negocios SaaS, Un Solo Cerebro
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Btn
              variant="outline"
              onClick={() => setShowQuickProvision(true)}
              className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 font-bold text-xs gap-1.5"
            >
              <Building2 className="h-3.5 w-3.5" />
              + Aprovisionar Empresa
            </Btn>
            <Link
              to="/admin/academia"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/20 px-3 py-1.5 text-xs font-bold text-amber-200 hover:bg-amber-500/30 transition-all"
            >
              <Compass className="h-3.5 w-3.5" />
              Academia Dueña (5 Módulos)
            </Link>
            <Link
              to="/admin/readiness"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-black/40 px-3 py-1.5 text-xs font-bold text-white hover:bg-white/10 transition-all"
            >
              <Rocket className="h-3.5 w-3.5 text-emerald-400" />
              Auditoría SRE
            </Link>
          </div>
        </div>

        {/* Division Selector Tabs */}
        <div className="mt-5 flex flex-wrap gap-1.5 border-t border-amber-500/20 pt-4">
          {[
            { id: "GLOBAL_DASHBOARD", label: "🌐 Visión Global Consolidada", count: allTenants.length },
            { id: "VET_DIVISION", label: "🐾 División Vet Life", count: vetTenants.length },
            { id: "CONTRACTOR_DIVISION", label: "🛠️ División Contractor OS", count: contractorTenants.length },
            { id: "ACTIVATIONS", label: "⚡ Centro de Activaciones", count: pendingActivationCount, alert: pendingActivationCount > 0 },
            { id: "DOMAINS", label: "🌐 Gestor de Dominios", count: allDomains.length },
            { id: "GHL_CRM", label: "📈 CRM GoHighLevel", count: 2 },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDivision(tab.id as AdminDivision)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all ${
                activeDivision === tab.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                  : "bg-black/30 text-amber-200/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  activeDivision === tab.id
                    ? "bg-black/30 text-black"
                    : tab.alert
                    ? "bg-rose-500 text-white animate-bounce"
                    : "bg-white/10 text-amber-200"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================================
          2. DIVISION: VISIÓN GLOBAL CONSOLIDADA
          ========================================================================= */}
      {activeDivision === "GLOBAL_DASHBOARD" && (
        <div className="space-y-8">
          {/* Dual Master Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* VET LIFE MASTER CARD */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-card to-background p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black text-emerald-400">
                    LÍNEA SAAS VETERINARIA
                  </span>
                  <h3 className="mt-3 text-2xl font-black text-foreground">
                    Vet Life / Vet Freedom OS
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Software clínico móvil, tele-triaje, OKVET y fórmulas COMVEZCOL
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                  <Stethoscope className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-muted/30 p-4 border border-border">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">Clínicas Activas</span>
                  <p className="text-xl font-black text-emerald-500">{vetTenants.length}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">MRR Estimado COP</span>
                  <p className="text-xl font-black text-foreground">
                    ${(vetMrrCop / 1000).toLocaleString("es-CO")}k
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">Salud OKVET</span>
                  <p className="text-sm font-black text-emerald-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-4 w-4" /> 100% Sinc
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Cliente Prioritario:</span>
                  <strong className="text-foreground">Dr. Luis Eduardo Ríos</strong>
                  <span className="text-emerald-500 font-bold">(luis.alphavisionm.com)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/vet"
                    className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-1"
                  >
                    Ver Landing /vet <ExternalLink className="h-3 w-3" />
                  </Link>
                  <button
                    onClick={() => setActiveDivision("VET_DIVISION")}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-700 transition-all"
                  >
                    Abrir División Vet →
                  </button>
                </div>
              </div>
            </div>

            {/* CONTRACTOR OS MASTER CARD */}
            <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-950/40 via-card to-background p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black text-amber-400">
                    LÍNEA SAAS DE SERVICIOS & OFICIOS
                  </span>
                  <h3 className="mt-3 text-2xl font-black text-foreground">
                    Alpha Service OS / Contractor OS
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Software de campo para HVAC, plomería, remodelación, cuadrillas y cotizaciones
                  </p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
                  <Wrench className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl bg-muted/30 p-4 border border-border">
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">Empresas Activas</span>
                  <p className="text-xl font-black text-amber-500">{contractorTenants.length}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">MRR Estimado USD</span>
                  <p className="text-xl font-black text-foreground">${contractorMrrUsd} USD</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-muted-foreground">Modo Calle</span>
                  <p className="text-sm font-black text-amber-600 flex items-center gap-1 mt-1">
                    <CheckCircle2 className="h-4 w-4" /> Bilingüe (EN/ES)
                  </p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Oficios Soportados:</span>
                  <strong className="text-foreground">8 Industrias de Construcción</strong>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to="/contractors"
                    className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                  >
                    Ver Panel /contractors <ExternalLink className="h-3 w-3" />
                  </Link>
                  <button
                    onClick={() => setActiveDivision("CONTRACTOR_DIVISION")}
                    className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-black text-white hover:bg-amber-700 transition-all"
                  >
                    Abrir División Contractors →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-4 border-border">
              <span className="text-xs font-bold text-muted-foreground">Total Organizaciones</span>
              <p className="mt-1 text-2xl font-black text-foreground">{allTenants.length}</p>
              <span className="text-[11px] text-emerald-600 font-bold">100% Aislamiento RLS</span>
            </Card>
            <Card className="p-4 border-border">
              <span className="text-xs font-bold text-muted-foreground">Pruebas 30 Días Activas</span>
              <p className="mt-1 text-2xl font-black text-amber-500">{trialTenantsCount}</p>
              <span className="text-[11px] text-muted-foreground">Sin tarjeta de crédito</span>
            </Card>
            <Card className="p-4 border-border">
              <span className="text-xs font-bold text-muted-foreground">Subdominios en Red</span>
              <p className="mt-1 text-2xl font-black text-indigo-500">{allDomains.length}</p>
              <span className="text-[11px] text-indigo-600 font-bold">Cloudflare Wildcard</span>
            </Card>
            <Card className="p-4 border-border">
              <span className="text-xs font-bold text-muted-foreground">Pendientes Activación</span>
              <p className="mt-1 text-2xl font-black text-rose-500">{pendingActivationCount}</p>
              <span className="text-[11px] text-rose-600 font-bold">Requieren Revisión</span>
            </Card>
          </div>

          {/* Asistente Claude de Plataforma */}
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Asistente Ejecutivo de Alpha Vision</h3>
                <p className="text-xs text-muted-foreground">
                  Pregunta en lenguaje natural sobre finanzas, activaciones, DNS o estado de cualquier tenant.
                </p>
              </div>
            </div>

            <div className="mt-4 max-h-60 space-y-3 overflow-y-auto pr-2">
              {chatLog.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${
                      m.sender === "user"
                        ? "bg-primary text-primary-foreground font-medium"
                        : "bg-muted text-foreground border border-border"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleSendPrompt(prompt);
              }}
              className="mt-4 flex gap-2"
            >
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Escribe tu instrucción o pregunta sobre las clínicas o contratistas..."
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Btn type="submit" disabled={isAiLoading || !prompt.trim()} className="font-bold text-xs gap-1">
                <Send className="h-3 w-3" />
                {isAiLoading ? "Consultando..." : "Preguntar"}
              </Btn>
            </form>
          </Card>
        </div>
      )}

      {/* =========================================================================
          3. DIVISION: VET LIFE DIVISION
          ========================================================================= */}
      {activeDivision === "VET_DIVISION" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <Stethoscope className="h-5 w-5 text-emerald-500" />
                División Vet Life — Clínicas y Médicos Veterinarios
              </h3>
              <p className="text-xs text-muted-foreground">
                Gestión comercial y operativa sin contaminación de funciones de construcción.
              </p>
            </div>
            <Link
              to="/onboarding"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-black text-white hover:bg-emerald-700"
            >
              + Alta Veterinaria (/onboarding)
            </Link>
          </div>

          {/* Tabla Veterinaria */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Clínica / Profesional</th>
                  <th className="p-3">Subdominio</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">OKVET Data</th>
                  <th className="p-3">GHL Stage</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vetTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{t.display_name}</div>
                      <div className="text-[10px] text-muted-foreground">{t.legal_name}</div>
                    </td>
                    <td className="p-3">
                      <a
                        href={`https://${t.hostname}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-emerald-600 font-bold hover:underline flex items-center gap-1"
                      >
                        {t.hostname} <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="p-3 font-medium">
                      {t.plan_name}
                      <div className="text-[10px] text-muted-foreground">
                        ${(t.plan_price_cop || 0).toLocaleString("es-CO")} COP/mes
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          t.account_status === "ACTIVE_PAID"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : t.account_status === "ACTIVE_TRIAL"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {t.account_status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px]">
                      {t.normalized_slug === "luis" ? (
                        <span className="font-bold text-emerald-600">46 Mascotas / 43 Fórmulas</span>
                      ) : (
                        <span className="text-muted-foreground">Pendiente Ingesta</span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] font-medium text-muted-foreground">
                      {t.ghl_stage_name || "Sin GHL"}
                    </td>
                    <td className="p-3 text-right">
                      <Btn
                        variant="outline"
                        onClick={() => setSelectedTenant(t)}
                        className="text-[11px] font-bold h-7 px-2"
                      >
                        Ver Detalle →
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. DIVISION: CONTRACTOR OS DIVISION
          ========================================================================= */}
      {activeDivision === "CONTRACTOR_DIVISION" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-500" />
                División Contractor OS — Empresas de Servicios y Oficios
              </h3>
              <p className="text-xs text-muted-foreground">
                Directorio por industria: HVAC, Plomería, Electricidad, Remodelación y Techados.
              </p>
            </div>
            <Link
              to="/contractors"
              className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-black text-white hover:bg-amber-700"
            >
              Abrir Operación en Calle →
            </Link>
          </div>

          {/* Tabla Contractor */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Empresa / Contratista</th>
                  <th className="p-3">Industria / Oficio</th>
                  <th className="p-3">Subdominio</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3">GHL Stage</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {contractorTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{t.display_name}</div>
                      <div className="text-[10px] text-muted-foreground">{t.legal_name}</div>
                    </td>
                    <td className="p-3">
                      <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-600 uppercase">
                        {t.industry}
                      </span>
                    </td>
                    <td className="p-3">
                      <a
                        href={`https://${t.hostname}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-mono text-amber-600 font-bold hover:underline flex items-center gap-1"
                      >
                        {t.hostname} <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="p-3 font-medium">
                      {t.plan_name}
                      <div className="text-[10px] text-muted-foreground">${t.plan_price_usd} USD/mes</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          t.account_status === "ACTIVE_PAID"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : t.account_status === "ACTIVE_TRIAL"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {t.account_status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] font-medium text-muted-foreground">
                      {t.ghl_stage_name || "Sin GHL"}
                    </td>
                    <td className="p-3 text-right">
                      <Btn
                        variant="outline"
                        onClick={() => setSelectedTenant(t)}
                        className="text-[11px] font-bold h-7 px-2"
                      >
                        Ver Detalle →
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. DIVISION: CENTRO DE ACTIVACIONES (15 ESTADOS)
          ========================================================================= */}
      {activeDivision === "ACTIVATIONS" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-500" />
                Centro de Activaciones & Gobernanza de Cuentas
              </h3>
              <p className="text-xs text-muted-foreground">
                Control de acceso real. Ninguna cuenta entra a producción sin verificación de requisitos.
              </p>
            </div>

            {/* Filtro por estado */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-bold">Filtrar:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground font-bold"
              >
                <option value="ALL">Todos los Estados ({allTenants.length})</option>
                <option value="ACTIVE_PAID">ACTIVE_PAID</option>
                <option value="ACTIVE_TRIAL">ACTIVE_TRIAL</option>
                <option value="TRIAL_ELIGIBLE">TRIAL_ELIGIBLE</option>
                <option value="WAITING_FOR_REVIEW">WAITING_FOR_REVIEW</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Subdominio</th>
                  <th className="p-3">Estado de Cuenta</th>
                  <th className="p-3">Facturación</th>
                  <th className="p-3 text-right">Comandos de Activación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{t.display_name}</div>
                      <div className="text-[10px] text-muted-foreground">{t.country}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-black ${
                          t.product_type === "VET_LIFE"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {t.product_type}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-foreground">{t.hostname}</td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                          t.account_status === "ACTIVE_PAID"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : t.account_status === "ACTIVE_TRIAL"
                            ? "bg-amber-500/10 text-amber-600"
                            : t.account_status === "SUSPENDED"
                            ? "bg-rose-500/10 text-rose-600"
                            : "bg-blue-500/10 text-blue-600"
                        }`}
                      >
                        {t.account_status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] font-bold text-muted-foreground">
                      {t.billing_status}
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {t.account_status !== "ACTIVE_PAID" && (
                          <button
                            onClick={() =>
                              handleTransitionStatus(
                                t.id,
                                "ACTIVE_PAID",
                                "Activación de suscripción paga por la dueña"
                              )
                            }
                            className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-black text-white hover:bg-emerald-700"
                          >
                            Activar Pago
                          </button>
                        )}
                        {t.account_status !== "ACTIVE_TRIAL" && t.account_status !== "ACTIVE_PAID" && (
                          <button
                            onClick={() =>
                              handleTransitionStatus(
                                t.id,
                                "ACTIVE_TRIAL",
                                "Activación de prueba 30 días por la dueña"
                              )
                            }
                            className="rounded-md bg-amber-600 px-2 py-1 text-[10px] font-black text-white hover:bg-amber-700"
                          >
                            Activar 30D
                          </button>
                        )}
                        {t.account_status !== "SUSPENDED" && (
                          <button
                            onClick={() =>
                              handleTransitionStatus(
                                t.id,
                                "SUSPENDED",
                                "Suspensión administrativa preventiva"
                              )
                            }
                            className="rounded-md bg-rose-600 px-2 py-1 text-[10px] font-black text-white hover:bg-rose-700"
                          >
                            Suspender
                          </button>
                        )}
                        {t.account_status === "SUSPENDED" && (
                          <button
                            onClick={() =>
                              handleTransitionStatus(
                                t.id,
                                "ACTIVE_PAID",
                                "Reactivación aprobada por la dueña"
                              )
                            }
                            className="rounded-md bg-emerald-600 px-2 py-1 text-[10px] font-black text-white hover:bg-emerald-700"
                          >
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. DIVISION: GESTOR DE DOMINIOS & RESOLVER
          ========================================================================= */}
      {activeDivision === "DOMAINS" && (
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-500" />
              Gestor Global de Dominios & Tenant Routing Resolver
            </h3>
            <p className="text-xs text-muted-foreground">
              Inspección de subdominios, certificados TLS, reservas permanentes y comprobador de resolución.
            </p>
          </div>

          {/* Comprobador de Resolución de Hostnames */}
          <Card className="p-5 border-border bg-gradient-to-r from-indigo-950/20 to-card">
            <h4 className="text-xs font-black uppercase text-indigo-400">
              ⚡ Comprobador Instrumental de Enrutamiento (Gateway Simulator)
            </h4>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input
                type="text"
                value={testHostname}
                onChange={(e) => setTestHostname(e.target.value)}
                placeholder="ej: luis.alphavisionm.com o desconocido.alphavisionm.com"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-xs font-mono text-foreground focus:ring-2 focus:ring-primary"
              />
              <Btn onClick={handleTestResolution} className="font-bold text-xs gap-1.5">
                <Activity className="h-3.5 w-3.5" />
                Resolver Hostname
              </Btn>
            </div>

            {resolutionResult && (
              <div className="mt-4 rounded-xl border border-border bg-muted/40 p-3 text-xs font-mono">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <span>Resultado:</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      resolutionResult.resolution_type === "NOT_FOUND"
                        ? "bg-rose-500/20 text-rose-400"
                        : "bg-emerald-500/20 text-emerald-400"
                    }`}
                  >
                    {resolutionResult.resolution_type}
                  </span>
                  <span>→ Ruta de Destino:</span>
                  <strong className="text-primary">{resolutionResult.target_route}</strong>
                </div>
                {resolutionResult.display_name && (
                  <div className="mt-1 text-muted-foreground">
                    Tenant: {resolutionResult.display_name} ({resolutionResult.normalized_slug})
                  </div>
                )}
                {resolutionResult.message && (
                  <div className="mt-1 text-rose-400">{resolutionResult.message}</div>
                )}
              </div>
            )}
          </Card>

          {/* Tabla de Dominios Registrados */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Hostname</th>
                  <th className="p-3">Tipo de Dominio</th>
                  <th className="p-3">Producto Destino</th>
                  <th className="p-3">DNS Status</th>
                  <th className="p-3">TLS / SSL</th>
                  <th className="p-3">Enrutamiento</th>
                  <th className="p-3">Reserva</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allDomains.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground">
                      <a
                        href={`https://${d.hostname}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {d.hostname} <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </a>
                    </td>
                    <td className="p-3 font-medium text-muted-foreground">{d.domain_type}</td>
                    <td className="p-3">
                      <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-black text-foreground">
                        {d.product_type}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <Check className="h-3.5 w-3.5" /> {d.verification_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-500 font-bold flex items-center gap-1">
                        <Lock className="h-3.5 w-3.5" /> {d.tls_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          d.routing_status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-rose-500/10 text-rose-600"
                        }`}
                      >
                        {d.routing_status}
                      </span>
                    </td>
                    <td className="p-3">
                      {d.reserved ? (
                        <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                          🔒 PROTEGIDO
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">Libre</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. DIVISION: GHL CRM PIPELINES & COMERCIAL
          ========================================================================= */}
      {activeDivision === "GHL_CRM" && (
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              Sincronización Comercial con GoHighLevel (Dual Pipeline Hub)
            </h3>
            <p className="text-xs text-muted-foreground">
              Pipelines comerciales B2B separados para la venta de suscripciones de Vet Life y Contractor OS.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Pipeline Vet Life */}
            <Card className="p-5 border-border">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h4 className="font-black text-foreground">Pipeline: Alpha Vet Life Sales</h4>
                  <p className="text-[11px] text-muted-foreground">ID: pipe_alpha_vet_sales_v1</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                  VET_LIFE
                </span>
              </div>
              <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                {GHL_PIPELINES.VET_LIFE.stages.map((stage) => {
                  const matchingCount = vetTenants.filter((t) => t.ghl_stage_name === stage.name).length;
                  return (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs"
                    >
                      <span className="font-bold text-foreground">
                        {stage.order}. {stage.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          matchingCount > 0 ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {matchingCount} empresas
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Pipeline Contractor OS */}
            <Card className="p-5 border-border">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h4 className="font-black text-foreground">Pipeline: Alpha Contractor OS Sales</h4>
                  <p className="text-[11px] text-muted-foreground">ID: pipe_alpha_contractor_sales_v1</p>
                </div>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600">
                  CONTRACTOR_OS
                </span>
              </div>
              <div className="mt-4 space-y-2 max-h-72 overflow-y-auto pr-1">
                {GHL_PIPELINES.CONTRACTOR_OS.stages.map((stage) => {
                  const matchingCount = contractorTenants.filter((t) => t.ghl_stage_name === stage.name).length;
                  return (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/20 px-3 py-2 text-xs"
                    >
                      <span className="font-bold text-foreground">
                        {stage.order}. {stage.name}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          matchingCount > 0 ? "bg-amber-600 text-white" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {matchingCount} empresas
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: APROVISIONAMIENTO RÁPIDO DE TENANT
          ========================================================================= */}
      {showQuickProvision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-amber-500/40 bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="text-lg font-black text-foreground flex items-center gap-2">
                <Building2 className="h-5 w-5 text-amber-500" />
                Aprovisionar Nueva Empresa / Tenant
              </h3>
              <button
                onClick={() => setShowQuickProvision(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickTenant} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-foreground">Línea de Producto SaaS</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewOrgProduct("VET_LIFE");
                      setNewOrgIndustry("VETERINARY");
                    }}
                    className={`rounded-xl border p-2.5 font-bold transition-all ${
                      newOrgProduct === "VET_LIFE"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-600"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    🐾 Vet Life (Veterinaria)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewOrgProduct("CONTRACTOR_OS");
                      setNewOrgIndustry("PLUMBING");
                    }}
                    className={`rounded-xl border p-2.5 font-bold transition-all ${
                      newOrgProduct === "CONTRACTOR_OS"
                        ? "border-amber-500 bg-amber-500/10 text-amber-600"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    🛠️ Contractor OS (Oficios)
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground">Nombre Comercial de la Empresa</label>
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => {
                    setNewOrgName(e.target.value);
                    if (!newOrgSlug) {
                      setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ""));
                    }
                  }}
                  placeholder="ej: Clínica Veterinaria El Poblado o Butler Yard Masters"
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-foreground">Subdominio Solicitado (*.alphavisionm.com)</label>
                <div className="mt-1 flex items-center">
                  <input
                    type="text"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9\-]/g, ""))}
                    placeholder="elpoblado"
                    className="flex-1 rounded-l-xl border border-r-0 border-border bg-background px-3 py-2 font-mono text-foreground focus:ring-2 focus:ring-primary"
                    required
                  />
                  <span className="rounded-r-xl border border-border bg-muted px-3 py-2 font-mono text-muted-foreground font-bold">
                    .alphavisionm.com
                  </span>
                </div>
              </div>

              {newOrgProduct === "CONTRACTOR_OS" && (
                <div>
                  <label className="font-bold text-foreground">Industria / Oficio Principal</label>
                  <select
                    value={newOrgIndustry}
                    onChange={(e) => setNewOrgIndustry(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-foreground font-bold"
                  >
                    <option value="HVAC">HVAC & Aire Acondicionado</option>
                    <option value="PLUMBING">Fontanería & Plomería</option>
                    <option value="ELECTRICAL">Electricidad Residencial & Comercial</option>
                    <option value="LANDSCAPING">Paisajismo & Jardinería</option>
                    <option value="PAINTING">Pintura Profesional</option>
                    <option value="REMODELING">Remodelación General</option>
                    <option value="ROOFING">Techos & Cubiertas</option>
                  </select>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                <Btn variant="outline" type="button" onClick={() => setShowQuickProvision(false)}>
                  Cancelar
                </Btn>
                <Btn type="submit" disabled={isProvisioning} className="font-bold gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  {isProvisioning ? "Aprovisionando..." : "Crear y Activar"}
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: DETALLE DE ORGANIZACIÓN EN 10 PESTAÑAS (§ 463)
          ========================================================================= */}
      {selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 shadow-2xl">
            {/* Cabecera del Tenant */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                      selectedTenant.product_type === "VET_LIFE"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {selectedTenant.product_type}
                  </span>
                  <span className="text-xs text-muted-foreground">· ID: {selectedTenant.tenant_id}</span>
                </div>
                <h3 className="mt-1 text-2xl font-black text-foreground">{selectedTenant.display_name}</h3>
                <p className="text-xs text-muted-foreground">{selectedTenant.legal_name}</p>
              </div>
              <button
                onClick={() => setSelectedTenant(null)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Pestañas de la Organización */}
            <div className="mt-4 flex flex-wrap gap-1 border-b border-border pb-2">
              {(
                [
                  "OVERVIEW",
                  "ACCOUNT",
                  "SUBSCRIPTION",
                  "DOMAIN",
                  "USERS",
                  "INTEGRATIONS",
                  "CRM",
                  "ACTIVITY",
                  "SUPPORT",
                  "SECURITY",
                ] as OrgTab[]
              ).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedOrgTab(tab)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedOrgTab === tab
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Contenido de la pestaña */}
            <div className="mt-6 text-xs space-y-4">
              {selectedOrgTab === "OVERVIEW" && (
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 border-border">
                    <span className="font-bold text-muted-foreground">Subdominio Asignado</span>
                    <p className="font-mono text-sm font-bold text-primary mt-1">{selectedTenant.hostname}</p>
                  </Card>
                  <Card className="p-4 border-border">
                    <span className="font-bold text-muted-foreground">Estado de Cuenta</span>
                    <p className="text-sm font-bold text-emerald-600 mt-1">{selectedTenant.account_status}</p>
                  </Card>
                  <Card className="p-4 border-border">
                    <span className="font-bold text-muted-foreground">Plan Comercial</span>
                    <p className="text-sm font-bold text-foreground mt-1">{selectedTenant.plan_name}</p>
                  </Card>
                  <Card className="p-4 border-border">
                    <span className="font-bold text-muted-foreground">Etapa GHL Sales</span>
                    <p className="text-sm font-bold text-purple-600 mt-1">{selectedTenant.ghl_stage_name}</p>
                  </Card>
                </div>
              )}

              {selectedOrgTab === "SUBSCRIPTION" && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground">Gestión de Suscripción SaaS</p>
                  <div className="rounded-xl border border-border p-4 bg-muted/20">
                    <div>Plan Actual: <strong>{selectedTenant.plan_name}</strong></div>
                    <div>Precio: <strong>{selectedTenant.plan_price_cop ? `$${selectedTenant.plan_price_cop.toLocaleString('es-CO')} COP/mes` : `$${selectedTenant.plan_price_usd} USD/mes`}</strong></div>
                    <div>Estado Facturación: <strong>{selectedTenant.billing_status}</strong></div>
                  </div>
                </div>
              )}

              {selectedOrgTab === "DOMAIN" && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground">Configuración de Hostname y TLS</p>
                  <div className="rounded-xl border border-border p-4 bg-muted/20 font-mono">
                    <div>Hostname: {selectedTenant.hostname}</div>
                    <div>Slug Normalizado: {selectedTenant.normalized_slug}</div>
                    <div>DNS: 185.158.133.1 (Cloudflare Active)</div>
                    <div>Certificado: Let's Encrypt TLS 1.3</div>
                  </div>
                </div>
              )}

              {selectedOrgTab === "CRM" && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground">GoHighLevel Integration</p>
                  <div className="rounded-xl border border-border p-4 bg-muted/20">
                    <div>Contact ID: <code>{selectedTenant.ghl_contact_id}</code></div>
                    <div>Opportunity ID: <code>{selectedTenant.ghl_opportunity_id}</code></div>
                    <div>Etapa Actual: <strong>{selectedTenant.ghl_stage_name}</strong></div>
                    <div className="mt-3 flex gap-2">
                      <Btn
                        onClick={() => handleSyncGhl(selectedTenant.id, "CUSTOMER ACTIVE")}
                        className="text-xs font-bold"
                      >
                        Sincronizar a CUSTOMER ACTIVE
                      </Btn>
                      <Btn
                        variant="outline"
                        onClick={() => handleSyncGhl(selectedTenant.id, "AT RISK")}
                        className="text-xs font-bold"
                      >
                        Marcar AT RISK
                      </Btn>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrgTab === "SECURITY" && (
                <div className="space-y-3">
                  <p className="text-sm font-bold text-foreground">Aislamiento de Datos y Políticas RLS</p>
                  <div className="rounded-xl border border-border p-4 bg-muted/20">
                    <div>Aislamiento Multi-Tenant: <strong className="text-emerald-600">100% Forzado en PostgreSQL 17</strong></div>
                    <div>Tenant Reference: <code>{selectedTenant.tenant_id}</code></div>
                    <div>Fronteras de Historia Clínica: <strong className="text-emerald-600">Totalmente Inaccesible para Contractor OS</strong></div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <Btn onClick={() => setSelectedTenant(null)}>
                Cerrar Ficha
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago Manual */}
      <ManualPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={() => {
          toast.success("Pago registrado correctamente");
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
}
