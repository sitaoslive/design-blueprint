import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { executeOfficialQuality } from "../application/official.functions";
import { OfficialActions, notifyQuality } from "../components/OfficialActions";
import { PromoteDraft, SurveyInvitation } from "./Official";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Trash2, Save, ArrowUp, ArrowDown } from "lucide-react";
import { useVF, updateQualityDemo } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { useQualityWorkspace, saveQualityDraft } from "../application/service";
import {
  SurveySchema,
  validateSurveyResponse,
  calculateSurveyMetrics,
  bogotaDate,
  type Survey,
  type SurveyResponse,
} from "../domain";
import { QualityNav, inputClass, PendingAuthority } from "../components/shared";

export function Surveys({ id = "" }: { id?: string }) {
  const { workspace, demo, loading, error, officialItems } = useQualityWorkspace();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const list = id ? workspace.surveys.filter((s) => s.id === id) : workspace.surveys;
  return (
    <>
      <PageTitle title={id ? "Resultados de encuesta" : "Encuestas y resultados"} />
      <QualityNav />
      <Link to="/admin/$" params={{ _splat: "encuestas/nueva" }} className="font-bold text-primary">
        Nueva encuesta
      </Link>
      {!demo && <p className="my-3 text-sm text-muted-foreground">Publicación interna en el portal; sin mensajes externos.</p>}
      <div className="my-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label>
          Desde
          <input
            type="date"
            className={inputClass}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Hasta
          <input
            type="date"
            className={inputClass}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      {from && to && from > to && <p role="alert">El periodo no es válido</p>}
      {loading ? (
        <p>Cargando…</p>
      ) : error ? (
        <p role="alert">{error}</p>
      ) : (
        list.map((s) => {
          const r = workspace.responses.filter(
            (r) =>
              (!from || (bogotaDate(r.at) ?? "") >= from) &&
              (!to || (bogotaDate(r.at) ?? "") <= to),
          );
          const m = calculateSurveyMetrics(s, r, null);
          return (
            <Card className="mb-3" key={s.id}>
              <b>{s.title}</b>
              <p className="text-sm">
                Versión {s.version} ·{" "}
                {s.state === "PUBLISHED" ? (demo ? "Publicada en demostración" : "Publicada en el portal") : s.state}
              </p>
              <p className="my-2">
                {m.responses} respuestas · CSAT:{" "}
                {m.csat === null ? "Sin datos" : `${m.csat.toFixed(1)} %`} · NPS:{" "}
                {m.nps === null ? "Sin datos" : m.nps.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">{m.method}</p>
              <p className="mt-2 text-xs">
                Tasa de respuesta: sin denominador de invitaciones autorizado. Muestra no
                concluyente de todas las familias.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  to="/admin/$"
                  params={{ _splat: `encuestas/${s.id}` }}
                  className="font-bold text-primary"
                >
                  Ver resultados
                </Link>
                {demo && s.state === "DRAFT" && (
                  <Btn
                    variant="soft"
                    onClick={() => {
                      updateQualityDemo((w) => ({
                        ...w,
                        surveys: w.surveys.map((x) =>
                          x.id === s.id
                            ? { ...x, state: "PUBLISHED", approvedBy: "demo-reviewer" }
                            : x,
                        ),
                      }));
                      toast.success("Encuesta publicada solo en demostración");
                    }}
                  >
                    Aprobar y publicar en demo
                  </Btn>
                )}
                {demo && s.state === "PUBLISHED" && (
                  <Link
                    to="/app/$"
                    params={{ _splat: `encuestas/${s.id}` }}
                    className="font-bold text-primary"
                  >
                    Responder prueba
                  </Link>
                )}
              </div>
              {!demo && (()=>{const item=officialItems.find(i=>i.id===s.id);return item?<><OfficialActions key={item.version} item={item} />{item.state==='PUBLISHED'&&<SurveyInvitation survey={item} />}</>:<PromoteDraft kind="surveys" draft={s} />;})()}
            </Card>
          );
        })
      )}
      {!loading && !error && !list.length && <Empty title="Sin encuestas registradas" />}
    </>
  );
}
export function SurveyBuilder() {
  const demo = useVF((s) => s.userId?.startsWith("demo-"));
  const { reload } = useQualityWorkspace();
  const [survey, setSurvey] = useState<Survey>(() => ({
    id: crypto.randomUUID(),
    title: "",
    version: 1,
    state: "DRAFT",
    approvedBy: "",
    questions: [
      { id: "q1", label: "¿Cómo fue tu experiencia?", type: "CSAT", required: true, options: [] },
    ],
  }));
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const save = async () => {
    const p = SurveySchema.safeParse(survey);
    if (!p.success) {
      toast.error(p.error.issues[0]?.message ?? "Revisa las preguntas");
      return;
    }
    setBusy(true);
    try {
      await saveQualityDraft("surveys", p.data);
      setSaved(true);
      reload();
      toast.success(
        demo ? "Encuesta sintética guardada" : "Borrador guardado; sin publicación oficial",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  const move = (index: number, delta: number) => {
    const q = [...survey.questions];
    const current = q[index],
      other = q[index + delta];
    if (!current || !other) return;
    q[index] = other;
    q[index + delta] = current;
    setSurvey({ ...survey, questions: q });
  };
  return (
    <>
      <PageTitle title="Constructor de encuesta" />
      <QualityNav />
      {!demo && <PendingAuthority draft />}
      <label className="block">
        Título
        <input
          aria-label="Título de encuesta"
          className={inputClass}
          value={survey.title}
          onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
          disabled={saved}
        />
      </label>
      <SectionTitle>Preguntas · versión {survey.version}</SectionTitle>
      {survey.questions.map((q, i) => (
        <div key={q.id} className="mb-4 space-y-2 border-b border-border pb-4">
          <label className="block">
            Pregunta {i + 1}
            <input
              className={inputClass}
              value={q.label}
              disabled={saved}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  questions: survey.questions.map((x) =>
                    x.id === q.id ? { ...x, label: e.target.value } : x,
                  ),
                })
              }
            />
          </label>
          <label className="block">
            Tipo
            <select
              className={inputClass}
              disabled={saved}
              value={q.type}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  questions: survey.questions.map((x) =>
                    x.id === q.id ? { ...x, type: e.target.value as typeof q.type } : x,
                  ),
                })
              }
            >
              <option value="CSAT">Satisfacción (1–5)</option>
              <option value="NPS">Recomendación (0–10)</option>
              <option value="TEXT">Comentario libre</option>
              <option value="CHOICE">Opciones</option>
            </select>
          </label>
          {q.type === "CHOICE" && (
            <label className="block">
              Una opción por línea
              <textarea
                className={inputClass}
                disabled={saved}
                value={q.options.join("\n")}
                onChange={(e) =>
                  setSurvey({
                    ...survey,
                    questions: survey.questions.map((x) =>
                      x.id === q.id ? { ...x, options: e.target.value.split("\n") } : x,
                    ),
                  })
                }
              />
            </label>
          )}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              disabled={saved}
              checked={q.required}
              onChange={(e) =>
                setSurvey({
                  ...survey,
                  questions: survey.questions.map((x) =>
                    x.id === q.id ? { ...x, required: e.target.checked } : x,
                  ),
                })
              }
            />
            Obligatoria al enviar (responder es voluntario)
          </label>
          <div className="flex gap-2">
            <Btn
              variant="soft"
              title="Subir pregunta"
              aria-label={`Subir pregunta ${i + 1}`}
              disabled={saved || i === 0}
              onClick={() => move(i, -1)}
            >
              <ArrowUp className="h-4 w-4" />
            </Btn>
            <Btn
              variant="soft"
              title="Bajar pregunta"
              aria-label={`Bajar pregunta ${i + 1}`}
              disabled={saved || i === survey.questions.length - 1}
              onClick={() => move(i, 1)}
            >
              <ArrowDown className="h-4 w-4" />
            </Btn>
            <Btn
              variant="outline"
              title="Eliminar pregunta"
              aria-label={`Eliminar pregunta ${i + 1}`}
              disabled={saved || survey.questions.length === 1}
              onClick={() =>
                setSurvey({ ...survey, questions: survey.questions.filter((x) => x.id !== q.id) })
              }
            >
              <Trash2 className="h-4 w-4" />
            </Btn>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <Btn
          variant="soft"
          disabled={saved || survey.questions.length >= 20}
          onClick={() =>
            setSurvey({
              ...survey,
              questions: [
                ...survey.questions,
                { id: crypto.randomUUID(), label: "", type: "TEXT", required: false, options: [] },
              ],
            })
          }
        >
          <Plus className="h-4 w-4" />
          Agregar pregunta
        </Btn>
        <Btn disabled={busy || saved} onClick={() => void save()}>
          <Save className="h-4 w-4" />
          Guardar borrador
        </Btn>
      </div>
      {saved && (
        <Link
          className="mt-4 block font-bold text-primary"
          to="/admin/$"
          params={{ _splat: `encuestas/${survey.id}` }}
        >
          Abrir encuesta guardada
        </Link>
      )}
    </>
  );
}
export function CustomerSurvey({ id }: { id: string }) {
  const { workspace, demo, officialItems } = useQualityWorkspace();
  const run = useServerFn(executeOfficialQuality);
  const [busy,setBusy]=useState(false);
  const uid = useVF((s) => s.userId);
  const pets = useVF((s) => s.pets);
  const roles = useVF((s) => s.roles);
  const survey = workspace.surveys.find((s) => s.id === id);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [done, setDone] = useState(false);
  const invitation=officialItems.find(i=>i.kind==='invitation' && (i.payload as Record<string,unknown>)['surveyId']===id && i.state==='OPEN');
  if (!demo && workspace.responses.some(r=>r.surveyId===id && r.customerId===uid)) return <><PageTitle title="Mi experiencia" /><p role="status" className="py-6">Gracias; tu respuesta quedó registrada.</p></>;
  if (!demo && !invitation)
    return (
      <>
        <PageTitle title="Tu experiencia con Vet Life" />
        <PendingAuthority />
        <Empty title="Encuesta no disponible mediante un enlace autorizado" />
      </>
    );
  if (!survey || survey.state !== "PUBLISHED") return <Empty title="Encuesta no publicada" />;
  const q = survey.questions[index];
  if (!q) return <Empty title="Sin pregunta disponible" />;
  const submit = async () => {
    const response: SurveyResponse = {
      id: crypto.randomUUID(),
      surveyId: id,
      surveyVersion: survey.version,
      customerId: uid ?? "demo-family",
      eventId: demo ? "demo-visit-event" : String((invitation?.payload as Record<string,unknown>)['eventId']),
      at: new Date().toISOString(),
      answers,
    };
    const error = validateSurveyResponse(survey, response);
    if (error) {
      toast.error("Completa las respuestas obligatorias con valores válidos");
      return;
    }
    if (
      workspace.responses.some(
        (r) =>
          r.surveyId === id &&
          r.customerId === response.customerId &&
          r.eventId === response.eventId,
      )
    ) {
      toast.error("Este evento ya tiene una respuesta de prueba");
      return;
    }
    if(demo){updateQualityDemo((w) => ({ ...w, responses: [...w.responses, response] }));setDone(true);return;}
    if(!invitation||busy)return;
    setBusy(true);try{await run({data:{action:'respond',kind:'response',entityId:response.id,expectedVersion:0,idempotencyKey:`response:${invitation.id}`,reason:'Respuesta voluntaria de la familia en el portal',payload:{invitationId:invitation.id,answers}}});setDone(true);toast.success('Respuesta registrada');}catch(e){toast.error(e instanceof Error?e.message:'No se confirmó la respuesta');}finally{setBusy(false);}
  };
  return (
    <>
      <PageTitle title="Tu experiencia con Vet Life" />
      {pets[0] && (
        <img
          src={pets[0].photo}
          alt={pets[0].name}
          className="mb-4 h-28 w-28 rounded-2xl object-cover"
        />
      )}
      <p className="mb-4 text-sm text-muted-foreground">
        Encuesta voluntaria {demo ? "de demostración" : "del portal"} · {survey.title}
      </p>
      {done ? (
        <p role="status" className="text-lg font-bold">
          Gracias por compartir tu experiencia{demo ? " de prueba" : ""}.
        </p>
      ) : (
        <>
          <p className="mb-2 text-xs text-muted-foreground">
            {index + 1} de {survey.questions.length}
          </p>
          <h2 className="mb-4 text-2xl font-bold">{q.label}</h2>
          {["CSAT", "NPS"].includes(q.type) ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {Array.from(
                { length: q.type === "NPS" ? 11 : 5 },
                (_, i) => i + (q.type === "NPS" ? 0 : 1),
              ).map((n) => (
                <Btn
                  className="min-h-12"
                  variant={answers[q.id] === n ? "primary" : "soft"}
                  aria-pressed={answers[q.id] === n}
                  key={n}
                  onClick={() => setAnswers({ ...answers, [q.id]: n })}
                >
                  {n}
                </Btn>
              ))}
            </div>
          ) : q.type === "CHOICE" ? (
            <div className="space-y-2">
              {q.options.map((option) => (
                <Btn
                  key={option}
                  className="w-full"
                  aria-pressed={answers[q.id] === option}
                  variant={answers[q.id] === option ? "primary" : "soft"}
                  onClick={() => setAnswers({ ...answers, [q.id]: option })}
                >
                  {option}
                </Btn>
              ))}
            </div>
          ) : (
            <textarea
              aria-label="Tu comentario"
              className={inputClass}
              rows={4}
              value={String(answers[q.id] ?? "")}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            />
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            <Btn variant="soft" disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
              Anterior
            </Btn>
            {index < survey.questions.length - 1 ? (
              <Btn onClick={() => setIndex((i) => i + 1)}>Siguiente</Btn>
            ) : (
              <Btn disabled={busy} onClick={()=>void submit()}>{demo ? "Enviar respuesta de prueba" : "Enviar mi respuesta"}</Btn>
            )}
          </div>
        </>
      )}
      {!roles.includes("cliente") && (
        <p className="mt-3 text-xs text-muted-foreground">
          Vista previa sintética para el equipo; no es una respuesta real del cliente.
        </p>
      )}
    </>
  );
}
