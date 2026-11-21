import { financePage } from "@/features/finance/components/FinancePages";
import { executivePage } from "@/features/executive-assistant/pages";
import { ControlCenter } from "@/features/system-administration/pages/ControlCenter";
import { controlScreen } from "@/features/system-administration/catalog";
import { ImportCenter } from "@/features/system-administration/pages/ImportCenter";
import { DispatchPage } from "@/features/live-dispatch/components/Dispatch";
import { dispatchScreen } from "@/features/live-dispatch/catalog";
import { qualityPage } from "@/features/customer-experience/pages";
import { referralPage } from "@/features/referrals/components/ReferralHub";
import { fieldPage } from "@/features/field-operations/components/FieldPages";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Layers, CheckCircle2, Clock } from "lucide-react";
import { SCREENS, findScreen, childScreens, fillParams, canFillParams, type Screen } from "@/lib/vf/screens";
import { PageTitle, SectionTitle, Card, Empty, Chips } from "../ui";
import { cn } from "@/lib/utils";
import { clientPage } from "../screens/client";
import { adminPage } from "../screens/admin";
import { otherPage } from "../screens/other";
import { opsPage } from "../screens/ops";
import { auxPage } from "../screens/aux";
import { rolePage } from "../screens/roles";
import { c01Page } from "../screens/c01";
import { p02Page } from "../screens/p02";
import { conciergePage } from "../screens/concierge";
import { AcademyPage } from "@/features/academy/Academy";
import { academyScreen } from "@/features/academy/catalog";
import { AutoSupport } from "@/features/support/AutoSupport";

const MOD_NAMES: Record<string, string> = { app: "Portal del cliente", cuidador: "Portal de cuidadores", equipo: "Equipo veterinario", operaciones: "Centro de coordinación", direccion: "Dirección ejecutiva", admin: "Administración central", especialista: "Portal de especialistas", auxiliar: "Portal del auxiliar", recepcion: "Recepción", finanzas: "Finanzas", soporte: "Soporte técnico", consultor: "Alpha Vision", auth: "Acceso" };

const Pill = ({ ok, label }: { ok: boolean; label: string }) => (
  <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold", ok ? "bg-sage text-sage-foreground" : "bg-amber text-amber-foreground")}>
    {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}{label}
  </span>
);

function ScreenRow({ s, from }: { s: Screen; from: string }) {
  const target = s.href ?? s.path;
  const to = fillParams(target, from);
  if (!canFillParams(target, from)) return (
    <div className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-3">
      <span className="w-20 shrink-0 text-xs font-bold text-primary">{s.id}</span>
      <span className="flex-1"><b className="block">{s.name || s.path}</b><span className="text-xs text-muted-foreground">Se abre desde un registro concreto (ficha, cita o caso)</span></span>
      <Pill ok={s.frontend === "funcional"} label={s.frontend === "funcional" ? "Funcional" : "Estructura"} />
    </div>
  );
  return (
    <Link to={to as never} className="flex items-center gap-3 rounded-2xl bg-secondary p-3 transition active:scale-[.99]">
      <span className="w-20 shrink-0 text-xs font-bold text-primary">{s.id}</span>
      <span className="flex-1"><b className="block">{s.name || s.path}</b><span className="text-xs text-muted-foreground">{s.path}</span></span>
      <Pill ok={s.frontend === "funcional"} label={s.frontend === "funcional" ? "Funcional" : "Estructura"} />
    </Link>
  );
}

/** Generic page for every registered screen: identity card, status and navigation to child screens. */
export function ScaffoldPage({ path }: { path: string }) {
  if (academyScreen(path) || path === "/equipo/evaluaciones") return <AcademyPage path={path} />;
  if (path === "/admin/soporte-automatico" || path === "/soporte/inicio" || path === "/soporte/salud") return <AutoSupport />;
  if (dispatchScreen(path)) return <DispatchPage path={path} />;
  if (controlScreen(path) && (path.startsWith("/admin/okvet") || path === "/admin/datos/calidad")) return <ImportCenter path={path} />;
  if (controlScreen(path)) return <ControlCenter path={path} />;
  const executive = executivePage(path);
  if (executive) return executive;
  const quality = qualityPage(path);
  if (quality) return quality;
  const fp = financePage(path);
  if (fp) return <>{fp}</>;
  const rp = referralPage(path);
  if (rp) return <>{rp}</>;
  const fo = fieldPage(path);
  if (fo) return <>{fo}</>;
  const cc = conciergePage(path);
  if (cc) return <>{cc}</>;
  const p02 = p02Page(path);
  if (p02) return <>{p02}</>;
  const c01 = c01Page(path);
  if (c01) return <>{c01}</>;
  if (path.startsWith("/admin/project-memory")) return <ProjectMemory path={path} />;
  const built = path.startsWith("/app/") ? clientPage(path) : path.startsWith("/admin/") ? adminPage(path) : path.startsWith("/auxiliar/") ? auxPage(path) : /^\/(recepcion|finanzas|soporte|consultor)\//.test(path) ? rolePage(path) : (otherPage(path) ?? opsPage(path));
  if (built) return <>{built}</>;
  const s = findScreen(path);
  const kids = childScreens(s?.path ?? path);
  const modKids = kids.length ? kids : SCREENS.filter((x) => x.module === (s?.module ?? path.split("/")[1]) && x.path.split("/").length === 3);
  if (!s && modKids.length === 0) return <div className="mt-8"><Empty title="Pantalla no registrada" hint={path} /></div>;
  return (
    <>
      <PageTitle title={s?.name || MOD_NAMES[path.split("/")[1] ?? ""] || "Módulo"} subtitle={s ? `${s.id} · ${s.section}` : path} />
      {s && (
        <Card>
          <div className="flex flex-wrap gap-2"><Pill ok label="Diseño" /><Pill ok={s.frontend === "funcional"} label="Frontend" /><Pill ok={s.backend === "conectado"} label="Backend" /><Pill ok={false} label="Integración" /></div>
          <p className="mt-3 text-sm text-muted-foreground">Ruta: {s.path} · Rol: {s.role} · Módulo: {s.module}</p>
          {s.href ? (
            <Link to={fillParams(s.href, path) as never} className="mt-3 inline-flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-3 font-bold text-primary-foreground">Abrir pantalla funcional <ArrowRight className="h-4 w-4" /></Link>
          ) : (
            <p className="mt-3 rounded-2xl bg-card p-3 text-sm">Estructura creada. El contenido completo de esta pantalla se construye en un próximo lote.</p>
          )}
        </Card>
      )}
      {modKids.length > 0 && (<><SectionTitle>Pantallas relacionadas</SectionTitle><div className="space-y-2">{modKids.map((k) => <ScreenRow key={k.path} s={k} from={path} />)}</div></>)}
    </>
  );
}

function ProjectMemory({ path }: { path: string }) {
  const [mod, setMod] = useState("todos");
  const [st, setSt] = useState<"todas" | "funcional" | "estructura">("todas");
  const mods = useMemo(() => ["todos", ...Array.from(new Set(SCREENS.map((s) => s.module)))], []);
  const list = SCREENS.filter((s) => (mod === "todos" || s.module === mod) && (st === "todas" || s.frontend === st));
  const done = SCREENS.filter((s) => s.frontend === "funcional").length;
  const sub = SCREENS.filter((s) => s.path.startsWith("/admin/project-memory/") && s.path.split("/").length === 4);
  const isDash = path.replace(/\/$/, "") === "/admin/project-memory";
  const isScreens = path.includes("/pantallas");
  return (
    <>
      <PageTitle title="Project Memory OS" subtitle={`${SCREENS.length} pantallas registradas · ${done} funcionales · ${SCREENS.length - done} en estructura`} />
      <div className="mb-4 h-3 overflow-hidden rounded-full bg-secondary"><div className="h-full bg-gradient-primary" style={{ width: `${(done / SCREENS.length) * 100}%` }} /></div>
      {isDash && <div className="grid grid-cols-2 gap-2">{sub.map((s) => <Link key={s.path} to={s.path as never} className="flex items-center gap-2 rounded-2xl bg-accent p-3 font-bold"><Layers className="h-5 w-5 text-primary" />{s.name}</Link>)}</div>}
      {(isDash || isScreens) && (<>
        <SectionTitle>Inventario de pantallas</SectionTitle>
        <div className="mb-2"><Chips value={st} onChange={setSt} options={[{ value: "todas", label: "Todas" }, { value: "funcional", label: "Funcionales" }, { value: "estructura", label: "Estructura" }]} /></div>
        <select value={mod} onChange={(e) => setMod(e.target.value)} className="mb-3 w-full rounded-2xl bg-accent p-3" aria-label="Módulo">{mods.map((m) => <option key={m}>{m}</option>)}</select>
        <div className="space-y-2">{list.map((s) => <ScreenRow key={s.path} s={s} from={s.path} />)}</div>
      </>)}
      {!isDash && !isScreens && <Card><b>{findScreen(path)?.name ?? "Sección"}</b><p className="text-muted-foreground">Registro estructurado. Ver también /docs del proyecto.</p><Link to={"/admin/project-memory" as never} className="mt-2 inline-block text-primary">← Volver al panel</Link></Card>}
    </>
  );
}
