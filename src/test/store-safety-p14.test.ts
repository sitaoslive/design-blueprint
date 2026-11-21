import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({ update: vi.fn(), load: vi.fn() }));
vi.mock("@/lib/vf/db", () => ({
  db: { from: () => ({ update: mock.update, insert: mock.update }) },
  write: vi.fn(),
  loadAll: mock.load,
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
import { actions, clearVF, getVF, hydrateVF, startDemo } from "@/lib/vf/store";
beforeEach(() => {
  clearVF();
  vi.clearAllMocks();
  mock.load.mockResolvedValue({
    payments: [{ id: "qa-payment", status: "pendiente", amount: 120000 }],
    items: [{ id: "qa-item", stock: 5 }],
    chat: [
      {
        id: "qa-proposal",
        from: "ai",
        text: "Borrador",
        proposal: { title: "Propuesta", effects: "Borrador", status: "propuesta" },
      },
    ],
  });
});
describe("P14 no hechos oficiales desde acciones antiguas", () => {
  it("limpiar una sesión deja el store vacío, no fixtures demo", () => {
    startDemo("cliente", "Cliente DEMO");
    expect(getVF().pets.length).toBeGreaterThan(0);
    clearVF();
    expect(getVF().pets).toEqual([]);
    expect(getVF().visits).toEqual([]);
    expect(getVF().payments).toEqual([]);
    expect(getVF().chat).toEqual([]);
  });
  it("marcar pagado falla cerrado y no inventa pago verificado", async () => {
    await hydrateVF("real-viewer", ["finanzas"], "Finanzas QA");
    expect(actions.markPaid("qa-payment")).toBe(false);
    expect(getVF().payments[0]?.status).toBe("pendiente");
    expect(mock.update).not.toHaveBeenCalled();
  });
  it("la activación antigua de ausencia no ejecuta cambios reales", async () => {
    await hydrateVF("real-viewer", ["luis"], "Luis QA");
    expect(
      actions.setAbsence({
        coordinator: "QA",
        replacements: ["qa-staff"],
        limits: "",
        from: "2026-11-21",
        to: "2026-11-22",
        active: true,
      }),
    ).toBe(false);
    expect(getVF().absence).toBeNull();
    expect(mock.update).not.toHaveBeenCalled();
  });
  it("las existencias reales no se ajustan directamente desde React", async () => {
    await hydrateVF("real-viewer", ["administrador"], "QA");
    expect(await actions.moveStock("qa-item", -1)).toBe(false);
    expect(getVF().items[0]?.stock).toBe(5);
    expect(mock.update).not.toHaveBeenCalled();
  });
  it("la aprobación antigua del asistente no convierte borrador en decisión oficial", async () => {
    await hydrateVF("real-viewer", ["luis"], "QA");
    expect(actions.setProposal("qa-proposal", "aprobada")).toBe(false);
    expect(getVF().chat[0]?.proposal?.status).toBe("propuesta");
    expect(mock.update).not.toHaveBeenCalled();
  });
  it("la hidratación real no conserva filas demo que no entregue la fuente", async () => {
    startDemo("cliente", "Cliente DEMO");
    await hydrateVF("real-viewer", ["cliente"], "QA");
    expect(getVF().pets).toEqual([]);
    expect(getVF().userId).toBe("real-viewer");
  });
});
