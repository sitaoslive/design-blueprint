import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/demo-interactiva")({
  beforeLoad: () => {
    throw redirect({ to: "/demo" });
  },
});
