import { describe, it, expect } from "vitest";
import { ACCOUNT_PROFILES, canProvideClinicalCare, visibleAccountProfiles } from "@/lib/vf/roles";
import { resolveActors, nextEventsFor } from "@/features/field-operations/domain";
describe("Perfiles solicitados", () => {
  it("solo se generan Cliente, Administrador, Luis y Auxiliar", () =>
    expect(ACCOUNT_PROFILES.map((profile) => profile.id)).toEqual([
      "cliente",
      "administrador",
      "luis",
      "auxiliar",
    ]));
  it("Luis combina Dueño, Administrador y Veterinario", () =>
    expect(ACCOUNT_PROFILES.find((profile) => profile.id === "luis")?.roles).toEqual([
      "luis",
      "administrador",
      "veterinario",
    ]));
  it("Administrador por sí solo no obtiene atención clínica", () => {
    expect(canProvideClinicalCare(["administrador"])).toBe(false);
    expect(
      nextEventsFor("ARRIVED", resolveActors({ roles: ["administrador"], isOwnVisit: false })),
    ).not.toContain("SERVICE_STARTED");
  });
  it("Luis conserva atención y no verifica su propio cierre", () => {
    const actors = resolveActors({
      roles: ["luis", "administrador", "veterinario"],
      isOwnVisit: true,
    });
    expect(nextEventsFor("ARRIVED", actors)).toContain("SERVICE_STARTED");
    expect(nextEventsFor("ADMINISTRATIVE_REVIEW", actors)).not.toContain("CLOSURE_VERIFIED");
  });
  it("Auxiliar no adquiere facultades por una etiqueta de ficha", () => {
    expect(canProvideClinicalCare(["auxiliar"])).toBe(false);
    expect(
      resolveActors({ roles: ["auxiliar"], staffRole: "Veterinario", isOwnVisit: true }),
    ).toEqual(["Auxiliar"]);
  });
  it("Luis tiene una entrada combinada, no tres perfiles duplicados", () =>
    expect(
      visibleAccountProfiles(["luis", "administrador", "veterinario"]).map((profile) => profile.id),
    ).toEqual(["luis"]));
});
