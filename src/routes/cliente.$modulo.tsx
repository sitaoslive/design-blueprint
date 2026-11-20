import { CaregiversManager } from "@/components/vf/screens/other";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { MessageCircle, Phone, FileText, UserPlus } from "lucide-react";
import { useVF, actions } from "@/lib/vf/store";
import { formatCOP } from "@/lib/vf/format";
import { meta } from "@/lib/vf/meta";
import { NotificationsPage } from "@/components/vf/pages/modules";
import { PageTitle, Card, StatusBadge, Btn, Empty, SectionTitle } from "@/components/vf/ui";

const TITLES: Record<string, string> = { pagos: "Pagos", notificaciones: "Notificaciones", remisiones: "Remisiones", ayuda: "Ayuda", documentos: "Documentos", cuidadores: "Cuidadores" };

export const Route = createFileRoute("/cliente/$modulo")({
  head: ({ params }) => meta(TITLES[params.modulo] ?? "Vet Life", "Espacio del propietario en Vet Life."),
  component: Page,
});

function Pagos() {
  const pays = useVF((s) => s.payments);
  return (<><PageTitle title="Pagos" />{pays.length === 0 && <Empty title="No tienes pagos registrados" />}{pays.map((p) => <Card key={p.id} className="mb-2 flex items-center gap-3"><div className="flex-1"><b>{p.concept}</b><p className="font-bold">{formatCOP(p.amount)}</p></div>{p.status === "pagado" ? <StatusBadge status="pagado" /> : <Btn onClick={() => { actions.markPaid(p.id); toast.success("Pago registrado (demostración)"); }}>Pagar</Btn>}</Card>)}</>);
}
function Remisiones() {
  const refs = useVF((s) => s.referrals);
  return (<><PageTitle title="Remisiones" subtitle="Especialistas recomendados" />{refs.map((r) => <Card key={r.id} className="mb-2 flex items-center justify-between"><span><b>{r.pet} · {r.specialty}</b><br /><span className="text-muted-foreground">{r.specialist ?? "Coordinación te contactará"}</span></span><StatusBadge status={r.status} /></Card>)}</>);
}
function Ayuda() {
  return (<><PageTitle title="Ayuda" subtitle="Estamos para acompañarte" />
    <a href="https://wa.me/570000000000" target="_blank" rel="noreferrer" className="mb-3 flex items-center gap-3 rounded-3xl bg-sage p-5 text-lg font-bold"><MessageCircle className="h-7 w-7 text-sage-foreground" />Escribir por WhatsApp</a>
    <a href="tel:+570000000000" className="flex items-center gap-3 rounded-3xl bg-accent p-5 text-lg font-bold"><Phone className="h-7 w-7 text-primary" />Llamar a Vet Life</a>
    <p className="mt-3 text-sm text-muted-foreground">Número oficial pendiente de configuración.</p></>);
}
function Page() {
  const { modulo } = Route.useParams();
  if (modulo === "pagos") return <Pagos />;
  if (modulo === "remisiones") return <Remisiones />;
  if (modulo === "ayuda") return <Ayuda />;
  if (modulo === "notificaciones") return <NotificationsPage />;
  if (modulo === "documentos") return (<><PageTitle title="Documentos" />{["Certificado de vacunación · Bruno", "Resumen consulta · Luna"].map((d) => <Card key={d} className="mb-2 flex items-center gap-3"><FileText className="h-6 w-6 text-primary" />{d}</Card>)}<p className="text-sm text-muted-foreground">Descarga disponible al integrar OKVET.</p></>);
  if (modulo === "cuidadores") return <CaregiversManager />;
  return <div className="mt-8"><Empty title="Sección no encontrada" /></div>;
}
