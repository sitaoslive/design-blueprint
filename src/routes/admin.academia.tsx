import { createFileRoute } from "@tanstack/react-router";
import { SuperAdminAcademyPage } from "@/features/system-administration/pages/SuperAdminAcademyPage";
import { meta } from "@/lib/vf/meta";

export const Route = createFileRoute("/admin/academia")({
  head: () =>
    meta(
      "Academia de la Dueña · Alpha Vision Method",
      "Manual operativo y formativo exclusivo para la propietaria de la plataforma. Alta de clínicas, activación de claves, control de contratistas y white-label."
    ),
  component: () => <SuperAdminAcademyPage />,
});
