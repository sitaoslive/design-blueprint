import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage, Block, SERVICES } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/servicios/$slug")({
  head: ({ params }) => meta(SERVICES.find((s) => s.slug === params.slug)?.name ?? "Servicio", "Detalle del servicio a domicilio."),
  component: Page,
});
function Page() {
  const { slug } = Route.useParams(); const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return <PublicPage title="Servicio no encontrado"><Link to="/servicios" className="text-primary">Ver servicios</Link></PublicPage>;
  return (
    <PublicPage title={s.name} intro={s.desc}>
      <Block t="Incluye">Visita a domicilio, evaluación y recomendaciones registradas en tu portal.</Block>
      <Block t="Precio">Por confirmar con coordinación (COP).</Block>
      <Link to="/auth" search={{ next: "/cliente/reservar" }} className="inline-block rounded-full bg-gradient-primary px-6 py-3 font-bold text-primary-foreground">Reservar</Link>
    </PublicPage>
  );
}
