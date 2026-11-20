import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { demoRole, exitDemo } from "@/lib/vf/session";

/** Visible reminder that the user is browsing sample data without signing in. */
export function DemoBanner() {
  const [demo, setDemo] = useState<{ role: string; name: string } | null>(null);
  const nav = useNavigate();
  useEffect(() => setDemo(demoRole()), []);
  if (!demo) return null;
  return (
    <div className="sticky top-0 z-30 -mx-5 mb-2 flex items-center justify-between gap-2 bg-blush px-5 py-2 text-sm">
      <span><b>Modo demo</b> · {demo.name} · datos de ejemplo, no se guarda nada</span>
      <span className="flex gap-3 font-bold text-primary">
        <button onClick={() => void nav({ to: "/demo" })}>Cambiar</button>
        <button onClick={() => { exitDemo(); void nav({ to: "/" }); }}>Salir</button>
      </span>
    </div>
  );
}
