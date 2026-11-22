import { ShieldCheck, Calendar, CheckCircle2, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HealthRecordItem {
  id: string;
  name: string;
  type: "VACCINE" | "CHECKUP" | "DEWORMING" | "SURGERY";
  lastDate: string;
  nextDate?: string;
  doctor: string;
  certified: boolean;
}

export function HealthRecordsTimeline({ records }: { records?: HealthRecordItem[] }) {
  const items: HealthRecordItem[] = records || [
    {
      id: "h1",
      name: "Vacuna Antirrábica Nobivac",
      type: "VACCINE",
      lastDate: "10 Ene 2026",
      nextDate: "10 Ene 2027",
      doctor: "Dr. Luis Eduardo Ríos",
      certified: true,
    },
    {
      id: "h2",
      name: "Chequeo Clínico General a Domicilio",
      type: "CHECKUP",
      lastDate: "12 Feb 2026",
      nextDate: "12 Ago 2026",
      doctor: "Dr. Luis Eduardo Ríos",
      certified: true,
    },
    {
      id: "h3",
      name: "Antiparasitario Interno Canigen",
      type: "DEWORMING",
      lastDate: "01 Feb 2026",
      nextDate: "01 May 2026",
      doctor: "Dra. Camila Torres",
      certified: true,
    },
  ];

  return (
    <div className="rounded-[2rem] border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-foreground">Historial Clínico Verificado</h3>
          <p className="text-xs text-muted-foreground">Respaldado con registro COMVEZCOL y OKVET</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-sage px-2.5 py-1 text-xs font-bold text-sage-foreground">
          <ShieldCheck className="h-3.5 w-3.5" /> Oficial
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-2xl border border-border bg-secondary/40 p-4 transition hover:bg-secondary/70"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-foreground">{item.name}</span>
              <span className="rounded-full bg-card px-2.5 py-0.5 text-[10px] font-bold text-primary shadow-sm">
                {item.type === "VACCINE" ? "Vacunación" : item.type === "CHECKUP" ? "Consulta" : "Desparasitación"}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground">
              <span>Aplicada: <b>{item.lastDate}</b></span>
              {item.nextDate && (
                <span className="text-amber-700 font-semibold dark:text-amber-400">
                  Próximo refuerzo: <b>{item.nextDate}</b>
                </span>
              )}
            </div>

            <div className="mt-1 flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
              <span>Veterinario: {item.doctor}</span>
              <span className="font-bold text-primary">Carné verificado ✓</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
