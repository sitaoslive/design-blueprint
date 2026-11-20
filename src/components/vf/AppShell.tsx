import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import type { ComponentType } from "react";
import { Home, Calendar, Users, Sparkles, Inbox, MoreHorizontal, PawPrint, User, Route as RouteIcon, ListChecks, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { PawDecor, TopBar, PawIcon } from "./ui";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }>; exact?: boolean };

export const NAV: Record<string, { brand: string; notif: string; items: NavItem[] }> = {
  luis: { brand: "Vet Freedom OS", notif: "/luis/notificaciones", items: [
    { to: "/luis", label: "Inicio", icon: Home, exact: true },
    { to: "/luis/agenda", label: "Agenda", icon: Calendar },
    { to: "/luis/equipo", label: "Equipo", icon: Users },
    { to: "/luis/asistente", label: "Asistente", icon: Sparkles },
    { to: "/luis/mas", label: "Más", icon: MoreHorizontal },
  ] },
  coordinacion: { brand: "Vet Freedom OS", notif: "/coordinacion/notificaciones", items: [
    { to: "/coordinacion", label: "Bandeja", icon: Inbox, exact: true },
    { to: "/coordinacion/agenda", label: "Agenda", icon: Calendar },
    { to: "/coordinacion/equipo", label: "Equipo", icon: Users },
    { to: "/coordinacion/mas", label: "Más", icon: MoreHorizontal },
  ] },
  cliente: { brand: "Vet Life", notif: "/cliente/notificaciones", items: [
    { to: "/cliente", label: "Inicio", icon: Home, exact: true },
    { to: "/cliente/mascotas", label: "Mascotas", icon: PawPrint },
    { to: "/cliente/agenda", label: "Agenda", icon: Calendar },
    { to: "/cliente/perfil", label: "Perfil", icon: User },
  ] },
  equipo: { brand: "Vet Life", notif: "/equipo/notificaciones", items: [
    { to: "/equipo", label: "Jornada", icon: Home, exact: true },
    { to: "/equipo/ruta", label: "Ruta", icon: RouteIcon },
    { to: "/equipo/tareas", label: "Tareas", icon: ListChecks },
    { to: "/equipo/academia", label: "Academia", icon: GraduationCap },
    { to: "/equipo/mas", label: "Más", icon: MoreHorizontal },
  ] },
};

NAV["app"] = NAV["cliente"]!;
NAV["operaciones"] = NAV["coordinacion"]!;
NAV["direccion"] = NAV["luis"]!;
NAV["cuidador"] = { brand: "Vet Life", notif: "/cuidador/inicio", items: [
  { to: "/cuidador/inicio", label: "Inicio", icon: Home }, { to: "/cuidador/mascotas", label: "Mascotas", icon: PawPrint },
  { to: "/cuidador/visitas", label: "Visitas", icon: Calendar }, { to: "/cuidador/perfil", label: "Perfil", icon: User } ] };
NAV["admin"] = { brand: "Vet Freedom OS", notif: "/luis/notificaciones", items: [
  { to: "/admin", label: "Inicio", icon: Home, exact: true }, { to: "/admin/usuarios", label: "Usuarios", icon: Users },
  { to: "/admin/project-memory", label: "Memoria", icon: ListChecks }, { to: "/luis", label: "Dirección", icon: Sparkles } ] };
NAV["auxiliar"] = { brand: "Vet Life", notif: "/auxiliar/mensajes", items: [
  { to: "/auxiliar/inicio", label: "Inicio", icon: Home }, { to: "/auxiliar/asignaciones", label: "Visitas", icon: Calendar },
  { to: "/auxiliar/preparacion", label: "Preparar", icon: ListChecks }, { to: "/auxiliar/mas", label: "Más", icon: MoreHorizontal } ] };
NAV["especialista"] = { brand: "Vet Life", notif: "/especialista", items: [
  { to: "/especialista", label: "Inicio", icon: Home, exact: true }, { to: "/especialista/remisiones", label: "Remisiones", icon: Inbox }, { to: "/especialista/agenda", label: "Agenda", icon: Calendar } ] };

export function AppShell({ area }: { area: keyof typeof NAV }) {
  const cfg = NAV[area]!;
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (i: NavItem) => (i.exact ? path === i.to || path === i.to + "/" : path.startsWith(i.to));
  return (
    <div className="min-h-screen bg-background md:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-1 border-r border-border bg-sidebar p-5 md:flex">
        <Link to="/" className="mb-6 flex items-center gap-2"><PawIcon className="h-8 w-8 text-primary" /><span className="text-xl font-extrabold">{cfg.brand}</span></Link>
        {cfg.items.map((i) => (
          <Link key={i.to} to={i.to as never} className={cn("flex items-center gap-3 rounded-2xl px-4 py-3 font-semibold transition", isActive(i) ? "bg-accent text-primary" : "text-muted-foreground hover:bg-secondary")}>
            <i.icon className="h-5 w-5" />{i.label}
          </Link>
        ))}
        <Link to="/" className="mt-auto rounded-2xl px-4 py-3 text-sm text-muted-foreground hover:bg-secondary">Cambiar de perfil</Link>
      </aside>
      <div className="relative mx-auto w-full max-w-md overflow-x-hidden px-5 pb-32 md:max-w-3xl md:pb-12">
        <PawDecor />
        <TopBar brand={cfg.brand} notifTo={cfg.notif} />
        <main className="relative z-10"><Outlet /></main>
      </div>
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur md:hidden" aria-label="Navegación principal">
        <div className="mx-auto flex max-w-md justify-around pt-2">
          {cfg.items.map((i) => {
            const a = isActive(i);
            return (
              <Link key={i.to} to={i.to as never} aria-current={a ? "page" : undefined} className={cn("flex min-w-16 flex-col items-center gap-1 px-2 py-1 text-sm transition", a ? "font-bold text-primary" : "text-muted-foreground")}>
                <i.icon className="h-7 w-7" />{i.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
