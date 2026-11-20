import { describe, it, expect } from "vitest";
import { classify, proposeReply, canMove, isOutOfHours, NO_INFO } from "@/lib/vf/concierge";

const arts = [{ title: "Tarifas", category: "tarifas", content: "La consulta a domicilio cuesta $ 120.000 COP.", status: "aprobado" }, { title: "Zonas", category: "zonas", content: "Atendemos Bogotá norte.", status: "borrador" }];

describe("concierge", () => {
  it("detecta varias intenciones (WA-T015)", () => {
    const c = classify("Hola, quiero una cita para Luna mañana y también saber cuánto cuesta", ["Luna", "Bruno"]);
    expect(c.intents).toContain("NEW_APPOINTMENT"); expect(c.intents).toContain("PRICE_INQUIRY"); expect(c.pet).toBe("Luna");
  });
  it("una solicitud nunca se presenta como cita confirmada (WA-T023)", () => {
    const r = proposeReply(classify("quiero agendar una cita"), arts);
    expect(r.text).not.toMatch(/confirmada/); expect(r.text).toMatch(/confirmará/);
  });
  it("urgencia escala y no sigue flujo comercial (WA-T028)", () => {
    const c = classify("Mi perro está convulsionando y quiero saber el precio");
    expect(c.safety).toBe("emergency"); const r = proposeReply(c, arts); expect(r.handoff).toBe(true); expect(r.text).not.toMatch(/120\.000/);
  });
  it("solicitud de dosis se escala sin dar dosis (WA-T029)", () => {
    const r = proposeReply(classify("¿qué dosis de meloxicam le doy?"), arts);
    expect(r.handoff).toBe(true); expect(r.text).not.toMatch(/\d+ ?mg/);
  });
  it("solo usa conocimiento aprobado (WA-T018/WA-T019)", () => {
    expect(proposeReply(classify("cuánto cuesta"), arts).text).toMatch(/120\.000/);
    const z = proposeReply(classify("¿llegan a Suba?"), arts); expect(z.text).toBe(NO_INFO); expect(z.handoff).toBe(true);
  });
  it("cliente pide humano (WA-T033)", () => { expect(proposeReply(classify("quiero hablar con una persona"), arts).handoff).toBe(true); });
  it("dos mascotas con el mismo nombre no se eligen solas (WA-T010)", () => { expect(classify("cita para Luna", ["Luna", "Luna"]).pet).toBeUndefined(); });
  it("una conversación cerrada no vuelve a IA directamente", () => { expect(canMove("CLOSED", "AI_ACTIVE")).toBe(false); expect(canMove("CLOSED", "WAITING_TEAM")).toBe(true); });
  it("fuera de horario: domingo y 21:00 Bogotá (WA-T020)", () => {
    expect(isOutOfHours(new Date("2026-11-22T15:00:00Z"))).toBe(true);
    expect(isOutOfHours(new Date("2026-11-20T02:00:00Z"))).toBe(true);
    expect(isOutOfHours(new Date("2026-11-20T15:00:00Z"))).toBe(false);
  });
  it("tarifa y formas de pago aprobadas por Dirección", () => {
    const real = [
      { category: "tarifas", status: "aprobado", content: "La visita veterinaria a domicilio cuesta $ 120.000 COP." },
      { category: "pagos", status: "aprobado", content: "Aceptamos efectivo, transferencia o Nequi, y link de pago." },
    ] as never;
    const r = proposeReply(classify("¿cuánto cuesta la visita y cómo puedo pagar?"), real);
    expect(r.text).toMatch(/\$ 120\.000 COP/); expect(r.text).toMatch(/Nequi/); expect(r.text).toMatch(/link de pago/); expect(r.handoff).toBe(false);
  });
});
