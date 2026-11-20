import { createFileRoute } from "@tanstack/react-router";
import { User, Users, Bell, ShieldCheck, Wallet } from "lucide-react";
import { meta } from "@/lib/vf/meta";
import { PageTitle, RowLink, Card } from "@/components/vf/ui";

export const Route = createFileRoute("/cliente/perfil")({
  head: () => meta("Mi perfil", "Datos de contacto, cuidadores autorizados y preferencias."),
  component: () => (
    <>
      <PageTitle title="Mi perfil" />
      <Card className="mb-4 flex items-center gap-3"><User className="h-10 w-10 text-primary" /><div><b className="text-lg">Andrea Gómez</b><p className="text-muted-foreground">300 555 1201 · Cra 15 #93-40</p></div></Card>
      <RowLink icon={Users} to="/cliente/cuidadores" label="Cuidadores autorizados" />
      <RowLink icon={Wallet} to="/cliente/pagos" label="Pagos y comprobantes" tone="sage" />
      <RowLink icon={Bell} to="/cliente/notificaciones" label="Notificaciones" />
      <RowLink icon={ShieldCheck} to="/" label="Cambiar de perfil" tone="sage" />
    </>
  ),
});
