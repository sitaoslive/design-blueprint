import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ShieldCheck, CheckCircle2, XCircle, Clock, PawPrint, User, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "@/lib/vf/meta";
import { Card, PageTitle, Btn } from "@/components/vf/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/solicitudes-vinculacion")({
  head: () =>
    meta(
      "Solicitudes de Vinculación de Mascotas · Vet Freedom OS",
      "Validación de identidad y protección contra registros duplicados de pacientes."
    ),
  ssr: false,
  component: PetClaimAdminPage,
});

export function PetClaimAdminPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    async function loadRequests() {
      // Claim requests (`pet_claim_requests`) do not exist in the database yet, so there is
      // nothing to review.
      setRequests([]);
      setLoading(false);
    }

    void loadRequests();
  }, []);

  const handleApprove = async (reqId: string, petId: string, ownerId: string) => {
    // Vinculación de tutores (`pet_owner_relations`, `pet_claim_requests`) no existe en la
    // base de datos: no se aprueba nada.
    toast.error("Las solicitudes de vinculación todavía no se pueden aprobar. Registra la vinculación directamente con el cliente.");
  };

  const handleReject = async (reqId: string) => {
    // Sin tabla `pet_claim_requests`: no se rechaza nada.
    toast.error("Las solicitudes de vinculación todavía no se pueden rechazar.");
  };

  return (
    <div className="space-y-6 pb-12">
      <PageTitle
        title="Validación de Vinculación de Mascotas"
        subtitle="Verificación clínica de titulares para prevenir registros duplicados y proteger la confidencialidad médica."
      />

      <div className="space-y-4">
        {!loading && requests.length === 0 && (
          <Card className="rounded-3xl border border-border p-8 text-center">
            <p className="text-sm font-bold text-foreground">No hay solicitudes de vinculación registradas</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Las solicitudes de tutores todavía no se guardan en el sistema: cuando estén disponibles, aparecerán aquí.
            </p>
          </Card>
        )}
        {requests.map((req) => {
          const isPending = req.status === "PENDING";
          const pet = req.pets;
          const owner = req.owners;

          return (
            <Card key={req.id} className="space-y-3 rounded-3xl border border-border p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-secondary text-primary">
                    <PawPrint className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-foreground">
                      Mascota: {pet?.name || "Sin nombre"} ({pet?.species === "CANINE" ? "Perro" : "Gato"})
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Raza: {pet?.breed || "Mestizo"} · Microchip: {pet?.microchip_number || "No registrado"}
                    </p>
                  </div>
                </div>

                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    isPending
                      ? "bg-amber text-amber-foreground"
                      : req.status === "APPROVED"
                      ? "bg-sage text-sage-foreground"
                      : "bg-danger text-danger-foreground"
                  )}
                >
                  {isPending ? "Pendiente de Revisión" : req.status === "APPROVED" ? "Aprobada ✓" : "Rechazada"}
                </span>
              </div>

              {/* Claimant details */}
              <div className="rounded-2xl bg-secondary/50 p-3 text-xs space-y-1">
                <p>
                  <b>Tutor Solicitante:</b> {owner?.first_name} {owner?.last_name} ({owner?.primary_phone})
                </p>
                <p>
                  <b>Método de Validación:</b> {req.verification_method}
                </p>
                {req.verification_evidence?.notes && (
                  <p>
                    <b>Evidencia proporcionada:</b> {req.verification_evidence.notes}
                  </p>
                )}
              </div>

              {/* Actions */}
              {isPending && (
                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Btn
                    variant="outline"
                    onClick={() => handleReject(req.id)}
                    className="text-xs text-destructive hover:bg-destructive/10"
                  >
                    <XCircle className="h-4 w-4" /> Rechazar
                  </Btn>
                  <Btn
                    variant="primary"
                    onClick={() => handleApprove(req.id, req.pet_id, req.claimant_owner_id)}
                    className="text-xs shadow-button"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Aprobar y Vincular
                  </Btn>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
