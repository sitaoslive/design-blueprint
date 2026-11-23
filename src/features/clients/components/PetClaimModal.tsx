import { useState } from "react";
import { ShieldCheck, Search, PawPrint, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Btn, Card } from "@/components/vf/ui";

export function PetClaimModal({
  isOpen,
  onClose,
  ownerId = "ca09f19b-cfef-4d6b-99f8-11977792c2c2",
}: {
  isOpen: boolean;
  onClose: () => void;
  ownerId?: string;
}) {
  const [method, setMethod] = useState<"MICROCHIP" | "CODE">("MICROCHIP");
  const [identifier, setIdentifier] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      toast.error("Por favor ingresa el número de microchip o código clínico.");
      return;
    }

    setSubmitting(true);
    // Claim storage (`pet_claim_requests`) is not part of the database yet, so this form
    // never reports a saved request. It fails closed with an explicit message instead.
    toast.error("Las solicitudes de vinculación todavía no están disponibles. Escríbenos por WhatsApp y las registramos.");
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-2xl">
        {submitted ? (
          <div className="text-center py-4 space-y-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-sage text-sage-foreground mx-auto">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-black text-foreground">Solicitud Recibida</h3>
            <p className="text-xs text-muted-foreground">
              El equipo de Vet Life verificará la titularidad médica de la mascota contra el expediente de OKVET para proteger la privacidad de los datos clínicos.
            </p>
            <Btn onClick={onClose} className="w-full mt-4">
              Entendido
            </Btn>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-foreground">Reclamar Expediente de Mascota</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Si tu veterinario ya atendió a tu mascota previamente o tiene expediente en clínica, vincúlala aquí de forma segura para evitar duplicados.
            </p>

            <div className="flex rounded-xl bg-secondary p-1">
              <button
                type="button"
                onClick={() => setMethod("MICROCHIP")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  method === "MICROCHIP" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Por Microchip (15 dígitos)
              </button>
              <button
                type="button"
                onClick={() => setMethod("CODE")}
                className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
                  method === "CODE" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                Por Nombre / Código
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">
                {method === "MICROCHIP" ? "Número de Microchip de la Mascota" : "Nombre de la Mascota en Historia Clínica"}
              </label>
              <input
                type="text"
                placeholder={method === "MICROCHIP" ? "Ej. 900215000123456" : "Ej. Luna o Toby"}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-1 w-full rounded-xl bg-accent px-3 py-2 text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-foreground">Notas Adicionales de Comprobación</label>
              <textarea
                placeholder="Raza, color o fecha aproximada de la última consulta domiciliaria..."
                value={evidenceNotes}
                onChange={(e) => setEvidenceNotes(e.target.value)}
                className="mt-1 w-full rounded-xl bg-accent px-3 py-2 text-xs font-medium"
                rows={2}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Btn type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Btn>
              <Btn type="submit" disabled={submitting} className="flex-1 shadow-button">
                {submitting ? "Enviando..." : "Enviar Solicitud"}
              </Btn>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
