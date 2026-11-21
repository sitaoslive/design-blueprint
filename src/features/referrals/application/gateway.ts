import { db } from "@/lib/vf/db";
import { getVF, refreshVF } from "@/lib/vf/store";
import { DraftSchema, draftKey, type ReferralDraft } from "../domain/advanced";
export const announceReferralChange = () => {
  if (typeof window !== "undefined") window.dispatchEvent(new Event("vf-referral-change"));
};
export async function checkedWrite(
  operation: PromiseLike<{ data: unknown; error: { message: string } | null }>,
) {
  const result = await operation;
  if (result.error) throw new Error(result.error.message);
  if (!Array.isArray(result.data) || !result.data.length)
    throw new Error("No se confirmó el guardado. Recarga y revisa tus permisos.");
  announceReferralChange();
  return result.data;
}
export async function createReferralDraft(draft: ReferralDraft) {
  const d = DraftSchema.parse(draft);
  const pet = getVF().pets.find((p) => p.id === d.petId);
  if (!pet) throw new Error("Paciente no encontrado");
  if (d.visitId && !getVF().visits.some((v) => v.id === d.visitId && v.petId === d.petId))
    throw new Error("La visita no corresponde al paciente");
  if (getVF().userId?.startsWith("demo-")) return { id: `demo-ref-${d.petId}`, demo: true };
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(draftKey(d)));
  const id = `rf-${Array.from(new Uint8Array(hash))
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 28)}`;
  const prior = await db.from("referrals").select("id").eq("id", id).maybeSingle();
  if (prior.error) throw new Error(prior.error.message);
  if (!prior.data) {
    const result = await db
      .from("referrals")
      .insert({
        id,
        pet_id: pet.id,
        pet: pet.name,
        specialty: d.specialty,
        status: "pendiente",
        specialist: d.preferredSpecialist || null,
      })
      .select("id");
    if (result.error?.code !== "23505") await checkedWrite(Promise.resolve(result));
  }
  const key = draftKey(d);
  const existing = await db
    .from("records")
    .select("id")
    .eq("kind", "referral_draft")
    .eq("ref_id", id)
    .contains("data", { key })
    .limit(1);
  if (existing.error) throw new Error(existing.error.message);
  if (!existing.data?.length)
    await checkedWrite(
      db
        .from("records")
        .insert({
          kind: "referral_draft",
          scope: "staff",
          ref_id: id,
          title: `Coordinación · ${pet.name}`,
          detail: d.nextAction,
          status: "borrador",
          data: { ...d, key },
          created_by: getVF().userId,
        })
        .select("id"),
    );
  await refreshVF();
  return { id, demo: false };
}
