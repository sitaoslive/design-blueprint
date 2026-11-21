import { it, expect } from "vitest";
import { diagnoseSupport } from "@/features/support/domain";
it("no certifica cuentas ni proveedores con una demo", () => {
  const result = diagnoseSupport({
    online: true,
    demo: true,
    signedIn: true,
    ownRead: "ok",
    queueCount: 0,
  });
  expect(result.find((signal) => signal.id === "access")?.status).toBe("unknown");
  expect(result.find((signal) => signal.id === "providers")?.status).toBe("unknown");
});
it("sin internet no presenta borradores pendientes como enviados", () => {
  const result = diagnoseSupport({
    online: false,
    demo: false,
    signedIn: true,
    ownRead: "unknown",
    queueCount: 2,
  });
  expect(result.find((signal) => signal.id === "network")?.status).toBe("blocked");
  expect(result.find((signal) => signal.id === "drafts")?.status).toBe("unknown");
});
