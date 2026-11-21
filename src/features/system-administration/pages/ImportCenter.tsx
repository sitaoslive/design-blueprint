import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Upload, ArrowLeft, ArrowRight, X } from "lucide-react";
import { Btn, Card, Empty, PageTitle, SectionTitle } from "@/components/vf/ui";
import { useVF } from "@/lib/vf/store";
import { canAdminister } from "../domain/access";
import { SavedPreparations } from "../components/SavedPreparations";
import { PreparationSchema, type Preparation } from "../application/preparation";
import { useFinanceRows } from "@/features/finance/application/sources";
import { FinanceSourceState, financeInput } from "@/features/finance/components/FinanceControls";
import { importFields, parseImportCsv, suggestFieldMapping, buildImportPreview, reconcileImport, evaluateVisitQuality, type FieldMapping, type LocalVisit } from "../domain/import";
import { requestProtectedImport } from "../application/import-contracts";

const steps = ["Origen", "Tipo", "Vista previa", "Mapeo", "Validación", "Duplicados", "Conflictos", "Revisión", "Resultado"];
const nav = [["okvet", "OKVET"], ["okvet/importar", "Importar archivo"], ["okvet/conciliacion", "Conciliación"], ["okvet/conflictos", "Conflictos"], ["datos/calidad", "Calidad de datos"]] as const;
export function ImportCenter({ path }: { path: string }) {
  const uid = useVF((s) => s.userId);
  const roles = useVF((s) => s.roles);
  if (!canAdminister(roles, uid)) return <Empty title="Revisión administrativa: acceso no autorizado" />;
  return <ImportWorkspace key={`${uid}:${path}`} path={path} actorId={uid ?? ""} />;
}
function ImportWorkspace({ path, actorId }: { path: string; actorId: string }) {
  const visits = useFinanceRows<LocalVisit>("visits");
  const [file, setFile] = useState<{ name: string; headers: string[]; rows: string[][]; fingerprint: string; requestId: string } | null>(null);
  const [mapping, setMapping] = useState<FieldMapping>(() => suggestFieldMapping([]));
  const [step, setStep] = useState(0);
  const [authorized, setAuthorized] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [evidence, setEvidence] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState("");
  const [filter, setFilter] = useState("");
  const [severity, setSeverity] = useState("all");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const generation = useRef(0);
  const preview = file ? buildImportPreview(file.headers, file.rows, mapping) : null;
  const comparisons = preview?.data.map((r) => reconcileImport(r, visits.rows ?? [])) ?? [];
  const quality = evaluateVisitQuality(visits.rows ?? []);
  const stale = !visits.loadedAt || Date.now() - Date.parse(visits.loadedAt) > 120000;
  const canReview = Boolean(file && authorized && reviewed && evidence.trim().length >= 10 && preview && !preview.findings.some((f) => f.severity === "error") && visits.rows && !visits.error && !stale);
  const isWizard = path.endsWith("importar");
  const preparation: Preparation | null = canReview && file && visits.loadedAt ? {
    requestId: file.requestId, source: file.name, fingerprint: file.fingerprint,
    rowCount: file.rows.length, mapping, authorizedFile: true, mappingReviewed: true,
    evidence, comparedAt: visits.loadedAt, conflictCount: comparisons.filter((c) => c.state !== "MATCHED").length,
  } : null;
  const preparationCheck = preparation ? PreparationSchema.safeParse(preparation) : null;
  const preparationError = preparationCheck && !preparationCheck.success ? "Revisa el archivo, las correspondencias y la evidencia antes de guardar." : "";
  const title = isWizard ? "Revisión de archivo OKVET" : path.endsWith("calidad") ? "Calidad de datos operativos" : path.endsWith("conflictos") ? "Conflictos de referencias OKVET" : path.endsWith("conciliacion") ? "Conciliación administrativa OKVET" : "Centro de verificación OKVET";
  const reset = () => { generation.current += 1; setBusy(false); setFile(null); setMapping(suggestFieldMapping([])); setStep(0); setAuthorized(false); setReviewed(false); setEvidence(""); setError(""); setResult(""); };
  return <>
    <PageTitle title={title} />
    <nav className="mb-4 flex flex-wrap gap-3 text-sm font-bold text-primary">
      <Link to="/admin">Centro de control</Link>
      {nav.map(([p, label]) => <Link key={p} to="/admin/$" params={{ _splat: p }}>{label}</Link>)}
    </nav>
    <p className="mb-4 text-sm text-muted-foreground">{actorId.startsWith("demo-") ? "DEMO sintético" : "Fuentes autorizadas de Lovable Cloud"} · Sin sincronización, confirmación ni modificación de expedientes clínicos.</p>
    <FinanceSourceState sources={[visits]}>
      {isWizard ? <>
        <ol className="mb-4 flex flex-wrap gap-x-3 gap-y-2 text-xs" aria-label="Pasos de revisión">
          {steps.map((s, i) => <li key={s} aria-current={i === step ? "step" : undefined} className={i === step ? "font-bold text-primary" : "text-muted-foreground"}>{i + 1}. {s}</li>)}
        </ol>
        <h2 className="mb-3 text-xl font-bold">{step + 1}. {steps[step]}</h2>
        {step === 0 && <>
          <label className="mb-4 flex items-start gap-2"><input type="checkbox" checked={authorized} onChange={(e) => { setAuthorized(e.target.checked); setReviewed(false); }} aria-label="Archivo autorizado" />Cuento con autorización para revisar este archivo</label>
          <input ref={input} className="hidden" type="file" accept=".csv,text/csv" aria-label="Archivo CSV" onChange={(e) => {
            const chosen = e.target.files?.[0]; e.target.value = ""; if (!chosen) return;
            const token = ++generation.current;
            setFile(null); setError(""); setResult(""); setReviewed(false);
            if (chosen.name.trim().length > 200) { setError("El nombre del archivo supera 200 caracteres; acórtalo antes de seleccionarlo."); return; }
            if (chosen.size > 1_000_000) { setError("El archivo supera 1 MB"); return; }
            if (!/\.csv$/i.test(chosen.name)) { setError("Solo se permiten archivos CSV"); return; }
            setBusy(true);
            void chosen.text().then(async (text) => {
              if (generation.current !== token) return;
              const parsed = parseImportCsv(chosen.name, text);
              if (parsed.headers.some((header) => header.length > 100)) throw new Error("Un encabezado supera 100 caracteres; acórtalo antes de revisar el archivo.");
              const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
              if (generation.current !== token) return;
              const fingerprint = Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
              setFile({ name: chosen.name, ...parsed, fingerprint, requestId: crypto.randomUUID() }); setMapping(suggestFieldMapping(parsed.headers));
            }).catch((err: unknown) => { if (generation.current === token) setError(err instanceof Error ? err.message : "No se pudo leer el archivo"); })
              .finally(() => { if (generation.current === token) setBusy(false); });
          }} />
          <Btn disabled={!authorized || busy} onClick={() => input.current?.click()}><Upload className="h-4 w-4" />{busy ? "Leyendo…" : "Seleccionar CSV"}</Btn>
          {file && <p className="mt-3 break-words">{file.name} · {file.rows.length} registros · {file.headers.length} columnas</p>}
          <p className="mt-3 text-xs text-muted-foreground">Archivo local, no enviado. Se descarta al salir de esta página. Máximo 1 MB, 2000 registros y 40 columnas.</p>
        </>}
        {step === 1 && <label>Tipo de exportación<select className={financeInput} aria-label="Tipo de exportación" value="visits" onChange={() => setReviewed(false)}><option value="visits">Citas operativas · referencias administrativas</option></select><p className="mt-2 text-sm text-muted-foreground">Expedientes clínicos, facturas y otros tipos requieren contratos específicos; no se interpretan como citas.</p></label>}
        {step === 2 && file && <div className="overflow-x-auto rounded-lg border border-border"><table className="w-full text-left text-sm"><thead><tr>{file.headers.map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{file.rows.slice(0, 10).map((r, i) => <tr key={i} className="border-t border-border">{r.map((v, j) => <td key={j} className="max-w-48 break-words p-2">{v}</td>)}</tr>)}</tbody></table></div>}
        {step === 3 && <div className="grid gap-3 sm:grid-cols-2">{importFields.map(([key, label, required]) => <label key={key}>{label}{required ? " *" : ""}<select className={financeInput} aria-label={`Columna ${label}`} value={mapping[key]} onChange={(e) => { setMapping({ ...mapping, [key]: e.target.value }); setReviewed(false); setResult(""); }}><option value="">Sin correspondencia</option>{file?.headers.map((h) => <option key={h} value={h}>{h}</option>)}</select></label>)}</div>}
        {(step === 4 || step === 5) && <>
          {(preview?.findings ?? []).filter((f) => step === 4 ? f.code !== "DUPLICATE_REFERENCE" : f.code === "DUPLICATE_REFERENCE").map((f, i) => <div key={i} className="border-b border-border py-3"><b>Fila {f.row || "encabezado"} · {f.code}</b><p className="text-sm break-words">{f.detail}</p></div>)}
          {!preview?.findings.filter((f) => step === 4 ? f.code !== "DUPLICATE_REFERENCE" : f.code === "DUPLICATE_REFERENCE").length && <p role="status">{step === 4 ? "Sin errores de formato detectados" : "Sin referencias duplicadas en el archivo"}</p>}
          <p className="mt-3 text-xs text-muted-foreground">La validación de formato no certifica identidad, origen ni estado clínico.</p>
        </>}
        {step === 6 && comparisons.map((c, i) => <Card key={i} className="mb-3"><b>Fila {i + 1} · {c.state}</b><p className="text-sm">Referencia: {preview?.data[i]?.externalId}</p><p className="text-sm">Registro local: {c.visit?.id ?? "Sin selección inequívoca"}</p><p className="text-sm">{c.differences.join(" · ") || "Campos coinciden; no equivale a verificación oficial"}</p></Card>)}
        {step === 7 && <>
          <p className="mb-3">{preview?.data.length ?? 0} registros · {preview?.findings.length ?? 0} hallazgos de formato · {comparisons.filter((c) => c.state !== "MATCHED").length} comparaciones requieren revisión.</p>
          <label className="mb-3 flex items-start gap-2"><input aria-label="Mapeo revisado" type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} />Revisé las correspondencias y los conflictos; no autorizo cambios oficiales</label>
          <label>Evidencia y responsable de revisión<textarea className={financeInput} maxLength={1000} aria-label="Evidencia de revisión" value={evidence} onChange={(e) => setEvidence(e.target.value)} /></label>
          <p className="mt-2 text-xs text-muted-foreground">Los errores bloquean la preparación. Conflictos y coincidencias posibles permanecen sin resolver; la revisión local no los cierra.</p>
          {preparationError && <p role="alert" className="my-3 text-sm">{preparationError}</p>}
          <SavedPreparations key={file?.requestId} preparation={preparationCheck?.success ? preparationCheck.data : null} actorId={actorId} />
        </>}
        {step === 8 && <>
          <p className="mb-3 font-bold">Sin importación oficial ni recibo verificado</p>
          <Btn disabled={!canReview || busy} onClick={() => {
            setBusy(true);
            const id = crypto.randomUUID();
            void requestProtectedImport({ actorId, source: file?.name ?? "", expectedVersion: 0, idempotencyKey: id, correlationId: id, authorizedFile: true, mappingReviewed: true, evidence, rowCount: preview?.data.length ?? 0 })
              .catch((err: unknown) => setResult(err instanceof Error ? err.message : "Importación no disponible"))
              .finally(() => setBusy(false));
          }}>Consultar disponibilidad de importación protegida</Btn>
          {result && <p role="alert" className="mt-3 break-words">{result}</p>}
          <p className="mt-3 text-sm">Conflictos sin resolver: {comparisons.filter((c) => c.state !== "MATCHED").length}. Autoridad, aplicación y auditoría: pendientes del contrato de servidor.</p>
        </>}
        {error && <p className="mt-3" role="alert">{error}</p>}
        <div className="mt-5 flex flex-wrap gap-2">
          <Btn variant="outline" disabled={step === 0 || busy} onClick={() => setStep((s) => s - 1)}><ArrowLeft className="h-4 w-4" />Anterior</Btn>
          <Btn disabled={step === 8 || !file || !authorized || busy || (step === 7 && (!canReview || !preparationCheck?.success))} onClick={() => setStep((s) => s + 1)}>Siguiente<ArrowRight className="h-4 w-4" /></Btn>
          <Btn variant="outline" onClick={reset}><X className="h-4 w-4" />Descartar archivo</Btn>
        </div>
      </> : <>
        <SectionTitle>Hallazgos en visitas visibles</SectionTitle>
        <div className="mb-3 grid gap-2 sm:grid-cols-2"><input className={financeInput} aria-label="Buscar hallazgos" placeholder="ID, referencia o hallazgo" value={filter} onChange={(e) => setFilter(e.target.value)} /><select className={financeInput} aria-label="Severidad del hallazgo" value={severity} onChange={(e) => setSeverity(e.target.value)}><option value="all">Todos</option><option value="error">Errores</option><option value="review">Revisión</option></select></div>
        {quality.filter((f) => (severity === "all" || f.severity === severity) && `${f.code} ${f.detail}`.toLowerCase().includes(filter.toLowerCase())).map((f, i) => <Card key={i} className="mb-3"><b>{f.code}</b><p className="text-sm break-words">{f.detail}</p><p className="text-xs text-muted-foreground">{f.severity === "error" ? "Error detectado" : "Dato por revisar"} · No corregido automáticamente</p></Card>)}
        {!quality.length && <Empty title="Sin hallazgos en las comprobaciones disponibles" hint="No certifica todos los datos ni la verificación externa." />}
        <SectionTitle>Referencias registradas</SectionTitle>
        {visits.rows?.filter((v) => `${v.id} ${v.okvet_ref ?? ""}`.toLowerCase().includes(filter.toLowerCase())).slice(0, 50).map((v) => <div className="border-b border-border py-3 break-words" key={v.id}><b>{v.id}</b><p className="text-sm">{v.operational_on ?? v.date} · {v.status} · {v.okvet_ref || "Sin referencia OKVET"}</p><Link to="/luis/cita/$id" params={{ id: v.id }} className="font-bold text-primary">Abrir cita autorizada</Link></div>)}
        <p className="mt-3 text-sm text-muted-foreground">Hasta 50 referencias visibles. Para comparar datos externos, revisa un archivo autorizado. Sin fusiones, vinculación, resolución ni confirmación automática.</p>
      </>}
    </FinanceSourceState>
    {!isWizard && <SavedPreparations preparation={null} actorId={actorId} />}
  </>;
}