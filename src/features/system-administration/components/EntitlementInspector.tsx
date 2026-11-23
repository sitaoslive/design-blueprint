/**
 * VET FREEDOM OS / ALPHA VISION — ENTITLEMENT INSPECTOR
 * Inspector visual en tiempo real de permisos y licencias para el Super Admin.
 * Evalúa las 5 condiciones de acceso para cada uno de los 33 Features Canónicos.
 */

import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  Filter,
  Sparkles,
  Building2,
  RefreshCw,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Card, PageTitle, SectionTitle, Btn } from "@/components/vf/ui";
import {
  getAllCanonicalFeatures,
  checkFeatureAccess,
} from "@/features/system-administration/application/entitlements";
import type { FeatureAccessEvaluation } from "@/types/entitlements";

export function EntitlementInspector() {
  const nav = useNavigate();
  const [selectedOrg, setSelectedOrg] = useState<string>("11111111-1111-1111-1111-111111111111");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ALLOWED" | "BLOCKED">("ALL");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedFeatureEval, setSelectedFeatureEval] = useState<FeatureAccessEvaluation | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  const features = getAllCanonicalFeatures();

  const handleInspectFeature = async (featureId: string) => {
    setIsEvaluating(true);
    try {
      const res = await checkFeatureAccess(selectedOrg, featureId);
      setSelectedFeatureEval(res);
    } catch {
      toast.error("Error al evaluar el feature");
    } finally {
      setIsEvaluating(false);
    }
  };

  const filteredFeatures = features.filter((f) => {
    const matchesSearch =
      f.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "ALL" || f.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const isLuis = selectedOrg === "11111111-1111-1111-1111-111111111111";

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 py-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-semibold mb-1">
            <Link to="/admin" className="hover:text-primary transition flex items-center gap-1">
              Owner Command Center
            </Link>
            <span>/</span>
            <span className="text-foreground">Inspector de Entitlements (PL-01)</span>
          </div>
          <PageTitle
            title="Motor de Entitlements & Licenciamiento B2B"
            subtitle="Auditoría en tiempo real de las 5 condiciones de acceso en servidor para los 33 Features de la plataforma."
          />
        </div>

        <div className="flex items-center gap-2">
          <Btn
            variant="outline"
            onClick={() => void nav({ to: "/admin" })}
            className="text-xs rounded-xl"
          >
            Volver al Centro de Control
          </Btn>
        </div>
      </div>

      {/* Selector de Clínica & Estado de Licencia */}
      <Card className="rounded-3xl p-5 border-border/80 bg-gradient-to-br from-card via-background to-secondary/20 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary shrink-0">
              <Building2 className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Organización Evaluada:
                </span>
                <select
                  value={selectedOrg}
                  onChange={(e) => setSelectedOrg(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-1 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="11111111-1111-1111-1111-111111111111">
                    Vet Life — Dr. Luis Eduardo Ríos (Producción)
                  </option>
                  <option value="22222222-2222-2222-2222-222222222222">
                    Clínica San Roque — Demo Prospecto (Trial 30 Días)
                  </option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ID: <code className="bg-secondary px-1.5 py-0.5 rounded text-[11px] font-mono">{selectedOrg}</code>
              </p>
            </div>
          </div>

          {/* Badges de Licencia */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="rounded-2xl border border-border bg-background/80 px-3.5 py-2">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Plan Comercial</span>
              <b className="text-xs text-primary">TIER 2: Clínica Domiciliaria ($389k COP)</b>
            </div>
            <div className="rounded-2xl border border-border bg-background/80 px-3.5 py-2">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Tipo Licencia</span>
              <b className="text-xs text-emerald-600">{isLuis ? "MONTHLY_PAID (Activa)" : "TRIAL_30_DAYS (27 días rest.)"}</b>
            </div>
            <div className="rounded-2xl border border-border bg-background/80 px-3.5 py-2">
              <span className="block text-[10px] uppercase font-bold text-muted-foreground">Cuota WhatsApp</span>
              <b className="text-xs text-foreground">{isLuis ? "45 / 1.500 msgs" : "10 / 1.500 msgs"}</b>
            </div>
          </div>
        </div>
      </Card>

      {/* Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por ID (p. ej. FEAT-CORE-005) o nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-border bg-background pl-10 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["ALL", "CLINICAL", "COMMS", "LOGISTICS", "EXEC", "THEMING"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                filterCategory === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cuadrícula de Features y su Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredFeatures.map((f) => {
          const isIncludedInT2 = f.tier2;
          const isDev = f.status === "SPECIFIED";
          const requiresOkvet = f.id === "FEAT-OKVET-001";

          return (
            <div
              key={f.id}
              onClick={() => void handleInspectFeature(f.id)}
              className="group cursor-pointer rounded-2xl border border-border/70 bg-card p-4 transition-all hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[11px] font-bold text-muted-foreground group-hover:text-primary transition">
                    {f.id}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      !isIncludedInT2
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : isDev
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    }`}
                  >
                    {!isIncludedInT2 ? "Tier 3 / Add-on" : isDev ? "Especificado" : "En Producción"}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-foreground leading-snug mb-1">
                  {f.name}
                </h3>
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-medium">Rol: {f.role}</span>
                <span className="flex items-center gap-1 font-semibold text-primary group-hover:underline">
                  Diagnosticar 5 Condiciones
                  <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Panel de Diagnóstico de las 5 Condiciones */}
      {selectedFeatureEval && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="max-w-xl w-full rounded-3xl p-6 border-primary/30 shadow-2xl bg-card space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold font-mono text-primary">
                  {selectedFeatureEval.feature_id}
                </span>
                <h3 className="text-lg font-black text-foreground">
                  {selectedFeatureEval.feature_name ?? selectedFeatureEval.feature_id}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Evaluación de servidor mediante RPC <code className="text-foreground">evaluate_tenant_feature_access</code>
                </p>
              </div>

              <span
                className={`rounded-2xl px-3 py-1.5 text-xs font-black shrink-0 ${
                  selectedFeatureEval.allowed
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-rose-500 text-white shadow-sm"
                }`}
              >
                {selectedFeatureEval.allowed ? "ACCESO PERMITIDO" : "ACCESO BLOQUEADO"}
              </span>
            </div>

            {/* Diagnóstico de las 5 Condiciones */}
            <div className="space-y-2.5 rounded-2xl bg-secondary/50 p-4 border border-border">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                Semáforo de las 5 Condiciones de Acceso:
              </h4>

              {/* 1. Comercial */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  1. Entitlement Comercial:
                </span>
                <span className={`font-bold ${selectedFeatureEval.conditions?.commercial_entitlement.passed !== false ? "text-emerald-600" : "text-rose-600"}`}>
                  {selectedFeatureEval.conditions?.commercial_entitlement.passed !== false ? "✓ Incluido en Plan" : "✗ Requiere Upgrade"}
                </span>
              </div>

              {/* 2. Rol */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  2. Autorización de Rol:
                </span>
                <span className={`font-bold ${selectedFeatureEval.conditions?.role_authorization.passed !== false ? "text-emerald-600" : "text-rose-600"}`}>
                  {selectedFeatureEval.conditions?.role_authorization.passed !== false ? "✓ Rol Autorizado" : "✗ Sin Privilegio"}
                </span>
              </div>

              {/* 3. Implementación */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  3. Preparación de Software:
                </span>
                <span className={`font-bold ${selectedFeatureEval.conditions?.implementation_readiness.passed !== false ? "text-emerald-600" : "text-amber-600"}`}>
                  {selectedFeatureEval.conditions?.implementation_readiness.passed !== false ? "✓ En Producción" : "En Desarrollo"}
                </span>
              </div>

              {/* 4. Integración */}
              <div className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  4. Conexión de Integración:
                </span>
                <span className={`font-bold ${selectedFeatureEval.conditions?.integration_readiness.passed !== false ? "text-emerald-600" : "text-rose-600"}`}>
                  {selectedFeatureEval.conditions?.integration_readiness.passed !== false ? "✓ Operacional" : "✗ Desconectada"}
                </span>
              </div>

              {/* 5. Cuota */}
              <div className="flex items-center justify-between text-xs py-1">
                <span className="font-semibold text-foreground flex items-center gap-2">
                  5. Disponibilidad de Cuota:
                </span>
                <span className={`font-bold ${selectedFeatureEval.conditions?.quota_availability.passed !== false ? "text-emerald-600" : "text-rose-600"}`}>
                  {selectedFeatureEval.conditions?.quota_availability.passed !== false ? "✓ Cuota Disponible" : "✗ Límite Excedido"}
                </span>
              </div>
            </div>

            {selectedFeatureEval.message && (
              <div className="rounded-xl bg-background border border-border p-3 text-xs text-muted-foreground">
                <b className="text-foreground block mb-0.5">Mensaje del Sistema:</b>
                {selectedFeatureEval.message}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Btn
                variant="outline"
                onClick={() => setSelectedFeatureEval(null)}
                className="text-xs rounded-xl"
              >
                Cerrar Diagnóstico
              </Btn>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
