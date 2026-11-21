import { createFileRoute } from "@tanstack/react-router";
import { ControlCenter } from "@/features/system-administration/pages/ControlCenter";
import { meta } from "@/lib/vf/meta";
export const Route = createFileRoute("/admin/")({
  head: () => meta("Centro de Control Vet Freedom", "Configuración, dependencias y estado comprobable de Vet Life; ninguna acción externa se activa desde este panel."),
  component: () => <ControlCenter path="/admin/inicio" />,
});