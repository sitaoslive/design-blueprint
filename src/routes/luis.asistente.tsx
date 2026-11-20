import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AlertTriangle, Calendar, Users, CalendarPlus, Wallet, Send, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useVF, actions, getVF } from "@/lib/vf/store";
import { meta } from "@/lib/vf/meta";
import { PageTitle, SectionTitle, QuickAction, Btn, StatusBadge } from "@/components/vf/ui";
import { StatusTimeline, ASSISTANT_CYCLE, DesignModeIndicator } from "@/components/vf/shared";

export const Route = createFileRoute("/luis/asistente")({
  head: () => meta("Asistente", "Asistente privada de Dirección: consulta, propone y pide tu aprobación."),
  component: Assistant,
});

function reply(q: string) {
  const s = getVF(); const t = q.toLowerCase();
  if (t.includes("tarde")) {
    const v = s.visits.filter((x) => x.date.startsWith("Mar") && x.time >= "12:00");
    return { text: `Esta tarde hay ${v.length} visitas: ${v.map((x) => `${x.time} ${x.service}`).join(", ")}.` };
  }
  if (t.includes("reorgan") || t.includes("mover") || t.includes("reasign")) {
    const a = s.approvals.find((x) => x.kind === "reorganizacion" && x.status === "pendiente");
    return a ? { text: "Propongo esta reorganización. No se ejecutará hasta que la apruebes:", proposal: { title: a.title, effects: a.detail, approvalId: a.id, status: "propuesta" as const } } : { text: "No hay reorganizaciones pendientes." };
  }
  if (t.includes("cobr") || t.includes("pago")) {
    const p = s.payments.filter((x) => x.status !== "pagado");
    return { text: `Hay ${p.length} cobros pendientes. El más alto: ${p.sort((a, b) => b.amount - a.amount)[0]?.concept ?? "ninguno"}.` };
  }
  if (t.includes("equipo")) return { text: s.staff.map((m) => `${m.name}: ${m.status.replace("_", " ")}`).join(" · ") };
  const unconf = s.visits.filter((v) => v.status === "pendiente").length;
  return { text: `Tienes ${unconf} citas sin confirmar, ${s.approvals.filter((a) => a.status === "pendiente").length} aprobaciones pendientes y ${s.incidents.filter((i) => i.status !== "cerrada").length} incidencias abiertas.` };
}

function Assistant() {
  const chat = useVF((s) => s.chat); const reqs = useVF((s) => s.requests.filter((r) => r.status === "nueva").length);
  const [text, setText] = useState(""); const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, [chat.length]);
  const send = (q: string) => {
    if (!q.trim()) return;
    actions.pushChat({ id: crypto.randomUUID(), from: "user", text: q });
    setText("");
    setTimeout(() => actions.pushChat({ id: crypto.randomUUID(), from: "ai", ...reply(q) }), 450);
  };
  return (
    <>
      <PageTitle title="Asistente" />
      <div className="mb-3"><DesignModeIndicator label="Asistente de demostración: respuestas por reglas, sin IA real" /></div>
      <div className="flex items-center gap-4 rounded-3xl bg-accent p-4">
        <AlertTriangle className="h-10 w-10 text-primary" />
        <p className="text-lg"><b>Hoy requiere atención:</b><br />2 alertas críticas, {reqs} solicitudes pendientes</p>
      </div>
      <div className="mt-5 space-y-3">
        {chat.map((m) => m.from === "user" ? (
          <div key={m.id} className="ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-gradient-primary px-5 py-3 text-lg text-primary-foreground">{m.text}</div>
        ) : (
          <div key={m.id} className="flex max-w-[92%] items-start gap-2">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-accent"><Sparkles className="h-5 w-5 text-primary" /></span>
            <div className="rounded-3xl rounded-tl-md bg-secondary px-5 py-3 text-lg">
              {m.text}
              {m.proposal && (
                <div className="mt-3 rounded-2xl bg-card p-3 text-base">
                  <div className="mb-2"><StatusTimeline steps={ASSISTANT_CYCLE} current={m.proposal.status === "propuesta" ? 2 : m.proposal.status === "aprobada" ? 4 : 3} failed={m.proposal.status === "rechazada"} /></div>
                  <b>{m.proposal.title}</b><p className="text-muted-foreground">{m.proposal.effects}</p>
                  {m.proposal.status === "propuesta" ? (
                    <div className="mt-2 flex gap-2">
                      <Btn className="py-2" onClick={() => { actions.setProposal(m.id, "aprobada"); if (m.proposal?.approvalId) actions.decideApproval(m.proposal.approvalId, "aprobada"); toast.success("Aprobado. El equipo ejecuta y verifica el cambio"); }}><CheckCircle2 className="h-4 w-4" />Aprobar</Btn>
                      <Btn variant="outline" className="py-2" onClick={() => actions.setProposal(m.id, "rechazada")}><XCircle className="h-4 w-4" />Rechazar</Btn>
                    </div>
                  ) : <StatusBadge status={m.proposal.status} className="mt-2" />}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {["Muéstrame la agenda de la tarde", "Propón una reorganización", "¿Cómo va el equipo?"].map((s) => <button key={s} onClick={() => send(s)} className="rounded-full border border-border bg-card px-4 py-2 text-sm">{s}</button>)}
      </div>
      <SectionTitle>Acciones rápidas</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <QuickAction icon={Calendar} label="Ver agenda" to="/luis/agenda" />
        <QuickAction icon={Users} label="Equipo" tone="sage" to="/luis/equipo" />
        <QuickAction icon={CalendarPlus} label="Nueva cita rápida" to="/luis/nueva-cita" />
        <QuickAction icon={Wallet} label="Cobros" tone="sage" to="/luis/finanzas" />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(text); }} className="sticky bottom-24 mt-5 flex items-center gap-2 rounded-full border border-border bg-card p-2 shadow-soft md:bottom-4">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe una instrucción" aria-label="Escribe una instrucción" className="flex-1 bg-transparent px-4 text-lg outline-none" />
        <button type="submit" aria-label="Enviar" className="grid h-12 w-12 place-items-center rounded-full bg-gradient-primary text-primary-foreground"><Send className="h-5 w-5" /></button>
      </form>
      <p className="mt-2 text-center text-xs text-muted-foreground">Respuestas de demostración · ninguna acción sensible se ejecuta sin tu aprobación</p>
      <Link to="/luis" className="sr-only">Inicio</Link>
    </>
  );
}
