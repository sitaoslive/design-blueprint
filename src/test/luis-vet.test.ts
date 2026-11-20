import { describe, it, expect } from "vitest";
import { resolveActors, nextEventsFor } from "@/features/field-operations/domain";
describe("Luis veterinario", () => {
  it("en su propia cita puede iniciar y terminar la atención", () => {
    const a = resolveActors({ roles: ["luis", "administrador"], isOwnVisit: true });
    expect(nextEventsFor("ARRIVED", a)).toContain("SERVICE_STARTED");
    expect(nextEventsFor("IN_SERVICE", a)).toContain("SERVICE_FINISHED");
  });
  it("no verifica el cierre de su propia cita", () => {
    expect(nextEventsFor("ADMINISTRATIVE_REVIEW", resolveActors({ roles: ["luis"], isOwnVisit: true }))).not.toContain("CLOSURE_VERIFIED");
  });
  it("conserva permisos de administrador en citas de otros", () => {
    expect(nextEventsFor("ADMINISTRATIVE_REVIEW", resolveActors({ roles: ["luis"], isOwnVisit: false }))).toContain("CLOSURE_VERIFIED");
  });
  it("un auxiliar sigue sin poder iniciar la atención", () => {
    expect(nextEventsFor("ARRIVED", resolveActors({ roles: ["auxiliar"], staffRole: "Auxiliar", isOwnVisit: true }))).not.toContain("SERVICE_STARTED");
  });
});
