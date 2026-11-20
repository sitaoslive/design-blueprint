import { createFileRoute, Link } from "@tanstack/react-router";
import { pets } from "@/lib/vf/data";
import { meta } from "@/lib/vf/meta";
import { PageTitle } from "@/components/vf/ui";

export const Route = createFileRoute("/cliente/mascotas/")({
  head: () => meta("Mis mascotas", "Perfiles de tus mascotas."),
  component: Pets,
});

function Pets() {
  return (
    <>
      <PageTitle title="Mis mascotas" />
      <div className="grid grid-cols-2 gap-3">
        {pets.map((p) => (
          <Link key={p.id} to="/cliente/mascotas/$id" params={{ id: p.id }} className="rounded-3xl bg-secondary p-2 shadow-soft">
            <img src={p.photo} alt={p.name} className="aspect-square w-full rounded-2xl object-cover" />
            <b className="mt-2 block px-1 text-xl">{p.name}</b><span className="px-1 text-muted-foreground">{p.species} · {p.age}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
