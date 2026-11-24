/**
 * ALPHA VISION METHOD — SUPER ADMIN MAESTRO 2.0 (PARTE 10)
 * SaaS Business Control Plane & Multi-Product Management
 * Products Governed:
 *   1. VET LIFE / VET FREEDOM OS (Dr. Luis Eduardo Ríos anchor)
 *   2. ALPHA SERVICE OS / CONTRACTOR OS (Trade service businesses)
 * 18 Navigation Divisions (§ 472):
 *   01 COMMAND CENTER, 02 VET LIFE, 03 CONTRACTOR OS, 04 ORGANIZATIONS,
 *   05 ACCOUNTS & ACTIVATIONS, 06 FEATURES & MODULES, 07 PRICING & PLANS,
 *   08 AI CONTROL CENTER, 09 AI USAGE, 10 BILLING & SUBSCRIPTIONS,
 *   11 DOMAINS, 12 GHL CRM, 13 INTEGRATIONS, 14 AUTOMATIONS,
 *   15 CUSTOMER SUCCESS, 16 SUPPORT, 17 AUDIT & SECURITY, 18 SYSTEM CONFIGURATION.
 */

import { useState, useMemo } from "react";
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
import {
  FEATURE_REGISTRY_CATALOG,
  VET_LIFE_PLANS,
  CONTRACTOR_OS_PLANS,
  resolveFeatureEntitlement,
  grantTenantFeatureOverride,
  revokeTenantFeatureOverride,
  type PlatformFeature,
  type TenantFeatureOverride,
  type FeatureEntitlementResult,
  type SaaSPlanPackaging,
} from "@/features/system-administration/application/featureGovernance";
import {
  OFFICIAL_CLAUDE_PRICING,
  calculateClaudeCostUsd,
  reserveAiQuota,
  reconcileAiUsage,
  getTenantBudget,
  updateTenantBudgetLimit,
  toggleTenantAiPause,
  getRecentAiEvents,
  getRecentAiAlerts,
  type AIUsageEvent,
  type AIUsageAlert,
  type AIBudgetPolicy,
} from "@/services/aiGatewayService";

export type AdminDivision =
  | "GLOBAL_DASHBOARD"     // 01 COMMAND CENTER
  | "VET_DIVISION"         // 02 VET LIFE
  | "CONTRACTOR_DIVISION"  // 03 CONTRACTOR OS
  | "ORGANIZATIONS"        // 04 ORGANIZATIONS
  | "ACTIVATIONS"          // 05 ACCOUNTS & ACTIVATIONS
  | "FEATURES"             // 06 FEATURES & MODULES
  | "PRICING_PLANS"        // 07 PRICING & PLANS
  | "AI_CONTROL"           // 08 AI CONTROL CENTER
  | "AI_USAGE"             // 09 AI USAGE
  | "BILLING"              // 10 BILLING & SUBSCRIPTIONS
  | "DOMAINS"              // 11 DOMAINS
  | "GHL_CRM"              // 12 GHL CRM
  | "INTEGRATIONS"         // 13 INTEGRATIONS
  | "AUTOMATIONS"          // 14 AUTOMATIONS
  | "CUSTOMER_SUCCESS"     // 15 CUSTOMER SUCCESS
  | "SUPPORT"              // 16 SUPPORT
  | "SECURITY_AUDIT"       // 17 AUDIT & SECURITY
  | "SYSTEM_CONFIG";       // 18 SYSTEM CONFIGURATION

type OrgTab =
  | "OVERVIEW"
  | "ACCOUNT"
  | "SUBSCRIPTION"
  | "FEATURES & ENTITLEMENTS"
  | "AI USAGE & BUDGETS"
  | "DOMAIN"
  | "USERS"
  | "INTEGRATIONS"
  | "CRM"
  | "ACTIVITY"
  | "SUPPORT"
  | "SECURITY";

export function OwnerCommandCenter() {
  const [activeDivision, setActiveDivision] = useState<AdminDivision>("GLOBAL_DASHBOARD");
  const [divisionCategoryFilter, setDivisionCategoryFilter] = useState<string>("ALL");
  const [divisionSearchQuery, setDivisionSearchQuery] = useState<string>("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<PlatformTenant | null>(null);
  const [selectedOrgTab, setSelectedOrgTab] = useState<OrgTab>("OVERVIEW");

  // Filtros de directorio
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PlatformAccountStatus | "ALL">("ALL");

  // Estado del Asistente Claude
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ClaudeMessage[]>([]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Estados de prueba de enrutamiento
  const [testHostname, setTestHostname] = useState("luis.alphavisionm.com");
  const [resolutionResult, setResolutionResult] = useState<HostnameResolutionResult | null>(null);

  // Estados de aprovisionamiento rápido
  const [showQuickProvision, setShowQuickProvision] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgSlug, setNewOrgSlug] = useState("");
  const [newOrgProduct, setNewOrgProduct] = useState<SaaSProductType>("VET_LIFE");
  const [newOrgIndustry, setNewOrgIndustry] = useState("VETERINARY");
  const [isProvisioning, setIsProvisioning] = useState(false);

  // Estado de Features & Overrides
  const [featureSearch, setFeatureSearch] = useState("");
  const [featureProductFilter, setFeatureProductFilter] = useState<string>("ALL");
  const [selectedFeatureForOverride, setSelectedFeatureForOverride] = useState<PlatformFeature | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [overrideDays, setOverrideDays] = useState(30);

  // Estado de Pricing Studio
  const [activePricingVertical, setActivePricingVertical] = useState<"VET_LIFE" | "CONTRACTOR_OS">("VET_LIFE");

  // Estado de AI Usage Calculator
  const [calcInputTokens, setCalcInputTokens] = useState<number>(25000);
  const [calcOutputTokens, setCalcOutputTokens] = useState<number>(1200);
  const [calcCacheWrite, setCalcCacheWrite] = useState<number>(10000);
  const [calcCacheRead, setCalcCacheRead] = useState<number>(4000);
  const [calcSelectedModel, setCalcSelectedModel] = useState<string>("claude-3-5-sonnet-20241022");

  // Datos reactivos
  const allTenants = useMemo(() => getPlatformTenants(), [activeDivision, showQuickProvision]);
  const allDomains = useMemo(() => getPlatformDomains(), [activeDivision, showQuickProvision]);
  const recentAiEvents = useMemo(() => getRecentAiEvents(15), [activeDivision]);

  const vetTenants = useMemo(() => allTenants.filter((t) => t.product_type === "VET_LIFE"), [allTenants]);
  const contractorTenants = useMemo(() => allTenants.filter((t) => t.product_type === "CONTRACTOR_OS"), [allTenants]);

  // Filtro de features
  const filteredFeatures = useMemo(() => {
    return FEATURE_REGISTRY_CATALOG.filter((f) => {
      const matchSearch =
        f.display_name.toLowerCase().includes(featureSearch.toLowerCase()) ||
        f.feature_id.toLowerCase().includes(featureSearch.toLowerCase()) ||
        f.module_name.toLowerCase().includes(featureSearch.toLowerCase());
      const matchProduct = featureProductFilter === "ALL" || f.product_id === featureProductFilter;
      return matchSearch && matchProduct;
    });
  }, [featureSearch, featureProductFilter]);

  // Métricas financieras
  const vetMrr = useMemo(
    () =>
      vetTenants
        .filter((t) => t.billing_status === "PAID")
        .reduce((sum, t) => sum + (t.plan_price_cop || (t.plan_code === "VET_SOLO" ? 189000 : 389000)), 0),
    [vetTenants]
  );

  const contractorMrr = useMemo(
    () =>
      contractorTenants
        .filter((t) => t.billing_status === "PAID")
        .reduce((sum, t) => sum + (t.plan_price_usd || (t.plan_code === "CONTRACTOR_GROWTH" ? 197 : 97)), 0),
    [contractorTenants]
  );

  const pendingActivationCount = useMemo(
    () => allTenants.filter((t) => t.account_status === "WAITING_FOR_REVIEW" || t.account_status === "TRIAL_ELIGIBLE").length,
    [allTenants]
  );

  // Cálculo en vivo del simulador de costos
  const simulatedCostUsd = useMemo(() => {
    return calculateClaudeCostUsd(calcSelectedModel, {
      inputTokens: Number(calcInputTokens) || 0,
      outputTokens: Number(calcOutputTokens) || 0,
      cacheCreationTokens: Number(calcCacheWrite) || 0,
      cacheReadTokens: Number(calcCacheRead) || 0,
    });
  }, [calcSelectedModel, calcInputTokens, calcOutputTokens, calcCacheWrite, calcCacheRead]);

  // Manejo de cambio de estado
  const handleTransitionStatus = async (tenantId: string, nextStatus: PlatformAccountStatus, reason: string) => {
    try {
      const res = await transitionTenantAccountStatus(tenantId, nextStatus, reason, "Super Admin Maestro (Dueña)");
      toast.success(`Estado actualizado: ${res.tenant.account_status} (${res.tenant.display_name})`);
      setActiveDivision(activeDivision);
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar estado");
    }
  };

  // Manejo de prueba de dominio
  const handleTestDomainResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testHostname.trim()) return;
    const res = await resolveTenantByHostname(testHostname.trim());
    setResolutionResult(res);
    if (res.resolution_type !== "NOT_FOUND") {
      toast.success(`Enrutamiento exitoso: ${res.target_route} [${res.product_type}]`);
    } else {
      toast.error(`Dominio no reconocido: ${res.hostname}`);
    }
  };

  // Creación rápida de inquilino
  const handleCreateQuickTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim()) {
      toast.error("Ingresa el nombre comercial de la empresa");
      return;
    }
    setIsProvisioning(true);
    try {
      const res = await provisionPlatformTenant({
        display_name: newOrgName,
        legal_name: `${newOrgName} S.A.S.`,
        product_type: newOrgProduct,
        industry: newOrgProduct === "VET_LIFE" ? "VETERINARY" : "FIELD_SERVICES",
        exact_niche: newOrgIndustry,
        requested_slug: newOrgSlug,
        country: "CO",
        currency: newOrgProduct === "VET_LIFE" ? "COP" : "USD",
        owner_email: `contacto@${newOrgSlug || "empresa"}.com`,
      });
      toast.success(`¡Empresa ${res.tenant.display_name} aprovisionada con subdominio ${res.tenant.normalized_slug}.alphavisionm.com!`);
      setShowQuickProvision(false);
      setNewOrgName("");
      setNewOrgSlug("");
    } catch (err: any) {
      toast.error(err.message || "Error al aprovisionar");
    } finally {
      setIsProvisioning(false);
    }
  };

  // Otorgar Override a un Tenant
  const handleGrantOverride = (tenantId: string, featureId: string) => {
    if (!overrideReason.trim()) {
      toast.error("Debes indicar un motivo comercial o de soporte");
      return;
    }
    const expires = new Date();
    expires.setDate(expires.getDate() + Number(overrideDays));

    grantTenantFeatureOverride({
      tenant_id: tenantId,
      feature_id: featureId,
      override_type: "TRIAL_GRANT",
      enabled: true,
      reason: overrideReason,
      approved_by: "Dueña de Plataforma",
      expires_at: expires.toISOString(),
    });

    toast.success(`Excepción otorgada para ${featureId} por ${overrideDays} días.`);
    setSelectedFeatureForOverride(null);
    setOverrideReason("");
  };

  // Simular Resolución de Entitlement
  const handleSimulateEntitlement = (featureId: string) => {
    const res = resolveFeatureEntitlement(
      selectedTenant ? selectedTenant.tenant_id : "11111111-1111-1111-1111-111111111111",
      featureId,
      {
        userRole: "VET",
        tenantProduct: selectedTenant ? selectedTenant.product_type : "VET_LIFE",
      }
    );
    if (res.allowed) {
      toast.success(`RESOLUCIÓN 14 PASOS: ${res.status} (Acceso Autorizado)`);
    } else {
      toast.warning(`RESOLUCIÓN 14 PASOS: ${res.status} (${res.reason})`);
    }
  };

  // Consulta IA Claude
  const handleAskAi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoadingAi) return;

    const userPrompt = prompt.trim();
    const userMsg: ClaudeMessage = { role: "user", content: userPrompt };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setPrompt("");
    setIsLoadingAi(true);

    try {
      const response = await askClaude(
        userPrompt,
        messages,
        {
          systemPrompt:
            "Eres el Asistente Ejecutivo del Super Admin de Alpha Vision Method. Ayuda a la Dueña a gobernar Vet Life y Contractor OS con datos precisos de métricas, RLS, subdominios y costos de tokens de Claude.",
        }
      );
      setMessages([...newHistory, { role: "assistant", content: response.text }]);
    } catch {
      toast.error("Error al consultar el Asistente Ejecutivo.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Las 18 divisiones completas
  const ALL_18_DIVISIONS = [
    { id: "GLOBAL_DASHBOARD", label: "01. 🌐 Command Center", count: allTenants.length, cat: "CORE" },
    { id: "VET_DIVISION", label: "02. 🐾 División Vet Life", count: vetTenants.length, cat: "CORE" },
    { id: "CONTRACTOR_DIVISION", label: "03. 🛠️ División Contractor OS", count: contractorTenants.length, cat: "CORE" },
    { id: "ORGANIZATIONS", label: "04. 🏢 Directorio Empresas", count: allTenants.length, cat: "CORE" },
    { id: "ACTIVATIONS", label: "05. ⚡ Centro de Activaciones", count: pendingActivationCount, alert: pendingActivationCount > 0, cat: "CORE" },
    { id: "FEATURES", label: "06. 🧩 Features & Módulos", count: FEATURE_REGISTRY_CATALOG.length, cat: "PACKAGING" },
    { id: "PRICING_PLANS", label: "07. 🏷️ Pricing & Planes", count: 6, cat: "PACKAGING" },
    { id: "AI_CONTROL", label: "08. 🧠 AI Control Center", count: 2, cat: "AI" },
    { id: "AI_USAGE", label: "09. 📊 AI Usage & Costos", count: recentAiEvents.length, cat: "AI" },
    { id: "BILLING", label: "10. 💳 Facturación SaaS", count: 2, cat: "OPS" },
    { id: "DOMAINS", label: "11. 🌐 Gestor de Dominios", count: allDomains.length, cat: "OPS" },
    { id: "GHL_CRM", label: "12. 📈 CRM GoHighLevel", count: 2, cat: "OPS" },
    { id: "INTEGRATIONS", label: "13. 🔌 Integraciones", count: 5, cat: "OPS" },
    { id: "AUTOMATIONS", label: "14. ⚙️ Automatizaciones", count: 20, cat: "OPS" },
    { id: "CUSTOMER_SUCCESS", label: "15. 🎯 Customer Success", count: 1, cat: "GOV" },
    { id: "SUPPORT", label: "16. 🎫 Soporte SaaS", count: 0, cat: "GOV" },
    { id: "SECURITY_AUDIT", label: "17. 🛡️ Auditoría & Seguridad", count: 100, cat: "GOV" },
    { id: "SYSTEM_CONFIG", label: "18. 🛠️ Configuración", count: 1, cat: "GOV" },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* =========================================================================
          SOVEREIGN MASTER BANNER — SUPER ADMIN 2.0
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-r from-stone-950 via-zinc-900 to-amber-950/70 p-6 text-white shadow-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-400">
              <Crown className="h-4 w-4" />
              Alpha Vision Method · SaaS Business Control Plane v10.0
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-300">
                👑 Mando Dueña Soberana
              </span>
            </div>
            <h2 className="mt-1 text-2xl font-black text-white md:text-3xl">
              Super Admin Maestro 2.0 — Feature Governance, Cost Control & Multi-Product Engine
            </h2>
            <p className="mt-1 text-xs text-amber-200/80">
              Dos productos independientes, un catálogo centralizado de funcionalidades y control atómico de costos de IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Btn
              onClick={() => setShowQuickProvision(true)}
              className="bg-amber-500 text-black font-black hover:bg-amber-400 text-xs shadow-lg shadow-amber-500/20"
            >
              + Aprovisionar Empresa
            </Btn>
            <Link
              to="/admin/academia"
              className="rounded-xl border border-amber-500/30 bg-white/5 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-white/10"
            >
              Academia Dueña (5 Módulos)
            </Link>
            <Link
              to="/admin/readiness"
              className="rounded-xl border border-amber-500/30 bg-white/5 px-3 py-2 text-xs font-bold text-amber-200 hover:bg-white/10"
            >
              Auditoría SRE
            </Link>
          </div>
        </div>

        {/* Category Filters and Quick Search for 18 Divisions */}
        <div className="mt-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-t border-amber-500/20 pt-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase text-amber-400/80">Filtro de Áreas:</span>
            {[
              { id: "ALL", label: "Todas las 18 Áreas" },
              { id: "CORE", label: "Core SaaS (1-5)" },
              { id: "PACKAGING", label: "Features & Packaging (6-7)" },
              { id: "AI", label: "Inteligencia Artificial (8-9)" },
              { id: "OPS", label: "Operaciones & CRM (10-14)" },
              { id: "GOV", label: "Gobernanza & Éxito (15-18)" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setDivisionCategoryFilter(cat.id)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                  divisionCategoryFilter === cat.id
                    ? "bg-amber-400 text-black shadow-md"
                    : "bg-black/40 text-amber-200/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400/60" />
            <input
              type="text"
              placeholder="Buscar división o módulo..."
              value={divisionSearchQuery}
              onChange={(e) => setDivisionSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-amber-500/30 bg-black/50 pl-8 pr-3 py-1.5 text-xs text-amber-100 placeholder:text-amber-200/40 outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            {divisionSearchQuery && (
              <button
                onClick={() => setDivisionSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-amber-400/70 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 18 Navigation Division Tabs */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {ALL_18_DIVISIONS.filter((tab) => {
            const matchCat = divisionCategoryFilter === "ALL" || tab.cat === divisionCategoryFilter;
            const matchSearch =
              !divisionSearchQuery.trim() ||
              tab.label.toLowerCase().includes(divisionSearchQuery.toLowerCase()) ||
              tab.id.toLowerCase().includes(divisionSearchQuery.toLowerCase());
            return matchCat && matchSearch;
          }).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDivision(tab.id as AdminDivision)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                activeDivision === tab.id
                  ? "bg-amber-500 text-black shadow-lg shadow-amber-500/25 ring-2 ring-amber-300 font-black scale-[1.02]"
                  : "bg-black/40 text-amber-200/80 hover:bg-white/10 hover:text-white border border-amber-500/10"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
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

        {/* Active Division Status Bar */}
        <div className="mt-4 flex items-center justify-between rounded-2xl bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-amber-200/70">Área Activa:</span>
            <span className="font-extrabold text-amber-300">
              {ALL_18_DIVISIONS.find((d) => d.id === activeDivision)?.label}
            </span>
          </div>
          <span className="text-[11px] text-amber-200/50 hidden sm:inline">
            Control Soberano Alpha Vision · Multi-Tenant RLS Aislado
          </span>
        </div>
      </div>

      {/* =========================================================================
          01. DIVISION: GLOBAL COMMAND CENTER
          ========================================================================= */}
      {activeDivision === "GLOBAL_DASHBOARD" && (
        <div className="space-y-6">
          {/* Dual Master Cards */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Card 1: Vet Life */}
            <Card className="relative overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-950/20 p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-400">
                    LÍNEA SAAS VETERINARIA
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-foreground">Vet Life / Vet Freedom OS</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Software clínico móvil, tele-triaje, OKVET y fórmulas COMVEZCOL
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-500">
                  <Stethoscope className="h-8 w-8" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                <div className="rounded-xl bg-background/50 p-3">
                  <p className="text-[11px] font-bold text-muted-foreground">Clínicas Activas</p>
                  <p className="text-xl font-black text-foreground">{vetTenants.length}</p>
                </div>
                <div className="rounded-xl bg-background/50 p-3">
                  <p className="text-[11px] font-bold text-muted-foreground">MRR Estimado COP</p>
                  <p className="text-xl font-black text-emerald-500">$ {Math.round(vetMrr / 1000)}k</p>
                </div>
                <div className="rounded-xl bg-background/50 p-3">
                  <p className="text-[11px] font-bold text-muted-foreground">Salud OKVET</p>
                  <p className="text-xs font-black text-emerald-400">100% Sinc</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-300">
                <span className="font-bold">Cliente Prioritario:</span> Dr. Luis Eduardo Ríos (
                <a href="https://luis.alphavisionm.com" target="_blank" rel="noreferrer" className="underline font-bold">
                  luis.alphavisionm.com
                </a>
                )
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  to="/vet"
                  className="w-1/2 rounded-xl border border-border bg-card p-2 text-center text-xs font-bold text-foreground hover:bg-muted"
                >
                  Ver Landing /vet
                </Link>
                <Btn
                  onClick={() => setActiveDivision("VET_DIVISION")}
                  className="w-1/2 bg-emerald-600 text-white font-bold hover:bg-emerald-500"
                >
                  Abrir División Vet →
                </Btn>
              </div>
            </Card>

            {/* Card 2: Contractor OS */}
            <Card className="relative overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-card via-card to-amber-950/20 p-6 shadow-xl">
              <div className="flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-400">
                    LÍNEA SAAS DE SERVICIOS & OFICIOS
                  </span>
                  <h3 className="mt-2 text-2xl font-black text-foreground">Alpha Service OS / Contractor OS</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Software de campo para HVAC, plomería, remodelación, cuadrillas y cotizaciones
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-500">
                  <Wrench className="h-8 w-8" />
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
                <div className="rounded-xl bg-background/50 p-3">
                  <p className="text-[11px] font-bold text-muted-foreground">Empresas Activas</p>
                  <p className="text-xl font-black text-foreground">{contractorTenants.length}</p>
                </div>
                <div className="rounded-xl bg-background/50 p-3">
                  <p className="text-[11px] font-bold text-muted-foreground">MRR Estimado USD</p>
                  <p className="text-xl font-black text-amber-500">$ {contractorMrr} USD</p>
                </div>
                <div className="rounded-xl bg-background/50 p-3">
                  <p className="text-[11px] font-bold text-muted-foreground">Modo Calle</p>
                  <p className="text-xs font-black text-amber-400">Bilingüe (EN/ES)</p>
                </div>
              </div>

              <div className="mt-4 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-300">
                <span className="font-bold">Oficios Soportados:</span> 8 Industrias de Construcción (HVAC, Plomería, etc.)
              </div>

              <div className="mt-4 flex gap-2">
                <Link
                  to="/contractors"
                  className="w-1/2 rounded-xl border border-border bg-card p-2 text-center text-xs font-bold text-foreground hover:bg-muted"
                >
                  Ver Panel /contractors
                </Link>
                <Btn
                  onClick={() => setActiveDivision("CONTRACTOR_DIVISION")}
                  className="w-1/2 bg-amber-600 text-white font-bold hover:bg-amber-500"
                >
                  Abrir División Contractors →
                </Btn>
              </div>
            </Card>
          </div>

          {/* Métricas Globales */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-4 border-border text-center">
              <Building2 className="mx-auto h-5 w-5 text-primary mb-1" />
              <p className="text-2xl font-black text-foreground">{allTenants.length}</p>
              <p className="text-[11px] font-bold text-muted-foreground">Total Organizaciones</p>
              <span className="text-[10px] text-emerald-500 font-bold">100% Aislamiento RLS</span>
            </Card>
            <Card className="p-4 border-border text-center">
              <Clock className="mx-auto h-5 w-5 text-amber-500 mb-1" />
              <p className="text-2xl font-black text-amber-500">
                {allTenants.filter((t) => t.account_status === "ACTIVE_TRIAL").length}
              </p>
              <p className="text-[11px] font-bold text-muted-foreground">Pruebas 30 Días Activas</p>
              <span className="text-[10px] text-muted-foreground">Sin tarjeta de crédito</span>
            </Card>
            <Card className="p-4 border-border text-center">
              <Globe className="mx-auto h-5 w-5 text-blue-500 mb-1" />
              <p className="text-2xl font-black text-blue-500">{allDomains.length}</p>
              <p className="text-[11px] font-bold text-muted-foreground">Subdominios en Red</p>
              <span className="text-[10px] text-emerald-500 font-bold">Cloudflare Wildcard</span>
            </Card>
            <Card className="p-4 border-border text-center">
              <AlertCircle className="mx-auto h-5 w-5 text-purple-500 mb-1" />
              <p className="text-2xl font-black text-purple-500">{pendingActivationCount}</p>
              <p className="text-[11px] font-bold text-muted-foreground">Pendientes Activación</p>
              <span className="text-[10px] text-purple-400 font-bold">Requieren Revisión</span>
            </Card>
          </div>

          {/* Asistente Ejecutivo Claude */}
          <Card className="p-6 border-border bg-gradient-to-br from-card via-card to-primary/5">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-foreground">Asistente Ejecutivo de Alpha Vision</h3>
                <p className="text-xs text-muted-foreground">
                  Pregunta en lenguaje natural sobre finanzas, activaciones, DNS o estado de cualquier tenant.
                </p>
              </div>
            </div>

            <div className="mt-4 max-h-60 overflow-y-auto space-y-3 pr-2 text-xs">
              {messages.length === 0 ? (
                <div className="rounded-xl bg-muted/30 p-4 text-center text-muted-foreground">
                  ¡Bienvenida a tu Centro de Mando Alpha Vision! Puedo ayudarte a activar cuentas, verificar subdominios,
                  consultar métricas de Vet Life o Contractor OS y auditar la sincronización con GoHighLevel.
                </div>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 ${
                      m.role === "user"
                        ? "ml-8 bg-primary text-primary-foreground font-medium"
                        : "mr-8 bg-muted text-foreground"
                    }`}
                  >
                    <p className="font-bold text-[10px] uppercase opacity-75">{m.role === "user" ? "Tú" : "Claude AI"}</p>
                    <p className="mt-1 whitespace-pre-wrap">{m.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAskAi} className="mt-4 flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Escribe tu instrucción o pregunta sobre las clínicas o contratistas..."
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <Btn type="submit" disabled={isLoadingAi || !prompt.trim()} className="font-bold">
                {isLoadingAi ? "Pensando..." : "Preguntar"}
              </Btn>
            </form>
          </Card>
        </div>
      )}

      {/* =========================================================================
          06. DIVISION: FEATURES & MODULES (§ 473 - 475)
          ========================================================================= */}
      {activeDivision === "FEATURES" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <Layers className="h-5 w-5 text-amber-500" />
                Catálogo Unificado de Features & Módulos (§ 475)
              </h3>
              <p className="text-xs text-muted-foreground">
                Gobernanza centralizada de funcionalidades: estado de verificación, empaquetado y control de activación server-side.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={featureProductFilter}
                onChange={(e) => setFeatureProductFilter(e.target.value)}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground"
              >
                <option value="ALL">Todos los Productos</option>
                <option value="VET_LIFE">🐾 Vet Life</option>
                <option value="CONTRACTOR_OS">🛠️ Contractor OS</option>
                <option value="PLATFORM_CORE">🌐 Platform Core</option>
              </select>
              <input
                type="text"
                value={featureSearch}
                onChange={(e) => setFeatureSearch(e.target.value)}
                placeholder="Buscar por ID, nombre o módulo..."
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground"
              />
            </div>
          </div>

          {/* Tabla de Features */}
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 text-[11px] font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="p-3">Feature ID / Nombre</th>
                  <th className="p-3">Producto</th>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Estado Verificación</th>
                  <th className="p-3">Plan Mínimo</th>
                  <th className="p-3">Costo IA</th>
                  <th className="p-3 text-right">Comandos de Gobernanza</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFeatures.map((f) => (
                  <tr key={f.feature_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-mono text-[11px] font-black text-primary">{f.feature_id}</div>
                      <div className="font-bold text-foreground text-xs">{f.display_name}</div>
                      <div className="text-[10px] text-muted-foreground line-clamp-1">{f.customer_value}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          f.product_id === "VET_LIFE"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : f.product_id === "CONTRACTOR_OS"
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {f.product_id}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-foreground font-medium">
                      {f.module_name}
                      <span className="block text-[10px] text-muted-foreground">{f.submodule_name}</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          f.implementation_status === "PRODUCTION_VERIFIED"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : f.implementation_status === "STAGING_VERIFIED"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
                        }`}
                      >
                        {f.implementation_status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground">{f.minimum_entitlement}</td>
                    <td className="p-3">
                      {f.has_ai_cost ? (
                        <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[10px] font-bold text-purple-600">
                          ⚠️ Requiere Cuota IA
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">Sin Costo IA</span>
                      )}
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <Btn
                        variant="outline"
                        onClick={() => handleSimulateEntitlement(f.feature_id)}
                        className="text-[10px] font-bold h-7 px-2"
                      >
                        Simular 14 Pasos
                      </Btn>
                      <Btn
                        variant="outline"
                        onClick={() => setSelectedFeatureForOverride(f)}
                        className="text-[10px] font-bold h-7 px-2 text-amber-600 border-amber-500/30"
                      >
                        + Crear Override
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal de Creación de Override */}
          {selectedFeatureForOverride && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
              <Card className="w-full max-w-lg p-6 border-border bg-card">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h4 className="font-black text-foreground">Crear Override Temporal</h4>
                    <p className="text-xs text-muted-foreground">{selectedFeatureForOverride.feature_id}</p>
                  </div>
                  <button onClick={() => setSelectedFeatureForOverride(null)} className="p-1 text-muted-foreground">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-foreground">Inquilino de Destino</label>
                    <select
                      id="override-tenant-select"
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2"
                    >
                      {allTenants.map((t) => (
                        <option key={t.tenant_id} value={t.tenant_id}>
                          {t.display_name} ({t.product_type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-foreground">Motivo Comercial / Soporte</label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      placeholder="ej: Demostración técnica VIP o compensación de servicio"
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-foreground">Duración en Días</label>
                    <input
                      type="number"
                      value={overrideDays}
                      onChange={(e) => setOverrideDays(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-border bg-background p-2"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                  <Btn variant="outline" onClick={() => setSelectedFeatureForOverride(null)}>
                    Cancelar
                  </Btn>
                  <Btn
                    onClick={() => {
                      const select = document.getElementById("override-tenant-select") as HTMLSelectElement;
                      if (select) handleGrantOverride(select.value, selectedFeatureForOverride.feature_id);
                    }}
                    className="bg-amber-500 text-black font-black"
                  >
                    Otorgar Override
                  </Btn>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          07. DIVISION: PRICING & PLANS (§ 480 - 484)
          ========================================================================= */}
      {activeDivision === "PRICING_PLANS" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Plan & Pricing Studio (§ 480 - 484)
              </h3>
              <p className="text-xs text-muted-foreground">
                Dos catálogos independientes: tres planes por producto con matriz de entitlements y versionado inmutable.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActivePricingVertical("VET_LIFE")}
                className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                  activePricingVertical === "VET_LIFE"
                    ? "bg-emerald-500 text-black shadow-lg"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                🐾 Planes Vet Life (COP)
              </button>
              <button
                onClick={() => setActivePricingVertical("CONTRACTOR_OS")}
                className={`rounded-xl px-4 py-2 text-xs font-black transition-all ${
                  activePricingVertical === "CONTRACTOR_OS"
                    ? "bg-amber-500 text-black shadow-lg"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                🛠️ Planes Contractor OS (USD)
              </button>
            </div>
          </div>

          {/* Grid de los 3 Planes del Producto Seleccionado */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(activePricingVertical === "VET_LIFE" ? VET_LIFE_PLANS : CONTRACTOR_OS_PLANS).map((p, idx) => (
              <Card key={p.plan_id} className="relative overflow-hidden border-2 border-border p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-black uppercase text-primary">
                    NIVEL {idx + 1}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${
                      p.publication_status === "PUBLISHED"
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    {p.publication_status}
                  </span>
                </div>
                <h4 className="mt-3 text-xl font-black text-foreground">{p.name}</h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.description}</p>
                <div className="mt-4 border-t border-border pt-4">
                  <p className="text-2xl font-black text-foreground">
                    {p.currency === "COP" ? `$${p.price.toLocaleString("es-CO")}` : `$${p.price} USD`}
                    <span className="text-xs font-normal text-muted-foreground"> / mes</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Límite: {p.user_limit} usuarios · Presupuesto IA: ${p.ai_monthly_budget_usd} USD/mes
                  </p>
                </div>
                <div className="mt-4 space-y-1.5 border-t border-border pt-3">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Features Incluidas:</p>
                  {p.features_included.map((fId) => (
                    <div key={fId} className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{fId}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          08. DIVISION: AI CONTROL CENTER (§ 485)
          ========================================================================= */}
      {activeDivision === "AI_CONTROL" && (
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Control Center — Modelos, Agentes y Tarifarios Versionados (§ 485)
            </h3>
            <p className="text-xs text-muted-foreground">
              Toda invocación pasa por el Alpha AI Gateway. Controles centralizados de tarifas de Claude API.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Object.values(OFFICIAL_CLAUDE_PRICING).map((model) => (
              <Card key={model.model_id} className="p-5 border-border">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h4 className="font-black text-foreground text-base">{model.display_name}</h4>
                    <span className="font-mono text-xs text-purple-500">{model.model_id}</span>
                  </div>
                  <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold text-purple-600">
                    Versión: {model.version_tag}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-muted-foreground font-medium">Tokens de Entrada</p>
                    <p className="text-lg font-black text-foreground">${model.input_cost_per_million.toFixed(2)} USD</p>
                    <p className="text-[10px] text-muted-foreground">por 1M tokens</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-muted-foreground font-medium">Tokens de Salida</p>
                    <p className="text-lg font-black text-foreground">${model.output_cost_per_million.toFixed(2)} USD</p>
                    <p className="text-[10px] text-muted-foreground">por 1M tokens</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-muted-foreground font-medium">Creación de Caché</p>
                    <p className="text-lg font-black text-foreground">${model.cache_write_cost_per_million.toFixed(2)} USD</p>
                    <p className="text-[10px] text-muted-foreground">por 1M tokens</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="text-muted-foreground font-medium">Lectura de Caché</p>
                    <p className="text-lg font-black text-foreground">${model.cache_read_cost_per_million.toFixed(2)} USD</p>
                    <p className="text-[10px] text-muted-foreground">por 1M tokens (90% ahorro)</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Políticas de Gobernanza y Resguardo */}
          <Card className="p-5 border-border bg-muted/20">
            <h4 className="font-black text-foreground">Reglas de Gobernanza & Fallback (§ 495)</h4>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3 text-xs text-muted-foreground">
              <div className="rounded-xl bg-card p-3 border border-border">
                <p className="font-bold text-foreground">Umbral Soft Limit: 80%</p>
                <p className="mt-1 text-[11px]">Genera advertencia preventiva sin bloquear la operación médica o del contratista.</p>
              </div>
              <div className="rounded-xl bg-card p-3 border border-border">
                <p className="font-bold text-foreground">Umbral Hard Limit: 100%</p>
                <p className="mt-1 text-[11px]">Bloquea únicamente llamadas de IA. La app continúa 100% operativa sin pérdida de datos.</p>
              </div>
              <div className="rounded-xl bg-card p-3 border border-border">
                <p className="font-bold text-foreground">Reserva Atómica (§ 493)</p>
                <p className="mt-1 text-[11px]">Bloqueo de saldo previo a la llamada para evitar sobrecostos concurrentes.</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =========================================================================
          09. DIVISION: AI USAGE & COST CALCULATOR (§ 488, 498)
          ========================================================================= */}
      {activeDivision === "AI_USAGE" && (
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-500" />
              AI Usage Metering & Calculador de Costos Reconciliados (§ 488, 498)
            </h3>
            <p className="text-xs text-muted-foreground">
              Auditoría forense de tokens y costos reales reportados por Claude API con conciliación atómica.
            </p>
          </div>

          {/* Calculador Interactivo */}
          <Card className="p-5 border-border bg-gradient-to-r from-card to-indigo-950/20">
            <h4 className="font-black text-foreground">Simulador de Costo de Invocación</h4>
            <p className="text-xs text-muted-foreground">Calcula con precisión de 6 decimales el costo exacto antes de llamar a la API.</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
              <div>
                <label className="font-bold text-muted-foreground">Modelo</label>
                <select
                  value={calcSelectedModel}
                  onChange={(e) => setCalcSelectedModel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2"
                >
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-muted-foreground">Input Tokens</label>
                <input
                  type="number"
                  value={calcInputTokens}
                  onChange={(e) => setCalcInputTokens(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground">Output Tokens</label>
                <input
                  type="number"
                  value={calcOutputTokens}
                  onChange={(e) => setCalcOutputTokens(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2"
                />
              </div>
              <div>
                <label className="font-bold text-muted-foreground">Cache Read</label>
                <input
                  type="number"
                  value={calcCacheRead}
                  onChange={(e) => setCalcCacheRead(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2"
                />
              </div>
              <div className="rounded-xl bg-indigo-500/10 p-3 text-center border border-indigo-500/30">
                <p className="text-[10px] font-bold text-indigo-400 uppercase">Costo Estimado</p>
                <p className="text-xl font-black text-indigo-400">${simulatedCostUsd.toFixed(6)}</p>
                <p className="text-[9px] text-muted-foreground">USD</p>
              </div>
            </div>
          </Card>

          {/* Tabla de Eventos Recientes de IA */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <h4 className="font-black text-foreground mb-3">Ledger de Consumo Reciente (Append-Only)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 text-[10px] font-bold text-muted-foreground uppercase">
                  <tr>
                    <th className="p-2.5">Request ID</th>
                    <th className="p-2.5">Producto</th>
                    <th className="p-2.5">Modelo</th>
                    <th className="p-2.5">Tokens (In / Out / Cache)</th>
                    <th className="p-2.5">Costo Reconciliado</th>
                    <th className="p-2.5">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentAiEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-muted-foreground">
                        Sin eventos recientes de IA. Inicia una invocación desde el portal para ver el registro en vivo.
                      </td>
                    </tr>
                  ) : (
                    recentAiEvents.map((evt) => (
                      <tr key={evt.request_id} className="hover:bg-muted/20">
                        <td className="p-2.5 font-mono text-[11px] text-primary">{evt.request_id}</td>
                        <td className="p-2.5 font-bold text-foreground">{evt.product_id}</td>
                        <td className="p-2.5 text-muted-foreground">{evt.model_id}</td>
                        <td className="p-2.5 text-foreground font-mono">
                          {evt.input_tokens} / {evt.output_tokens} / {evt.cache_read_tokens}
                        </td>
                        <td className="p-2.5 font-mono font-bold text-indigo-500">
                          ${evt.reconciled_cost_usd.toFixed(6)} USD
                        </td>
                        <td className="p-2.5">
                          <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                            {evt.result_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          02. DIVISION: VET LIFE DIVISION
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

          {/* Tabla Vet Life */}
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
                  <tr key={t.tenant_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{t.display_name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.legal_name}</div>
                    </td>
                    <td className="p-3 font-mono text-primary font-bold">
                      <a
                        href={`https://${t.normalized_slug}.alphavisionm.com`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {t.normalized_slug}.alphavisionm.com
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-foreground">{t.plan_name || t.plan_code}</div>
                      <div className="text-[10px] text-muted-foreground">
                        $ {t.plan_price_cop ? t.plan_price_cop.toLocaleString('es-CO') : (t.plan_code === "VET_SOLO" ? "189.000" : "389.000")} COP/mes
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          t.account_status === "ACTIVE_PAID"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : t.account_status === "ACTIVE_TRIAL"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
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
          03. DIVISION: CONTRACTOR OS DIVISION
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
                  <tr key={t.tenant_id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-foreground">{t.display_name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.legal_name}</div>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-500 uppercase">
                        {t.exact_niche || "CONTRACTOR"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-primary font-bold">
                      <a
                        href={`https://${t.normalized_slug}.alphavisionm.com`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline flex items-center gap-1"
                      >
                        {t.normalized_slug}.alphavisionm.com
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-foreground">{t.plan_name || t.plan_code}</div>
                      <div className="text-[10px] text-muted-foreground">
                        $ {t.plan_price_usd ? t.plan_price_usd : (t.plan_code === "CONTRACTOR_GROWTH" ? "197" : "97")} USD/mes
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                          t.account_status === "ACTIVE_PAID"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : t.account_status === "ACTIVE_TRIAL"
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-amber-500/10 text-amber-600"
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
          05. DIVISION: ACCOUNTS & ACTIVATIONS
          ========================================================================= */}
      {activeDivision === "ACTIVATIONS" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <Rocket className="h-5 w-5 text-amber-500" />
                Centro de Activaciones & Gobernanza de Cuentas
              </h3>
              <p className="text-xs text-muted-foreground">
                Control de acceso real. Ninguna cuenta entra a producción sin verificación de requisitos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">Filtrar:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-bold text-foreground"
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
                {allTenants
                  .filter((t) => statusFilter === "ALL" || t.account_status === statusFilter)
                  .map((t) => (
                    <tr key={t.tenant_id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-foreground">{t.display_name}</div>
                        <div className="text-[10px] text-muted-foreground">{t.country}</div>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-[10px] font-bold">{t.product_type}</span>
                      </td>
                      <td className="p-3 font-mono text-primary font-bold">{t.normalized_slug}.alphavisionm.com</td>
                      <td className="p-3">
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
                          {t.account_status}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">
                          {t.billing_status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        {t.account_status !== "ACTIVE_PAID" && (
                          <Btn
                            variant="outline"
                            onClick={() => handleTransitionStatus(t.tenant_id, "ACTIVE_PAID", "Pago verificado por Super Admin")}
                            className="text-[10px] font-bold text-emerald-600 border-emerald-500/30 h-7 px-2"
                          >
                            Activar Pago
                          </Btn>
                        )}
                        {t.account_status === "WAITING_FOR_REVIEW" && (
                          <Btn
                            variant="outline"
                            onClick={() => handleTransitionStatus(t.tenant_id, "ACTIVE_TRIAL", "Trial 30D autorizado por Super Admin")}
                            className="text-[10px] font-bold text-blue-600 border-blue-500/30 h-7 px-2"
                          >
                            Activar 30D
                          </Btn>
                        )}
                        {t.account_status !== "SUSPENDED" ? (
                          <Btn
                            variant="outline"
                            onClick={() => handleTransitionStatus(t.tenant_id, "SUSPENDED", "Suspensión administrativa")}
                            className="text-[10px] font-bold text-rose-600 border-rose-500/30 h-7 px-2"
                          >
                            Suspender
                          </Btn>
                        ) : (
                          <Btn
                            variant="outline"
                            onClick={() => handleTransitionStatus(t.tenant_id, "ACTIVE_PAID", "Reactivación de cuenta")}
                            className="text-[10px] font-bold text-emerald-600 border-emerald-500/30 h-7 px-2"
                          >
                            Reactivar
                          </Btn>
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
          11. DIVISION: GESTOR DE DOMINIOS & GATEWAY SIMULATOR
          ========================================================================= */}
      {activeDivision === "DOMAINS" && (
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h3 className="text-xl font-black text-foreground flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Gestor Global de Dominios & Enrutamiento Lovable Edge
            </h3>
            <p className="text-xs text-muted-foreground">
              Infraestructura DNS Wildcard (*.alphavisionm.com) hacia la IP 185.158.133.1.
            </p>
          </div>

          {/* Simulador Instrumental de Enrutamiento */}
          <Card className="p-5 border-border bg-gradient-to-r from-card to-blue-950/20">
            <h4 className="font-black text-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              Comprobador Instrumental de Enrutamiento (Gateway Simulator)
            </h4>
            <form onSubmit={handleTestDomainResolution} className="mt-3 flex gap-2">
              <input
                type="text"
                value={testHostname}
                onChange={(e) => setTestHostname(e.target.value)}
                placeholder="ejemplo: luis.alphavisionm.com"
                className="flex-1 rounded-xl border border-border bg-background px-4 py-2 text-xs font-mono text-foreground"
              />
              <Btn type="submit" className="bg-blue-600 text-white font-bold text-xs">
                Resolver Hostname
              </Btn>
            </form>

            {resolutionResult && (
              <div
                className={`mt-3 rounded-xl p-3 text-xs ${
                  resolutionResult.resolution_type !== "NOT_FOUND"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                }`}
              >
                <div className="flex items-center gap-2 font-bold">
                  <span>Resultado: {resolutionResult.product_type || "DESCONOCIDO"}</span>
                  <span>→ Ruta de Destino: {resolutionResult.target_route}</span>
                </div>
                {resolutionResult.display_name && (
                  <p className="mt-1 text-[11px] opacity-90">
                    Tenant: {resolutionResult.display_name} ({resolutionResult.normalized_slug})
                  </p>
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
                  <tr key={d.hostname} className="hover:bg-muted/30">
                    <td className="p-3 font-mono font-bold text-primary">
                      <a href={`https://${d.hostname}`} target="_blank" rel="noreferrer" className="hover:underline">
                        {d.hostname}
                      </a>
                    </td>
                    <td className="p-3 text-[11px] text-muted-foreground">{d.domain_type}</td>
                    <td className="p-3 font-bold">{d.product_type}</td>
                    <td className="p-3">
                      <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                        {d.verification_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600">
                        {d.tls_status}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
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
          12. DIVISION: GHL CRM PIPELINES
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
              <div className="mt-4 space-y-2 text-xs">
                {GHL_PIPELINES.VET_LIFE.stages.map((st) => (
                  <div key={st.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5">
                    <span className="font-medium text-foreground">
                      {st.order}. {st.name}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {vetTenants.filter((t) => t.ghl_stage_name === st.name).length} empresas
                    </span>
                  </div>
                ))}
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
              <div className="mt-4 space-y-2 text-xs">
                {GHL_PIPELINES.CONTRACTOR_OS.stages.map((st) => (
                  <div key={st.id} className="flex items-center justify-between rounded-lg bg-muted/30 p-2.5">
                    <span className="font-medium text-foreground">
                      {st.order}. {st.name}
                    </span>
                    <span className="text-[11px] font-bold text-muted-foreground">
                      {contractorTenants.filter((t) => t.ghl_stage_name === st.name).length} empresas
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: APROVISIONAMIENTO RÁPIDO
          ========================================================================= */}
      {showQuickProvision && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
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
                      setNewOrgSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, "")
                          .slice(0, 15)
                      );
                    }
                  }}
                  placeholder="ej: Clínica Veterinaria El Poblado o Butler Yard Masters"
                  className="mt-1 w-full rounded-xl border border-border bg-background p-2.5 text-foreground"
                />
              </div>

              <div>
                <label className="font-bold text-foreground">Subdominio Solicitado (*.alphavisionm.com)</label>
                <div className="mt-1 flex items-center">
                  <input
                    type="text"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="elpoblado"
                    className="flex-1 rounded-l-xl border border-r-0 border-border bg-background p-2.5 font-mono text-foreground"
                  />
                  <span className="rounded-r-xl border border-l-0 border-border bg-muted/50 px-3 py-2.5 text-[11px] font-bold text-muted-foreground">
                    .alphavisionm.com
                  </span>
                </div>
              </div>

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
          MODAL: DETALLE DE ORGANIZACIÓN (CON 10 PESTAÑAS ORIGINALES + GOVERNANCE)
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

            {/* Pestañas de la Organización (Incluye todas las 10 originales de AVAT-039) */}
            <div className="mt-4 flex flex-wrap gap-1 border-b border-border pb-2">
              {(
                [
                  "OVERVIEW",
                  "ACCOUNT",
                  "SUBSCRIPTION",
                  "FEATURES & ENTITLEMENTS",
                  "AI USAGE & BUDGETS",
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
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    selectedOrgTab === tab
                      ? "bg-primary text-primary-foreground shadow"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Contenido de la pestaña */}
            <div className="mt-6 text-xs">
              {selectedOrgTab === "OVERVIEW" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-2xl bg-muted/30 p-3">
                      <p className="text-muted-foreground font-bold">Subdominio Asignado</p>
                      <p className="font-mono font-bold text-primary">{selectedTenant.normalized_slug}.alphavisionm.com</p>
                    </div>
                    <div className="rounded-2xl bg-muted/30 p-3">
                      <p className="text-muted-foreground font-bold">Estado de Cuenta</p>
                      <p className="font-bold text-foreground">{selectedTenant.account_status}</p>
                    </div>
                    <div className="rounded-2xl bg-muted/30 p-3">
                      <p className="text-muted-foreground font-bold">Plan Comercial</p>
                      <p className="font-bold text-foreground">{selectedTenant.plan_name || selectedTenant.plan_code}</p>
                    </div>
                    <div className="rounded-2xl bg-muted/30 p-3">
                      <p className="text-muted-foreground font-bold">Etapa GHL Sales</p>
                      <p className="font-bold text-foreground">{selectedTenant.ghl_stage_name || "Sin Lead"}</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedOrgTab === "FEATURES & ENTITLEMENTS" && (
                <div className="space-y-4">
                  <h4 className="font-black text-foreground">Gobernanza de Features para {selectedTenant.display_name}</h4>
                  <p className="text-muted-foreground text-xs">
                    Comprueba la resolución en tiempo real de permisos y excepciones activas.
                  </p>
                  <div className="rounded-xl border border-border p-3 space-y-2">
                    {FEATURE_REGISTRY_CATALOG.filter(
                      (f) => f.product_id === selectedTenant.product_type || f.product_id === "PLATFORM_CORE"
                    ).map((f) => {
                      const res = resolveFeatureEntitlement(selectedTenant.tenant_id, f.feature_id, {
                        tenantProduct: selectedTenant.product_type,
                        accountStatus: selectedTenant.account_status,
                      });
                      return (
                        <div key={f.feature_id} className="flex items-center justify-between border-b border-border pb-1.5">
                          <div>
                            <span className="font-bold text-foreground">{f.display_name}</span>
                            <span className="block font-mono text-[10px] text-muted-foreground">{f.feature_id}</span>
                          </div>
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-black ${
                              res.allowed
                                ? "bg-emerald-500/10 text-emerald-500"
                                : "bg-rose-500/10 text-rose-500"
                            }`}
                          >
                            {res.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedOrgTab === "AI USAGE & BUDGETS" && (
                <div className="space-y-4">
                  <h4 className="font-black text-foreground">Presupuesto y Consumo de IA</h4>
                  {(() => {
                    const budget = getTenantBudget(selectedTenant.tenant_id);
                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-muted-foreground font-medium">Presupuesto Mensual</p>
                          <p className="text-xl font-black text-foreground">${budget.monthly_budget_usd.toFixed(2)} USD</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-muted-foreground font-medium">Consumido este Mes</p>
                          <p className="text-xl font-black text-indigo-500">${budget.current_spend_usd.toFixed(4)} USD</p>
                        </div>
                        <div className="rounded-xl bg-muted/40 p-3">
                          <p className="text-muted-foreground font-medium">Estado del Servicio</p>
                          <p className="text-sm font-black text-emerald-500">
                            {budget.is_paused ? "PAUSADO" : "ACTIVO (Soft 80% / Hard 100%)"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Pestañas restantes */}
              {selectedOrgTab !== "OVERVIEW" &&
                selectedOrgTab !== "FEATURES & ENTITLEMENTS" &&
                selectedOrgTab !== "AI USAGE & BUDGETS" && (
                  <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
                    Sección {selectedOrgTab} activa para el tenant {selectedTenant.display_name}.
                  </div>
                )}
            </div>

            <div className="mt-6 flex justify-end border-t border-border pt-4">
              <Btn variant="outline" onClick={() => setSelectedTenant(null)}>
                Cerrar Ficha
              </Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
