import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { demoRole, exitDemo } from "@/lib/vf/session";
import { fireEmergencyAlert } from "./EmergencyAlertBanner";
import { BellRing } from "lucide-react";

/** Visible reminder that the user is browsing sample data without signing in. */
export function DemoBanner() {
  const [demo, setDemo] = useState<{ role: string; name: string } | null>(null);
  const nav = useNavigate();
  useEffect(() => setDemo(demoRole()), []);
  if (!demo) return null;
  return (
    <div className="sticky top-0 z-30 -mx-5 mb-2 flex flex-wrap items-center justify-between gap-2 bg-blush px-5 py-2 text-xs sm:text-sm">
      <span>
        <b>Modo demo</b> · {demo.name} · datos de prueba aislados
      </span>
      <span className="flex items-center gap-3 font-bold text-primary">
        <button
          onClick={() => fireEmergencyAlert("Luna", "Urgencia vital de prueba desde modo demo")}
          className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs text-red-700 hover:bg-red-200"
          title="Prueba el timbre y vibración en celular y reloj"
        >
          <BellRing className="h-3.5 w-3.5 animate-pulse" />
          Probar Alarma
        </button>
        <button onClick={() => void nav({ to: "/demo" })}>Cambiar Rol</button>
        <button
          onClick={() => {
            exitDemo();
            void nav({ to: "/" });
          }}
        >
          Salir
        </button>
      </span>
    </div>
  );
}
