import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const backend = vi.hoisted(() => ({ reply: vi.fn(), update: vi.fn() }));
vi.mock("@/lib/vf/db", () => {
  const query = { update: (patch: unknown) => { backend.update(patch); return query; }, eq: () => query, is: () => query, select: backend.reply };
  return { db: { from: () => query }, write: vi.fn(), loadAll: async () => ({ visits: ["pendiente", "confirmada", "en_curso"].map((status) => ({ id: `qa-${status}`, step: "programada", status })), tasks: [{ id: "qa-task", title: "Tarea", done: false, staffId: "qa-staff" }], items: [{ id: "qa-item", name: "Insumo", stock: 5, min: 1, lot: "QA", expires: "" }], courses: [{ id: "qa-course", title: "Curso", progress: 0 }], referrals: [{ id: "qa-referral", status: "pendiente", specialist: "" }] }) };
});
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));
import { actions, getVF, hydrateVF, resetVF } from "@/lib/vf/store";

describe("Cambios compartidos confirmados", () => {
  beforeEach(async () => { resetVF(); backend.reply.mockReset(); backend.update.mockReset(); vi.stubGlobal("navigator", { onLine: true }); await hydrateVF("qa-user", ["auxiliar"], "QA"); });
  afterEach(() => vi.unstubAllGlobals());
  for (const status of ["pendiente", "confirmada", "en_curso"] as const) it(`finalizar el paso de campo conserva el estado oficial ${status}`, async () => {
    backend.reply.mockResolvedValue({ data: [{ id: `qa-${status}` }], error: null });
    expect(await actions.advanceStep(`qa-${status}`, "finalizada")).toBe(true);
    expect(backend.update).toHaveBeenCalledWith({ step: "finalizada" });
    expect(getVF().visits.find((v) => v.id === `qa-${status}`)?.status).toBe(status);
    expect(getVF().visits.find((v) => v.id === `qa-${status}`)?.step).toBe("finalizada");
  });
  it("no completa una tarea cuando el servidor rechaza el guardado", async () => {
    backend.reply.mockResolvedValue({ data: null, error: { message: "Denegado" } });
    expect(await actions.toggleTask("qa-task")).toBe(false);
    expect(getVF().tasks.find((t) => t.id === "qa-task")?.done).toBe(false);
  });
  it("no completa una tarea si la escritura no devuelve una fila", async () => {
    backend.reply.mockResolvedValue({ data: [], error: null });
    expect(await actions.toggleTask("qa-task")).toBe(false);
    expect(getVF().tasks.find((t) => t.id === "qa-task")?.done).toBe(false);
  });
  it("espera la respuesta antes de mostrar la tarea completada", async () => {
    let finish: (value: unknown) => void = () => {};
    backend.reply.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    const saving = actions.toggleTask("qa-task");
    expect(getVF().tasks.find((t) => t.id === "qa-task")?.done).toBe(false);
    finish({ data: [{ id: "qa-task" }], error: null });
    expect(await saving).toBe(true);
    expect(getVF().tasks.find((t) => t.id === "qa-task")?.done).toBe(true);
  });
  it("conserva las existencias si se rechaza el ajuste", async () => {
    backend.reply.mockResolvedValue({ data: null, error: { message: "Denegado" } });
    expect(await actions.moveStock("qa-item", -1)).toBe(false);
    expect(getVF().items.find((i) => i.id === "qa-item")?.stock).toBe(5);
  });
  it("no inventa progreso del curso si se rechaza el guardado", async () => {
    backend.reply.mockResolvedValue({ data: null, error: { message: "Denegado" } });
    expect(await actions.progressCourse("qa-course")).toBe(false);
    expect(getVF().courses.find((c) => c.id === "qa-course")?.progress).toBe(0);
  });
  it("no cambia tareas oficiales sin conexión", async () => {
    vi.stubGlobal("navigator", { onLine: false });
    expect(await actions.toggleTask("qa-task")).toBe(false);
    expect(backend.reply).not.toHaveBeenCalled();
    expect(getVF().tasks.find((t) => t.id === "qa-task")?.done).toBe(false);
  });
  it("asignar especialista no confirma ni agenda la remisión", async () => {
    const ref = getVF().referrals[0]; if (!ref) throw new Error("Falta remisión de prueba");
    const original = ref.status;
    backend.reply.mockResolvedValue({ data: [{ id: ref.id }], error: null });
    expect(await actions.resolveReferral(ref.id, "Especialista QA")).toBe(true);
    expect(getVF().referrals.find(r => r.id === ref.id)?.specialist).toBe("Especialista QA");
    expect(getVF().referrals.find(r => r.id === ref.id)?.status).toBe(original);
  });
  it("no muestra especialista asignado si el guardado es rechazado", async () => {
    const ref = getVF().referrals[0]; if (!ref) throw new Error("Falta remisión de prueba");
    const original = ref.specialist;
    backend.reply.mockResolvedValue({ data: [], error: null });
    expect(await actions.resolveReferral(ref.id, "Especialista QA")).toBe(false);
    expect(getVF().referrals.find(r => r.id === ref.id)?.specialist).toBe(original);
  });
});