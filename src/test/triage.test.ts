import { describe, it, expect } from "vitest";
import { triageRequest, triageReferral } from "@/lib/vf/triage";

describe("triage", () => {
  it("marks bleeding as alta", () => expect(triageRequest("Mi perro está sangrando").priority).toBe("alta"));
  it("marks vomiting as media", () => expect(triageRequest("Ha tenido vómito desde ayer").priority).toBe("media"));
  it("marks routine as baja", () => expect(triageRequest("Quiero agendar vacuna").priority).toBe("baja"));
  it("unassigned cardiology referral is alta", () => expect(triageReferral("Cardiología", false).priority).toBe("alta"));
  it("assigned referral is baja", () => expect(triageReferral("Cardiología", true).priority).toBe("baja"));
});
