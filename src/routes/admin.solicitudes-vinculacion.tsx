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
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("pet_claim_requests")
          .select("*, pets(name, species, breed, microchip_number), owners(first_name, last_name, primary_phone)")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (err) {
        console.warn("Error cargando pet_claim_requests:", err);
        // Fallback demo requests
        setRequests([
          {
            id: "req-1",
            status: "PENDING",
            verification_method: "MICROCHIP",
            verification_evidence: { identifier: "900215000192837", notes: "Golden Retriever atendido en Chicó el mes pasado" },
            created_at: new Date().toISOString(),
            pets: { name: "Luna", species: "CANINE", breed: "Golden Retriever", microchip_number: "900215000192837" },
            owners: { first_name: "Camila", last_name: "Torres", primary_phone: "+573001239988" },
          },
          {
            id: "req-2",
            status: "APPROVED",
            verification_method: "MANUAL_CODE",
            verification_evidence: { code: "VET-MAX-2026" },
            created_at: new Date(Date.now() - 86400000).toISOString(),
            pets: { name: "Maximilian", species: "FELINE", breed: "Maine Coon" },
            owners: { first_name: "Harrison", last_name: "Ríos", primary_phone: "+573115556677" },
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    void loadRequests();
  }, []);

  const handleApprove = async (reqId: string, petId: string, ownerId: string) => {
    try {
      // 1. Link in pet_owner_relations
      await supabase.from("pet_owner_relations").insert({
        pet_id: petId,
        owner_id: ownerId,
        relation_type: "TUTOR_PRINCIPAL",
        is_authorized_decision_maker: true,
      });

      // 2. Mark request approved
      await supabase
        .from("pet_claim_requests")
        .update({ status: "APPROVED", reviewed_at: new Date().toISOString() })
        .eq("id", reqId);

      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: "APPROVED" } : r))
      );
      toast.success("Solicitud aprobada y expediente vinculado");
    } catch (err: any) {
      toast.error(err.message || "Error al aprobar solicitud");
    }
  };

  const handleReject = async (reqId: string) => {
    try {
      await supabase
        .from("pet_claim_requests")
        .update({ status: "REJECTED", reviewed_at: new Date().toISOString() })
        .eq("id", reqId);

      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: "REJECTED" } : r))
      );
      toast.info("Solicitud rechazada");
    } catch (err: any) {
      toast.error(err.message || "Error al rechazar solicitud");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageTitle
        title="Validación de Vinculación de Mascotas"
        subtitle="Verificación clínica de titulares para prevenir registros duplicados y proteger la confidencialidad médica."
      />

      <div className="space-y-4">
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
