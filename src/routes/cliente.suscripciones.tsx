import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Sparkles,
  ChevronLeft,
  Package,
  Calendar,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Truck,
  Plus,
  RefreshCw,
  Award,
  ChevronRight,
  MapPin,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, Card, Btn } from "@/components/vf/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cliente/suscripciones")({
  head: () =>
    meta(
      "Membresías & Auto-Refill",
      "Club de salud preventiva y despacho mensual automático de alimentos y antiparasitarios."
    ),
  component: SubscriptionsPage,
});

function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState<"subscriptions" | "membership">(
    "subscriptions"
  );

  const [subscriptions, setSubscriptions] = useState([
    {
      id: "sub-1",
      pet: "Kenji",
      petBreed: "Shiba Inu",
      product: "Simparica Trio 10-20 kg (1 comprimido)",
      category: "Antiparasitario Mensual",
      frequencyDays: 30,
      nextDispatch: "4 de Diciembre, 2026",
      daysLeft: 12,
      price: 52200, // 10% off $58,000
      regularPrice: 58000,
      autoCharge: true,
      address: "Calle 10 # 43E-12, Poblado, Medellín",
      dosage: "1 tableta masticable mensual con el desayuno",
      status: "ACTIVE",
    },
    {
      id: "sub-2",
      pet: "Samantha",
      petBreed: "Gato Criollo",
      product: "Hill's Prescription Diet c/d Multicare Feline 3.8 kg",
      category: "Alimento Medicado Urinario",
      frequencyDays: 45,
      nextDispatch: "10 de Diciembre, 2026",
      daysLeft: 18,
      price: 157500, // 10% off $175,000
      regularPrice: 175000,
      autoCharge: true,
      address: "Carrera 25 # 3-45, Envigado",
      dosage: "65g al día dividido en 2 tomas",
      status: "ACTIVE",
    },
  ]);

  const [membership, setMembership] = useState({
    tierName: "Plan Salud Adulto",
    monthlyFee: 49000,
    status: "ACTIVE",
    petName: "Nilo",
    includedHomeVisits: 2,
    usedHomeVisits: 1,
    savedThisYear: 180000,
    perks: [
      { name: "2 Consultas Médicas a Domicilio / año", status: "1 usada · 1 disponible" },
      { name: "Vacuna de Rabia Anual", status: "Al día (Vence Oct 2027)" },
      { name: "Vacuna Séxtuple Canina", status: "Al día" },
      { name: "Desparasitación Interna Semestral", status: "Próxima en 45 días" },
      { name: "Tele-Triaje Prioritario 24/7 sin costo", status: "Ilimitado" },
      { name: "15% Descuento en Exámenes de Laboratorio", status: "Activo" },
    ],
  });

  const toggleAutoCharge = (id: string) => {
    setSubscriptions((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextVal = !s.autoCharge;
          toast.info(
            nextVal
              ? `Cobro automático reactivado para ${s.product}`
              : `Cobro automático pausado. Se solicitará confirmación manual previa al envío.`
          );
          return { ...s, autoCharge: nextVal };
        }
        return s;
      })
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <Link
        to="/cliente"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al Panel del Tutor
      </Link>

      <PageTitle
        title="Salud Recurrente & Auto-Refill"
        subtitle="Despacho programado de medicamentos a la puerta de tu casa y membresía de salud preventiva."
      />

      {/* Segmented Control Tabs */}
      <div className="flex rounded-2xl bg-secondary/80 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("subscriptions")}
          className={cn(
            "flex-1 rounded-xl py-3 text-xs font-black transition",
            activeTab === "subscriptions"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          📦 Auto-Refill Fórmulas ({subscriptions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("membership")}
          className={cn(
            "flex-1 rounded-xl py-3 text-xs font-black transition",
            activeTab === "membership"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          ⭐ Club de Salud Preventiva (1)
        </button>
      </div>

      {/* TAB 1: Auto-Refill Subscriptions */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-foreground">
                Entregas Programadas
              </h3>
              <p className="text-xs text-muted-foreground">
                Recibe la dosis exacta antes de que se agote con 10% de ahorro recurrente.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                toast.success(
                  "Para agregar un medicamento o alimento a tu auto-refill, solicítalo al Dr. Luis o durante tu consulta."
                )
              }
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Añadir Producto</span>
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {subscriptions.map((sub) => (
              <div
                key={sub.id}
                className="relative overflow-hidden rounded-3xl border border-border bg-card p-5 shadow-soft transition hover:border-primary/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
                      <Package className="h-5 w-5" />
                    </span>
                    <div>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                        {sub.category}
                      </span>
                      <h4 className="font-black text-foreground text-sm leading-snug">
                        {sub.product}
                      </h4>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-2xl bg-secondary/60 p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Para:</span>
                    <b className="text-foreground">
                      {sub.pet} ({sub.petBreed})
                    </b>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frecuencia:</span>
                    <span className="font-semibold text-foreground">
                      Cada {sub.frequencyDays} días
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Posología:</span>
                    <span className="italic text-foreground">{sub.dosage}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-border">
                    <span className="text-muted-foreground">Precio suscriptor:</span>
                    <div className="text-right">
                      <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400">
                        ${sub.price.toLocaleString("es-CO")} COP
                      </span>
                      <span className="ml-1 text-[10px] line-through text-muted-foreground">
                        ${sub.regularPrice.toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dispatch ETA banner */}
                <div className="mt-3 flex items-center justify-between rounded-xl bg-primary/5 p-2.5 text-xs">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Truck className="h-4 w-4" />
                    <span>Próximo despacho: {sub.nextDispatch}</span>
                  </div>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-black text-primary">
                    En {sub.daysLeft} días
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{sub.address}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleAutoCharge(sub.id)}
                    className={cn(
                      "font-bold transition hover:underline",
                      sub.autoCharge ? "text-emerald-600" : "text-amber-600"
                    )}
                  >
                    {sub.autoCharge ? "✓ Débito Activo" : "⏸ Manual"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Pet Wellness Membership Club */}
      {activeTab === "membership" && (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-secondary p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500 text-white shadow-md">
                  <Award className="h-7 w-7" />
                </div>
                <div>
                  <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">
                    Membresía Activa
                  </span>
                  <h3 className="text-xl font-black text-foreground">
                    {membership.tierName} · {membership.petName}
                  </h3>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-2xl font-black text-foreground">
                  ${membership.monthlyFee.toLocaleString("es-CO")}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    COP / mes
                  </span>
                </span>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                  ✓ Ahorro acumulado este año: ${membership.savedThisYear.toLocaleString("es-CO")} COP
                </p>
              </div>
            </div>

            {/* Home Visits Quota Progress */}
            <div className="mt-6 rounded-2xl bg-card p-4 border border-border shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  Visitas Médicas Domiciliarias Incluidas en tu Plan:
                </span>
                <span className="font-mono text-primary font-black">
                  {membership.usedHomeVisits} de {membership.includedHomeVisits} utilizadas (1 disponible)
                </span>
              </div>
              <div className="mt-2 h-3 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${
                      (membership.usedHomeVisits /
                        membership.includedHomeVisits) *
                      100
                    }%`,
                  }}
                />
              </div>
              <div className="mt-3 flex justify-between items-center text-xs">
                <span className="text-muted-foreground">
                  Renovación anual de cupos: 22 de Septiembre, 2027
                </span>
                <Link
                  to="/cliente/reservar"
                  className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                >
                  Usar mi visita disponible →
                </Link>
              </div>
            </div>

            {/* Perks List */}
            <div className="mt-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Beneficios Incluidos en tu Cobertura:
              </h4>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {membership.perks.map((perk, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-2xl bg-card/80 p-3 border border-border/80 text-xs"
                  >
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                    <div>
                      <b className="text-foreground">{perk.name}</b>
                      <p className="text-muted-foreground text-[11px]">
                        {perk.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                💳 Cargo recurrente en tarjeta: Visa terminada en 4821
              </span>
              <button
                type="button"
                onClick={() =>
                  toast.success(
                    "Tu solicitud de asesoría para Plan Dorado Senior ha sido enviada a coordinación."
                  )
                }
                className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                <span>Conocer Plan Dorado Senior (Adultos Mayores)</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
