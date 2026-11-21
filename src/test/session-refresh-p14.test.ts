import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  state: { userId: "viewer", loaded: true, roles: ["administrador"] as string[] },
  roles: ["administrador"] as string[],
  getUser: vi.fn(),
  hydrate: vi.fn(),
  clear: vi.fn(),
}));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getUser: mocks.getUser } },
}));
vi.mock("@/lib/vf/db", () => ({
  db: {
    from: () => ({
      select: () => ({ eq: async () => ({ data: mocks.roles.map((role) => ({ role })) }) }),
    }),
  },
}));
vi.mock("@/lib/vf/store", () => ({
  getVF: () => mocks.state,
  hydrateVF: mocks.hydrate,
  clearVF: mocks.clear,
  startDemo: vi.fn(),
}));
import { guardArea, demoRole } from "@/lib/vf/session";
beforeEach(() => {
  sessionStorage.clear();
  vi.clearAllMocks();
  mocks.roles = ["administrador"];
  mocks.state = { userId: "viewer", loaded: true, roles: ["administrador"] };
  mocks.getUser.mockResolvedValue({
    data: { user: { id: "viewer", email: "synthetic@example.test", user_metadata: {} } },
  });
});
describe("P14 identidad y roles del store", () => {
  it("rehidrata el mismo usuario cuando pierde Administración y conserva Veterinario", async () => {
    mocks.roles = ["veterinario"];
    await guardArea("equipo", "/equipo");
    expect(mocks.hydrate).toHaveBeenCalledWith("viewer", ["veterinario"], "synthetic");
  });
  it("borra datos anteriores antes de redirigir una sesión vencida", async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    await expect(guardArea("luis", "/luis")).rejects.toBeDefined();
    expect(mocks.clear).toHaveBeenCalledOnce();
  });
  it("borra los datos reservados cuando el usuario ya no tiene acceso al área", async () => {
    mocks.roles = ["cliente"];
    await expect(guardArea("admin", "/admin")).rejects.toBeDefined();
    expect(mocks.clear).toHaveBeenCalledOnce();
  });
  it("no recarga por un simple cambio de orden de los mismos roles", async () => {
    mocks.state.roles = ["luis", "administrador"];
    mocks.roles = ["administrador", "luis"];
    await guardArea("admin", "/admin");
    expect(mocks.hydrate).not.toHaveBeenCalled();
  });
  it("rechaza una sesión demo con forma incorrecta", () => {
    sessionStorage.setItem(
      "vf_demo",
      JSON.stringify({ role: "administrador", name: { token: "invalid" } }),
    );
    expect(demoRole()).toBeNull();
  });
  it("conserva la entrada demo válida", () => {
    sessionStorage.setItem("vf_demo", JSON.stringify({ role: "auxiliar", name: "Camila DEMO" }));
    expect(demoRole()).toEqual({ role: "auxiliar", name: "Camila DEMO" });
  });
});
