import { describe, expect, it } from "vitest";
import { deploymentGates } from "@/features/system-administration/domain";
import {
  criticalFlows,
  productionAssessment,
} from "@/features/system-administration/domain/readiness";
const now = new Date("2026-11-21T18:00:00Z");
const proofs = () =>
  deploymentGates.map((name) => ({
    name,
    version: "v14",
    reference: `receipt-${name}`,
    checkedAt: "2026-11-21T17:59:00Z",
    expiresAt: "2026-11-21T18:05:00Z",
    status: "VERIFIED",
  }));
describe("P14 comprobaciones de producción", () => {
  it("requiere los 17 gates especificados", () => {
    expect(deploymentGates).toHaveLength(17);
    expect(deploymentGates).toContain("OKVET");
    expect(deploymentGates).toContain("Recuperación");
  });
  it("rechaza pruebas completas de origen no autenticado", () =>
    expect(productionAssessment(proofs(), "v14", now, false).ready).toBe(false));
  it("acepta solo las pruebas completas vigentes de la misma versión y origen autenticado", () =>
    expect(productionAssessment(proofs(), "v14", now, true).ready).toBe(true));
  it("rechaza recibos caducados", () =>
    expect(
      productionAssessment(
        proofs().map((p) => ({ ...p, expiresAt: now.toISOString() })),
        "v14",
        now,
        true,
      ).ready,
    ).toBe(false));
  it("rechaza recibos de fecha futura", () =>
    expect(
      productionAssessment(
        proofs().map((p) => ({ ...p, checkedAt: "2026-11-21T18:01:00Z" })),
        "v14",
        now,
        true,
      ).ready,
    ).toBe(false));
  it("rechaza otra versión", () =>
    expect(productionAssessment(proofs(), "v15", now, true).ready).toBe(false));
  it("rechaza un gate duplicado aunque los dos tengan éxito", () =>
    expect(
      productionAssessment([...proofs(), ...proofs().slice(0, 1)], "v14", now, true).ready,
    ).toBe(false));
  it("rechaza el conjunto incompleto", () =>
    expect(productionAssessment(proofs().slice(1), "v14", now, true).ready).toBe(false));
  it("rechaza un gate fallido", () =>
    expect(
      productionAssessment(
        proofs().map((p) => ({ ...p, status: p.name === "Finanzas" ? "FAILED" : "VERIFIED" })),
        "v14",
        now,
        true,
      ).ready,
    ).toBe(false));
  it("rechaza referencias vacías", () =>
    expect(
      productionAssessment(
        proofs().map((p) => ({ ...p, reference: " " })),
        "v14",
        now,
        true,
      ).ready,
    ).toBe(false));
  it("rechaza campos adicionales en los recibos", () =>
    expect(
      productionAssessment(
        proofs().map((p) => ({ ...p, token: "unexpected" })),
        "v14",
        now,
        true,
      ).ready,
    ).toBe(false));
  it("conserva los doce flujos sin declararlos aprobados", () => {
    expect(criticalFlows.map((f) => f.id)).toEqual([
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
    ]);
    expect(
      criticalFlows.every((f) =>
        ["BLOCKED_BACKEND", "BLOCKED_EXTERNAL_PROVIDER", "NOT_RUN"].includes(f.status),
      ),
    ).toBe(true);
  });
});
