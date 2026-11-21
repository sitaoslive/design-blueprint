import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { currentUser } from "@/lib/vf/session";
import { clearVF } from "@/lib/vf/store";
import { ROLES } from "@/lib/vf/roles";
import { PawIcon, Btn } from "@/components/vf/ui";
import { DemoProfiles } from "@/components/vf/DemoProfiles";
import { Companions } from "@/components/vf/Companions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Veterinaria Dr. Luis Ríos · Vet Freedom OS" },
      { name: "description", content: "Veterinaria Dr. Luis Ríos: atención a domicilio, agenda y portales de familias y equipo." },
      { property: "og:title", content: "Veterinaria Dr. Luis Ríos · Vet Freedom OS" },
      { property: "og:description", content: "Agenda, equipo, rutas y asistente para veterinaria a domicilio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const nav = useNavigate();
  const [u, setU] = useState<Awaited<ReturnType<typeof currentUser>> | undefined>(undefined);
  useEffect(() => { void currentUser().then(setU); }, []);
  const mine = u ? ROLES.filter((r) => u.roles.includes(r.id)) : [];
  const signOut = async () => { await supabase.auth.signOut(); clearVF(); setU(null); nav({ to: "/auth", search: { next: undefined }, replace: true }); };
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-5 pb-12">
      <div className="relative mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-2 pt-6"><PawIcon className="h-7 w-7 shrink-0 text-sage-foreground" /><span className="text-lg font-extrabold">Veterinaria Dr. Luis Ríos</span></div>
        <Companions />
        <h2 className="mt-4 text-2xl font-extrabold">{u ? `Hola, ${u.name}` : "Tu espacio en la veterinaria"}</h2>
        <p className="mt-2 text-base text-muted-foreground">{u ? "¿Con qué perfil entras hoy?" : "Familias, equipo y Dirección."}</p>
        {u === null && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link to="/auth" search={{ next: undefined }} className="rounded-full bg-gradient-primary px-8 py-4 text-center text-lg font-bold text-primary-foreground shadow-button">Entrar</Link>
            <Link to="/auth" search={{ next: undefined }} className="rounded-full border-2 border-primary/40 px-8 py-4 text-center text-lg font-bold text-primary-dark">Crear cuenta de cliente</Link>
          </div>
        )}
        {u === null && <section className="mt-8"><h2 className="text-2xl font-extrabold">Entrar como demo</h2><p className="mb-3 text-muted-foreground">Sin contraseña: toca un perfil y entras directo a su panel con datos de ejemplo.</p><DemoProfiles /></section>}
        {u === null && <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">{[["/servicios","Servicios"],["/zonas","Zonas"],["/como-funciona","Cómo funciona"],["/nosotros","Nosotros"],["/preguntas","Preguntas"],["/contacto","Contacto"]].map(([to,l]) => <Link key={to} to={to as never} className="rounded-full bg-secondary px-4 py-2">{l}</Link>)}</div>}
        {u && mine.length === 0 && <p className="mt-6 rounded-2xl bg-accent p-4">Tu cuenta aún no tiene perfil asignado. Pide a Dirección que te lo asigne.</p>}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {mine.map((r, i) => (
            <Link key={r.id} to={r.home as never} className={`animate-pop flex items-center gap-4 rounded-3xl p-5 shadow-soft transition active:scale-[.98] ${i < 4 ? "bg-accent" : "bg-secondary"}`} style={{ animationDelay: `${i * 30}ms` }}>
              <span className="flex-1"><b className="block text-xl">{r.label}</b><span className="text-muted-foreground">{r.desc}</span></span>
              <ChevronRight className="text-primary" />
            </Link>
          ))}
        </div>
        {u && <Btn variant="soft" onClick={() => void signOut()} className="mt-6"><LogOut className="h-4 w-4" />Cerrar sesión</Btn>}
      </div>
    </div>
  );
}
