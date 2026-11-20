import { z } from "zod";

/** Scheduling domain types (Prompt 05). Pure: no React, no backend. */
export type Role = "Veterinario" | "Auxiliar";
export type Minutes = number;

export interface StaffMember { id: string; name: string; role: Role; zone: string; skills: string[]; absentToday?: boolean }
export interface StaffShift { staffId: string; day: string; start: Minutes; end: Minutes; kind: "turno" | "ausencia" }
export interface ServiceDef { name: string; duration: Minutes; roles: Role[]; preferredSkills: string[]; protected?: boolean }
export interface Booking { id: string; staffId: string; day: string; start: Minutes; duration: Minutes; zone: string; status: string; protected?: boolean; label?: string }
export interface AppointmentHold { holdId: string; staffId: string; day: string; start: Minutes; end: Minutes; expiresAt: number; status: HoldStatus }
export type HoldStatus = "REQUESTED" | "ACTIVE" | "EXPIRED" | "RELEASED" | "CONVERTED" | "FAILED";

export type AvailabilityStatus = "AVAILABLE" | "POSSIBLE" | "PENDING_OKVET" | "PROVISIONALLY_HELD" | "BUSY" | "UNAVAILABLE" | "INCOMPATIBLE" | "COORDINATION_REQUIRED" | "STALE_DATA";
export interface Constraint { code: string; hard: boolean; message: string }

export interface AvailabilityResult {
  status: AvailabilityStatus; professionalId: string; day: string; startAt: Minutes; endAt: Minutes;
  serviceDuration: Minutes; travelBefore: Minutes; travelAfter: Minutes; bufferBefore: Minutes; bufferAfter: Minutes;
  constraints: Constraint[]; warnings: string[]; confidence: "alta" | "media" | "baja"; sourceFreshness: "vigente" | "desactualizado";
  requiresApproval: boolean; requiresOkvetConfirmation: true; score: number;
}

export interface SchedulingContext {
  staff: StaffMember[]; shifts: StaffShift[]; bookings: Booking[]; holds: AppointmentHold[];
  services: ServiceDef[]; coveredZones: string[]; now: number; dataAgeMinutes: number;
}

export const SlotRequestSchema = z.object({
  service: z.string().min(1), zone: z.string().min(1), day: z.string().min(1),
  from: z.number().int().min(0).max(24 * 60), to: z.number().int().min(0).max(24 * 60),
  professionalId: z.string().optional(), step: z.number().int().min(5).max(120).default(30),
}).refine((r) => r.to > r.from, { message: "La franja debe terminar después de empezar" });
export type SlotRequest = z.infer<typeof SlotRequestSchema>;
