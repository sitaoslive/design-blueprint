import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Save, Search } from "lucide-react";
import { db } from "@/lib/vf/db";
import { useVF, refreshVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn } from "@/components/vf/ui";
import { useQualitySources } from "../adapters/sources";
import { useQualityWorkspace, saveQualityDraft, requestCustomerHelp } from "../application/service";
import { canOpenQualityPath, canPersistDraft } from "../application/access";
import { OfficialActions } from "../components/OfficialActions";
import { PromoteDraft, CustomerQuality, StandardsEditor } from "./Official";
import {
  EducationSchema,
  approvedEducation,
  evaluateCommunicationEligibility,
  purposeLabels,
  Purposes,
  customerHealth,
  evaluateRecoveryActions,
  type EducationArticle,
  type ContactContext,
  type ConsentPurpose,
} from "../domain";
import {
  QualityNav,
  inputClass,
  PendingAuthority,
  UnavailableAction,
  SourceDate,
} from "../components/shared";

type Memory = {
  id: string;
  client_id: string;
  kind: string;
  validation: string;
  source: string;
  sensitivity: string;
  consent: string | null;
  valid_until: string | null;
  last_confirmed_at: string | null;
};
type Settings = {
  user_id: string;
  preferences: Record<string, unknown>;
  consents: Record<string, unknown>;
};
type Suppression = { contact_phone: string; reason: string; active: boolean };
function useContactFacts(id: string) {
  const uid = useVF((s) => s.userId);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [memory, setMemory] = useState<Memory[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setSettings(null);
    setMemory([]);
    if (!id) return;
    void Promise.all([
      db
        .from("client_settings")
        .select("user_id,preferences,consents")
        .eq("user_id", id)
        .maybeSingle(),
      db
        .from("customer_memory")
        .select(
          "id,client_id,kind,validation,source,sensitivity,consent,valid_until,last_confirmed_at",
        )
        .eq("client_id", id),
    ]).then(([s, m]) => {
      if (!active) return;
      if (s.error || m.error) setError(s.error?.message ?? m.error?.message);
      else {
        setSettings(s.data);
        setMemory(m.data ?? []);
        setError("");
      }
    });
    return () => {
      active = false;
    };
  }, [id, uid]);
  return { settings, memory, error };
}
function FamilySelect({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  const pets = useVF((s) => s.pets);
  const demo = useVF((s) => s.userId?.startsWith("demo-"));
  const families = Array.from(
    new Map(pets.map((p) => [p.ownerId || (demo ? "demo-family" : ""), p.owner])).entries(),
  ).filter(([id]) => id);
  return (
    <label className="mb-4 block">
      Familia
      <select
        className={inputClass}
        aria-label="Familia"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Selecciona</option>
        {families.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Eligibility({ consentOnly = false }: { consentOnly?: boolean }) {
  const { officialItems } = useQualityWorkspace();
  const roles = useVF((s) => s.roles);
  const demo = useVF((s) => s.userId?.startsWith("demo-"));
  const [family, setFamily] = useState("");
  const facts = useContactFacts(family);
  const [purpose, setPurpose] = useState<ConsentPurpose>("review");
  const [ctx, setCtx] = useState<ContactContext>({
    customerId: "demo-family",
    identityVerified: false,
    purpose: "review",
    channel: "whatsapp",
    consent: "UNKNOWN",
    consentSource: "",
    optOut: false,
    griefAuthorized: false,
    sensitiveComplaint: false,
    informationVerified: false,
    relevantEvent: false,
    necessaryOperational: false,
    eventAlreadyContacted: false,
    contactsInPeriod: 0,
    maxInPeriod: null,
    lastContactAt: null,
    minimumIntervalMinutes: null,
    now: "",
  });
  const decision = evaluateCommunicationEligibility({
    ...ctx,
    customerId: family,
    purpose,
    now: new Date().toISOString(),
  });
  return (
    <>
      <PageTitle title={consentOnly ? "Permisos por finalidad" : "Elegibilidad y frecuencia"} />
      <QualityNav />
      <FamilySelect value={family} onChange={setFamily} />
      {facts.error && <p role="alert">{facts.error}</p>}
      {consentOnly ? (
        <>
          {Purposes.map((p) => (
            <div key={p} className="mb-3 border-b border-border py-3">
              <b>{purposeLabels[p]}</b>
              <p className="text-sm">
                {officialItems.filter(i=>i.kind==='consent'&&i.owner_id===family&&(i.payload as Record<string,unknown>)['purpose']===p).map(i=>`${String((i.payload as Record<string,unknown>)['channel'])}: ${i.state} · versión ${i.version}`).join(' / ') || "Sin autorización específica registrada"}
              </p>
            </div>
          ))}
          <SectionTitle>Preferencias existentes</SectionTitle>
          {facts.settings ? (
            Object.entries(facts.settings.preferences).map(([key, value]) => (
              <p key={key} className="mb-2 break-words text-sm">
                {key} ·{" "}
                {typeof value === "boolean" ? (value ? "Activada" : "Desactivada") : "Registrada"}
              </p>
            ))
          ) : (
            <Empty title="Sin preferencias disponibles para esta familia" />
          )}
          <p className="my-3 text-sm text-muted-foreground">
            Una preferencia o autorización operativa no constituye permiso general para promociones.
          </p>
          {canOpenQualityPath("/app/notificaciones/preferencias", roles) && <Link
            to="/app/$"
            params={{ _splat: "notificaciones/preferencias" }}
            className="font-bold text-primary"
          >
            Preferencias de mi cuenta
          </Link>}
        </>
      ) : (
        <>
          <label className="block">
            Finalidad
            <select
              className={inputClass}
              value={purpose}
              onChange={(e) => setPurpose(e.target.value as ConsentPurpose)}
            >
              {Purposes.map((p) => (
                <option key={p} value={p}>
                  {purposeLabels[p]}
                </option>
              ))}
            </select>
          </label>
          {demo ? (
            <fieldset className="my-4 space-y-3">
              <legend className="mb-3 text-sm font-bold">
                Evaluación sintética · no guarda consentimientos reales
              </legend>
              {(
                [
                  ["identityVerified", "Identidad verificada"],
                  ["informationVerified", "Información verificada"],
                  ["relevantEvent", "Evento pertinente"],
                  ["optOut", "Baja solicitada"],
                  ["griefAuthorized", "Duelo autorizado"],
                  ["sensitiveComplaint", "Queja sensible abierta"],
                  ["eventAlreadyContacted", "Evento ya contactado"],
                  ["necessaryOperational", "Comunicación operativa necesaria"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={ctx[key]}
                    onChange={(e) => setCtx({ ...ctx, [key]: e.target.checked })}
                  />
                  {label}
                </label>
              ))}
              <label className="block">
                Autorización de prueba
                <select
                  className={inputClass}
                  value={ctx.consent}
                  onChange={(e) =>
                    setCtx({
                      ...ctx,
                      consent: e.target.value as ContactContext["consent"],
                      consentSource:
                        e.target.value === "GRANTED" ? "Fuente sintética explícita" : "",
                    })
                  }
                >
                  <option value="UNKNOWN">Desconocida</option>
                  <option value="GRANTED">Otorgada (sintética)</option>
                  <option value="REVOKED">Revocada</option>
                </select>
              </label>
              <label className="block">
                Mensajes en el periodo
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={ctx.contactsInPeriod}
                  onChange={(e) => setCtx({ ...ctx, contactsInPeriod: Number(e.target.value) })}
                />
              </label>
              <label className="block">
                Límite de prueba
                <input
                  type="number"
                  min="0"
                  className={inputClass}
                  value={ctx.maxInPeriod ?? ""}
                  onChange={(e) =>
                    setCtx({ ...ctx, maxInPeriod: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </label>
            </fieldset>
          ) : (
            <PendingAuthority />
          )}
          <div role="status" className="my-4 border-l-2 border-primary pl-3">
            <b>
              {
                {
                  ELIGIBLE: "Elegible para revisión previa",
                  REQUIRES_REVIEW: "Requiere revisión",
                  SUPPRESSED: "Contacto suprimido",
                  NOT_AUTHORIZED: "Sin autorización",
                  DATA_INCOMPLETE: "Datos insuficientes",
                }[decision.status]
              }
            </b>
            <p className="text-sm">{decision.reason}</p>
          </div>
          <UnavailableAction label="Solicitar evaluación autorizada" />
        </>
      )}
    </>
  );
}
export function FamilyExperience({ id = "" }: { id?: string }) {
  const roles = useVF((s) => s.roles);
  const [family, setFamily] = useState(id);
  const pets = useVF((s) => s.pets);
  const visits = useVF((s) => s.visits);
  const { sources, conversations } = useQualitySources();
  const { workspace } = useQualityWorkspace();
  const facts = useContactFacts(family);
  const mine = pets.filter((p) => (p.ownerId || "demo-family") === family);
  const petIds = new Set(mine.map((p) => p.id));
  const current = visits.filter((v) => petIds.has(v.petId));
  const complaints = workspace.complaints.filter(
    (c) => c.customerId === family && c.state !== "CLOSED",
  );
  const chats = conversations.filter((c) => c.owner_id === family);
  const relevant = sources.filter(
    (s) => current.some((v) => v.id === s.id) || chats.some((c) => c.id === s.id),
  );
  const health = customerHealth({
    restricted: facts.memory.some((m) => m.sensitivity !== "normal" && m.validation === "validada"),
    complaints: complaints.length,
    overdue: relevant.filter((s) => s.dueAt && Date.parse(s.dueAt) < Date.now()).length,
    pending: relevant.length,
    sources: mine.length,
  });
  return (
    <>
      <PageTitle title="Experiencia de la familia" />
      <QualityNav />
      <FamilySelect value={family} onChange={setFamily} />
      {family && (
        <>
          <p className="my-4 text-xl font-bold">{health}</p>
          <div className="flex flex-wrap gap-3">
            {mine.map((p) => (
              <div key={p.id}>
                <img src={p.photo} alt={p.name} className="h-20 w-20 rounded-xl object-cover" />
                <b>{p.name}</b>
              </div>
            ))}
          </div>
          <SectionTitle>Recorrido registrado</SectionTitle>
          {current.map((v) => (
            <div key={v.id} className="mb-3 border-b border-border py-3">
              <b>
                {v.service} · {v.status}
              </b>
              <p>
                {v.date} {v.time}
              </p>
              <SourceDate source={`visits / ${v.id}`} />
              <Link
                className="mt-2 block font-bold text-primary"
                to="/coordinacion/cita/$id"
                params={{ id: v.id }}
              >
                Abrir cita
              </Link>
            </div>
          ))}
          <SectionTitle>Continuidad</SectionTitle>
          <p>Quejas disponibles: {complaints.length}</p>
          <p>Conversaciones vinculadas: {chats.length}</p>
          <p>Memoria autorizada: {facts.memory.length} referencias</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Las fechas no registradas no se reconstruyen. Sin inferencias emocionales ni
            segmentación clínica o comercial.
          </p>
          {canPersistDraft(roles) && <Link
            className="mt-3 block font-bold text-primary"
            to="/admin/$"
            params={{ _splat: "customer-memory" }}
          >
            Abrir memoria existente
          </Link>}
        </>
      )}
    </>
  );
}
export function LoyaltyHome() {
  return (
    <>
      <PageTitle title="Relación y continuidad" />
      <QualityNav />
      {[
        ["recordatorios", "Controles profesionales"],
        ["resenas", "Reseñas voluntarias"],
        ["referidos", "Referidos voluntarios"],
        ["recuperacion", "Recuperación administrativa"],
        ["consentimientos", "Consentimientos"],
        ["frecuencia", "Frecuencia de contacto"],
        ["instagram", "Origen de solicitudes"],
        ["marca", "Experiencia de marca"],
        ["testimonios", "Autorizaciones de testimonios"],
      ].map(([slug, title]) => (
        <Link
          key={slug}
          className="mb-3 block border-b border-border py-3 font-bold text-primary"
          to="/operaciones/$"
          params={{ _splat: `fidelizacion/${slug}` }}
        >
          {title}
        </Link>
      ))}
    </>
  );
}
export function Recovery() {
  const roles = useVF((s) => s.roles);
  const { sources } = useQualitySources();
  const opportunities = sources
    .filter((s) => ["Solicitud", "Cita sin confirmar", "Compromiso"].includes(s.category))
    .filter((s) => evaluateRecoveryActions(s).status !== "EXCLUDED");
  return (
    <>
      <PageTitle title="Recuperación administrativa" />
      <QualityNav />
      {opportunities.map((s) => (
        <Card key={`${s.source}:${s.id}`} className="mb-3">
          <b>{s.category}</b>
          <p>{evaluateRecoveryActions(s).action}</p>
          <SourceDate source={`${s.source}/${s.id}`} at={s.updatedAt} />
          <Link to={s.href as never} className="mt-2 block font-bold text-primary">
            Revisar solicitud original
          </Link>
        </Card>
      ))}
      {!opportunities.length && <Empty title="Sin oportunidades registradas" />}
      <p className="text-sm text-muted-foreground">
        No se envían disculpas ni se prometen compensaciones. Los casos cancelados a petición del
        cliente no se reactivan.
      </p>
      {canPersistDraft(roles) && <Link
        className="mt-3 block font-bold text-primary"
        to="/direccion/$"
        params={{ _splat: "finanzas/ajustes/nuevo" }}
      >
        Solicitar revisión de cobro o compensación
      </Link>}
    </>
  );
}
export function Reviews({
  referrals = false,
  testimonials = false,
}: {
  referrals?: boolean;
  testimonials?: boolean;
}) {
  return (
    <>
      <PageTitle
        title={
          testimonials
            ? "Autorización de testimonios"
            : referrals
              ? "Referidos voluntarios"
              : "Reseñas voluntarias"
        }
      />
      <QualityNav />
      <p className="mb-4">
        {testimonials
          ? "Una reseña pública no autoriza su uso publicitario ni el de fotografías de personas o mascotas."
          : referrals
            ? "Compartir debe ser iniciativa de la familia. Un contacto proporcionado por otra persona no autoriza mensajes promocionales."
            : "Gracias por confiar en Vet Life. Si deseas compartir tu experiencia, puedes hacerlo aquí. Tu opinión nos ayuda a mejorar."}
      </p>
      {!referrals && !testimonials && (
        <p className="text-sm text-muted-foreground">
          No se filtra por satisfacción ni se condicionan recompensas a opiniones favorables.
        </p>
      )}
      <PendingAuthority />
      <Link
        to="/operaciones/$"
        params={{ _splat: "fidelizacion/frecuencia" }}
        className="my-4 block font-bold text-primary"
      >
        Revisar elegibilidad y restricciones
      </Link>
      <UnavailableAction
        label={
          testimonials
            ? "Registrar autorización específica"
            : referrals
              ? "Consultar programa autorizado"
              : "Preparar solicitud autorizada"
        }
      />
      <SectionTitle>Historial autorizado</SectionTitle>
      <Empty title="Sin solicitudes ni autorizaciones conectadas" />
    </>
  );
}
export function Preventive() {
  const treatments = useVF((s) => s.treatments);
  return (
    <>
      <PageTitle title="Controles profesionales" />
      <QualityNav />
      {treatments.map((t) => (
        <Card key={t.id} className="mb-3">
          <b>
            {t.pet} · {t.plan}
          </b>
          <p>Profesional: {t.responsible}</p>
          <p>
            {t.done} de {t.total} registros
          </p>
          <p className="my-2 text-sm text-muted-foreground">
            Sin fecha de próximo control y vigencia profesional verificables; no se declara vencido
            ni se genera un recordatorio.
          </p>
          <SourceDate source={`treatments/${t.id}`} />
        </Card>
      ))}
      {!treatments.length && <Empty title="Sin planes profesionales visibles" />}
      <Link
        to="/luis/$modulo"
        params={{ modulo: "recordatorios" }}
        className="font-bold text-primary"
      >
        Abrir recordatorios de especialistas existentes
      </Link>
    </>
  );
}
export function Attribution() {
  const requests = useVF((s) => s.requests);
  return (
    <>
      <PageTitle title="Origen de solicitudes" />
      <QualityNav />
      {requests.map((r) => (
        <div key={r.id} className="mb-3 border-b border-border py-3">
          <b>{r.channel}</b>
          <p className="text-sm">Solicitud {r.id} · Origen de Instagram o campaña: desconocido</p>
        </div>
      ))}
      <PendingAuthority />
      <p className="text-sm text-muted-foreground">
        No se atribuyen citas a Instagram sin identificadores y eventos autorizados.
      </p>
    </>
  );
}
export function SensitiveContext() {
  return (
    <>
      <PageTitle title="Protección de contexto sensible" />
      <QualityNav />
      <p>
        Promociones, solicitudes de reseñas, referidos y reactivaciones comerciales quedan
        suprimidos cuando existe duelo autorizado.
      </p>
      <p className="my-3 text-sm text-muted-foreground">
        Una frase aislada no crea una etiqueta permanente. Las comunicaciones necesarias mantienen
        su finalidad y autorización.
      </p>
      <Link to="/admin/$" params={{ _splat: "customer-memory" }} className="font-bold text-primary">
        Revisar en la memoria existente
      </Link>
      <PendingAuthority />
    </>
  );
}
export function BrandStandards() {
  return (
    <>
      <PageTitle title="Estándares de experiencia" />
      <QualityNav />
      {[
        "Identificarse y saludar con respeto",
        "Verificar hechos antes de prometer una solución",
        "Asignar responsable y fecha al compromiso",
        "Comunicar cambios sin afirmar confirmación pendiente",
        "Solicitar revisión profesional ante cuestiones clínicas",
        "Cerrar con evidencia, conservando la posibilidad de reapertura",
      ].map((s) => (
        <p key={s} className="border-b border-border py-4">
          {s}
        </p>
      ))}
      <p className="my-3 text-sm text-muted-foreground">
        Propuesta de estándares; aprobación y versión organizacional pendientes.
      </p>
      <StandardsEditor />
    </>
  );
}

type ArticleRow = {
  id: string;
  title: string;
  category: string;
  content: string;
  source: string;
  status: string;
  approved_by: string | null;
  reviewed_at: string | null;
  valid_until: string | null;
  version: number;
};
export function Education({
  create = false,
  client = false,
  id = "",
}: {
  create?: boolean;
  client?: boolean;
  id?: string;
}) {
  const { workspace, demo, reload, officialItems } = useQualityWorkspace();
  const uid = useVF((s) => s.userId);
  const [articles, setArticles] = useState<ArticleRow[]>([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [a, setA] = useState<EducationArticle>(() => ({
    id: crypto.randomUUID(),
    title: "",
    category: "Preparación",
    body: "",
    source: "",
    clinical: false,
    reviewer: "",
    reviewedAt: "",
    validUntil: "",
    version: 1,
    state: "DRAFT",
  }));
  useEffect(() => {
    let active = true;
    void db
      .from("knowledge_articles")
      .select("*")
      .eq("status", "APPROVED")
      .then((r: { data: ArticleRow[] | null; error: { message: string } | null }) => {
        if (!active) return;
        if (r.error) setError(r.error.message);
        else setArticles(r.data ?? []);
      });
    return () => {
      active = false;
    };
  }, [uid]);
  const save = async () => {
    const p = EducationSchema.safeParse(a);
    if (!p.success) {
      toast.error(p.error.issues[0]?.message ?? "Completa el artículo");
      return;
    }
    setBusy(true);
    try {
      await saveQualityDraft("education", a);
      reload();
      toast.success(
        demo ? "Contenido sintético guardado" : "Borrador reservado guardado; no publicado",
      );
      setA((x) => ({ ...x, id: crypto.randomUUID(), title: "", body: "", source: "" }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  const approved = articles
    .map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      body: r.content,
      source: r.source,
      clinical: true,
      reviewer: r.approved_by ?? "",
      reviewedAt: r.reviewed_at ?? "",
      validUntil: r.valid_until ?? "",
      version: r.version,
      state: "PUBLISHED" as const,
    }))
    .filter((a) => approvedEducation(a, new Date().toISOString()));
  const rows = (client ? [...approved, ...workspace.education.filter(a=>approvedEducation(a,new Date().toISOString()))] : [...approved, ...workspace.education]).filter(
    (a) =>
      (!id || a.id === id) && `${a.title} ${a.category}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title={
          client
            ? "Biblioteca de Vet Life"
            : create
              ? "Nuevo contenido educativo"
              : "Contenido educativo"
        }
      />
      {!client && <QualityNav />}
      {create ? (
        <div className="space-y-3">
          {(
            [
              ["title", "Título"],
              ["category", "Categoría"],
              ["source", "Fuente"],
            ] as const
          ).map(([key, label]) => (
            <label className="block" key={key}>
              {label}
              <input
                className={inputClass}
                value={a[key]}
                onChange={(e) => setA({ ...a, [key]: e.target.value })}
              />
            </label>
          ))}
          <label className="block">
            Contenido
            <textarea
              className={inputClass}
              rows={6}
              value={a.body}
              onChange={(e) => setA({ ...a, body: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={a.clinical}
              onChange={(e) => setA({ ...a, clinical: e.target.checked })}
            />
            Incluye información veterinaria; necesita revisión profesional
          </label>
          <Btn disabled={busy} onClick={() => void save()}>
            <Save className="h-4 w-4" />
            Guardar borrador
          </Btn>
          <PendingAuthority draft />
        </div>
      ) : (
        <>
          <label className="block">
            <span className="inline-flex items-center gap-1">
              <Search className="h-4 w-4" />
              Buscar contenido
            </span>
            <input className={inputClass} value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {!client && (
            <Link
              to="/admin/$"
              params={{ _splat: "contenido-educativo/nuevo" }}
              className="my-4 block font-bold text-primary"
            >
              Nuevo borrador
            </Link>
          )}
          {error && <p role="alert">{error}</p>}
          {rows.map((a) => (
            <article key={a.id} className="mt-4 border-b border-border pb-4">
              <h2 className="text-xl font-bold">{a.title}</h2>
              <p className="text-xs text-primary">
                {a.category} · Versión {a.version} ·{" "}
                {a.state === "PUBLISHED"
                  ? "Información aprobada y vigente"
                  : "Borrador sin aprobación"}
              </p>
              <p className="mt-2 whitespace-pre-wrap">{a.body}</p>
              <SourceDate source={a.source} at={a.reviewedAt} />
              {!client&&!demo&&(()=>{const item=officialItems.find(i=>i.id===a.id);return item?<OfficialActions key={item.version} item={item} />:<PromoteDraft kind="education" draft={a} />;})()}
              {demo&&a.state!=="PUBLISHED"&&<UnavailableAction label="Solicitar revisión profesional" />}
            </article>
          ))}
          {!rows.length && (
            <Empty
              title={
                client
                  ? "Sin contenido revisado y vigente disponible"
                  : "Sin artículos en esta vista"
              }
            />
          )}
        </>
      )}
    </>
  );
}
export function CustomerHelp() {
  const pets = useVF((s) => s.pets);
  const uid = useVF((s) => s.userId);
  const [description, setDescription] = useState("");
  const [petId, setPetId] = useState("");
  const [key] = useState(() => crypto.randomUUID());
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const send = async () => {
    setBusy(true);
    try {
      const result = await requestCustomerHelp({ description, petId, idempotencyKey: key });
      setDone(true);
      if (result !== "DEMO_ONLY") await refreshVF();
      toast.success(
        result === "DEMO_ONLY"
          ? "Solicitud de prueba; no se envió al equipo real"
          : "Solicitud registrada para atención humana",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo enviar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title="Ayuda y contacto humano" />
      {done ? (
        <p role="status" className="my-4 font-bold">
          Tu solicitud {uid?.startsWith("demo-") ? "de prueba" : ""} quedó registrada. No equivale a
          una queja resuelta.
        </p>
      ) : (
        <div className="space-y-3">
          <label className="block">
            Mascota
            <select aria-label="Mascota" className={inputClass} value={petId} onChange={(e) => setPetId(e.target.value)}>
              <option value="">Selecciona</option>
              {pets
                .filter((p) => p.ownerId === uid)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="block">
            ¿En qué podemos ayudarte?
            <textarea
              className={inputClass}
              rows={5}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </label>
          <Btn disabled={busy} onClick={() => void send()}>
            Solicitar contacto humano
          </Btn>
        </div>
      )}
      <SectionTitle>Mis solicitudes</SectionTitle>
      <CustomerQuality />
      {uid?.startsWith("demo-") && (
        <Link
          to="/app/$"
          params={{ _splat: "encuestas/demo-survey" }}
          className="mb-3 block font-bold text-primary"
        >
          Compartir mi experiencia (prueba)
        </Link>
      )}
      <Link to="/app/$" params={{ _splat: "ayuda/solicitudes" }} className="font-bold text-primary">
        Ver solicitudes y estado
      </Link>
      <Link
        to="/app/$"
        params={{ _splat: "notificaciones/preferencias" }}
        className="mt-3 block font-bold text-primary"
      >
        Preferencias de contacto
      </Link>
    </>
  );
}
