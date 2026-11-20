import { describe, it, expect } from "vitest";
import { triageRequest, triageReferral } from "@/lib/vf/triage";

describe("triage", () => {
  it("marks bleeding as alta", () => expect(triageRequest("Mi perro está sangrando").priority).toBe("alta"));
  it("marks vomiting as media", () => expect(triageRequest("Ha tenido vómito desde ayer").priority).toBe("media"));
  it("reschedule is media with agenda reason", () => { const t = triageRequest("Necesito reprogramar la cita"); expect(t.priority).toBe("media"); expect(t.reason).toContain("agenda"); });
  it("urgency wins over symptoms", () => expect(triageRequest("vómito con sangre").priority).toBe("alta"));
  it("not eating is media", () => expect(triageRequest("Mi perro no quiere comer desde ayer.").priority).toBe("media"));
  it("marks routine as baja", () => expect(triageRequest("Quiero agendar vacuna").priority).toBe("baja"));
  it("unassigned cardiology referral is alta", () => expect(triageReferral("Cardiología", false).priority).toBe("alta"));
  it("assigned referral is baja", () => expect(triageReferral("Cardiología", true).priority).toBe("baja"));
});
