export type OfferStatus = "OFFERED" | "ACCEPTED" | "DECLINED" | "EXPIRED" | "PENDING_OKVET";
export interface WaitEntry { id: string; service: string; zone: string; status: string; createdAt: number }
export interface Vacancy { id: string; service: string; zone: string; day: string; start: number }
export interface Offer { entryId: string; vacancyId: string; status: OfferStatus; expiresAt: number }
/** Eligible entries for a vacancy, oldest first; excludes anyone already holding an active offer. */
export function eligibleFor(v: Vacancy, list: WaitEntry[], offers: Offer[], now: number) {
  const busy = new Set(offers.filter((o) => o.status === "OFFERED" && o.expiresAt > now).map((o) => o.entryId));
  return list.filter((e) => e.status === "activa" && e.service === v.service && e.zone === v.zone && !busy.has(e.id)).sort((a, b) => a.createdAt - b.createdAt);
}
/** Accepting turns into PENDING_OKVET (never "confirmada"); a vacancy can only be accepted once. */
export function acceptOffer(offer: Offer, offers: Offer[], now: number): { ok: boolean; status: OfferStatus; reason?: string } {
  if (offer.expiresAt <= now) return { ok: false, status: "EXPIRED", reason: "La oferta venció" };
  if (offers.some((o) => o.vacancyId === offer.vacancyId && o !== offer && (o.status === "ACCEPTED" || o.status === "PENDING_OKVET"))) return { ok: false, status: offer.status, reason: "Ese cupo ya fue tomado" };
  return { ok: true, status: "PENDING_OKVET" };
}
