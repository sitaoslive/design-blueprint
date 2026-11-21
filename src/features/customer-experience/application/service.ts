import { useEffect, useState } from "react";
import { z } from "zod";
import { db } from "@/lib/vf/db";
import { getVF, useVF, updateQualityDemo } from "@/lib/vf/store";
import { emptyQualityWorkspace, type QualityWorkspace } from "./workspace";
import { ComplaintDraftSchema, ComplaintStates, SurveySchema, EducationSchema } from "../domain";
import { canManageQuality, canPersistDraft } from "./access";
export { canManageQuality, canPersistDraft } from "./access";

const ComplaintSchema = ComplaintDraftSchema.extend({
  id: z.string(),
  state: z.enum(ComplaintStates),
  version: z.number().int().positive(),
  createdAt: z.string(),
  updatedAt: z.string(),
  events: z.array(
    z.object({
      id: z.string(),
      at: z.string(),
      actorId: z.string(),
      from: z.enum(ComplaintStates),
      to: z.enum(ComplaintStates),
      reason: z.string(),
      evidence: z.string(),
      version: z.number(),
    }),
  ),
  plan: z.string(),
  evidence: z.string(),
  customerConfirmation: z.enum(["UNKNOWN", "CONFIRMED", "DECLINED"]),
  professionalReviewed: z.boolean(),
  solutionImplemented: z.boolean(),
});
const RecordSchema = z.object({
  id: z.string(),
  kind: z.string(),
  data: z.object({
    module: z.literal("quality-p10"),
    draft: z.unknown(),
    version: z.number().int().positive(),
    idempotencyKey: z.string(),
  }),
});
const kindMap = {
  complaints: "quality_complaint_draft",
  surveys: "quality_survey_draft",
  education: "quality_education_draft",
  improvements: "quality_improvement_draft",
} as const;
export type DraftKind = keyof typeof kindMap;
export function useQualityWorkspace() {
  const uid = useVF((s) => s.userId);
  const roles = useVF((s) => s.roles);
  const synthetic = useVF((s) => s.qualityDemo);
  const demo = Boolean(uid?.startsWith("demo-"));
  const [workspace, setWorkspace] = useState<QualityWorkspace>(emptyQualityWorkspace);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(!demo);
  const [epoch, setEpoch] = useState(0);
  useEffect(() => {
    setWorkspace(emptyQualityWorkspace());
    setError("");
    if (demo || !uid || !canPersistDraft(roles)) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    const load = async () => {
      try {
        const result = await db
          .from("records")
          .select("id,kind,data")
          .in("kind", Object.values(kindMap))
          .eq("scope", "director");
        if (result.error) throw new Error(result.error.message);
        const next = emptyQualityWorkspace();
        for (const raw of result.data ?? []) {
          const r = RecordSchema.safeParse(raw);
          if (!r.success)
            throw new Error("Un borrador tiene un formato no válido; solicita revisión");
          if (r.data.kind === kindMap.complaints)
            next.complaints.push(ComplaintSchema.parse(r.data.data.draft));
          if (r.data.kind === kindMap.surveys)
            next.surveys.push(SurveySchema.parse(r.data.data.draft));
          if (r.data.kind === kindMap.education)
            next.education.push(EducationSchema.parse(r.data.data.draft));
          // Improvement records are validated before writing; official states remain provider-owned.
          if (r.data.kind === kindMap.improvements) {
            const a = ImprovementSchema.parse(r.data.data.draft);
            next.improvements.push(a);
          }
        }
        if (active) {
          setWorkspace(next);
          setError("");
        }
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : "No se pudo cargar");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    const timer = setInterval(() => void load(), 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [uid, demo, epoch, roles]);
  return {
    workspace: demo ? synthetic : workspace,
    demo,
    error,
    loading,
    reload: () => setEpoch((x) => x + 1),
  };
}
const ImprovementSchema = z.object({
  id: z.string(),
  title: z.string(),
  hypothesis: z.string(),
  confirmedCause: z.string(),
  evidence: z.string(),
  assignedTo: z.string(),
  dueAt: z.string(),
  state: z.enum([
    "IDEA",
    "UNDER_REVIEW",
    "APPROVED",
    "IMPLEMENTATION_PENDING",
    "IN_PROGRESS",
    "VALIDATION_PENDING",
    "EFFECTIVE",
    "INEFFECTIVE",
    "CLOSED",
  ]),
  approvedBy: z.string(),
  implementationEvidence: z.string(),
  measuredAfter: z.string(),
  trainingReference: z.string(),
});
const pending = new Set<string>();
export async function saveQualityDraft<K extends DraftKind>(
  kind: K,
  draft: QualityWorkspace[K][number],
): Promise<void> {
  const state = getVF();
  if (!state.userId) throw new Error("UNAUTHORIZED");
  if (!canManageQuality(state.roles)) throw new Error("FORBIDDEN");
  const schema =
    kind === "complaints"
      ? ComplaintSchema
      : kind === "surveys"
        ? SurveySchema
        : kind === "education"
          ? EducationSchema
          : ImprovementSchema;
  schema.parse(draft);
  if (state.userId.startsWith("demo-")) {
    updateQualityDemo((w) => ({
      ...w,
      [kind]: [...w[kind].filter((d) => d.id !== draft.id), draft],
    }));
    return;
  }
  if (!canPersistDraft(state.roles))
    throw new Error("El servicio protegido para este perfil aún no está conectado");
  const allowed =
    kind === "complaints" ? "NEW" : kind === "surveys" || kind === "education" ? "DRAFT" : "IDEA";
  const status = "state" in draft ? draft.state : "";
  if (status !== allowed)
    throw new Error("Las decisiones oficiales requieren el servicio autorizado");
  const key = `${state.userId}:quality-p10:${draft.id}`;
  if (pending.has(key)) throw new Error("Guardado en curso");
  pending.add(key);
  try {
    const result = await db
      .from("records")
      .insert({
        id: draft.id,
        kind: kindMap[kind],
        scope: "director",
        ref_id: "customerId" in draft ? draft.customerId : null,
        title: "title" in draft ? draft.title : draft.category,
        detail:
          "description" in draft
            ? draft.description
            : "Borrador reservado; sin publicación ni ejecución oficial",
        status: "draft",
        created_by: state.userId,
        data: { module: "quality-p10", draft, version: 1, idempotencyKey: key },
      })
      .select("id");
    if (result.error) {
      if (result.error.code === "23505") {
        const original = await db
          .from("records")
          .select("id,data")
          .eq("id", draft.id)
          .eq("kind", kindMap[kind])
          .single();
        if (!original.error && JSON.stringify(original.data?.data?.draft) === JSON.stringify(draft))
          return;
      }
      throw new Error(result.error.message);
    }
    if (!result.data?.length) throw new Error("No se confirmó el guardado");
  } finally {
    pending.delete(key);
  }
}
export async function requestCustomerHelp(input: {
  description: string;
  petId: string;
  idempotencyKey: string;
}) {
  const s = getVF();
  if (!s.userId || !s.roles.includes("cliente")) throw new Error("FORBIDDEN");
  if (input.description.trim().length < 10)
    throw new Error("Describe tu solicitud con al menos 10 caracteres");
  const pet = s.pets.find((p) => p.id === input.petId && p.ownerId === s.userId);
  if (!pet) throw new Error("Selecciona una de tus mascotas");
  if (s.userId.startsWith("demo-")) return "DEMO_ONLY";
  const result = await db
    .from("service_requests")
    .insert({
      id: input.idempotencyKey,
      client: s.displayName,
      phone: "",
      pet: pet.name,
      channel: "Portal",
      message: input.description.trim(),
      status: "nueva",
      at: new Date().toISOString(),
      created_by: s.userId,
    })
    .select("id");
  if (result.error?.code === "23505") {
    const existing = await db
      .from("service_requests")
      .select("id,message,created_by")
      .eq("id", input.idempotencyKey)
      .single();
    if (
      !existing.error &&
      existing.data?.created_by === s.userId &&
      existing.data?.message === input.description.trim()
    )
      return "RECORDED";
  }
  if (result.error || !result.data?.length)
    throw new Error(result.error?.message ?? "No se confirmó la solicitud");
  return "RECORDED";
}
