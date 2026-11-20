import { usePets } from "@/lib/vf/store";
import { useMyStaff } from "@/lib/vf/me";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useVF } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { PageTitle, StatusBadge } from "@/components/vf/ui";

export const Route = createFileRoute("/equipo/ruta")({
  head: () => meta("Mi ruta", "Orden de visitas del día con navegación."),
  component: RoutePage,
});

function RoutePage() {
  const pets = usePets();
  const { mine } = useMyStaff(); const allV = useVF((s) => s.visits);
  const visits = allV.filter((v) => mine(v.staffId) && v.date.startsWith("Mar")).sort((a, b) => a.time.localeCompare(b.time));
  return (
    <>
      <PageTitle title="Mi ruta" subtitle="Ruta Norte · orden sugerido" />
      <ol className="relative space-y-4 border-l-2 border-dashed border-primary/40 pl-6">
        {visits.map((v, i) => (
          <li key={v.id} className="relative">
            <span className="absolute -left-[2.35rem] grid h-8 w-8 place-items-center rounded-full bg-gradient-primary font-bold text-primary-foreground">{i + 1}</span>
            <Link to="/equipo/visita/$id" params={{ id: v.id }} className="block rounded-3xl bg-secondary p-4 shadow-soft">
              <div className="flex justify-between gap-2"><b className="text-lg">{v.time} · {pets.find((p) => p.id === v.petId)?.name}</b><StatusBadge status={v.step === "finalizada" ? "finalizada" : v.status} /></div>
              <p className="text-muted-foreground">{v.address}</p>
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-muted-foreground">Sin rastreo GPS permanente. Solo registras llegada y salida.</p>
    </>
  );
}
