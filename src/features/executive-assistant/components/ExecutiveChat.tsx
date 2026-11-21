import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Send, Plus, Archive, Pencil, Paperclip, X, LockKeyhole, Sparkles } from "lucide-react";
import { Btn, Card, PageTitle, Empty } from "@/components/vf/ui";
import { toast } from "sonner";
import { useExecutiveSources, queryExecutiveTool } from "../application/queries";
import { useExecutiveWorkspace, type ExecutiveMessage } from "../application/workspace";
import { emptyContext, prepareExecutiveQuery } from "../application/request";
import { VoiceInput, ReadResponse } from "../voice/VoiceInput";
import { ExecutiveNav } from "./ExecutiveNav";
import { financeInput, FinanceSourceState } from "@/features/finance/components/FinanceControls";
const prompts = [
  "¿Qué necesita mi atención hoy?",
  "Muéstrame las citas de mañana",
  "¿Cómo va el equipo?",
  "¿Qué cobros se reportaron?",
  "¿Qué remisiones están pendientes?",
];
export function ExecutiveChat() {
  const sources = useExecutiveSources();
  const { workspace, update } = useExecutiveWorkspace();
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [history, setHistory] = useState(false);
  const [rename, setRename] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [state, setState] = useState("IDLE");
  const [attachment, setAttachment] = useState<{ name: string; text: string } | null>(null);
  const file = useRef<HTMLInputElement | null>(null);
  const token = useRef(0);
  const conversation = workspace?.conversations.find((c) => c.id === workspace.activeId);
  const context = conversation?.context ?? emptyContext;
  const setContext = (patch: Partial<typeof context>) => update((w) => ({ ...w,
    conversations: w.conversations.map((c) => c.id === w.activeId ? { ...c, context: { ...c.context, ...patch } } : c),
  }));
  useEffect(
    () => () => {
      token.current += 1;
    },
    [],
  );
  const add = (message: ExecutiveMessage) =>
    update((w) => ({
      ...w,
      conversations: w.conversations.map((c) =>
        c.id === w.activeId
          ? { ...c, messages: [...c.messages, message], updatedAt: message.createdAt }
          : c,
      ),
    }));
  const send = async (request: string) => {
    if (!request.trim() || state === "PROCESSING" || !conversation || conversation.archived) return;
    const currentToken = ++token.current;
    setState("PROCESSING");
    const createdAt = new Date().toISOString();
    add({
      id: crypto.randomUUID(),
      role: "user",
      text: request.trim(),
      createdAt,
      results: [],
      status: "COMPLETED",
    });
    setText("");
    const plan = prepareExecutiveQuery(request, context);
    const { intents, risk } = plan;
    const date = plan.period.from;
    setContext(plan.context);
    const results = plan.tools.map((id) => queryExecutiveTool(id, sources, plan.period));
    let reply =
      risk === 5
        ? "No puedo preparar esta acción: está prohibida por la política de seguridad."
        : intents.includes("APPROVAL_REQUEST")
          ? "Selecciona la propuesta y revisa su versión, impacto y vigencia. La instrucción no constituye aprobación ni ejecución; el contrato protegido está pendiente."
          : risk > 0
            ? "Puedo preparar un borrador y revisar las restricciones en el módulo de origen. Ninguna cita, pago, permiso o mensaje fue modificado."
            : results.length
              ? `Consulta de fuentes autorizadas para ${date} (Bogotá). ${sources.demo ? "Datos sintéticos de demostración." : "Las advertencias indican qué información no está completa."}`
              : "Necesito un tema concreto: agenda, equipo, tareas, cobros, remisiones o calidad. No seleccioné un paciente ni una acción automáticamente.";
    if (attachment)
      reply += ` El adjunto “${attachment.name}” es contenido no confiable; no concede permisos, no se envió a IA y no originó herramientas.`;
    if (context.staffId) reply += ` Profesional seleccionado: ${sources.staff.rows?.find((s) => s.id === context.staffId)?.name ?? context.staffId}. Este filtro solo se aplica a agenda, carga y tareas.`;
    if (risk > 0 && results.length) reply += " Las consultas siguientes son solo de lectura.";
    await Promise.resolve();
    if (token.current !== currentToken) return;
    const status =
      risk === 5 ? "BLOCKED" : risk >= 3
        ? "AWAITING_APPROVAL"
        : results.some((r) => ["UNAVAILABLE", "ERROR", "STALE"].includes(r.status))
          ? "PARTIAL"
          : "COMPLETED";
    add({
      id: crypto.randomUUID(),
      role: "assistant",
      text: reply,
      createdAt: new Date().toISOString(),
      results: risk === 5 ? [] : results,
      status,
    });
    setState(status);
    setAttachment(null);
  };
  const newConversation = () => {
    const id = crypto.randomUUID();
    update((w) => ({
      ...w,
      activeId: id,
      conversations: [
        ...w.conversations,
        {
          id,
          title: "Nueva conversación",
          archived: false,
          updatedAt: new Date().toISOString(),
          messages: [],
          context: { ...emptyContext },
        },
      ],
    }));
    setState("IDLE");
  };
  return (
    <>
      <PageTitle title="Asistente de Dirección" />
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <LockKeyhole className="h-4 w-4" />
        Sesión privada · {new Date().toLocaleDateString("es-CO", {
          timeZone: "America/Bogota",
        })} · {sources.demo ? "DEMO sintético" : "Fuentes autorizadas"} · IA y transcripción
        pendientes
      </div>
      <ExecutiveNav />
      <div className="mb-3 flex flex-wrap gap-2">
        <Btn variant="outline" onClick={() => setHistory((v) => !v)}>
          Historial de sesión
        </Btn>
        <Btn variant="outline" onClick={newConversation}>
          <Plus className="h-4 w-4" />
          Nueva conversación
        </Btn>
      </div>
      {history && (
        <section className="mb-5 border-y border-border py-3">
          <input
            className={financeInput}
            aria-label="Buscar conversaciones"
            placeholder="Buscar conversaciones"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="my-3 space-y-2">
            {workspace?.conversations
              .filter(
                (c) =>
                  c.archived === showArchived &&
                  `${c.title} ${c.messages.map((m) => m.text).join(" ")}`
                    .toLowerCase()
                    .includes(search.toLowerCase()),
              )
              .map((c) => (
                <div className="flex flex-wrap items-center gap-2" key={c.id}>
                  <Btn
                    variant="outline"
                    onClick={() => {
                      update((w) => ({ ...w, activeId: c.id }));
                      setState("IDLE");
                    }}
                  >
                    {c.title}
                  </Btn>
                  <Btn
                    variant="outline"
                    aria-label={`Archivar ${c.title}`}
                    onClick={() =>
                      update((w) => ({
                        ...w,
                        conversations: w.conversations.map((x) =>
                          x.id === c.id ? { ...x, archived: !x.archived } : x,
                        ),
                      }))
                    }
                  >
                    <Archive className="h-4 w-4" />{c.archived ? "Restaurar" : "Archivar"}
                  </Btn>
                </div>
              ))}
          </div>
          <Btn variant="outline" onClick={() => setShowArchived((v) => !v)}>{showArchived ? "Ver activas" : "Ver archivadas"}</Btn>
          <label>
            Nombre de conversación
            <input
              className={financeInput}
              aria-label="Renombrar conversación"
              value={rename}
              onChange={(e) => setRename(e.target.value)}
            />
          </label>
          <Btn
            variant="outline"
            disabled={!rename.trim()}
            onClick={() => {
              update((w) => ({
                ...w,
                conversations: w.conversations.map((c) =>
                  c.id === w.activeId ? { ...c, title: rename.trim() } : c,
                ),
              }));
              setRename("");
            }}
          >
            <Pencil className="h-4 w-4" />
            Renombrar
          </Btn>
          <p className="mt-2 text-xs text-muted-foreground">
            Historial privado de esta sesión, caduca en 24 horas. Historial oficial y auditoría:
            contrato pendiente.
          </p>
        </section>
      )}
      <FinanceSourceState sources={[sources.visits, sources.staff, sources.records, sources.payments, sources.tasks, sources.approvals]}>
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <label>Profesional de la conversación
            <select className={financeInput} aria-label="Profesional de la conversación" value={context.staffId} onChange={(e) => setContext({ staffId: e.target.value, entityId: "" })}>
              <option value="">Todos; sin selección automática</option>
              {sources.staff.rows?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </label>
          <label>Cita de la conversación
            <select className={financeInput} aria-label="Cita de la conversación" value={context.entityId} onChange={(e) => setContext({ entityId: e.target.value })}>
              <option value="">Todas; sin selección automática</option>
              {sources.visits.rows?.filter((v) => !context.staffId || v.staff_id === context.staffId).map((v) => <option key={v.id} value={v.id}>{v.operational_on ?? v.date} · {v.time} · {v.service} · {v.id}</option>)}
            </select>
          </label>
        </div>
      </FinanceSourceState>
      {conversation?.archived && <p role="status">Conversación archivada: restáurala o inicia una nueva.</p>}
      {!conversation?.messages.length && (
        <div className="my-5 border-y border-border py-6">
          <Sparkles className="mb-3 h-8 w-8 text-primary" />
          <h2 className="text-xl font-bold">¿Qué revisamos hoy?</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {prompts.map((p) => (
              <Btn variant="outline" key={p} onClick={() => void send(p)}>
                {p}
              </Btn>
            ))}
          </div>
        </div>
      )}
      <div className="space-y-4" aria-live="polite">
        {conversation?.messages.map((m) => (
          <article
            key={m.id}
            className={
              m.role === "user"
                ? "ml-auto max-w-[90%] rounded-lg bg-primary p-3 text-primary-foreground"
                : "border-b border-border py-3"
            }
          >
            <p className="whitespace-pre-wrap break-words">{m.text}</p>
            {m.results.map((r) => (
              <Card key={r.correlationId} className="mt-3">
                <p className="text-xs font-bold text-muted-foreground">
                  {r.source || "Fuente no disponible"} · {r.status} ·{" "}
                  {r.sourceTimestamp
                    ? new Date(r.sourceTimestamp).toLocaleString("es-CO", {
                        timeZone: "America/Bogota",
                      })
                    : "Sin fecha de consulta"}
                </p>
                {r.error && (
                  <p role="alert" className="mt-2 text-sm">
                    {r.error}
                  </p>
                )}
                <ul className="divide-y divide-border">
                  {r.data.map((d) => (
                    <li key={d.id} className="py-2">
                      <Link className="font-bold text-primary" to={d.href as never}>
                        {d.title}
                      </Link>
                      <p className="text-sm break-words">{d.detail}</p>
                    </li>
                  ))}
                </ul>
                {r.status === "NO_DATA" && (
                  <Empty title="Sin registros visibles para esta consulta" />
                )}
                {r.warnings.map((w) => (
                  <p key={w} className="mt-2 text-xs text-muted-foreground">
                    {w}
                  </p>
                ))}
              </Card>
            ))}
            {m.role === "assistant" && (
              <>
                <div className="mt-2 flex flex-wrap gap-3 text-sm font-bold text-primary">
                  <Link to="/direccion/$" params={{ _splat: "propuestas" }} onClick={() => update((w) => ({ ...w, pendingDraft: {
                    objective: conversation?.messages.slice(0, conversation.messages.indexOf(m)).reverse().find((x) => x.role === "user")?.text ?? "",
                    sourceIds: [...new Set(m.results.flatMap((r) => r.data.map((d) => d.id)))],
                    responsible: context.staffId, deadline: context.date ?? new Date().toISOString().slice(0, 10),
                  } }))}>
                    Preparar propuesta
                  </Link>
                  <Link to="/operaciones/$" params={{ _splat: "simulador" }}>
                    Simular
                  </Link>
                  <Link to="/direccion/$" params={{ _splat: "delegaciones" }}>
                    Delegar
                  </Link>
                  <Link to="/direccion/$" params={{ _splat: "asistente/resultados" }}>
                    Ver resultados
                  </Link>
                </div>
                <ReadResponse text={m.text} />
              </>
            )}
          </article>
        ))}
      </div>
      <div className="mt-4">
        <VoiceInput onText={setText} />
      </div>
      {attachment && (
        <p className="mb-2 text-sm">
          Adjunto local: {attachment.name} · No enviado{" "}
          <Btn variant="outline" aria-label="Quitar adjunto" onClick={() => setAttachment(null)}>
            <X className="h-4 w-4" />
          </Btn>
        </p>
      )}
      <form
        className="sticky bottom-24 z-20 mt-3 flex items-end gap-2 rounded-lg border border-border bg-card p-2 md:bottom-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send(text);
        }}
      >
        <textarea
          className="max-h-40 min-h-14 min-w-0 flex-1 resize-y bg-transparent p-2 text-base"
          aria-label="Instrucción para la asistente"
          placeholder="¿Qué necesitas revisar?"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          ref={file}
          className="hidden"
          type="file"
          accept=".txt,.md"
          onChange={(e) => {
            const chosen = e.target.files?.[0];
            if (!chosen) return;
            if (chosen.size > 100000) {
              toast.error("El adjunto supera 100 KB");
              return;
            }
            void chosen.text().then((t) => setAttachment({ name: chosen.name, text: t }));
            e.target.value = "";
          }}
        />
        <Btn
          type="button"
          variant="outline"
          aria-label="Adjuntar información"
          onClick={() => file.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Btn>
        <Btn
          type="submit"
          aria-label="Enviar instrucción"
          disabled={!text.trim() || state === "PROCESSING" || !conversation || conversation.archived}
        >
          <Send className="h-4 w-4" />
        </Btn>
      </form>
      <p className="mt-2 text-xs text-muted-foreground" role="status">
        {state === "PROCESSING"
          ? "Consultando fuentes cargadas"
          : state === "AWAITING_APPROVAL"
            ? "Revisión humana pendiente; no se ejecutó una acción"
            : "Respuestas por reglas · sin IA ni envíos externos"}
      </p>
      <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-primary">
        {[
          ["/luis/agenda", "Agenda"],
          ["/luis/equipo", "Equipo"],
          ["/direccion/finanzas", "Finanzas"],
          ["/luis/remisiones", "Remisiones"],
          ["/direccion/modo-ausencia", "Modo ausencia"],
        ].map(([href, title]) => (
          <Link key={href} to={href as never}>
            {title}
          </Link>
        ))}
      </div>
    </>
  );
}
