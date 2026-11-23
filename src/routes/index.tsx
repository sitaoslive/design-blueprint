import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, LogOut, Stethoscope, CalendarPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { currentUser } from "@/lib/vf/session";
import { clearVF } from "@/lib/vf/store";
import { visibleAccountProfiles } from "@/lib/vf/roles";
import { PawIcon, Btn } from "@/components/vf/ui";
import { Companions } from "@/components/vf/Companions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vet Life · Dr. Luis Eduardo Ríos | Veterinaria a Domicilio Medellín & Oriente" },
      {
        name: "description",
        content:
          "Vet Life: Veterinaria a domicilio en Medellín y Oriente Antioqueño por el Dr. Luis Eduardo Ríos. Agenda, rutas de campo, fórmulas OKVET y portal familiar.",
      },
      { property: "og:title", content: "Vet Life · Dr. Luis Eduardo Ríos | Veterinaria a Domicilio" },
      {
        property: "og:description",
        content: "Medicina veterinaria a domicilio en Medellín y Oriente Antioqueño con calidez y rigor clínico.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const nav = useNavigate();
  const [u, setU] = useState<Awaited<ReturnType<typeof currentUser>> | undefined>(undefined);
  useEffect(() => {
    void currentUser().then(setU);
  }, []);
  const mine = u ? visibleAccountProfiles(u.roles) : [];
  const signOut = async () => {
    await supabase.auth.signOut();
    clearVF();
    setU(null);
    nav({ to: "/auth", search: { next: undefined }, replace: true });
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-background px-5 pb-12">
      <div className="relative mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between pt-6">
          <div className="flex items-center gap-2">
            <PawIcon className="h-7 w-7 shrink-0 text-sage-foreground" />
            <span className="text-lg font-extrabold text-foreground">Vet Life · Dr. Luis Ríos</span>
          </div>
          <Link
            to="/luis"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition hover:bg-primary/20"
          >
            <Stethoscope className="h-3.5 w-3.5" />
            Acceso Dr. Luis
          </Link>
        </div>
        <Companions />
        <h2 className="mt-4 text-2xl font-extrabold text-foreground">
          {u ? `Hola, ${u.name}` : "Atención Veterinaria a Domicilio"}
        </h2>
        <p className="mt-2 text-base text-muted-foreground">
          {u
            ? "¿Con qué perfil entras hoy?"
            : "Medicina veterinaria con calidez en la tranquilidad de tu hogar en Medellín y el Oriente Antioqueño."}
        </p>
        {u === null && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/cliente/reservar"
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-primary px-8 py-4 text-center text-lg font-bold text-primary-foreground shadow-button transition active:scale-[0.99]"
            >
              <CalendarPlus className="h-5 w-5" />
              Agendar Cita a Domicilio
            </Link>
            <Link
              to="/auth"
              search={{ next: undefined }}
              className="rounded-full border-2 border-primary/40 px-8 py-4 text-center text-lg font-bold text-primary-dark transition hover:bg-primary/5"
            >
              Entrar a mi cuenta
            </Link>
          </div>
        )}
        {u === null && (
          <section className="mt-8 space-y-4">
            {/* Tarjeta Dr. Luis Ejecutivo */}
            <Link
              to="/luis"
              className="group flex items-center justify-between rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white shadow-lg transition active:scale-[0.99] hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-emerald-200">
                    Dirección Médica
                  </span>
                  <b className="mt-1 block text-lg font-extrabold">
                    Centro Ejecutivo · Dr. Luis Eduardo Ríos
                  </b>
                  <span className="text-xs text-white/80">
                    Agenda del día, asistente por voz, rutas Waze y fórmulas oficiales OKVET.
                  </span>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 shrink-0 transition group-hover:translate-x-1" />
            </Link>

            {/* Tarjeta Portal Familiar */}
            <Link
              to="/cliente"
              className="group flex items-center justify-between rounded-3xl bg-secondary/80 p-5 transition active:scale-[0.99] hover:bg-secondary"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <PawIcon className="h-6 w-6" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    Portal de Familias
                  </span>
                  <b className="mt-1 block text-lg font-extrabold text-foreground">
                    Mis Mascotas y Cuidados Diarios
                  </b>
                  <span className="text-xs text-muted-foreground">
                    Carné digital de vacunación, historial clínico y seguimiento en tiempo real.
                  </span>
                </div>
              </div>
              <ChevronRight className="h-6 w-6 shrink-0 text-muted-foreground transition group-hover:translate-x-1" />
            </Link>
          </section>
        )}
        {u && u.roles.some((r) => r === "luis" || r === "administrador") && (
          <Link
            to="/luis"
            className="mt-6 flex items-center justify-between rounded-3xl bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white shadow-lg transition active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-300">
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-emerald-200">
                  Acceso Prioritario
                </span>
                <b className="mt-1 block text-lg font-extrabold">
                  Ir al Centro Ejecutivo del Dr. Luis
                </b>
                <span className="text-xs text-white/80">
                  Asistente de voz, despacho, rutas Medellín/Oriente y pacientes OKVET.
                </span>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 shrink-0" />
          </Link>
        )}
        {u === null && (
          <div className="mt-6 flex flex-wrap gap-2 text-sm font-semibold">
            {[
              ["/servicios", "Servicios"],
              ["/zonas", "Zonas"],
              ["/como-funciona", "Cómo funciona"],
              ["/nosotros", "Nosotros"],
              ["/preguntas", "Preguntas"],
              ["/contacto", "Contacto"],
            ].map(([to, l]) => (
              <Link key={to} to={to as never} className="rounded-full bg-secondary px-4 py-2">
                {l}
              </Link>
            ))}
          </div>
        )}
        {u && mine.length === 0 && (
          <p className="mt-6 rounded-2xl bg-accent p-4">
            Tu cuenta aún no tiene perfil asignado. Pide a Dirección que te lo asigne.
          </p>
        )}
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {mine.map((r, i) => (
            <Link
              key={r.id}
              to={r.home as never}
              className={`animate-pop flex items-center gap-4 rounded-3xl p-5 shadow-soft transition active:scale-[.98] ${i < 4 ? "bg-accent" : "bg-secondary"}`}
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <span className="flex-1">
                <b className="block text-xl">{r.label}</b>
                <span className="text-muted-foreground">{r.desc}</span>
              </span>
              <ChevronRight className="text-primary" />
            </Link>
          ))}
        </div>
        {u && (
          <Btn variant="soft" onClick={() => void signOut()} className="mt-6">
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Btn>
        )}
        <div className="mt-10 border-t border-border pt-4 text-center">
          <Link to="/demo" className="text-xs text-muted-foreground transition hover:text-foreground">
            Modo evaluación · Ver simulador de roles demo
          </Link>
        </div>
      </div>
    </div>
  );
}
