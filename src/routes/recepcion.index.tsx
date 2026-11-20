import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/recepcion/")({
  beforeLoad: () => { throw redirect({ to: "/recepcion/$", params: { _splat: "inicio" } }); },
});
