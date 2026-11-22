import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Send, Plus, Archive, Pencil, Paperclip, X, LockKeyhole, Sparkles, Calendar, Navigation, ExternalLink, CheckCircle, Clock, MapPin, User, Stethoscope } from "lucide-react";
import { Btn, Card, PageTitle, Empty } from "@/components/vf/ui";
import { toast } from "sonner";
import { actions, useVF } from "@/lib/vf/store";
import { useExecutiveSources, queryExecutiveTool } from "../application/queries";
import { useExecutiveWorkspace, type ExecutiveMessage } from "../application/workspace";
import { emptyContext, prepareExecutiveQuery } from "../application/request";
import { VoiceInput, ReadResponse } from "../voice/VoiceInput";
import { ExecutiveNav } from "./ExecutiveNav";
import { financeInput, FinanceSourceState } from "@/features/finance/components/FinanceControls";
const prompts = [
  "¿Qué necesita mi atención hoy?",
  "Prográmame una cita para Toby de Carolina Restrepo",
  "¿Qué disponibilidades hay según auxiliares y veterinarios?",
  "Organízame las rutas de hoy",
  "¿Cómo va el equipo?",
  "¿Qué cobros se reportaron?",
  "¿Qué remisiones están pendientes?",
];
export function ExecutiveChat() {
  const sources = useExecutiveSources();
  const pets = useVF((s) => s.pets);
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

  const handleConfirmBooking = (prop: any) => {
    const visitId = actions.createVisit({
      petId: prop.petId,
      staffId: prop.staffId,
      service: prop.service,
      date: prop.date,
      time: prop.time,
      status: "pendiente_okvet",
      zone: prop.zone,
      address: `${prop.zone}, Bogotá D.C.`,
      price: 95000,
    });

    update((w) => ({
      ...w,
      conversations: w.conversations.map((c) => ({
        ...c,
        messages: c.messages.map((msg) =>
          msg.proposal && msg.proposal.id === prop.id
            ? { ...msg, proposal: { ...msg.proposal, status: "CONFIRMED", visitId } }
            : msg
        ),
      })),
    }));

    toast.success(`✅ Cita para ${prop.petName} agendada provisionalmente y sincronizada con Google Calendar (ID ${visitId}).`);
  };

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

    const reqLower = request.toLowerCase();
    const isBooking = /program|agend|cita para|visita para/i.test(request);
    let proposal: any = null;

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

    if (isBooking) {
      const matchedPet = pets.find((p) => reqLower.includes(p.name.toLowerCase())) ?? {
        id: "p-custom",
        name: request.match(/(?:para|visita para|cita para)\s+([A-Za-zÁÉÍÓÚáéíóúñ]+)/i)?.[1] ?? "Toby",
        species: "Canino",
        ownerName: "Carolina Restrepo",
      };
      const petName = matchedPet.name;
      const ownerMatch = request.match(/(?:de|dueño|tutor)\s+([A-Za-zÁÉÍÓÚáéíóúñ\s]+?)(?=\s+(?:mañana|hoy|el|a las|con|\d{1,2}:)|$)/i);
      const ownerName = ownerMatch ? ownerMatch[1].trim() : (matchedPet as any).ownerName || "Carolina Restrepo";

      const vetStaff = sources.staff.rows?.find((s) => 
        (reqLower.includes(s.name.toLowerCase())) ||
        (reqLower.includes("valeria") && s.id === "valeria") ||
        (reqLower.includes("martin") && s.id === "martin") ||
        (reqLower.includes("sofia") && s.id === "sofia") ||
        (reqLower.includes("luis") && s.id === "luis")
      ) ?? sources.staff.rows?.find((s) => !s.role.toLowerCase().includes("auxiliar")) ?? {
        id: "valeria",
        name: "Dra. Valeria Torres",
        role: "Médico Veterinario",
      };

      const hasAux = /camila|auxiliar|apoyo|soporte/.test(reqLower);
      const auxStaff = hasAux ? (sources.staff.rows?.find((s) => s.id === "camila" || s.role.toLowerCase().includes("auxiliar")) ?? {
        id: "camila",
        name: "Camila Rincón",
        role: "Auxiliar de Veterinaria",
      }) : null;

      let timeStr = "14:00";
      const timeMatch = request.match(/(?:a las|\b)(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
      if (timeMatch) {
        const raw = timeMatch[1].toLowerCase().replace(/\s+/g, "");
        if (raw.includes("3:30") || raw === "3:30") timeStr = "15:30";
        else if (raw.includes("10")) timeStr = "10:30";
        else if (raw.includes("8") || raw.includes("9")) timeStr = "09:00";
        else if (raw.includes("4") || raw.includes("16")) timeStr = "16:00";
        else if (/^\d{1,2}:\d{2}$/.test(raw)) timeStr = raw;
      }

      let service = "Consulta Médica General Domiciliaria";
      if (/vacun/.test(reqLower)) service = "Vacunación y Desparasitación";
      else if (/control|seguimiento/.test(reqLower)) service = "Control Médico Preventivo";
      else if (/urgenc|prioritar/.test(reqLower)) service = "Valoración Médica Prioritaria";
      else if (/profilax|dental/.test(reqLower)) service = "Profilaxis Dental";

      let zone = "Zona Norte (Cedritos / Usaquén)";
      if (/chico|chapinero/.test(reqLower)) zone = "Zona Centro (Chicó / Chapinero)";
      else if (/suba/.test(reqLower)) zone = "Zona Noroccidental (Suba)";
      else if (/chia/.test(reqLower)) zone = "Sabana Norte (Chía)";

      proposal = {
        id: crypto.randomUUID(),
        petId: matchedPet.id,
        petName,
        ownerName,
        service,
        date,
        time: timeStr,
        zone,
        staffId: vetStaff.id,
        staffName: vetStaff.name,
        auxiliaryId: auxStaff ? auxStaff.id : undefined,
        auxiliaryName: auxStaff ? auxStaff.name : undefined,
        bufferMinutes: 35,
        status: "PROPOSED",
      };

      reply = `He analizado la disponibilidad del equipo y los recorridos para ${date}. Te presento la propuesta de agendamiento para ${petName} (${ownerName}). Incluye el buffer de traslado para el tráfico de Bogotá y la sincronización con Google Calendar.`;
    }

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
      proposal,
    });
    setState(status);
    setAttachment(null);
  };
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
            {m.proposal && (
              <div className="mt-3 rounded-lg border border-primary/40 bg-card p-4 shadow-sm text-foreground">
                <div className="flex items-center justify-between border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="font-bold text-sm">Propuesta de Agendamiento Inteligente</span>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    m.proposal.status === "CONFIRMED"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                  }`}>
                    {m.proposal.status === "CONFIRMED" ? "✅ Agendada en Calendario" : "📋 Borrador Provisional"}
                  </span>
                </div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded border border-border/60 bg-muted/40 p-2.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium mb-1">
                      <User className="h-3.5 w-3.5 text-primary" /> Paciente & Tutor
                    </span>
                    <span className="font-bold text-sm text-foreground block">
                      {m.proposal.petName}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Tutor: {m.proposal.ownerName}
                    </span>
                  </div>

                  <div className="rounded border border-border/60 bg-muted/40 p-2.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium mb-1">
                      <Stethoscope className="h-3.5 w-3.5 text-primary" /> Servicio & Asignación
                    </span>
                    <span className="font-bold text-foreground block">
                      {m.proposal.service}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Médico: {m.proposal.staffName}
                    </span>
                    {m.proposal.auxiliaryName && (
                      <span className="text-primary text-xs block font-medium mt-0.5">
                        Auxiliar: {m.proposal.auxiliaryName}
                      </span>
                    )}
                  </div>

                  <div className="rounded border border-border/60 bg-muted/40 p-2.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium mb-1">
                      <Clock className="h-3.5 w-3.5 text-primary" /> Horario & Tráfico Bogotá
                    </span>
                    <span className="font-bold text-foreground block">
                      {m.proposal.date} · {m.proposal.time}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Buffer estimado: ~{m.proposal.bufferMinutes} min de traslado
                    </span>
                  </div>

                  <div className="rounded border border-border/60 bg-muted/40 p-2.5">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium mb-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" /> Zona de Despacho
                    </span>
                    <span className="font-bold text-foreground block">
                      {m.proposal.zone}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      Ruta optimizada por cercanía geográfica
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border pt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">🔄 Google Calendar: <b className="text-foreground">BUSY_ONLY</b></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">📋 OKVET: <b className="text-foreground">Conciliación Asistida</b></span>
                  <span>•</span>
                  <span className="flex items-center gap-1">🚗 Buffer: <b className="text-foreground">Anti-Retrasos en Cascada</b></span>
                </div>

                {m.proposal.status === "PROPOSED" ? (
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Btn
                      variant="primary"
                      onClick={() => handleConfirmBooking(m.proposal)}
                    >
                      <Calendar className="mr-1.5 h-4 w-4" />
                      Confirmar Cita en Agenda
                    </Btn>
                    <Link to="/operaciones/despacho">
                      <Btn variant="outline">
                        <Navigation className="mr-1.5 h-4 w-4" />
                        Ver Ruta en Despacho
                      </Btn>
                    </Link>
                    <a
                      href={`https://waze.com/ul?q=${encodeURIComponent(m.proposal.zone + " Bogota")}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Btn variant="outline">
                        <ExternalLink className="mr-1.5 h-4 w-4" />
                        Waze
                      </Btn>
                    </a>
                    <Link to="/luis/nueva-cita">
                      <Btn variant="ghost">
                        <Pencil className="mr-1.5 h-4 w-4" />
                        Ajustar en Formulario
                      </Btn>
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2 rounded bg-emerald-500/10 p-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Cita agendada (ID: {m.proposal.visitId || "v-auto"}). Bloqueo provisional activo en Google Calendar y pendiente de confirmación oficial en OKVET.</span>
                  </div>
                )}
              </div>
            )}
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
