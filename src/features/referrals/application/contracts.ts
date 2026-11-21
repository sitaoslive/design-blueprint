import { z } from "zod";
export const CommandSchema = z.object({
  organizationId: z.string().min(1),
  referralId: z.string().min(1),
  expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(1),
  correlationId: z.string().uuid(),
});
export const IntegrationErrorSchema = z.object({
  code: z.enum([
    "UNAUTHORIZED",
    "FORBIDDEN",
    "REFERRAL_NOT_FOUND",
    "CLINICAL_APPROVAL_REQUIRED",
    "SPECIALIST_NOT_VERIFIED",
    "AVAILABILITY_STALE",
    "OFFER_EXPIRED",
    "SLOT_UNAVAILABLE",
    "EXTERNAL_CONFIRMATION_PENDING",
    "BOOKING_ALREADY_EXISTS",
    "CONSENT_REQUIRED",
    "DOCUMENT_NOT_AUTHORIZED",
    "PROFESSIONAL_REVIEW_REQUIRED",
    "CONFLICT",
    "INTEGRATION_UNAVAILABLE",
  ]),
  message: z.string(),
});
export type ReferralCommand = z.infer<typeof CommandSchema>;
export interface ReferralExternalGateway {
  requestAvailability(
    command: ReferralCommand & { specialistId: string; from: string; to: string },
  ): Promise<{ requestId: string; state: "WAITING_RESPONSE" }>;
  reserveSlot(
    command: ReferralCommand & { offerId: string },
  ): Promise<{ holdId: string; expiresAt: string }>;
  shareDocuments(
    command: ReferralCommand & { documentIds: string[]; consentId: string; expiresAt: string },
  ): Promise<{ grantId: string; expiresAt: string }>;
  sendOptions(command: ReferralCommand): Promise<{ messageId: string; state: "QUEUED" }>;
}
/** Explicit unavailable adapter: not an endpoint and never fabricated provider success. */
export const unavailableReferralGateway: ReferralExternalGateway = {
  requestAvailability: async () => {
    throw new Error("INTEGRATION_UNAVAILABLE: contacto externo no conectado");
  },
  reserveSlot: async () => {
    throw new Error("INTEGRATION_UNAVAILABLE: reserva externa atómica no conectada");
  },
  shareDocuments: async () => {
    throw new Error("INTEGRATION_UNAVAILABLE: autorización documental por remisión no conectada");
  },
  sendOptions: async () => {
    throw new Error("INTEGRATION_UNAVAILABLE: envío externo no conectado");
  },
};
export const REFERRAL_CONTRACTS = [
  ["getReferral", "referral_cases", "RLS del equipo; propietario por canal autorizado"],
  ["listReferrals", "referrals", "RLS por mascota y especialista"],
  ["createReferralDraft", "referrals + records", "can_refer; metadata no autoriza aprobación"],
  ["requestClinicalApproval", "referral_cases", "guard_referral_case"],
  ["getVerifiedSpecialists", "org_settings", "revisión por Dirección"],
  ["getSpecialistProfile", "specialists + org_settings", "lectura autorizada"],
  ["getSpecialistAvailability", "records", "ventanas informadas, no reservas"],
  ["registerReportedAvailability", "records", "fuente manual, vigencia"],
  ["createAvailabilityRequest", "referral_reminders", "tarea interna; contacto externo pendiente"],
  ["createBookingOffer", "referral_cases", "versión y vigencia"],
  ["getBookingOffer", "my_referral_offers", "RLS propietario"],
  ["submitBookingSelection", "referral_choices", "offer_is_live"],
  ["requestExternalConfirmation", "referral_cases", "estado; sin contacto automático"],
  [
    "registerVerifiedExternalAppointment",
    "referral_cases",
    "historial con evidencia; registro manual, no validación del proveedor",
  ],
  ["requestReferralReschedule", "referral_cases", "motivo y versión"],
  ["requestReferralCancellation", "referral_cases", "motivo y versión"],
  ["getReferralDocuments", "EXTERNAL", "autorización por remisión pendiente"],
  ["requestDocumentApproval", "EXTERNAL", "revisión profesional protegida pendiente"],
  [
    "prepareSecureDocumentSharing",
    "EXTERNAL",
    "consentimiento, acceso mínimo, revocación pendiente",
  ],
  [
    "getPendingReferralResults",
    "specialist_reports + referral_cases",
    "recepción separada de revisión",
  ],
  [
    "submitReferralReport",
    "specialist_reports",
    "autor verificado; archivo protegido por remisión pendiente",
  ],
  ["requestProfessionalReview", "referral_cases", "guard_referral_case"],
  ["createReferralFollowUp", "referral_reminders", "responsable y fecha"],
  ["delegateReferralCommitment", "referral_reminders", "reasignación confirmada"],
  ["getReferralTimeline", "referral_cases", "historial persistido"],
  ["getReferralMetrics", "referral_cases", "solo datos visibles, sin estimaciones inventadas"],
] as const;
