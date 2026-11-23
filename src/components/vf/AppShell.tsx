import { ConnectionBanner } from "@/features/field-operations/components/FieldPages";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import {
  Home,
  Calendar,
  Users,
  Sparkles,
  Inbox,
  MoreHorizontal,
  PawPrint,
  User,
  Route as RouteIcon,
  ListChecks,
  GraduationCap,
  LifeBuoy,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PawDecor, TopBar, PawIcon, Btn } from "./ui";
import { DemoBanner } from "./DemoBanner";
import { Companions } from "./Companions";
import { AutoSupport } from "@/features/support/AutoSupport";
import { EmergencyAlertBanner } from "./EmergencyAlertBanner";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  exact?: boolean;
};

export const NAV: Record<string, { brand: string; notif: string; items: NavItem[] }> = {
  luis: {
    brand: "Vet Freedom OS",
    notif: "/luis/notificaciones",
    items: [
      { to: "/luis", label: "Inicio", icon: Home, exact: true },
      { to: "/direccion/whatsapp", label: "WhatsApp", icon: Inbox },
      { to: "/luis/agenda", label: "Agenda", icon: Calendar },
      { to: "/luis/equipo", label: "Equipo", icon: Users },
      { to: "/luis/mas", label: "Más", icon: MoreHorizontal },
    ],
  },
  coordinacion: {
    brand: "Vet Freedom OS",
    notif: "/coordinacion/notificaciones",
    items: [
      { to: "/coordinacion", label: "Bandeja", icon: Inbox, exact: true },
      { to: "/coordinacion/agenda", label: "Agenda", icon: Calendar },
      { to: "/coordinacion/equipo", label: "Equipo", icon: Users },
      { to: "/coordinacion/mas", label: "Más", icon: MoreHorizontal },
    ],
  },
  cliente: {
    brand: "Vet Life",
    notif: "/cliente/notificaciones",
    items: [
      { to: "/cliente", label: "Inicio", icon: Home, exact: true },
      { to: "/cliente/mascotas", label: "Mascotas", icon: PawPrint },
      { to: "/cliente/agenda", label: "Agenda", icon: Calendar },
      { to: "/cliente/perfil", label: "Perfil", icon: User },
    ],
  },
  equipo: {
    brand: "Vet Life",
    notif: "/equipo/notificaciones",
    items: [
      { to: "/equipo", label: "Jornada", icon: Home, exact: true },
      { to: "/equipo/ruta", label: "Ruta", icon: RouteIcon },
      { to: "/equipo/tareas", label: "Tareas", icon: ListChecks },
      { to: "/equipo/academia", label: "Academia", icon: GraduationCap },
      { to: "/equipo/mas", label: "Más", icon: MoreHorizontal },
    ],
  },
};

NAV["app"] = NAV["cliente"]!;
NAV["operaciones"] = NAV["coordinacion"]!;
NAV["direccion"] = NAV["luis"]!;
NAV["cuidador"] = {
  brand: "Vet Life",
  notif: "/cuidador/inicio",
  items: [
    { to: "/cuidador/inicio", label: "Inicio", icon: Home },
    { to: "/cuidador/mascotas", label: "Mascotas", icon: PawPrint },
    { to: "/cuidador/visitas", label: "Visitas", icon: Calendar },
    { to: "/cuidador/perfil", label: "Perfil", icon: User },
  ],
};
NAV["admin"] = {
  brand: "Vet Freedom OS",
  notif: "/luis/notificaciones",
  items: [
    { to: "/admin", label: "Inicio", icon: Home, exact: true },
    { to: "/admin/usuarios", label: "Usuarios", icon: Users },
    { to: "/admin/project-memory", label: "Memoria", icon: ListChecks },
    { to: "/luis", label: "Dirección", icon: Sparkles },
  ],
};
NAV["auxiliar"] = {
  brand: "Vet Life",
  notif: "/auxiliar/mensajes",
  items: [
    { to: "/auxiliar/inicio", label: "Inicio", icon: Home },
    { to: "/auxiliar/asignaciones", label: "Visitas", icon: Calendar },
    { to: "/auxiliar/preparacion", label: "Preparar", icon: ListChecks },
    { to: "/auxiliar/mas", label: "Más", icon: MoreHorizontal },
  ],
};
NAV["recepcion"] = {
  brand: "Vet Life",
  notif: "/recepcion/bandeja",
  items: [
    { to: "/recepcion/inicio", label: "Inicio", icon: Home },
    { to: "/recepcion/bandeja", label: "Bandeja", icon: Inbox },
    { to: "/recepcion/cita-rapida", label: "Cita", icon: Calendar },
    { to: "/recepcion/clientes", label: "Clientes", icon: Users },
  ],
};
NAV["finanzas"] = {
  brand: "Vet Freedom OS",
  notif: "/finanzas/inicio",
  items: [
    { to: "/finanzas/inicio", label: "Inicio", icon: Home },
    { to: "/finanzas/cobros", label: "Cobros", icon: ListChecks },
    { to: "/finanzas/conciliacion", label: "Conciliar", icon: Sparkles },
    { to: "/finanzas/reportes", label: "Reportes", icon: MoreHorizontal },
  ],
};
NAV["soporte"] = {
  brand: "Vet Freedom OS",
  notif: "/soporte/incidencias",
  items: [
    { to: "/soporte/inicio", label: "Inicio", icon: Home },
    { to: "/soporte/incidencias", label: "Incidencias", icon: Inbox },
    { to: "/soporte/salud", label: "Salud", icon: Sparkles },
    { to: "/soporte/auditoria", label: "Auditoría", icon: ListChecks },
  ],
};
NAV["consultor"] = {
  brand: "Alpha Vision",
  notif: "/consultor/inicio",
  items: [
    { to: "/consultor/inicio", label: "Inicio", icon: Home },
    { to: "/consultor/indicadores", label: "Indicadores", icon: ListChecks },
    { to: "/consultor/mejoras", label: "Mejoras", icon: Sparkles },
    { to: "/consultor/perfil", label: "Perfil", icon: User },
  ],
};
NAV["especialista"] = {
  brand: "Vet Life",
  notif: "/especialista",
  items: [
    { to: "/especialista", label: "Inicio", icon: Home, exact: true },
    { to: "/especialista/remisiones", label: "Remisiones", icon: Inbox },
    { to: "/especialista/agenda", label: "Agenda", icon: Calendar },
  ],
};

export function AppShell({ area }: { area: keyof typeof NAV }) {
  const cfg = NAV[area] ?? NAV["cliente"];
  if (!cfg) throw new Error("Navegación no disponible");
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [support, setSupport] = useState(false);
  const isActive = (i: NavItem) =>
    i.exact ? path === i.to || path === i.to + "/" : path.startsWith(i.to);
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r border-sidebar-border bg-sidebar p-5 text-sidebar-foreground md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <PawIcon className="h-8 w-8 shrink-0 text-sidebar-foreground" />
          <span className="min-w-0 text-lg font-extrabold">
            Veterinaria Dr. Luis Ríos
            <span className="mt-2 block text-xs font-semibold text-sidebar-foreground/60">
              {cfg.brand}
            </span>
          </span>
        </Link>
        {cfg.items.map((i) => (
          <Link
            key={i.to}
            to={i.to as never}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition",
              isActive(i)
                ? "bg-accent text-primary"
                : "text-sidebar-foreground/75 hover:bg-sidebar-foreground/10",
            )}
          >
            <i.icon className="h-5 w-5" />
            {i.label}
          </Link>
        ))}
        {(area === "luis" || area === "direccion") && (
          <Link
            to="/luis/asistente"
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 font-semibold transition",
              path.includes("/asistente")
                ? "bg-accent text-primary"
                : "text-sidebar-foreground/75 hover:bg-sidebar-foreground/10",
            )}
          >
            <Sparkles className="h-5 w-5" />
            Asistente IA
          </Link>
        )}
        <Link
          to="/"
          className="mt-auto rounded-lg px-4 py-3 text-sm text-sidebar-foreground/75 hover:bg-sidebar-foreground/10"
        >
          Cambiar de perfil
        </Link>
      </aside>
      <div
        className={cn(
          "relative mx-auto w-full max-w-md overflow-x-hidden px-5 pb-32 md:max-w-3xl md:pb-12",
          path.includes("/whatsapp") && "lg:max-w-6xl",
        )}
      >
        <DemoBanner />
        <EmergencyAlertBanner />
        <PawDecor />
        <TopBar brand={cfg.brand} notifTo={cfg.notif} />
        <p className="text-sm font-bold text-primary md:hidden">Veterinaria Dr. Luis Ríos</p>
        <main className="relative z-10">
          <div className="mt-3 flex justify-end">
            <Btn
              variant="soft"
              className="p-2"
              aria-label="Soporte automático"
              title="Soporte automático"
              aria-expanded={support}
              onClick={() => setSupport(!support)}
            >
              <LifeBuoy className="h-5 w-5" />
            </Btn>
          </div>
          {support && <AutoSupport compact />}
          <ConnectionBanner />
          {(area === "luis" || area === "direccion") && !path.includes("asistente") && (
            <Link
              to="/luis/asistente"
              className="mt-3 flex items-center gap-2 text-sm font-bold text-primary"
            >
              <Sparkles className="h-4 w-4" />
              Preguntar a la asistente
            </Link>
          )}
          {cfg.items.some((i) => i.exact && isActive(i)) && <Companions compact />}
          <Outlet />
          {(area === "luis" || area === "direccion" || area === "admin") && !path.endsWith("/mas") && (
            <Link
              to="/luis/$modulo"
              params={{ modulo: "mas" }}
              className="mt-5 block rounded-2xl bg-secondary/80 p-3 text-center text-sm font-bold text-primary hover:bg-secondary md:hidden"
            >
              Ver todos los módulos (Más módulos) →
            </Link>
          )}
        </main>
      </div>
      <nav
        className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden"
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-md justify-around pt-2">
          {cfg.items.map((i) => {
            const a = isActive(i);
            return (
              <Link
                key={i.to}
                to={i.to as never}
                aria-current={a ? "page" : undefined}
                className={cn(
                  "flex min-w-16 flex-col items-center gap-1 px-2 py-1 text-sm transition",
                  a ? "font-bold text-primary" : "text-muted-foreground",
                )}
              >
                <i.icon className="h-7 w-7" />
                {i.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
