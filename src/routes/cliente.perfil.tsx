import { createFileRoute } from "@tanstack/react-router";
import { User, Users, Bell, ShieldCheck, Wallet } from "lucide-react";
import { meta } from "@/lib/vf/meta";
import { useVF } from "@/lib/vf/store";
import { PageTitle, RowLink, Card } from "@/components/vf/ui";

export const Route = createFileRoute("/cliente/perfil")({
  head: () => meta("Mi perfil", "Datos de contacto, cuidadores autorizados y preferencias."),
  component: Perfil,
});
function Perfil() {
  const name = useVF((s) => s.displayName);
  return (
    <>
      <PageTitle title="Mi perfil" />
      <Card className="mb-4 flex items-center gap-3"><User className="h-10 w-10 text-primary" /><div><b className="text-lg">{name}</b><p className="text-muted-foreground">Datos de contacto en tu cuenta</p></div></Card>
      <RowLink icon={Users} to="/cliente/hogar" label="Círculo Familiar & Cuidadores del Hogar" />
      <RowLink icon={Wallet} to="/cliente/pagos" label="Pagos y comprobantes" tone="sage" />
      <RowLink icon={Bell} to="/cliente/notificaciones" label="Notificaciones" />
      <RowLink icon={ShieldCheck} to="/" label="Cambiar de perfil" tone="sage" />
    </>
  );
}
