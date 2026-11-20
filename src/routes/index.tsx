import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { ROLES } from "@/lib/vf/roles";
import { IMG } from "@/lib/vf/data";
import { PawIcon } from "@/components/vf/ui";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vet Freedom OS · Vet Life" },
      { name: "description", content: "Sistema operativo de Vet Life: la veterinaria a domicilio que funciona sin depender de Luis." },
      { property: "og:title", content: "Vet Freedom OS · Vet Life" },
      { property: "og:description", content: "Agenda, equipo, rutas y asistente para veterinaria a domicilio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-5 pb-12">
      <PawIcon className="pointer-events-none absolute -right-6 top-10 h-44 w-44 rotate-12 text-paw" />
      <div className="relative mx-auto max-w-3xl">
        <div className="flex items-center gap-2 pt-6"><PawIcon className="h-9 w-9 text-primary" /><span className="text-2xl font-extrabold">Vet Freedom OS</span></div>
        <div className="mt-8 flex items-center gap-4">
          <div className="flex -space-x-4">{[IMG.dog, IMG.valeria, IMG.cat].map((s) => <img key={s} src={s} alt="" className="h-16 w-16 rounded-full border-4 border-background object-cover" />)}</div>
        </div>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">¿Con qué perfil entras hoy?</h1>
        <p className="mt-2 text-lg text-muted-foreground">Cada perfil ve solo lo que necesita. Modo demostración con datos de ejemplo.</p>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {ROLES.map((r, i) => (
            <Link key={r.id} to={r.home as never} className={`animate-pop flex items-center gap-4 rounded-3xl p-5 shadow-soft transition active:scale-[.98] ${i < 4 ? "bg-accent" : "bg-secondary"}`} style={{ animationDelay: `${i * 30}ms` }}>
              <span className="flex-1"><b className="block text-xl">{r.label}</b><span className="text-muted-foreground">{r.desc}</span></span>
              <ChevronRight className="text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
