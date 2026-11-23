import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/lib/vf/meta";
import { InteractiveProductAcademy } from "@/features/academy/InteractiveProductAcademy";
import { EmergencyAlertBanner } from "@/components/vf/EmergencyAlertBanner";

export const Route = createFileRoute("/demo-interactiva")({
  head: () =>
    meta(
      "Academia Interactiva de Producto · Vet Freedom OS",
      "Experiencia interactiva guiada de Vet Freedom OS para el Dr. Luis Eduardo Ríos, veterinarios de campo, recepcionistas, tutores de mascotas y administradores SaaS."
    ),
  ssr: false,
  component: DemoInteractivaPage,
});

function DemoInteractivaPage() {
  return (
    <main className="min-h-screen bg-background">
      <EmergencyAlertBanner />
      <InteractiveProductAcademy />
    </main>
  );
}
