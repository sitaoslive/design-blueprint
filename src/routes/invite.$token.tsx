import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Heart, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, UserCheck, Phone, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "@/lib/vf/meta";
import { Card, PageTitle, Btn } from "@/components/vf/ui";
import { actions } from "@/lib/vf/store";

export const Route = createFileRoute("/invite/$token")({
  head: ({ params }) =>
    meta(
      `Invitación Veterinaria · Código ${params.token}`,
      "Acepta la invitación de tu veterinario a domicilio y accede al portal de salud de tu mascota."
    ),
  ssr: false,
  component: InvitationRedeemPage,
});

function InvitationRedeemPage() {
  const { token } = Route.useParams();
  const nav = useNavigate();

  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [targetPet, setTargetPet] = useState<any>(null);
  const [redeemed, setRedeemed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form for owner confirmation
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");

  useEffect(() => {
    async function loadInvitation() {
      // Invitation storage (`user_invitations`) does not exist in the database yet, so no
      // code can be verified here.
      setError("Los códigos de invitación todavía no están disponibles. Pídele a tu veterinario que te agregue manualmente.");
      setLoading(false);
    }

    if (token) {
      void loadInvitation();
    }
  }, [token]);

  const handleRedeem = async () => {
    if (!ownerName.trim()) {
      toast.error("Por favor ingresa tu nombre completo para el expediente clínico.");
      return;
    }

    setLoading(true);
    // Invitation redemption (`owners`, `redeem_pet_invitation_code`) is not backed by the
    // database yet, so nothing is linked here.
    toast.error("Los códigos de invitación todavía no están disponibles. Pídele a tu veterinario que te agregue manualmente.");
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Sparkles className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-3 text-sm font-bold text-foreground">Verificando invitación médica...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-danger/20 text-danger mx-auto">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-xl font-black text-foreground">Invitación Inválida</h2>
        <p className="mt-2 text-sm text-muted-foreground">{error}</p>
        <div className="mt-6">
          <Link
            to="/cliente/bienvenida"
            className="inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground"
          >
            Ir a Registro Manual
          </Link>
        </div>
      </div>
    );
  }

  if (redeemed) {
    return (
      <div className="mx-auto max-w-md p-6 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-sage text-sage-foreground mx-auto">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-2xl font-black text-foreground">¡Todo Listo!</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {targetPet ? targetPet.name : "Tu mascota"} está vinculada a tu cuenta de Vet Life con atención domiciliaria del Dr. Luis Ríos.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            to="/cliente"
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-button"
          >
            Entrar a mi Portal de Tutor
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/cliente/agenda"
            className="rounded-2xl border border-border bg-card py-3 text-sm font-bold text-foreground"
          >
            Agendar Primera Visita
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md space-y-6 p-4">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Invitación Personalizada
        </span>
        <h1 className="mt-3 text-2xl font-black text-foreground">
          El Dr. Luis Eduardo Ríos te ha invitado a Vet Life
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Código de vinculación: <span className="font-mono font-bold text-primary">{token}</span>
        </p>
      </div>

      {targetPet && (
        <Card className="flex items-center gap-4 rounded-3xl border border-border bg-secondary/40 p-4">
          <img
            src="https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=150&q=80"
            alt={targetPet.name}
            className="h-16 w-16 rounded-2xl object-cover shadow-sm"
          />
          <div>
            <h3 className="text-lg font-black text-foreground">{targetPet.name}</h3>
            <p className="text-xs font-medium text-muted-foreground">
              {targetPet.breed || "Raza registrada"} · {targetPet.species === "CANINE" ? "Canino" : "Felino"}
            </p>
            <span className="mt-1 inline-block rounded-full bg-sage px-2 py-0.5 text-[10px] font-bold text-sage-foreground">
              Expediente Clínico Preparado
            </span>
          </div>
        </Card>
      )}

      <Card className="space-y-4 rounded-3xl border border-border p-5">
        <h3 className="font-extrabold text-foreground">Confirma tus Datos de Tutor</h3>

        <div>
          <label className="text-xs font-bold text-foreground">Tu Nombre Completo</label>
          <input
            type="text"
            placeholder="Ej. Juan Pérez"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-accent px-3 py-2.5 text-sm font-medium"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground">Número de WhatsApp (para recordatorios y visitas)</label>
          <input
            type="tel"
            placeholder="+57 300 123 4567"
            value={ownerPhone}
            onChange={(e) => setOwnerPhone(e.target.value)}
            className="mt-1 w-full rounded-xl bg-accent px-3 py-2.5 text-sm font-medium"
          />
        </div>

        <button
          type="button"
          onClick={handleRedeem}
          className="w-full rounded-2xl bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-button transition active:scale-[0.98]"
        >
          Aceptar Invitación y Vincular Mascota
        </button>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Al confirmar, aceptas recibir confirmaciones clínicas y notificaciones del Dr. Luis Ríos vía WhatsApp bajo la política de Habeas Data (Ley 1581 de 2012).
      </p>
    </div>
  );
}
