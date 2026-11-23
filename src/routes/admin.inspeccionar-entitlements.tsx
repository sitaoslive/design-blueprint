import { createFileRoute } from "@tanstack/react-router";
import { EntitlementInspector } from "@/features/system-administration/components/EntitlementInspector";

export const Route = createFileRoute("/admin/inspeccionar-entitlements")({
  component: EntitlementInspector,
});
