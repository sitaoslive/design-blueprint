import { describe, expect, it } from "vitest";
import { deploymentReady, deploymentGates } from "@/features/system-administration/domain";
describe("P14 integridad de lanzamiento", () => {
  it("no combina evidencias de distintas versiones", () => {
    expect(
      deploymentReady(
        deploymentGates.map((name, i) => ({
          name,
          verified: true,
          evidence: "qa",
          version: i === 0 ? "1" : "2",
        })),
      ),
    ).toBe(false);
  });
  it("no permite evidencias contradictorias del mismo gate", () => {
    const gates = deploymentGates.map((name) => ({
      name,
      verified: true,
      evidence: "qa",
      version: "1",
    }));
    expect(
      deploymentReady([
        ...gates,
        { name: "Frontend", verified: false, evidence: "failed", version: "1" },
      ]),
    ).toBe(false);
  });
});
