import { expect, it } from "vitest";
import { durationPreviewContext } from "@/features/live-dispatch/domain/scheduling";
import { evaluateSlot, type SchedulingContext } from "@/features/scheduling/domain";
const context: SchedulingContext = { staff: [{ id: "vet", name: "QA", role: "Veterinario", zone: "Zona Norte", skills: [] }], shifts: [{ staffId: "vet", day: "Martes", start: 480, end: 1080, kind: "turno" }], bookings: [{ id: "confirmed", staffId: "vet", day: "Martes", start: 600, duration: 30, zone: "Zona Norte", status: "confirmada" }], services: [{ name: "Control", duration: 30, roles: ["Veterinario"], preferredSkills: [] }], coveredZones: ["Zona Norte"], holds: [], now: 0, dataAgeMinutes: 0 };
it("DUR15-T07/T09 aumentar 30 a 120 recalcula y rechaza el solapamiento", () => {
  const request = { service: "Control", zone: "Zona Norte", day: "Martes", start: 510 };
  expect(evaluateSlot(context, "vet", request).status).toBe("AVAILABLE");
  const preview = durationPreviewContext(context, "Control", 120);
  expect(evaluateSlot(preview, "vet", request).status).toBe("BUSY");
  expect(context.services[0]?.duration).toBe(30); expect(context.bookings[0]?.start).toBe(600);
});
it("Duraciones inválidas no llegan al motor", () => { for (const d of [0, -1, 1.5, NaN, 481]) expect(() => durationPreviewContext(context, "Control", d)).toThrow(); });