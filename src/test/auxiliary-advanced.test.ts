import { describe, expect, it } from "vitest";
import { taskTransitions, validateTaskTransition, nextSupportStage, operationalDay, taskOverdue } from "@/features/field-operations/domain/advanced";
describe("Auxiliares avanzados", () => {
  it("una tarea se acepta antes de iniciarla", () => expect(validateTaskTransition("assigned", "in_progress", "")).not.toBeNull());
  it("solo una tarea en curso se completa", () => { expect(taskTransitions("accepted")).not.toContain("completed"); expect(taskTransitions("in_progress")).toContain("completed"); });
  it("bloquear requiere motivo", () => expect(validateTaskTransition("in_progress", "blocked", "")).not.toBeNull());
  it("auxiliar no cancela tareas", () => expect(taskTransitions("in_progress")).not.toContain("cancelled"));
  it("tarea resuelta no se reabre", () => expect(taskTransitions("completed", true)).toEqual([]));
  it("el apoyo nunca tiene un paso de atención clínica", () => expect(nextSupportStage("ARRIVED")).toBe("COMPLETED"));
  it("la jornada usa la fecha de Colombia", () => expect(operationalDay(new Date("2026-11-21T02:00:00Z"))).toBe("2026-11-20"));
  it("una tarea pendiente con fecha pasada está vencida", () => expect(taskOverdue("2026-11-20T12:00:00Z", "assigned", Date.parse("2026-11-21T12:00:00Z"))).toBe(true));
  it("una tarea completada no aparece vencida", () => expect(taskOverdue("2026-11-20T12:00:00Z", "completed", Date.parse("2026-11-21T12:00:00Z"))).toBe(false));
});