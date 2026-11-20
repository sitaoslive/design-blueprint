import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/consultor/")({
  beforeLoad: () => { throw redirect({ to: "/consultor/$", params: { _splat: "inicio" } }); },
});
