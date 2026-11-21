import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { FileCheck, ShieldAlert } from "lucide-react";
import { Btn, Empty, PageTitle, SectionTitle } from "@/components/vf/ui";
import { useVF } from "@/lib/vf/store";
import { canAdminister } from "../domain/access";
import { criticalFlows, productionAssessment } from "../domain/readiness";

export function Readiness() {
  const roles = useVF((s) => s.roles);
  const uid = useVF((s) => s.userId);
  const [tab, setTab] = useState<"application" | "production" | "flows">("application");
  if (!canAdminister(roles, uid))
    return <Empty title="Revisión de aplicación: acceso no autorizado" />;
  // No protected evidence endpoint exists; never substitute administrative labels or demo fixtures.
  const production = productionAssessment([], "", new Date(), false);
  return (
    <>
      <PageTitle title="Revisión de aplicación" subtitle="Veterinaria Dr. Luis Ríos" />
      <Link to="/admin" className="mb-4 inline-block font-bold text-primary">
        ← Centro de control
      </Link>
      <div role="tablist" aria-label="Ámbito de revisión" className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["application", "Aplicación"],
            ["production", "Producción"],
            ["flows", "Flujos críticos"],
          ] as const
        ).map(([id, label]) => (
          <Btn
            key={id}
            role="tab"
            aria-selected={tab === id}
            aria-controls="readiness-panel"
            variant={tab === id ? "primary" : "soft"}
            onClick={() => setTab(id)}
          >
            {label}
          </Btn>
        ))}
      </div>
      <section id="readiness-panel" role="tabpanel" className="min-w-0">
        {tab === "application" ? (
          <>
            <SectionTitle>
              <FileCheck className="mr-2 inline h-5 w-5" />
              Aplicación · revisión parcial
            </SectionTitle>
            <p className="mb-4 text-sm text-muted-foreground">
              La navegación y las pruebas internas no certifican todos los requisitos ni las
              conexiones externas.
            </p>
            {[
              [
                "Inventario",
                "Rutas, pantallas, controles y contratos inspeccionables. Inventario estático no equivale a funcionamiento probado.",
              ],
              [
                "Permisos",
                "La sesión vuelve a cargar los permisos actuales; los accesos rechazados descartan los datos anteriores.",
              ],
              [
                "Pruebas",
                "Evidencia y límites por módulo en el registro P14; aceptación original y dispositivos físicos no certificados.",
              ],
              [
                "Fuentes originales",
                "Las Partes 1–3 no están conciliadas íntegramente. No se inventan los 224 comportamientos ni las 170 pruebas.",
              ],
            ].map(([label, detail]) => (
              <div key={label} className="border-b border-border py-4">
                <b>{label}</b>
                <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
              </div>
            ))}
          </>
        ) : tab === "production" ? (
          <>
            <p role="status" className="mb-3 font-bold text-destructive">
              <ShieldAlert className="mr-2 inline h-5 w-5" />
              Producción bloqueada
            </p>
            <p className="text-sm text-muted-foreground">
              Sin evidencias vigentes y autenticadas para una misma versión. Ninguna aprobación se
              ejecuta desde esta revisión.
            </p>
            {production.gates.map((gate) => (
              <div
                key={gate.name}
                className="flex items-center justify-between gap-3 border-b border-border py-3"
              >
                <b>{gate.name}</b>
                <span className="text-sm text-muted-foreground">Sin verificar</span>
              </div>
            ))}
            <Btn disabled className="mt-4">
              Aprobar lanzamiento
            </Btn>
          </>
        ) : (
          <>
            <SectionTitle>Flujos A–L · aceptación completa pendiente</SectionTitle>
            {criticalFlows.map((flow) => (
              <div key={flow.id} className="border-b border-border py-4">
                <b>
                  {flow.id} · {flow.title}
                </b>
                <p className="mt-1 text-sm text-muted-foreground">{flow.dependency}</p>
                <p className="mt-1 text-sm font-bold">
                  {flow.status === "NOT_RUN"
                    ? "Prueba completa pendiente"
                    : "Bloqueado por autoridad o proveedor"}
                </p>
              </div>
            ))}
          </>
        )}
      </section>
    </>
  );
}
