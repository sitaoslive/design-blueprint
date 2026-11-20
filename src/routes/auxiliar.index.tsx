import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/auxiliar/")({
  beforeLoad: () => { throw redirect({ to: "/auxiliar/$", params: { _splat: "inicio" } }); },
});
