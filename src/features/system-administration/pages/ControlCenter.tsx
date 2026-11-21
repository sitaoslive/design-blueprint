import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Activity, ShieldCheck, Settings, Wallet, Bot, FileCheck } from "lucide-react";
import { Btn, Card, Empty, PageTitle, SectionTitle } from "@/components/vf/ui";
import { useVF } from "@/lib/vf/store";
import { useFinanceRows } from "@/features/finance/application/sources";
import { FinanceSourceState, financeInput } from "@/features/finance/components/FinanceControls";
import { EXECUTIVE_CONTRACTS } from "@/features/executive-assistant/application/contracts";
import { canUseExecutive } from "@/features/executive-assistant/domain";
import { deploymentGates, integrationHealth } from "../domain";
import { controlScreen } from "../catalog";

type Integration = { id: string; name: string; purpose: string; status: string; note: string };
type Incident = { id: string; title: string; severity: string; status: string };
const modules = [
  ["organizacion", "Organización", Settings], ["servicios", "Servicios", Settings],
  ["zonas", "Cobertura", Settings], ["horarios", "Horarios", Settings],
  ["usuarios", "Personal", ShieldCheck], ["permisos", "Permisos", ShieldCheck],
  ["integraciones", "Integraciones registradas", Activity], ["auditoria", "Auditoría", FileCheck],
  ["desarrollo/dependencias", "Dependencias", Bot], ["despliegue", "Lanzamiento", FileCheck],
] as const;
export function ControlCenter({ path }: { path: string }) {
  const roles = useVF((s) => s.roles);
  const uid = useVF((s) => s.userId);
  const integrations = useFinanceRows<Integration>("integrations");
  const incidents = useFinanceRows<Incident>("incidents");
  const [filter, setFilter] = useState("");
  if (!canUseExecutive(roles, uid)) return <Empty title="Centro de control: acceso no autorizado" />;
  const title = controlScreen(path)?.[1] ?? "Centro de Control Vet Freedom";
  const demo = uid?.startsWith("demo-");
  return <>
    <PageTitle title={title} />
    <nav className="mb-4 flex flex-wrap gap-3 text-sm font-bold text-primary">
      {modules.map(([p, label]) => <Link key={p} to="/admin/$" params={{ _splat: p }}>{label}</Link>)}
      <Link to="/direccion/$" params={{ _splat: "finanzas" }}><Wallet className="inline h-4 w-4" /> Finanzas</Link>
      <Link to="/luis/asistente">Asistente de Luis</Link>
    </nav>
    {path.endsWith("dependencias") ? <>
      <p className="mb-3 text-sm">Autoridad oficial de Dirección pendiente. Los borradores no aprueban, delegan ni ejecutan.</p>
      <input className={financeInput} aria-label="Buscar contrato" placeholder="Buscar contrato" value={filter} onChange={(e) => setFilter(e.target.value)} />
      {EXECUTIVE_CONTRACTS.filter((c) => c.toLowerCase().includes(filter.toLowerCase())).map((name) => <div key={name} className="border-b border-border py-3 break-words">
        <b className="text-sm">{name}</b><p className="text-sm text-muted-foreground">Sin autoridad conectada · Responsable: Antigravity / proveedor autorizado</p>
        <p className="text-xs">Requiere sesión, permiso por operación, versión, correlación, idempotencia y recibo auditable.</p>
      </div>)}
    </> : path.endsWith("despliegue") ? <>
      <p role="status" className="mb-4 font-bold">Lanzamiento bloqueado: faltan evidencias técnicas y aprobación de versión.</p>
      {deploymentGates.map((gate) => <div key={gate} className="border-b border-border py-3"><b>{gate}</b><p className="text-sm">No verificado para lanzamiento · Las pruebas de módulos no certifican esta condición.</p></div>)}
      <Btn className="mt-4" disabled>Aprobar lanzamiento</Btn>
    </> : <FinanceSourceState sources={[integrations, incidents]}>
      <p className="mb-3 text-sm">{demo ? "DEMO sintético" : "Registros autorizados de Lovable Cloud"} · La lectura de registros no verifica servicios externos.</p>
      <SectionTitle>Estado de servicios</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {integrations.rows?.map((i) => <Card key={i.id}>
          <b>{i.name}</b><p className="text-sm">{i.purpose}</p>
          <p className="mt-2 font-bold">{integrationHealth({ status: i.status, checkedAt: null, reference: null }, new Date()) === "UNKNOWN" ? "Estado desconocido" : "Verificado"}</p>
          <p className="text-xs text-muted-foreground">Estado administrativo: {i.status}. Sin comprobación reciente ni referencia de salud.</p>
          <Link to="/admin/$" params={{ _splat: "integraciones" }} className="mt-2 inline-block font-bold text-primary">Revisar registro</Link>
        </Card>)}
      </div>
      {!integrations.rows?.length && <Empty title="Sin servicios registrados visibles" />}
      <SectionTitle>Incidencias abiertas</SectionTitle>
      {incidents.rows?.filter((i) => i.status !== "cerrada").map((i) => <Card className="mb-3" key={i.id}><b>{i.title}</b><p>{i.severity} · {i.status}</p><Link to="/luis/$modulo" params={{ modulo: "incidencias" }} className="font-bold text-primary">Revisar con el equipo</Link></Card>)}
    </FinanceSourceState>}
  </>;
}