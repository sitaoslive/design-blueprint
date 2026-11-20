import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "@/lib/vf/meta";
import { Btn, PageTitle } from "@/components/vf/ui";

export const Route = createFileRoute("/reset-password")({ head: () => meta("Nueva contraseña", "Define una nueva contraseña."), component: Reset });
function Reset() {
  const [pw, setPw] = useState(""); const nav = useNavigate();
  return (
    <div className="mx-auto max-w-sm px-5 pt-10">
      <PageTitle title="Nueva contraseña" />
      <form onSubmit={async (e) => { e.preventDefault(); const { error } = await supabase.auth.updateUser({ password: pw }); if (error) { toast.error(error.message); return; } toast.success("Contraseña actualizada"); nav({ to: "/" }); }} className="space-y-3">
        <input type="password" minLength={8} required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Nueva contraseña" className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-lg" />
        <Btn type="submit" className="w-full py-4">Guardar</Btn>
      </form>
    </div>
  );
}
