import { createFileRoute } from "@tanstack/react-router";
import { meta } from "@/lib/vf/meta";
import { PawIcon } from "@/components/vf/ui";
import { Companions } from "@/components/vf/Companions";
import { CommercialDemoShowcase } from "@/components/vf/CommercialDemoShowcase";
import { EmergencyAlertBanner } from "@/components/vf/EmergencyAlertBanner";

export const Route = createFileRoute("/demo")({
  head: () =>
    meta(
      "Demo Comercial Bilingüe · Vet Freedom OS",
      "Demostración interactiva de Vet Freedom OS para clínicas y veterinarias: GPS en vivo de auxiliares, cronómetro de consulta, conserje IA y fórmulas médicas oficiales."
    ),
  ssr: false,
  component: DemoPage,
});

function DemoPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <EmergencyAlertBanner />
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5 text-primary">
          <PawIcon className="h-8 w-8" />
          <span className="text-xl font-extrabold tracking-tight">
            Vet Freedom OS <span className="text-xs font-bold text-muted-foreground">· Commercial Demo</span>
          </span>
        </div>
        <Companions compact />
      </div>
      <CommercialDemoShowcase />
    </main>
  );
}
