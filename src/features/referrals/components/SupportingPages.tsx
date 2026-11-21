import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { useVF, getVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { checkedWrite } from "../application/gateway";
import { referralBase } from "./Directory";
import { useReferralRows } from "./data";
import { formatCOP } from "@/lib/vf/format";
const input = "w-full min-w-0 rounded-2xl border border-border bg-card p-3";
type RecordRow = {
  id: string;
  title: string;
  detail: string;
  status: string;
  data: Record<string, unknown>;
};
export function ReferralDocuments({ id, sharing = false }: { id: string; sharing?: boolean }) {
  const ref = useVF((s) => s.referrals.find((r) => r.id === id));
  const roles = useVF((s) => s.roles);
  const rows = useReferralRows<RecordRow>("records", "ref_id", id);
  const [title, setTitle] = useState("");
  const [reference, setReference] = useState("");
  const [busy, setBusy] = useState(false);
  if (!ref) return <Empty title="Remisión no encontrada" />;
  const requests = rows.rows?.filter((r) => r.data["module"] === "referral-document-request") ?? [];
  const save = async () => {
    if (!title.trim() || !reference.trim()) {
      toast.error("Indica documento requerido y referencia autorizada");
      return;
    }
    setBusy(true);
    try {
      if (getVF().userId?.startsWith("demo-")) {
        toast.success("Solicitud de demostración; sin compartir archivos");
        return;
      }
      await checkedWrite(
        db
          .from("records")
          .insert({
            kind: "referral_document_request",
            scope: "staff",
            ref_id: id,
            title: title.trim(),
            detail: reference.trim(),
            status: "revision_pendiente",
            data: { module: "referral-document-request" },
            created_by: getVF().userId,
          })
          .select("id"),
      );
      await rows.reload();
      setTitle("");
      setReference("");
      toast.success("Solicitud registrada; pendiente de revisión profesional");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        title={sharing ? "Preparación de paquete documental" : "Documentación de la remisión"}
        subtitle={`${ref.pet} · ${ref.specialty}`}
      />
      <p className="mb-4">
        La recepción de un documento no significa revisión profesional ni autorización para
        compartirlo.
      </p>
      <div className="space-y-3">
        <label className="block">
          Documento requerido
          <input
            className={input}
            aria-label="Documento requerido"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="block">
          Referencia autorizada de origen
          <input
            className={input}
            aria-label="Referencia documental"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </label>
        <Btn disabled={busy} onClick={() => void save()}>
          Solicitar revisión del paquete
        </Btn>
      </div>
      <SectionTitle>Solicitudes documentales</SectionTitle>
      {requests.map((r) => (
        <Card key={r.id} className="mb-2">
          <b>{r.title}</b>
          <p>{r.detail}</p>
          <p className="text-sm">Pendiente de revisión profesional protegida</p>
        </Card>
      ))}
      {!requests.length && <Empty title="Sin solicitudes documentales" />}
      <p className="mt-4 text-sm font-bold">
        Compartición al especialista pendiente: falta autorización por remisión, consentimiento,
        vencimiento y revocación en el servidor.
      </p>
      <Btn className="mt-2" variant="outline" disabled>
        Compartir paquete autorizado
      </Btn>
      <nav className="mt-4 flex flex-wrap gap-3 font-bold text-primary">
        <Link to="/operaciones/$" params={{ _splat: "documentos" }}>
          Consultar documentos privados existentes
        </Link>
        <Link to={`${referralBase(roles)}/remisiones/${id}/revision-profesional` as never}>
          Revisión de informe y seguimiento
        </Link>
      </nav>
    </>
  );
}
export function ReferralBudget({ id }: { id: string }) {
  const ref = useVF((s) => s.referrals.find((r) => r.id === id));
  const rows = useReferralRows<RecordRow>("records", "ref_id", id);
  const [f, setF] = useState({ amount: "", source: "", provider: "", expires: "", conditions: "" });
  const [busy, setBusy] = useState(false);
  if (!ref) return <Empty title="Remisión no encontrada" />;
  const save = async () => {
    const amount = Number(f.amount);
    if (
      !f.amount ||
      !Number.isFinite(amount) ||
      amount < 0 ||
      !f.source.trim() ||
      !f.provider.trim() ||
      !f.expires ||
      Date.parse(`${f.expires}T23:59:59-05:00`) <= Date.now()
    ) {
      toast.error("Indica tarifa no negativa, fuente, prestador y vigencia futura");
      return;
    }
    setBusy(true);
    try {
      if (getVF().userId?.startsWith("demo-")) {
        toast.success("Presupuesto de demostración; no se cobra");
        return;
      }
      await checkedWrite(
        db
          .from("records")
          .insert({
            kind: "rem_presupuesto",
            scope: "staff",
            ref_id: id,
            title: `Tarifa informada · ${f.provider}`,
            detail: f.conditions,
            status: "borrador",
            data: {
              amount,
              currency: "COP",
              source: f.source,
              provider: f.provider,
              expiresAt: `${f.expires}T23:59:59-05:00`,
              billedBy: f.provider,
              paidTo: f.provider,
            },
            created_by: getVF().userId,
          })
          .select("id"),
      );
      await rows.reload();
      toast.success("Tarifa informada registrada; no se generó ningún cobro");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title="Presupuesto externo" subtitle={`${ref.pet} · ${ref.specialty}`} />
      <div className="space-y-3">
        {(
          [
            ["amount", "Tarifa informada COP", "number"],
            ["provider", "Quién presta, factura y cobra", "text"],
            ["source", "Fuente de la tarifa", "text"],
            ["expires", "Vigente hasta", "date"],
            ["conditions", "Condiciones", "text"],
          ] as const
        ).map(([key, label, type]) => (
          <label className="block" key={key}>
            {label}
            <input
              className={input}
              type={type}
              aria-label={label}
              value={f[key]}
              onChange={(e) => setF({ ...f, [key]: e.target.value })}
            />
          </label>
        ))}
        <Btn disabled={busy} onClick={() => void save()}>
          Guardar tarifa informada
        </Btn>
      </div>
      <p className="mt-3 text-sm">
        Precio informado, no definitivo. La facturación externa se mantiene separada de los cobros
        de Vet Life.
      </p>
      <SectionTitle>Presupuestos registrados</SectionTitle>
      {rows.rows
        ?.filter((r) => r.data["currency"] === "COP")
        .map((r) => (
          <Card key={r.id} className="mb-2">
            <b>{r.title}</b>
            <p>{formatCOP(Number(r.data["amount"]))}</p>
            <p className="text-sm">Fuente: {String(r.data["source"] ?? "")}</p>
            <p className="text-sm">{r.detail}</p>
          </Card>
        ))}
    </>
  );
}
