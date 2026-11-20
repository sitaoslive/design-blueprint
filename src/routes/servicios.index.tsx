import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicPage, SERVICES } from "@/components/vf/public/PublicPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/servicios/")({
  head: () => meta("Servicios", "Servicios veterinarios a domicilio de Vet Life."),
  component: () => (
    <PublicPage title="Servicios" intro="Todo lo que tu mascota necesita, en casa.">
      <div className="grid gap-3 sm:grid-cols-2">{SERVICES.map((s) => <Link key={s.slug} to="/servicios/$slug" params={{ slug: s.slug }} className="rounded-3xl bg-accent p-5 shadow-soft"><b className="text-xl">{s.name}</b><p className="text-muted-foreground">{s.desc}</p></Link>)}</div>
    </PublicPage>
  ),
});
