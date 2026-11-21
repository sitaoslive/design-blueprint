import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Save, RefreshCw } from "lucide-react";
import { Btn, Card, SectionTitle } from "@/components/vf/ui";
import { useFinanceRows } from "@/features/finance/application/sources";
import { saveImportPreparation } from "../application/preparation.functions";
import { PreparationSchema, type Preparation, type SavedPreparation } from "../application/preparation";

export function SavedPreparations({ preparation, actorId }: { preparation: Preparation | null; actorId: string }) {
  const rows = useFinanceRows<SavedPreparation>("records", "administrative_import_preparation");
  const save = useServerFn(saveImportPreparation);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const demo = actorId.startsWith("demo-");
  return <>
    <SectionTitle>Preparaciones reservadas</SectionTitle>
    <Btn disabled={!preparation || busy || demo} onClick={async () => {
      if (!preparation) return;
      setBusy(true); setMessage("");
      try {
        await save({ data: preparation });
        await rows.reload();
        setMessage("Preparación guardada para revisión; sin importación ni autorización oficial");
      } catch (error) { setMessage(error instanceof Error ? error.message : "No se pudo guardar"); }
      finally { setBusy(false); }
    }}><Save className="h-4 w-4" />{busy ? "Guardando…" : "Guardar preparación"}</Btn>
    <Btn variant="outline" className="ml-2" onClick={() => void rows.reload()}><RefreshCw className="h-4 w-4" />Actualizar</Btn>
    <p className="my-3 text-sm text-muted-foreground">Solo se guardan correspondencias, huella del archivo y revisión declarada. El CSV y sus filas no se guardan. La autorización oficial permanece bloqueada.</p>
    {demo && <p role="status">DEMO: guardado real deshabilitado</p>}
    {message && <p role="status" className="my-3 break-words">{message}</p>}
    {rows.error && <p role="alert">No se pudieron leer las preparaciones</p>}
    {rows.rows?.filter((r) => r.status === "PREPARED_DRAFT" && PreparationSchema.safeParse(r.data).success).map((r) => <Card key={r.id} className="mb-3">
      <b className="break-words">{r.title}</b><p>{r.data.rowCount} registros · {r.data.conflictCount} comparaciones por revisar</p>
      <p className="text-sm break-words">{r.data.evidence}</p>
      <p className="text-xs break-all">Huella: {r.data.fingerprint}</p>
      <p className="text-xs">{r.created_at} · PREPARED_DRAFT · Revisión declarada, no aprobación</p>
      <Btn variant="outline" disabled>Aplicar importación oficial</Btn>
    </Card>)}
  </>;
}