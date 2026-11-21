import { z } from "zod";
import { ComplaintDraftSchema, SurveySchema, EducationSchema, prepareCorrectiveAction, type CorrectiveAction } from "../domain";

export const OfficialCommandSchema = z.object({
  action: z.enum(["create", "transition", "clinical_review", "feedback", "consent", "invite", "respond"]),
  kind: z.string(), entityId: z.string().uuid(), expectedVersion: z.number().int().nonnegative(),
  idempotencyKey: z.string().min(8), reason: z.string().trim().min(3), payload: z.record(z.unknown()),
});
export type OfficialCommand = z.infer<typeof OfficialCommandSchema>;
export function validateOfficialCommand(input: unknown) {
  const c = OfficialCommandSchema.parse(input);
  if(c.action==='consent') z.object({purpose:z.enum(['operational','appointment','administrative','followup','education','promotion','review','referral','testimonial']),channel:z.enum(['portal','whatsapp','email','sms','public']),status:z.enum(['GRANTED','REVOKED']),source:z.string().trim().min(3)}).parse(c.payload);
  if(c.action==='invite') z.object({surveyId:z.string().uuid(),customerId:z.string().uuid(),eventId:z.string().min(1),expiresAt:z.string().datetime()}).parse(c.payload);
  if(c.action==='respond') z.object({invitationId:z.string().uuid(),answers:z.record(z.union([z.string().max(5000),z.number().finite()]))}).parse(c.payload);
  if (c.action === "create") {
    if (c.kind === "complaints") ComplaintDraftSchema.parse(c.payload);
    else if (c.kind === "surveys") SurveySchema.parse(c.payload);
    else if (c.kind === "education") EducationSchema.parse(c.payload);
    else if (c.kind === "improvements") {
      const a = z.object({ id:z.string(), title:z.string(), hypothesis:z.string(), confirmedCause:z.string(), evidence:z.string(), assignedTo:z.string(), dueAt:z.string(), state:z.literal("IDEA"), approvedBy:z.string(), implementationEvidence:z.string(), measuredAfter:z.string(), trainingReference:z.string() }).parse(c.payload);
      const error = prepareCorrectiveAction(a as CorrectiveAction);
      if (error) throw new Error(error);
    } else if (c.kind !== "standards") throw new Error("INTEGRATION_UNAVAILABLE");
  }
  return c;
}