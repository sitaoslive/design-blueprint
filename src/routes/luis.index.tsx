import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Calendar,
  ClipboardList,
  AlertTriangle,
  Shuffle,
  CalendarPlus,
  Users,
  MessageCircle,
  Wallet,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { useVF } from "@/lib/vf/store";
import { canProvideClinicalCare } from "@/lib/vf/roles";
import { bogotaDate } from "@/features/finance/domain/presentation";
import { operationalDay } from "@/features/field-operations/domain/advanced";
import { meta } from "@/lib/vf/meta";
import { LuisModeSwitch, LuisVetHome, OwnerAlerts, useLuisMode } from "@/features/luis/LuisPages";
import {
  PageTitle,
  SectionTitle,
  ListCard,
  AttentionRow,
  QuickAction,
  DemoNote,
} from "@/components/vf/ui";

export const Route = createFileRoute("/luis/")({
  head: () => meta("Centro ejecutivo", "Lo que Luis necesita revisar hoy, en una sola pantalla."),
  component: Dashboard,
});

function Stat({
  icon: I,
  value,
  label,
  to,
}: {
  icon: typeof Calendar;
  value: React.ReactNode;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to as never}
      className="flex flex-col items-center border-border px-1 text-center transition active:opacity-70 [&:not(:first-child)]:border-l"
    >
      <I className="mb-1 h-7 w-7 text-primary" />
      <b className="text-3xl">{value}</b>
      <span className="text-sm leading-tight text-muted-foreground">{label}</span>
    </Link>
  );
}

function Ring({ value }: { value: number }) {
  const c = 2 * Math.PI * 26;
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-16 w-16 -rotate-90"
      aria-label={`Índice de autonomía ${value}%`}
    >
      <circle cx="32" cy="32" r="26" fill="none" stroke="var(--sage)" strokeWidth="7" />
      <circle
        cx="32"
        cy="32"
        r="26"
        fill="none"
        stroke="var(--sage-foreground)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
      />
      <text
        x="32"
        y="37"
        textAnchor="middle"
        className="rotate-90 fill-foreground text-[15px] font-extrabold"
        style={{ transformOrigin: "32px 32px" }}
      >
        {value}%
      </text>
    </svg>
  );
}

function Dashboard() {
  const [mode, setMode] = useLuisMode();
  const clinical = useVF((s) => canProvideClinicalCare(s.roles));
  return (
    <>
      {clinical && <LuisModeSwitch mode={mode} onChange={setMode} />}
      {clinical && mode === "veterinario" ? <LuisVetHome /> : <OwnerDashboard />}
    </>
  );
}

function OwnerDashboard() {
  const visits = useVF((s) => s.visits);
  const reqs = useVF((s) => s.requests.filter((r) => r.status !== "resuelta").length);
  const newReqs = useVF((s) => s.requests.filter((r) => r.status === "nueva").length);
  const approvals = useVF((s) => s.approvals);
  const incidents = useVF(
    (s) => s.incidents.filter((i) => i.status !== "cerrada" && i.severity === "alta").length,
  );
  const absence = useVF((s) => s.absence);
  const unconfirmed = visits.filter(
    (v) => v.status === "pendiente" || v.status === "pendiente_okvet",
  ).length;
  const pendingAp = approvals.filter((a) => a.status === "pendiente");
  const todayVisits = visits.filter(
    (v) => bogotaDate(v.operationalOn ?? v.date) === operationalDay(),
  );
  return (
    <>
      <PageTitle title="Hola, Luis" subtitle="Esto es lo que requiere tu atención hoy" />
      {newReqs > 0 && (
        <Link to="/luis/$modulo" params={{ modulo: "notificaciones" }} className="mb-4 flex items-center gap-3 rounded-3xl border-2 border-primary/30 bg-card p-4 shadow-soft">
          <ClipboardList className="h-7 w-7 shrink-0 text-primary" />
          <span className="flex-1"><b className="block text-lg">{newReqs} solicitud{newReqs === 1 ? "" : "es"} nueva{newReqs === 1 ? "" : "s"}</b><span className="text-sm text-muted-foreground">Revísalas en notificaciones</span></span>
          <ChevronRight className="h-5 w-5 text-primary" />
        </Link>
      )}
      <div className="grid grid-cols-4 rounded-3xl bg-secondary px-1 py-4 shadow-soft">
        <Stat icon={Calendar} value={todayVisits.length} label="Visitas hoy" to="/luis/agenda" />
        <Stat
          icon={ClipboardList}
          value={reqs}
          label="Solicitudes pendientes"
          to="/luis/solicitudes"
        />
        <Stat
          icon={AlertTriangle}
          value={incidents}
          label="Incidencias altas"
          to="/luis/incidencias"
        />
        <Link
          to="/direccion/$"
          params={{ _splat: "autonomia" }}
          className="flex flex-col items-center border-l border-border text-center"
        >
          <ShieldCheck className="mb-2 h-7 w-7 text-sage-foreground" />
          <b className="text-sm">Sin datos suficientes</b>
          <span className="text-sm leading-tight text-muted-foreground">Autonomía</span>
        </Link>
      </div>
      <OwnerAlerts />
      {absence?.active && (
        <Link
          to={"/luis/ausencia" as never}
          className="mt-3 flex items-center gap-2 rounded-2xl bg-sage p-3 font-semibold"
        >
          <ShieldCheck className="h-5 w-5 text-sage-foreground" />
          Plan de ausencia registrado · {absence.coordinator} · autoridad por verificar
        </Link>
      )}
      <SectionTitle>Requiere tu revisión</SectionTitle>
      <ListCard>
        {pendingAp.find((a) => a.kind === "reorganizacion") && (
          <AttentionRow icon={Shuffle} title="Aprobar reorganización" to="/luis/aprobaciones" />
        )}
        {unconfirmed > 0 && (
          <AttentionRow
            icon={Calendar}
            title={`${unconfirmed} citas sin confirmar`}
            to="/luis/agenda"
          />
        )}
        {pendingAp.find((a) => a.kind === "cobro") && (
          <AttentionRow icon={Wallet} title="Cobro alto pendiente" to="/luis/aprobaciones" />
        )}
        {pendingAp.find((a) => a.kind === "reemplazo") && (
          <AttentionRow icon={Users} title="Solicitud de reemplazo" to="/luis/aprobaciones" />
        )}
        {pendingAp.length === 0 && unconfirmed === 0 && (
          <p className="py-4 text-center text-muted-foreground">
            Todo al día. La operación avanza sin ti.
          </p>
        )}
      </ListCard>
      <SectionTitle>Acciones rápidas</SectionTitle>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <QuickAction icon={CalendarPlus} label="Nueva cita rápida" to="/luis/nueva-cita" />
        <QuickAction icon={Calendar} label="Ver agenda" tone="sage" to="/luis/agenda" />
        <QuickAction icon={Users} label="Equipo" to="/luis/equipo" />
        <QuickAction icon={Users} label="Operación de campo" tone="sage" to="/luis/campo" />
        <QuickAction icon={MessageCircle} label="Asistente" tone="sage" to="/luis/asistente" />
        <QuickAction icon={Shuffle} label="Más módulos" tone="sage" to="/luis/mas" />
      </div>
      <Link
        to={"/luis/finanzas" as never}
        className="mt-4 flex items-center gap-4 rounded-3xl bg-sage p-5 shadow-soft"
      >
        <span className="grid h-14 w-14 place-items-center rounded-full bg-card">
          <Wallet className="h-7 w-7 text-sage-foreground" />
        </span>
        <span className="flex-1 text-lg">
          Cobros y fuentes
          <b className="block text-base text-sage-foreground">
            Reportado, verificado y conciliado por separado
          </b>
        </span>
        <ChevronRight className="text-sage-foreground" />
      </Link>
      <Link
        to={"/luis/ausencia" as never}
        className="mt-3 flex items-center justify-center gap-2 text-primary"
      >
        <Sparkles className="h-4 w-4" />
        Configurar modo ausencia
      </Link>
      <DemoNote />
    </>
  );
}
