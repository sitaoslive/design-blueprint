import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Users, UserPlus, ShieldCheck, CheckCircle2, Trash2, Mail, Phone, Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "@/lib/vf/meta";
import { Card, PageTitle, SectionTitle, Btn } from "@/components/vf/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cliente/hogar" as any)({
  head: () =>
    meta(
      "Gestión Familiar y Cuidadores de Mascotas · Vet Life",
      "Administra quién puede autorizar tratamientos, recibir visitas a domicilio y ver el carné de tus mascotas."
    ),
  ssr: false,
  component: HouseholdCaregiversPage,
});

export function HouseholdCaregiversPage() {
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New caregiver form
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [relationship, setRelationship] = useState("PARTNER");
  const [permissionLevel, setPermissionLevel] = useState("VIEW_AND_SCHEDULE");

  useEffect(() => {
    async function loadCaregivers() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("household_caregivers")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCaregivers(data || []);
      } catch (err) {
        // Fallback demo data
        setCaregivers([
          {
            id: "cg-1",
            caregiver_name: "Andrés Salcedo",
            caregiver_phone: "+57 311 223 3445",
            caregiver_email: "andres@hogar.com",
            relationship: "PARTNER",
            permission_level: "FULL_DECISION",
            status: "ACTIVE",
          },
          {
            id: "cg-2",
            caregiver_name: "Mateo (Paseador Canino)",
            caregiver_phone: "+57 300 987 6543",
            relationship: "DOG_WALKER",
            permission_level: "VIEW_ONLY",
            status: "ACTIVE",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    void loadCaregivers();
  }, []);

  const handleAddCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Por favor ingresa el nombre de la persona.");
      return;
    }

    try {
      // Find default owner or first
      const { data: owners } = await supabase.from("owners").select("id, organization_id").limit(1);
      const ownerId = owners?.[0]?.id || "ca09f19b-cfef-4d6b-99f8-11977792c2c2";
      const orgId = owners?.[0]?.organization_id || "11111111-1111-1111-1111-111111111111";

      const newCaregiver = {
        organization_id: orgId,
        owner_id: ownerId,
        caregiver_name: name.trim(),
        caregiver_phone: phone.trim() || null,
        caregiver_email: email.trim() || null,
        relationship,
        permission_level: permissionLevel,
        status: "ACTIVE",
      };

      const { data, error } = await supabase
        .from("household_caregivers")
        .insert(newCaregiver)
        .select()
        .single();

      if (error) throw error;

      setCaregivers((prev) => [data || { id: "cg-" + Date.now(), ...newCaregiver }, ...prev]);
      setShowAddModal(false);
      setName("");
      setPhone("");
      setEmail("");
      toast.success(`🎉 ¡${name} añadido como cuidador autorizado de tu hogar!`);
    } catch (err: any) {
      toast.error(err.message || "Error al registrar cuidador");
    }
  };

  const handleRemoveCaregiver = async (id: string) => {
    try {
      await supabase.from("household_caregivers").delete().eq("id", id);
      setCaregivers((prev) => prev.filter((c) => c.id !== id));
      toast.info("Cuidador retirado de tu círculo de atención");
    } catch (err: any) {
      toast.error(err.message || "Error al remover cuidador");
    }
  };

  const relationshipLabels: Record<string, string> = {
    PARTNER: "Pareja / Cónyuge",
    FAMILY: "Familiar del Hogar",
    DOG_WALKER: "Paseador Canino",
    ROOMMATE: "Compañero de Casa",
    PET_SITTER: "Cuidador / Guardería",
  };

  const permissionLabels: Record<string, { label: string; desc: string; badge: string }> = {
    FULL_DECISION: {
      label: "Decisión Médica Total",
      desc: "Puede autorizar procedimientos, hospitalización y firmar consentimientos.",
      badge: "bg-danger text-danger-foreground",
    },
    VIEW_AND_SCHEDULE: {
      label: "Recibir Domicilio y Agendar",
      desc: "Puede recibir al Dr. Luis Ríos en el apartamento y agendar visitas.",
      badge: "bg-sage text-sage-foreground",
    },
    VIEW_ONLY: {
      label: "Solo Carné y Pasaporte",
      desc: "Solo puede verificar vacunas y pasaporte para paseos o viajes.",
      badge: "bg-accent text-primary",
    },
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <PageTitle
            title="Círculo Familiar & Cuidadores"
            subtitle="Autoriza a familiares, paseadores o cuidadores para interactuar con el veterinario sin compartir tus contraseñas."
          />
        </div>
        <Btn
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="gap-2 shadow-button text-xs"
        >
          <UserPlus className="h-4 w-4" />
          Añadir Cuidador
        </Btn>
      </div>

      <div className="space-y-3">
        {caregivers.map((cg) => {
          const perm = permissionLabels[cg.permission_level] || permissionLabels.VIEW_AND_SCHEDULE!;
          return (
            <Card key={cg.id} className="rounded-3xl border border-border p-5 shadow-soft">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-primary font-black">
                    {cg.caregiver_name[0]?.toUpperCase()}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-foreground">{cg.caregiver_name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {relationshipLabels[cg.relationship] || cg.relationship} · {cg.caregiver_phone || "Sin teléfono"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveCaregiver(cg.id)}
                  className="text-muted-foreground hover:text-destructive p-1 transition"
                  title="Eliminar cuidador"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-secondary/50 p-3 text-xs">
                <div>
                  <p className="font-bold text-foreground">{perm.label}</p>
                  <p className="text-[11px] text-muted-foreground">{perm.desc}</p>
                </div>
                <span className={cn("rounded-full px-2.5 py-0.5 text-[10px] font-bold shrink-0", perm.badge)}>
                  {cg.permission_level === "FULL_DECISION" ? "Total" : "Operativo"}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal Add Caregiver */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-extrabold text-foreground">Añadir Persona Autorizada</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCaregiver} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-foreground">Nombre Completo *</label>
                <input
                  type="text"
                  placeholder="Ej. Mateo Gómez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-accent px-3 py-2 text-sm font-medium"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Teléfono WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+57 300 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-accent px-3 py-2 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Parentesco o Rol en el Hogar</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-accent p-2 text-xs font-medium"
                >
                  <option value="PARTNER">Pareja / Cónyuge</option>
                  <option value="FAMILY">Familiar que vive en casa</option>
                  <option value="DOG_WALKER">Paseador Canino</option>
                  <option value="PET_SITTER">Cuidador / Guardería</option>
                  <option value="ROOMMATE">Compañero de Apartamento</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground">Nivel de Permisos</label>
                <select
                  value={permissionLevel}
                  onChange={(e) => setPermissionLevel(e.target.value)}
                  className="mt-1 w-full rounded-xl bg-accent p-2 text-xs font-medium"
                >
                  <option value="VIEW_AND_SCHEDULE">Recibir Domicilio y Agendar Citas (Recomendado)</option>
                  <option value="FULL_DECISION">Decisión Médica y Procedimientos (Cónyuge / Co-tutor)</option>
                  <option value="VIEW_ONLY">Solo Visualización de Carné (Paseador)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-3">
                <Btn
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Btn>
                <Btn type="submit" className="flex-1 shadow-button">
                  Guardar Cuidador
                </Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
