import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { PawIcon } from "../ui";

const NAV: [string, string][] = [["/servicios", "Servicios"], ["/zonas", "Zonas"], ["/como-funciona", "Cómo funciona"], ["/nosotros", "Nosotros"], ["/preguntas", "Preguntas"], ["/contacto", "Contacto"]];

export function PublicPage({ title, intro, children }: { title: string; intro?: string; children?: ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <PawIcon className="pointer-events-none absolute -right-8 top-16 h-48 w-48 rotate-12 text-paw" />
      <header className="relative mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-5">
        <Link to="/" className="flex items-center gap-2"><PawIcon className="h-8 w-8 text-primary" /><span className="text-xl font-extrabold">Vet Life</span></Link>
        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-muted-foreground">{NAV.map(([to, l]) => <Link key={to} to={to as never} activeProps={{ className: "text-primary" }}>{l}</Link>)}</nav>
      </header>
      <main className="relative mx-auto max-w-3xl px-5 pb-16">
        <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl">{title}</h1>
        {intro && <p className="mt-3 text-lg text-muted-foreground">{intro}</p>}
        <div className="mt-8 space-y-4">{children}</div>
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <Link to="/privacidad">Privacidad</Link> · <Link to="/terminos">Términos</Link> · Vet Life · Veterinaria a domicilio
      </footer>
    </div>
  );
}
export const Block = ({ t, children }: { t: string; children: ReactNode }) => <section className="rounded-3xl bg-secondary p-5 shadow-soft"><h2 className="mb-1 text-xl font-extrabold">{t}</h2><div className="text-muted-foreground">{children}</div></section>;

export const SERVICES = [
  { slug: "consulta-general", name: "Consulta general", desc: "Evaluación completa en la comodidad de tu casa." },
  { slug: "vacunacion", name: "Vacunación", desc: "Esquemas de vacunas para perros y gatos." },
  { slug: "control-preventivo", name: "Control preventivo", desc: "Chequeos periódicos para anticipar problemas." },
  { slug: "tratamientos-recurrentes", name: "Tratamientos recurrentes", desc: "Planes continuos con seguimiento." },
  { slug: "toma-de-muestras", name: "Toma de muestras", desc: "Laboratorio sin salir de casa." },
  { slug: "curaciones", name: "Curaciones", desc: "Manejo de heridas y posoperatorios." },
];
