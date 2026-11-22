/**
 * VET FREEDOM OS — FORMULARIO ASISTIDO DE CONFIRMACIÓN OKVET
 * Conecta los componentes de Lovable UI con el backend de Antigravity en Supabase
 * RPC: public.submit_okvet_human_confirmation
 * Dirección Médica: Dr. Luis Eduardo Ríos
 * Dirección Estratégica: Alpha Vision Method
 * Fecha: 22 de Noviembre de 2026
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Btn, Card, SectionTitle } from "@/components/vf/ui";
import { CheckCircle2, AlertTriangle, ShieldCheck, FileCheck } from "lucide-react";
import { financeInput } from "@/features/finance/components/FinanceControls";

const VET_LIFE_ORG_ID = "11111111-1111-1111-1111-111111111111";

export interface OkvetConfirmationProps {
  appointmentId?: string;
  petName?: string;
  clientName?: string;
  scheduledDate?: string;
  onSuccess?: (reference: string) => void;
}

export function OkvetConfirmationForm({
  appointmentId: initialAppointmentId,
  petName,
  clientName,
  scheduledDate,
  onSuccess
}: OkvetConfirmationProps) {
  const [appointmentId, setAppointmentId] = useState(initialAppointmentId || "");
  const [okvetReference, setOkvetReference] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId.trim() || !okvetReference.trim()) {
      setResultMsg({ type: "error", text: "Debe ingresar el ID de cita y el radicado oficial de OKVET." });
      return;
    }

    setBusy(true);
    setResultMsg(null);

    try {
      const { data, error } = await supabase.rpc("submit_okvet_human_confirmation", {
        p_org_id: VET_LIFE_ORG_ID,
        p_appointment_id: appointmentId.trim(),
        p_okvet_reference: okvetReference.trim(),
        p_confirmed_by: "11111111-1111-1111-1111-000000000001", // Dr. Luis / Operador
        p_notes: notes.trim() || "Confirmación médica asistida registrada desde Lovable."
      });

      if (error) {
        setResultMsg({ type: "error", text: `Error en confirmación OKVET: ${error.message}` });
      } else {
        setResultMsg({
          type: "success",
          text: `Cita confirmada exitosamente con radicado OKVET "${okvetReference.trim()}". Evento emitido a Outbox.`
        });
        if (onSuccess) onSuccess(okvetReference.trim());
      }
    } catch (err: any) {
      setResultMsg({ type: "error", text: `Excepción de conexión: ${err.message || "Error desconocido"}` });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-primary font-bold">
        <ShieldCheck className="h-5 w-5" />
        <SectionTitle className="!mb-0">Confirmación Asistida en OKVET Cloud</SectionTitle>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Procedimiento SOP-OKVET-01: Ingrese el radicado oficial obtenido en la plataforma clínica OKVET Cloud para formalizar la cita.
      </p>

      {resultMsg && (
        <div className={`mt-4 flex items-center gap-2 rounded-2xl p-3 text-xs font-bold ${
          resultMsg.type === "success"
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            : "bg-red-500/10 text-red-600 border border-red-500/20"
        }`}>
          {resultMsg.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          {resultMsg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {!initialAppointmentId && (
          <div>
            <label className="text-xs font-bold text-muted-foreground">UUID de Cita en Supabase *</label>
            <input
              type="text"
              placeholder="Ej: d7c1918a-f88e-4a6c-9419-..."
              value={appointmentId}
              onChange={(e) => setAppointmentId(e.target.value)}
              className={financeInput}
              required
            />
          </div>
        )}

        {initialAppointmentId && (
          <div className="rounded-2xl bg-secondary/60 p-3 text-xs">
            <p><b>Cita seleccionada:</b> {appointmentId}</p>
            {petName && <p><b>Paciente:</b> {petName} {clientName ? `(${clientName})` : ""}</p>}
            {scheduledDate && <p><b>Fecha:</b> {scheduledDate}</p>}
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-muted-foreground">
            Radicado Oficial de OKVET Cloud *
          </label>
          <input
            type="text"
            placeholder="Ej: OK-2026-8849"
            value={okvetReference}
            onChange={(e) => setOkvetReference(e.target.value)}
            className={financeInput}
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold text-muted-foreground">
            Notas de Confirmación Médica / Operativa
          </label>
          <textarea
            rows={2}
            placeholder="Observaciones de disponibilidad, agenda o verificación con el médico veterinario asignado..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={financeInput}
          />
        </div>

        <Btn type="submit" disabled={busy} className="w-full">
          <FileCheck className="h-4 w-4 mr-2" />
          {busy ? "Confirmando en Supabase..." : "Registrar Confirmación Humana OKVET"}
        </Btn>
      </form>
    </Card>
  );
}
