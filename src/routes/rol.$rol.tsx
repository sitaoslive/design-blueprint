import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, CheckCircle2, Lock } from "lucide-react";
import { roleById } from "@/lib/vf/roles";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, Card, PawIcon, Empty } from "@/components/vf/ui";

const LINKS: Record<string, [string, string][]> = {
  recepcion: [["/coordinacion/solicitudes", "Bandeja de solicitudes"], ["/coordinacion/nueva-cita", "Nueva cita rápida"]],
  finanzas: [["/luis/finanzas", "Cobros y cartera"], ["/luis/informes", "Bitácora"]],
  administrador: [["/luis/configuracion", "Integraciones y políticas"], ["/luis/academia", "Academia"]],
  auxiliar: [["/equipo/inventario", "Preparar insumos"], ["/equipo/tareas", "Tareas"]],
  cuidador: [["/cliente/agenda", "Citas autorizadas"]],
  soporte: [["/luis/informes", "Registros de la sesión"]],
  consultor: [["/luis/informes", "Indicadores autorizados"]],
};

export const Route = createFileRoute("/rol/$rol")({
  head: ({ params }) => meta(roleById(params.rol)?.label ?? "Perfil", "Permisos y accesos del perfil."),
  component: RolePage,
});

function RolePage() {
  const { rol } = Route.useParams(); const r = roleById(rol);
  return (
    <div className="mx-auto min-h-screen max-w-md bg-background px-5 pb-12 md:max-w-2xl">
      <Link to="/" className="inline-flex items-center gap-1 pt-6 text-primary"><ChevronLeft className="h-5 w-5" />Perfiles</Link>
      {!r ? <div className="mt-8"><Empty title="Perfil no encontrado" /></div> : (<>
        <div className="mt-4 flex items-center gap-2"><PawIcon className="h-8 w-8 text-primary" /><span className="font-extrabold">Vet Freedom OS</span></div>
        <PageTitle title={r.label} subtitle={r.desc} />
        <SectionTitle>Puede</SectionTitle>
        <Card>{r.permissions.map((p) => <p key={p} className="flex items-center gap-2 py-1"><CheckCircle2 className="h-5 w-5 text-sage-foreground" />{p}</p>)}</Card>
        {r.denied.length > 0 && (<><SectionTitle>No puede</SectionTitle><Card>{r.denied.map((p) => <p key={p} className="flex items-center gap-2 py-1 text-muted-foreground"><Lock className="h-5 w-5 text-primary" />{p}</p>)}</Card></>)}
        <SectionTitle>Accesos</SectionTitle>
        <div className="space-y-2">{(LINKS[r.id] ?? []).map(([to, l]) => <Link key={to} to={to as never} className="block rounded-2xl bg-accent px-5 py-4 text-lg font-bold">{l}</Link>)}</div>
        <p className="mt-6 text-sm text-muted-foreground">Panel completo de este perfil: siguiente entrega.</p>
      </>)}
    </div>
  );
}
