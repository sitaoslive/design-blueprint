import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/sin-acceso")({
  head: () => meta("Sin acceso", "Tu perfil no tiene permiso para esta sección."),
  component: () => (
    <div className="grid min-h-screen place-items-center bg-background px-5 text-center">
      <div><Lock className="mx-auto h-12 w-12 text-primary" /><h1 className="mt-3 text-3xl font-extrabold">Sin acceso</h1><p className="mt-2 text-muted-foreground">Tu perfil no tiene permiso para esta sección. Pide a Dirección que te asigne el rol adecuado.</p><Link to="/" className="mt-5 inline-block rounded-full bg-gradient-primary px-6 py-3 font-bold text-primary-foreground">Ir a mis perfiles</Link></div>
    </div>
  ),
});
