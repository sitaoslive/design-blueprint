import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  DollarSign,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Send,
  Building2,
  Banknote,
  CreditCard,
  ChevronLeft,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, Card, Btn } from "@/components/vf/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/luis/comisiones")({
  head: () =>
    meta(
      "Liquidación y Split de Comisiones",
      "Control de visitas, efectivo cobrado en campo, pagos digitales y transferencias netas al personal médico."
    ),
  component: CommissionSettlementsPage,
});

function CommissionSettlementsPage() {
  const [settlements, setSettlements] = useState([
    {
      id: "set-001",
      staffName: "Dr. Luis Eduardo Ríos",
      role: "Director Médico / Veterinario Principal",
      comvezcol: "COMVEZCOL-001",
      bank: "Bancolombia Ahorros ··4812",
      visits: 42,
      totalBilled: 5880000,
      rate: 40,
      grossCommission: 2352000,
      cashCollected: 650000,
      digitalCollected: 5230000,
      netPayout: 1702000,
      status: "PENDING",
      reference: "LIQ-2026-11-001",
    },
    {
      id: "set-002",
      staffName: "Dra. Camila Torres",
      role: "Médica Veterinaria de Enlace",
      comvezcol: "COMVEZCOL-002",
      bank: "Nequi · 301 445 8821",
      visits: 36,
      totalBilled: 4680000,
      rate: 35,
      grossCommission: 1638000,
      cashCollected: 420000,
      digitalCollected: 4260000,
      netPayout: 1218000,
      status: "PENDING",
      reference: "LIQ-2026-11-002",
    },
    {
      id: "set-003",
      staffName: "Andrés Salcedo",
      role: "Coordinador de Rutas y Operaciones",
      comvezcol: "N/A",
      bank: "Bancolombia Ahorros ··9021",
      visits: 78,
      totalBilled: 10560000,
      rate: 3.5,
      grossCommission: 369600,
      cashCollected: 0,
      digitalCollected: 10560000,
      netPayout: 369600,
      status: "PENDING",
      reference: "LIQ-2026-11-003",
    },
  ]);

  const handleDisperse = (id: string, name: string, amount: number) => {
    setSettlements((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: "PAID", paidAt: "Hoy, 16:45" } : s
      )
    );
    toast.success(
      `Dispersión autorizada: $${amount.toLocaleString("es-CO")} COP transferidos a ${name}.`
    );
  };

  const totalBilledMonth = settlements.reduce((a, b) => a + b.totalBilled, 0);
  const totalCashCollected = settlements.reduce((a, b) => a + b.cashCollected, 0);
  const totalDigitalCollected = settlements.reduce(
    (a, b) => a + b.digitalCollected,
    0
  );
  const totalNetDue = settlements.reduce(
    (a, b) => (b.status === "PENDING" ? a + b.netPayout : a),
    0
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <Link
        to="/luis"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver a Mi Panel Médico (Dr. Luis)
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
            Cierre Contable · Noviembre 2026
          </span>
          <h1 className="mt-2 text-2xl font-black text-foreground md:text-3xl">
            Liquidación & Split de Comisiones Médicas
          </h1>
          <p className="text-xs text-muted-foreground">
            Conciliación matemática automática: cruce de cobros en efectivo en calle vs recaudos digitales en la nube.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            toast.success("Descargando libro contable de liquidación (.CSV / Excel)...")
          }
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
        >
          <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
          <span>Exportar a Excel / SIIGO</span>
        </button>
      </div>

      {/* KPI Overview Tiles */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              Facturación Mes
            </span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-black text-foreground">
            ${totalBilledMonth.toLocaleString("es-CO")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            78 consultas domiciliarias
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              Recaudo Digital Pasarela
            </span>
            <CreditCard className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ${totalDigitalCollected.toLocaleString("es-CO")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            90% pagado por Nequi/Card
          </span>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-muted-foreground">
              Efectivo en Calle (Retenido)
            </span>
            <Banknote className="h-4 w-4 text-amber-600" />
          </div>
          <p className="mt-2 font-mono text-2xl font-black text-amber-600 dark:text-amber-400">
            ${totalCashCollected.toLocaleString("es-CO")}
          </p>
          <span className="text-[11px] text-muted-foreground">
            Descontado de la liquidación
          </span>
        </div>

        <div className="rounded-2xl border-2 border-primary/40 bg-primary/5 p-4 shadow-soft">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-primary">
              Pendiente por Dispersar
            </span>
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-2 font-mono text-2xl font-black text-primary">
            ${totalNetDue.toLocaleString("es-CO")}
          </p>
          <span className="text-[11px] text-primary/80 font-bold">
            Saldo neto a transferir al equipo
          </span>
        </div>
      </div>

      {/* Explanatory Formula Callout */}
      <div className="rounded-2xl border border-border bg-secondary/60 p-4 text-xs text-muted-foreground">
        <div className="flex items-start gap-2">
          <HelpCircle className="h-4 w-4 shrink-0 text-primary mt-0.5" />
          <p>
            <b>Fórmula de Split Automático:</b>{" "}
            <span className="font-mono text-foreground font-bold">
              [Facturación del Médico × % Comisión] − [Efectivo cobrado en mano al cliente] = Transferencia Neta a Cuenta Bancaria
            </span>
            . Esto elimina las disputas de fin de mes por cuadre de caja en la práctica a domicilio.
          </p>
        </div>
      </div>

      {/* Staff Settlement Breakdown */}
      <div className="space-y-4">
        <h3 className="text-base font-black text-foreground">
          Liquidación Individual por Profesional
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {settlements.map((st) => (
            <div
              key={st.id}
              className={cn(
                "relative flex flex-col justify-between rounded-3xl border-2 p-5 shadow-soft transition",
                st.status === "PAID"
                  ? "border-emerald-500/40 bg-emerald-500/5"
                  : "border-border bg-card"
              )}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-black text-foreground text-base">
                      {st.staffName}
                    </h4>
                    <p className="text-xs text-muted-foreground">{st.role}</p>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {st.comvezcol} · {st.bank}
                    </span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[10px] font-black uppercase",
                      st.status === "PAID"
                        ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                        : "bg-amber-500/20 text-amber-700 dark:text-amber-300 animate-pulse"
                    )}
                  >
                    {st.status === "PAID" ? "✓ Transferido" : "Pendiente"}
                  </span>
                </div>

                {/* Math breakdown */}
                <div className="mt-4 rounded-2xl bg-secondary/60 p-3 text-xs space-y-1.5 font-sans">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Consultas Realizadas:</span>
                    <b className="font-mono text-foreground">{st.visits} visitas</b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Facturado:</span>
                    <span className="font-mono text-foreground">
                      ${st.totalBilled.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Comisión Pactada ({st.rate}%):
                    </span>
                    <b className="font-mono text-foreground">
                      +${st.grossCommission.toLocaleString("es-CO")}
                    </b>
                  </div>
                  <div className="flex justify-between text-amber-600 dark:text-amber-400">
                    <span>Efectivo cobrado en mano:</span>
                    <span className="font-mono font-bold">
                      -${st.cashCollected.toLocaleString("es-CO")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-border font-bold">
                    <span className="text-foreground">Transferencia Neta:</span>
                    <span className="font-mono text-base font-black text-primary">
                      ${st.netPayout.toLocaleString("es-CO")} COP
                    </span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="mt-5 pt-3 border-t border-border">
                {st.status === "PAID" ? (
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" />
                      Dispersión ejecutada
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Ref: {st.reference}
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleDisperse(st.id, st.staffName, st.netPayout)
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-98"
                  >
                    <Send className="h-4 w-4" />
                    <span>
                      Dispersar ${st.netPayout.toLocaleString("es-CO")} COP
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
