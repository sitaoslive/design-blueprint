import { usePets } from "@/lib/vf/store";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Calendar, Clock, Stethoscope, Eye, CalendarClock, ChevronRight } from "lucide-react";
import { useVF, actions } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, Chips, StatusBadge, Btn, Empty } from "@/components/vf/ui";

export const Route = createFileRoute("/cliente/agenda")({
  head: () => meta("Mi agenda", "Próximas visitas e historial de tus mascotas."),
  component: Agenda,
});

const SLOTS = [["Vie, 31 de enero", "09:00"], ["Vie, 31 de enero", "14:00"], ["Lun, 3 de febrero", "10:30"]] as const;

function Agenda() {
  const pets = usePets();
  const [tab, setTab] = useState<"hoy" | "semana" | "todas">("semana");
  const [open, setOpen] = useState<string | null>(null);
  const [detail, setDetail] = useState<string | null>(null);
  const staff = useVF((s) => s.staff);
  const all = useVF((s) => s.visits);
  const list = all.filter((v) => tab === "todas" || (tab === "hoy" ? v.date.startsWith("Mar") : true)).filter((v) => v.status !== "cancelada");
  return (
    <>
      <PageTitle title="Mi agenda" />
      <Chips value={tab} onChange={setTab} options={[{ value: "hoy", label: "Hoy" }, { value: "semana", label: "Semana" }, { value: "todas", label: "Todas" }]} />
      <SectionTitle>Próximas visitas</SectionTitle>
      <div className="space-y-4">
        {list.length === 0 && <Empty title="No tienes visitas en este periodo" />}
        {list.map((v) => {
          const p = pets.find((x) => x.id === v.petId)!; const st = staff.find((s) => s.id === v.staffId);
          return (
            <div key={v.id} className="animate-pop overflow-hidden rounded-3xl border border-border bg-card shadow-soft">
              <div className="flex gap-3 p-3">
                <img src={p.photo} alt={p.name} className="h-28 w-28 rounded-2xl object-cover" />
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2"><b className="text-2xl">{p.name}</b><StatusBadge status={v.status === "pendiente_okvet" ? "pendiente" : v.status} /></div>
                  <p className="flex items-center gap-2 text-lg"><Stethoscope className="h-5 w-5 text-primary" />{v.service}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-primary" />{v.date}</p>
                  <p className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4 text-primary" />{v.time}</p>
                </div>
              </div>
              {st && <div className="flex items-center gap-2 border-t border-border px-4 py-2"><img src={st.photo} alt="" className="h-8 w-8 rounded-full object-cover" />{st.name}</div>}
              {detail === v.id && <div className="border-t border-border bg-secondary px-4 py-3 text-muted-foreground">Dirección: {v.address}<br />Preparación: {v.prep.join(", ") || "Ninguna"}</div>}
              {open === v.id && (
                <div className="space-y-2 border-t border-border bg-accent p-3">
                  <p className="font-bold">Elige un nuevo horario</p>
                  {SLOTS.map(([d, t]) => <button key={d + t} onClick={() => { actions.rescheduleVisit(v.id, d, t); setOpen(null); toast.success("Solicitud de cambio enviada"); }} className="flex w-full items-center justify-between rounded-2xl bg-card p-3">{d} · {t}<ChevronRight className="h-4 w-4" /></button>)}
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
                <Btn variant="sage" onClick={() => setDetail(detail === v.id ? null : v.id)}><Eye className="h-5 w-5" />Ver detalle</Btn>
                <Btn variant="soft" onClick={() => setOpen(open === v.id ? null : v.id)}><CalendarClock className="h-5 w-5" />Reprogramar</Btn>
              </div>
            </div>
          );
        })}
      </div>
      <SectionTitle>Historial reciente</SectionTitle>
      <Link to="/cliente/mascotas/$id" params={{ id: "luna" }} className="flex items-center gap-3 rounded-3xl bg-secondary p-4">
        <Stethoscope className="h-7 w-7 text-primary" /><span className="flex-1"><b className="block text-lg">Consulta general</b><span className="text-muted-foreground">10 de enero</span></span><StatusBadge status="finalizada" />
      </Link>
    </>
  );
}
