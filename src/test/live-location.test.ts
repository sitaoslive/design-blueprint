import { describe, expect, it } from "vitest";
import { freshLocations } from "@/features/live-dispatch/domain/liveLocation";
const now = Date.parse("2026-11-21T22:00:00Z");
const row = (min: number) => ({ user_id: "u", staff_id: "s", visit_id: "v", lat: 4.6, lng: -74, accuracy: 10, updated_at: new Date(now - min * 60000).toISOString() });
describe("ubicación en vivo", () => {
  it("muestra posiciones de menos de 15 minutos", () => { expect(freshLocations([row(14)], now)).toHaveLength(1); });
  it("oculta posiciones de 15 minutos o más", () => { expect(freshLocations([row(15)], now)).toHaveLength(0); });
});
