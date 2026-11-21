import { Link } from "@tanstack/react-router";
import type { ReactNode, ComponentType } from "react";
import { Bell, ChevronRight, CheckCircle2, Clock, Car, PauseCircle, Search, PlayCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVF } from "@/lib/vf/store";

type Icon = ComponentType<{ className?: string }>;

export function PawIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="currentColor" aria-hidden>
      <ellipse cx="14" cy="26" rx="6.5" ry="8.5" transform="rotate(-20 14 26)" />
      <ellipse cx="25" cy="13" rx="6.5" ry="8.5" transform="rotate(-6 25 13)" />
      <ellipse cx="40" cy="13" rx="6.5" ry="8.5" transform="rotate(6 40 13)" />
      <ellipse cx="51" cy="26" rx="6.5" ry="8.5" transform="rotate(20 51 26)" />
      <path d="M32 30c-9 0-18 10-18 19 0 6 5 9 10 8 3-.5 5-2 8-2s5 1.5 8 2c5 1 10-2 10-8 0-9-9-19-18-19z" />
    </svg>
  );
}

export function PawDecor() {
  return null;
}

export function TopBar({ brand = "Vet Freedom OS", notifTo }: { brand?: string; notifTo: string }) {
  const unread = useVF((s) => s.notifications.filter((n) => !n.read).length);
  return (
    <div className="relative z-10 flex items-center justify-between gap-3 border-b border-border pb-4 pt-4">
      <Link to="/" className="flex items-center gap-2" aria-label="Cambiar de perfil">
        <PawIcon className="h-8 w-8 text-primary" />
        <span className="text-xl font-extrabold text-foreground">{brand}</span>
      </Link>
      <Link to={notifTo as never} aria-label="Notificaciones" className="relative grid h-12 w-12 place-items-center rounded-full bg-accent text-foreground transition active:scale-95">
        <Bell className="h-6 w-6" />
        {unread > 0 && <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-primary" />}
      </Link>
    </div>
  );
}

export function PageTitle({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="relative z-10 mb-5 mt-5">
      <h1 className="break-words text-3xl font-extrabold leading-tight text-foreground">{title}</h1>
      {subtitle && <p className="text-lg text-muted-foreground">{subtitle}</p>}
      {children}
    </div>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-3 mt-7 flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-extrabold text-foreground">{children}</h2>
      {action}
    </div>
  );
}

const tones = {
  blush: "bg-accent",
  sage: "bg-sage",
  cream: "bg-secondary",
  amber: "bg-amber",
} as const;
export type Tone = keyof typeof tones;
const iconTones: Record<Tone, string> = { blush: "text-primary", sage: "text-sage-foreground", cream: "text-primary", amber: "text-amber-foreground" };

export function MetricTile({ icon: I, label, value, tone = "blush", to }: { icon: Icon; label: string; value: ReactNode; tone?: Tone; to: string }) {
  return (
    <Link to={to as never} className={cn("animate-pop flex items-center gap-3 rounded-3xl p-4 shadow-soft transition active:scale-[.98]", tones[tone])}>
      <I className={cn("h-8 w-8 shrink-0", iconTones[tone])} />
      <span className="flex-1 text-[1.05rem] leading-tight text-foreground">{label}</span>
      <span className="text-4xl font-extrabold text-foreground">{value}</span>
    </Link>
  );
}

export function QuickAction({ icon: I, label, tone = "blush", to, onClick, vertical }: { icon: Icon; label: string; tone?: Tone; to?: string; onClick?: () => void; vertical?: boolean }) {
  const cls = cn("flex items-center gap-4 rounded-3xl px-5 py-4 text-lg text-foreground shadow-soft transition active:scale-[.98]", tones[tone], vertical && "flex-col justify-center gap-2 py-6 text-center");
  const inner = (<><I className={cn("h-7 w-7 shrink-0", iconTones[tone])} /><span className="leading-tight">{label}</span></>);
  return to ? <Link to={to as never} className={cls}>{inner}</Link> : <button type="button" onClick={onClick} className={cls}>{inner}</button>;
}

export function ListCard({ children }: { children: ReactNode }) {
  return <div className="divide-y divide-border rounded-3xl bg-secondary px-4 shadow-soft">{children}</div>;
}

export function AttentionRow({ icon: I, title, detail, to, tone = "blush" }: { icon: Icon; title: string; detail?: string; to: string; tone?: Tone }) {
  return (
    <Link to={to as never} className="flex items-center gap-4 py-3 transition active:opacity-70">
      <span className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full", tones[tone])}><I className={cn("h-6 w-6", iconTones[tone])} /></span>
      <span className="flex-1">
        <span className="block text-lg font-bold text-foreground">{title}</span>
        {detail && <span className="block text-muted-foreground">{detail}</span>}
      </span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}

export function RowLink({ icon: I, label, to, tone = "blush" }: { icon: Icon; label: ReactNode; to: string; tone?: Tone }) {
  return (
    <Link to={to as never} className={cn("mb-3 flex items-center gap-4 rounded-2xl px-5 py-4 text-lg text-foreground transition active:scale-[.99]", tones[tone])}>
      <I className={cn("h-7 w-7", iconTones[tone])} />
      <span className="flex-1">{label}</span>
      <ChevronRight className="h-5 w-5 text-muted-foreground" />
    </Link>
  );
}

const statusMap: Record<string, { label: string; cls: string; icon: Icon }> = {
  confirmada: { label: "Confirmada", cls: "bg-sage text-sage-foreground", icon: CheckCircle2 },
  pendiente: { label: "Pendiente", cls: "bg-amber text-amber-foreground", icon: Clock },
  pendiente_okvet: { label: "Pendiente OKVET", cls: "bg-amber text-amber-foreground", icon: Clock },
  en_curso: { label: "En curso", cls: "bg-sage text-sage-foreground", icon: PlayCircle },
  por_iniciar: { label: "Por iniciar", cls: "bg-amber text-amber-foreground", icon: Clock },
  revision: { label: "Revisión", cls: "bg-sage text-sage-foreground", icon: Search },
  finalizada: { label: "Finalizada", cls: "bg-secondary text-muted-foreground", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", cls: "bg-danger text-danger-foreground", icon: AlertCircle },
  disponible: { label: "Disponible", cls: "bg-sage text-sage-foreground", icon: CheckCircle2 },
  en_ruta: { label: "En ruta", cls: "bg-amber text-amber-foreground", icon: Car },
  ausente: { label: "Ausente", cls: "bg-danger text-danger-foreground", icon: PauseCircle },
  posible: { label: "Posible", cls: "bg-sage text-sage-foreground", icon: CheckCircle2 },
  pagado: { label: "Pagado", cls: "bg-sage text-sage-foreground", icon: CheckCircle2 },
  vencido: { label: "Vencido", cls: "bg-danger text-danger-foreground", icon: AlertCircle },
  aprobada: { label: "Aprobada", cls: "bg-sage text-sage-foreground", icon: CheckCircle2 },
  rechazada: { label: "Rechazada", cls: "bg-danger text-danger-foreground", icon: AlertCircle },
  abierta: { label: "Abierta", cls: "bg-danger text-danger-foreground", icon: AlertCircle },
  en_gestion: { label: "En gestión", cls: "bg-amber text-amber-foreground", icon: Clock },
  cerrada: { label: "Cerrada", cls: "bg-sage text-sage-foreground", icon: CheckCircle2 },
  nueva: { label: "Nueva", cls: "bg-accent text-accent-foreground", icon: AlertCircle },
  resuelta: { label: "Resuelta", cls: "bg-sage text-sage-foreground", icon: CheckCircle2 },
  por_resolver: { label: "Por resolver", cls: "bg-amber text-amber-foreground", icon: Clock },
  agendada: { label: "Agendada", cls: "bg-sage text-sage-foreground", icon: CheckCircle2 },
  bloqueado: { label: "Pendiente de integración", cls: "bg-amber text-amber-foreground", icon: Clock },
};
export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const m = statusMap[status] ?? { label: status, cls: "bg-secondary text-foreground", icon: Clock };
  const I = m.icon;
  return <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold", m.cls, className)}><I className="h-4 w-4" />{m.label}</span>;
}

export function Chips<T extends string>({ options, value, onChange }: { options: { value: T; label: string; icon?: Icon }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
      {options.map((o) => {
        const active = o.value === value; const I = o.icon;
        return (
          <button key={o.value} role="tab" aria-selected={active} onClick={() => onChange(o.value)}
            className={cn("flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-base font-semibold transition active:scale-95",
              active ? "bg-gradient-primary text-primary-foreground shadow-button" : "bg-secondary text-foreground")}>
            {I && <I className="h-5 w-5" />}{o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Btn({ children, variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "soft" | "sage" }) {
  const v = {
    primary: "bg-gradient-primary text-primary-foreground shadow-button",
    outline: "border-2 border-primary/40 bg-card text-primary-dark",
    soft: "bg-accent text-foreground",
    sage: "bg-sage text-foreground",
  }[variant];
  return <button type="button" {...p} className={cn("inline-flex min-h-11 max-w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition active:scale-[.98] disabled:opacity-50", v, className)}>{children}</button>;
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("animate-pop rounded-lg border border-border bg-card p-4 shadow-soft", className)}>{children}</div>;
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center rounded-3xl bg-secondary p-8 text-center">
      <PawIcon className="mb-2 h-10 w-10 text-paw" />
      <p className="font-bold text-foreground">{title}</p>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function DemoNote() {
  return <p className="mt-8 text-center text-xs text-muted-foreground">Modo demostración · datos de ejemplo · sin conexión a OKVET ni WhatsApp todavía</p>;
}
