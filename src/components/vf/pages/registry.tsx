import type { ReactNode } from "react";
import { RequestsInbox, RoutesPage, SimulatorPage, ReferralsPage, SpecialistsPage, IncidentsPage, ApprovalsPage, NotificationsPage, OkvetPage, FinancePage, ClientsPage, ReportsPage, AcademyPage, TreatmentsPage, InventoryPage, AbsencePage, MoreMenu, ICONS as I } from "./modules";
import { UsersPage, IntegrationsPage } from "./admin";
import { ScaffoldPage } from "./Scaffold";
import { LuisPatients, LuisReminders, LuisPatientReferrals, LuisVetHome } from "@/features/luis/LuisPages";
import { PersonalAcademy } from "@/features/field-operations/components/AdvancedPages";
import { qualityPage } from "@/features/customer-experience/pages";

type Entry = { title: string; render: (base: string) => ReactNode };
export const MODULES: Record<string, Entry> = {
  calidad: { title: "Calidad y experiencia", render: () => qualityPage("/operaciones/calidad") },
  fidelizacion: { title: "Relación y continuidad", render: () => qualityPage("/operaciones/fidelizacion") },
  solicitudes: { title: "Solicitudes", render: (b) => <RequestsInbox base={b} /> },
  rutas: { title: "Rutas", render: () => <RoutesPage /> },
  simulador: { title: "Simulador", render: () => <SimulatorPage /> },
  remisiones: { title: "Remisiones", render: () => <ReferralsPage /> },
  especialistas: { title: "Especialistas", render: () => <SpecialistsPage /> },
  incidencias: { title: "Incidencias", render: () => <IncidentsPage /> },
  aprobaciones: { title: "Aprobaciones", render: () => <ApprovalsPage /> },
  notificaciones: { title: "Notificaciones", render: () => <NotificationsPage /> },
  okvet: { title: "OKVET", render: () => <OkvetPage /> },
  finanzas: { title: "Finanzas", render: () => <FinancePage /> },
  clientes: { title: "Clientes", render: () => <ClientsPage /> },
  informes: { title: "Informes", render: () => <ReportsPage /> },
  academia: { title: "Academia", render: () => <AcademyPage /> },
  tratamientos: { title: "Tratamientos", render: () => <TreatmentsPage /> },
  inventario: { title: "Inventario", render: () => <InventoryPage /> },
  configuracion: { title: "Integraciones", render: () => <IntegrationsPage /> },
  usuarios: { title: "Usuarios y permisos", render: () => <UsersPage /> },
  ausencia: { title: "Modo ausencia", render: () => <AbsencePage /> },
  pacientes: { title: "Todos los pacientes", render: () => <LuisPatients /> },
  recordatorios: { title: "Recordatorios de pacientes", render: () => <LuisReminders /> },
  "remisiones-pacientes": { title: "Remisiones de pacientes", render: () => <LuisPatientReferrals /> },
  "mi-jornada": { title: "Mi jornada", render: () => <LuisVetHome /> },
};

const LUIS_MORE: [string, string, typeof I.Inbox][] = [
  ["calidad", "Calidad y experiencia", I.ShieldCheck], ["fidelizacion", "Relación y continuidad", I.Users],
  ["pacientes", "Todos los pacientes", I.Users], ["recordatorios", "Recordatorios de pacientes", I.Bell], ["remisiones-pacientes", "Remisiones de pacientes", I.Stethoscope], ["mi-jornada", "Mi jornada", I.CalendarClock],
  ["remisiones", "Remisiones", I.Stethoscope], ["especialistas", "Especialistas", I.Users], ["simulador", "Simulador", I.Shuffle], ["incidencias", "Incidencias", I.AlertTriangle], ["inventario", "Inventario", I.Package], ["notificaciones", "Notificaciones", I.Bell],
  ["aprobaciones", "Aprobaciones", I.CheckCircle2], ["ausencia", "Modo ausencia", I.ShieldCheck], ["solicitudes", "Solicitudes y WhatsApp", I.Inbox],
  ["rutas", "Rutas", I.RouteIcon], ["tratamientos", "Tratamientos", I.Pill], ["clientes", "Clientes", I.Users], ["finanzas", "Finanzas", I.Wallet],
  ["informes", "Informes y bitácora", I.FileText], ["okvet", "OKVET", I.Database], ["academia", "Academia", I.GraduationCap], ["usuarios", "Usuarios y permisos", I.Users], ["configuracion", "Integraciones", I.Settings],
];
const COORD_MORE: [string, string, typeof I.Inbox][] = [
  ["calidad", "Calidad y experiencia", I.ShieldCheck], ["fidelizacion", "Relación y continuidad", I.Users],
  ["solicitudes", "Solicitudes", I.Inbox], ["rutas", "Rutas", I.RouteIcon], ["simulador", "Simulador", I.Shuffle], ["remisiones", "Remisiones", I.Stethoscope],
  ["especialistas", "Especialistas", I.Users], ["incidencias", "Incidencias", I.AlertTriangle], ["aprobaciones", "Coberturas y reemplazos", I.CheckCircle2], ["okvet", "OKVET", I.Database], ["informes", "Informes", I.FileText],
];
const STAFF_MORE: [string, string, typeof I.Inbox][] = [
  ["tratamientos", "Tratamientos", I.Pill], ["inventario", "Inventario", I.Package], ["remisiones", "Remisiones", I.Stethoscope], ["incidencias", "Incidencias", I.AlertTriangle], ["notificaciones", "Notificaciones", I.Bell],
];
const MORE: Record<string, typeof LUIS_MORE> = { "/luis": LUIS_MORE, "/coordinacion": COORD_MORE, "/equipo": STAFF_MORE };

export function ModuleView({ base, slug }: { base: string; slug: string }) {
  if (base === "/equipo" && slug === "academia") return <PersonalAcademy />;
  if (slug === "mas") return <MoreMenu base={base} items={MORE[base] ?? []} />;
  const m = MODULES[slug];
  return m ? <>{m.render(base)}</> : <ScaffoldPage path={`${base}/${slug}`} />;
}
