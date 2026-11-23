import { createFileRoute, Link } from "@tanstack/react-router";
import { meta } from "@/lib/vf/meta";
import { PawIcon } from "@/components/vf/ui";
import { Companions } from "@/components/vf/Companions";
import { CommercialDemoShowcase } from "@/components/vf/CommercialDemoShowcase";
import { EmergencyAlertBanner } from "@/components/vf/EmergencyAlertBanner";
import { Sparkles, ArrowRight, Compass } from "lucide-react";

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

      {/* Academia Interactiva Banner */}
      <div className="mb-6 flex flex-col gap-3 rounded-3xl border border-primary/30 bg-primary/10 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-primary">
              Nuevo · Experiencia Integral
            </span>
            <b className="block text-sm font-extrabold text-foreground">
              Academia Interactiva de Producto ("Vive la Plataforma Completa")
            </b>
            <p className="text-xs text-muted-foreground">
              Experimenta los 6 roles, 3 modos de aprendizaje y el asistente "Enséñame Cómo".
            </p>
          </div>
        </div>

        <Link
          to="/demo-interactiva"
          className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-button transition hover:bg-primary/90"
        >
          <span>Abrir Academia Interactiva</span>
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

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
