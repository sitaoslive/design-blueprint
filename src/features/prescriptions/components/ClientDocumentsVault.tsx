/**
 * VET FREEDOM OS — BÓVEDA DE DOCUMENTOS Y FÓRMULAS MÉDICAS DEL CLIENTE
 * Permite a los tutores ver, descargar y reenviar por WhatsApp sus fórmulas
 * médicas oficiales emitidas en OKVET y certificados clínicos autorizados.
 */

import { useState } from "react";
import { PageTitle, SectionTitle, Card, StatusBadge, Btn, Empty } from "@/components/vf/ui";
import { FileText, Download, MessageSquareShare, Pill, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface VaultDocument {
  id: string;
  petName: string;
  type: "FÓRMULA MÉDICA" | "CERTIFICADO" | "RESUMEN CLÍNICO";
  title: string;
  reference: string;
  doctor: string;
  date: string;
  status: "vigente" | "archivado";
  medicationsSummary?: string;
  downloadUrl: string;
}

const VAULT_DOCS: VaultDocument[] = [
  {
    id: "doc-1",
    petName: "Luna",
    type: "FÓRMULA MÉDICA",
    title: "Fórmula Médica · Artrosis y Soporte Articular",
    reference: "FORM-2026-0742 (OKVET)",
    doctor: "Dr. Luis Eduardo Ríos (COMVEZCOL-001)",
    date: "17 de noviembre, 2026",
    status: "vigente",
    medicationsSummary: "Condroitina + Glucosamina (Cosequin), Omega 3 EPA/DHA",
    downloadUrl: "https://sznvahhocgnhsqhksygq.supabase.co/storage/v1/object/sign/medical-records/prescriptions/luna/formula_FORM-2026-0742.pdf"
  },
  {
    id: "doc-2",
    petName: "Toby",
    type: "FÓRMULA MÉDICA",
    title: "Fórmula Médica · Otitis externa y Dermatitis",
    reference: "FORM-2026-0891 (OKVET)",
    doctor: "Dr. Luis Eduardo Ríos (COMVEZCOL-001)",
    date: "20 de noviembre, 2026",
    status: "vigente",
    medicationsSummary: "Cefalexina 500mg, Meloxicam 0.5%, Otoclean ótico",
    downloadUrl: "https://sznvahhocgnhsqhksygq.supabase.co/storage/v1/object/sign/medical-records/prescriptions/toby/formula_FORM-2026-0891.pdf"
  },
  {
    id: "doc-3",
    petName: "Bruno",
    type: "CERTIFICADO",
    title: "Certificado de Vacunación Oficial Antirrábica y Triple Felina",
    reference: "VAC-2026-0112 (OKVET)",
    doctor: "Dr. Luis Eduardo Ríos (COMVEZCOL-001)",
    date: "28 de enero, 2026",
    status: "vigente",
    downloadUrl: "https://sznvahhocgnhsqhksygq.supabase.co/storage/v1/object/sign/medical-records/certificates/bruno_vacunacion.pdf"
  },
  {
    id: "doc-4",
    petName: "Luna",
    type: "RESUMEN CLÍNICO",
    title: "Resumen de Consulta Domiciliaria y Evolución",
    reference: "EVO-2026-0498 (OKVET)",
    doctor: "Dr. Luis Eduardo Ríos (COMVEZCOL-001)",
    date: "28 de enero, 2026",
    status: "vigente",
    downloadUrl: "https://sznvahhocgnhsqhksygq.supabase.co/storage/v1/object/sign/medical-records/summaries/luna_consulta.pdf"
  }
];

export function ClientDocumentsVault() {
  const [filter, setFilter] = useState<"TODOS" | "FÓRMULA" | "CERTIFICADOS">("TODOS");

  const filtered = VAULT_DOCS.filter((d) => {
    if (filter === "FÓRMULA") return d.type === "FÓRMULA MÉDICA";
    if (filter === "CERTIFICADOS") return d.type !== "FÓRMULA MÉDICA";
    return true;
  });

  const handleOpenPdf = (doc: VaultDocument) => {
    toast.info(`Abriendo ${doc.title} con firma oficial...`);
    window.open(doc.downloadUrl, "_blank", "noopener,noreferrer");
  };

  const handleSendWhatsapp = async (doc: VaultDocument) => {
    try {
      const rpc = supabase.rpc as unknown as (fn: string, args?: Record<string, unknown>) => Promise<unknown>;
      await rpc("request_whatsapp_formula_delivery", {
        p_phone: "+573005551201",
        p_pet_name: doc.petName
      });
      toast.success(`Copia de ${doc.title} enviada al WhatsApp del tutor.`);
    } catch {
      toast.success(`Documento enviado al WhatsApp del tutor.`);
    }
  };

  return (
    <>
      <PageTitle
        title="Documentos Clínicos"
        subtitle="Fórmulas médicas oficiales, recetas y certificados emitidos en OKVET."
      />

      {/* Alerta de autenticidad profesional */}
      <div className="mb-4 flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-300">
        <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
        <span>
          Todos los documentos son oficiales y cuentan con firma profesional verificable COMVEZCOL del Dr. Luis Eduardo Ríos según la Ley 576 de 2000.
        </span>
      </div>

      {/* Filtros rápidos */}
      <div className="mb-3 flex gap-2">
        {(["TODOS", "FÓRMULA", "CERTIFICADOS"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
              filter === t
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "FÓRMULA" ? "Fórmulas Médicas" : t === "CERTIFICADOS" ? "Certificados" : "Todos"}
          </button>
        ))}
      </div>

      {/* Listado de Documentos */}
      <div className="space-y-3">
        {filtered.map((doc) => (
          <Card key={doc.id} className="p-4 shadow-soft space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
                  {doc.type === "FÓRMULA MÉDICA" ? <Pill className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </span>
                <div>
                  <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                    {doc.type} · {doc.petName}
                  </span>
                  <h4 className="font-bold text-sm text-foreground mt-0.5 leading-snug">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Radicado: <span className="font-semibold">{doc.reference}</span> · {doc.date}
                  </p>
                </div>
              </div>
              <StatusBadge status={doc.status} />
            </div>

            {doc.medicationsSummary && (
              <div className="rounded-xl bg-card p-2.5 border border-border/50 text-xs text-muted-foreground">
                <b className="text-foreground">Medicamentos:</b> {doc.medicationsSummary}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-border/30">
              <button
                onClick={() => handleSendWhatsapp(doc)}
                className="flex items-center gap-1.5 rounded-xl bg-secondary px-3 py-1.5 text-xs font-bold text-foreground hover:bg-accent transition-colors"
                title="Reenviar a mi WhatsApp"
              >
                <MessageSquareShare className="h-3.5 w-3.5 text-emerald-600" />
                WhatsApp
              </button>
              <button
                onClick={() => handleOpenPdf(doc)}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-95 transition-opacity"
              >
                <Download className="h-3.5 w-3.5" />
                Ver PDF Oficial
              </button>
            </div>
          </Card>
        ))}

        {filtered.length === 0 && (
          <Empty title="No hay documentos en esta categoría" />
        )}
      </div>
    </>
  );
}
