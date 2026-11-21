import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const backend = vi.hoisted(() => ({ read: vi.fn() }));
vi.mock("@/lib/vf/store", () => ({ useVF: (select: (state: { userId: string; roles: string[] }) => unknown) => select({ userId: "qa-user", roles: ["veterinario"] }) }));
vi.mock("@/lib/vf/db", () => ({ db: { from: () => ({ select: backend.read }) } }));
import { useFinanceRows } from "@/features/finance/application/sources";

describe("Despacho relee las marcas confirmadas de atención", () => {
  beforeEach(() => {
    backend.read.mockReset();
    vi.stubGlobal("BroadcastChannel", class { onmessage: (() => void) | null = null; close() {} });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("un cambio de campo obtiene IN_SERVICE sin esperar el sondeo", async () => {
    backend.read.mockResolvedValue({ data: [{ visit_id: "qa-visit", state: "ARRIVED", stamps: {} }], error: null });
    const { result, unmount } = renderHook(() => useFinanceRows<{ state: string; stamps: Record<string, string> }>("visit_executions"));
    await waitFor(() => expect(result.current.rows?.[0]?.state).toBe("ARRIVED"));
    backend.read.mockResolvedValue({ data: [{ visit_id: "qa-visit", state: "IN_SERVICE", stamps: { IN_SERVICE: "2026-11-21T17:00:00Z" } }], error: null });
    act(() => window.dispatchEvent(new Event("vf-field-change")));
    await waitFor(() => expect(result.current.rows?.[0]?.stamps["IN_SERVICE"]).toBe("2026-11-21T17:00:00Z"));
    expect(backend.read).toHaveBeenCalledTimes(2);
    unmount();
    act(() => window.dispatchEvent(new Event("vf-field-change")));
    expect(backend.read).toHaveBeenCalledTimes(2);
  });
  it("una consulta rechazada no conserva tiempos como fuente vigente", async () => {
    backend.read.mockResolvedValue({ data: [{ state: "IN_SERVICE" }], error: null });
    const { result } = renderHook(() => useFinanceRows<{ state: string }>("visit_executions"));
    await waitFor(() => expect(result.current.rows?.[0]?.state).toBe("IN_SERVICE"));
    backend.read.mockResolvedValue({ data: null, error: { message: "Acceso rechazado" } });
    act(() => window.dispatchEvent(new Event("vf-field-change")));
    await waitFor(() => expect(result.current.error).toBe("Acceso rechazado"));
    expect(result.current.rows).toBeNull();
    expect(result.current.loadedAt).toBeNull();
  });
});