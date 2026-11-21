import { Link } from "@tanstack/react-router";
import { ShieldCheck, MessageCircle, ClipboardList, HeartHandshake, BarChart3 } from "lucide-react";
import { Btn } from "@/components/vf/ui";
import { toast } from "sonner";
import { useVF } from "@/lib/vf/store";
import { canOpenQualityPath } from "../application/access";
export const inputClass =
  "mt-1 w-full min-w-0 rounded-xl border border-border bg-card p-3 text-foreground";
export function qualityError(code: string): string {
  const errors: Record<string, string> = { STALE_DATA: "El caso cambió; vuelve a consultarlo", DATA_INCOMPLETE: "Faltan datos, responsable, plan o evidencia para este paso", INVALID_STATE_TRANSITION: "Este paso no corresponde al estado actual", PROFESSIONAL_REVIEW_REQUIRED: "Hace falta revisión veterinaria autorizada", NOT_AUTHORIZED: "Falta aprobación autorizada" };
  return errors[code] ?? code;
}
export function QualityNav() {
  const roles = useVF((s) => s.roles);
  return (
    <nav
      aria-label="Calidad y experiencia"
      className="mb-5 flex flex-wrap gap-x-4 gap-y-3 border-b border-border pb-4 text-sm font-bold text-primary"
    >
      {[
        ["/operaciones/calidad", "Calidad", ShieldCheck],
        ["/operaciones/quejas", "Quejas", ClipboardList],
        ["/operaciones/calidad/conversaciones", "Conversaciones", MessageCircle],
        ["/operaciones/fidelizacion", "Continuidad", HeartHandshake],
        ["/admin/encuestas", "Encuestas", BarChart3],
        ["/admin/calidad/aprobaciones", "Aprobaciones", ShieldCheck],
      ].filter(([href]) => canOpenQualityPath(String(href), roles)).map(([href, label, Icon]) => {
        const I = Icon as typeof ShieldCheck;
        return (
          <Link
            key={String(href)}
            to={String(href) as never}
            className="inline-flex min-h-11 items-center gap-1"
          >
            <I className="h-4 w-4" />
            {String(label)}
          </Link>
        );
      })}
    </nav>
  );
}
export function PendingAuthority({ draft = false }: { draft?: boolean }) {
  return (
    <p className="my-3 border-l-2 border-primary pl-3 text-sm text-muted-foreground">
      {draft
        ? "Borrador interno: requiere revisión y aprobación antes de publicarse en el portal."
        : "Servicio autorizado pendiente. No se enviaron mensajes ni se ejecutaron cambios oficiales."}
    </p>
  );
}
export function UnavailableAction({ label }: { label: string }) {
  return (
    <Btn
      variant="outline"
      onClick={() =>
        toast.error("El servicio autorizado aún no está conectado; no se realizó ninguna acción")
      }
    >
      {label}
    </Btn>
  );
}
export function SourceDate({ source, at }: { source: string; at?: string | null }) {
  const date =
    at && Number.isFinite(Date.parse(at))
      ? new Date(at).toLocaleString("es-CO", { timeZone: "America/Bogota" })
      : "Fecha no registrada";
  return (
    <p className="mt-2 break-words text-xs text-muted-foreground">
      Fuente: {source} · {date}
    </p>
  );
}
