import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/finanzas/")({
  beforeLoad: () => { throw redirect({ to: "/finanzas/$", params: { _splat: "inicio" } }); },
});
