import { useEffect, useState } from "react";
import { db } from "@/lib/vf/db";
import { useVF } from "@/lib/vf/store";
import { canManageQuality } from "../application/service";
import type { QualitySource } from "../domain";
export type ConversationSource = {
  id: string;
  owner_id: string | null;
  contact_name: string;
  status: string;
  last_message_at: string;
  last_inbound_at: string | null;
  sensitive: boolean;
  verified: boolean;
};
export type RecordSource = {
  id: string;
  kind: string;
  title: string;
  status: string;
  ref_id: string | null;
  data: Record<string, unknown>;
  updated_at: string;
};
type ReferralSource = { referral_id: string; state: string; updated_at: string };
type ReminderSource = {
  id: string;
  referral_id: string | null;
  due_at: string;
  status: string;
  assignee: string;
};
export function useQualitySources() {
  const state = useVF((s) => s);
  const [conversations, setConversations] = useState<ConversationSource[]>([]);
  const [records, setRecords] = useState<RecordSource[]>([]);
  const [referrals, setReferrals] = useState<ReferralSource[]>([]);
  const [reminders, setReminders] = useState<ReminderSource[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setConversations([]);
    setRecords([]);
    setReferrals([]);
    setReminders([]);
    setError("");
    if (!state.userId || !canManageQuality(state.roles)) return;
    const load = async () => {
      try {
        const [c, r, cases, followups] = await Promise.all([
          db
            .from("conversations")
            .select(
              "id,owner_id,contact_name,status,last_message_at,last_inbound_at,sensitive,verified",
            ),
          db
            .from("records")
            .select("id,kind,title,status,ref_id,data,updated_at")
            .in("kind", [
              "compromiso_conversacion",
              "compromiso_visita",
              "reminder",
              "referral_commitment",
            ]),
          db.from("referral_cases").select("referral_id,state,updated_at"),
          db.from("referral_reminders").select("id,referral_id,due_at,status,assignee"),
        ]);
        if (c.error || r.error || cases.error || followups.error)
          throw new Error(
            c.error?.message ??
              r.error?.message ??
              cases.error?.message ??
              followups.error?.message,
          );
        if (active) {
          setConversations(c.data ?? []);
          setRecords(r.data ?? []);
          setReferrals(cases.data ?? []);
          setReminders(followups.data ?? []);
          setError("");
        }
      } catch (e) {
        if (active)
          setError(e instanceof Error ? e.message : "No se pudieron consultar las fuentes");
      }
    };
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [state.userId, state.roles]);
  const sources: QualitySource[] = [
    ...referrals.map((r) => ({
      id: r.referral_id,
      category: "Remisión",
      source: "referral_cases",
      sourceReference: r.referral_id,
      status: r.state,
      dueAt: null,
      updatedAt: r.updated_at,
      assignedTo: null,
      href: `/operaciones/remisiones/${r.referral_id}`,
    })),
    ...reminders.map((r) => ({
      id: r.id,
      category: "Seguimiento",
      source: "referral_reminders",
      sourceReference: r.referral_id ?? r.id,
      status: r.status,
      dueAt: r.due_at,
      updatedAt: null,
      assignedTo: r.assignee || null,
      href: r.referral_id ? `/operaciones/remisiones/${r.referral_id}` : "/luis/recordatorios",
    })),
    ...state.requests
      .filter((r) => r.status !== "resuelta")
      .map((r) => ({
        id: r.id,
        category: "Solicitud",
        source: "service_requests",
        sourceReference: r.id,
        status: r.status,
        dueAt: null,
        updatedAt: null,
        assignedTo: null,
        href: "/coordinacion/solicitudes",
      })),
    ...state.visits
      .filter((v) => ["pendiente", "pendiente_okvet", "revision"].includes(v.status))
      .map((v) => ({
        id: v.id,
        category: "Cita sin confirmar",
        source: "visits",
        sourceReference: v.id,
        status: v.status,
        dueAt: null,
        updatedAt: null,
        assignedTo: v.staffId,
        href: `/coordinacion/cita/${v.id}`,
      })),
    ...state.incidents.map((i) => ({
      id: i.id,
      category: "Incidencia",
      source: "incidents",
      sourceReference: i.id,
      status: i.status,
      dueAt: null,
      updatedAt: null,
      assignedTo: i.owner,
      href: "/operaciones/incidencias",
    })),
    ...conversations.map((c) => ({
      id: c.id,
      category: "Conversación",
      source: "conversations",
      sourceReference: c.id,
      status: c.status,
      dueAt: null,
      updatedAt: c.last_inbound_at,
      assignedTo: null,
      href: `/operaciones/whatsapp/${c.id}`,
    })),
    ...records.map((r) => ({
      id: r.id,
      category: "Compromiso",
      source: "records",
      sourceReference: r.id,
      status: r.status,
      dueAt: typeof r.data["dueAt"] === "string" ? r.data["dueAt"] : null,
      updatedAt: r.updated_at,
      assignedTo: typeof r.data["assignedTo"] === "string" ? r.data["assignedTo"] : null,
      href:
        r.kind === "compromiso_conversacion" && r.ref_id
          ? `/operaciones/whatsapp/${r.ref_id}`
          : "/operaciones/compromisos",
    })),
  ];
  return { sources, conversations, records, error };
}
