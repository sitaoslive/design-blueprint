import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Stethoscope, Save } from "lucide-react";
import { db } from "@/lib/vf/db";
import { getVF, useVF } from "@/lib/vf/store";
import { PageTitle, SectionTitle, Card, Empty, Btn, Chips } from "@/components/vf/ui";
import {
  ProfileSchema,
  emptyProfile,
  credentialStatus,
  CREDENTIAL_LABEL,
  CONNECTION_LABEL,
  WindowSchema,
  validateWindow,
  windowState,
  compareSpecialists,
  connectionPolicy,
  type SpecialistProfile,
  type ReportedWindow,
} from "../domain/advanced";
import { checkedWrite } from "../application/gateway";
import { useReferralRows } from "./data";
const input = "w-full min-w-0 rounded-2xl border border-border bg-card p-3";
type Setting = { key: string; value: unknown };
type WindowRow = { id: string; data: unknown; ref_id: string; status: string };
export function useDirectoryData() {
  const settings = useReferralRows<Setting>("org_settings");
  const windows = useReferralRows<WindowRow>("records", "kind", "specialist_window");
  const profiles: Record<string, SpecialistProfile> = {};
  for (const r of settings.rows ?? []) {
    if (!r.key.startsWith("specialist-profile:")) continue;
    const p = ProfileSchema.safeParse(r.value);
    if (p.success) profiles[r.key.slice("specialist-profile:".length)] = p.data;
  }
  const slots = (windows.rows ?? []).flatMap((r) => {
    const w = WindowSchema.safeParse(r.data);
    return w.success && r.status !== "cancelada" ? [w.data] : [];
  });
  return { profiles, slots, settings, windows };
}
export function referralBase(roles: string[]) {
  return roles.some((r) => ["luis", "administrador", "coordinador", "recepcion"].includes(r))
    ? "/operaciones"
    : "/equipo";
}
export function SpecialistDirectory({ comparison = false }: { comparison?: boolean }) {
  const specs = useVF((s) => s.specialists);
  const roles = useVF((s) => s.roles);
  const base = referralBase(roles);
  const data = useDirectoryData();
  const [q, setQ] = useState("");
  const [sp, setSp] = useState("");
  const [city, setCity] = useState("");
  const [verified, setVerified] = useState(false);
  const list = compareSpecialists(specs, data.profiles, data.slots, sp, city, new Date()).filter(
    (x) =>
      (!verified || x.eligible) &&
      `${x.specialist.name} ${x.specialist.specialty}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        title={comparison ? "Cobertura y especialistas de respaldo" : "Directorio de especialistas"}
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <input
          className={input}
          aria-label="Buscar especialista"
          placeholder="Buscar especialista"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className={input}
          aria-label="Especialidad"
          value={sp}
          onChange={(e) => setSp(e.target.value)}
        >
          <option value="">Todas las especialidades</option>
          {[...new Set(specs.map((s) => s.specialty))].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <input
          className={input}
          aria-label="Ciudad"
          placeholder="Ciudad"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={verified}
            onChange={(e) => setVerified(e.target.checked)}
          />
          Solo verificación vigente
        </label>
      </div>
      {data.settings.error && <p role="alert">{data.settings.error}</p>}
      {list.length ? (
        list.map((x) => (
          <Card key={x.specialist.id} className="mb-3">
            <div className="flex gap-3">
              <Stethoscope className="h-7 w-7 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <Link
                  className="font-bold text-primary"
                  to={`${base}/especialistas/${x.specialist.id}` as never}
                >
                  {x.specialist.name}
                </Link>
                <p>
                  {x.specialist.specialty} · {x.specialist.city}
                </p>
                <p className="text-sm">{x.profile.center || "Centro no registrado"}</p>
                <p className="text-sm font-bold">{CREDENTIAL_LABEL[x.credential]}</p>
                <p className="text-sm">{CONNECTION_LABEL[x.profile.mode]}</p>
                {comparison && (
                  <>
                    <p className="text-sm">{x.windows.length} ventanas informadas vigentes</p>
                    {x.warnings.map((w) => (
                      <p key={w} className="text-xs text-muted-foreground">
                        {w}
                      </p>
                    ))}
                  </>
                )}
              </div>
            </div>
          </Card>
        ))
      ) : (
        <Empty title="Sin especialistas que cumplan estos filtros" />
      )}
      <Link className="font-bold text-primary" to={`${base}/especialistas/respaldo` as never}>
        Comparar cobertura
      </Link>
    </>
  );
}
export function SpecialistProfilePage({
  id,
  initialTab = "resumen",
}: {
  id: string;
  initialTab?: string;
}) {
  const s = useVF((v) => v.specialists.find((x) => x.id === id));
  const roles = useVF((v) => v.roles);
  const base = referralBase(roles);
  const data = useDirectoryData();
  const [tab, setTab] = useState(initialTab);
  const [edit, setEdit] = useState<SpecialistProfile | null>(null);
  const [busy, setBusy] = useState(false);
  const [attest, setAttest] = useState(false);
  if (!s) return <Empty title="Especialista no encontrado" />;
  const p = edit ?? data.profiles[id] ?? emptyProfile();
  const state = credentialStatus(p.credential, new Date());
  const director = roles.some((r) => r === "luis" || r === "administrador");
  const update = (key: keyof Omit<SpecialistProfile, "credential">, value: string) =>
    setEdit({ ...p, [key]: value });
  const save = async () => {
    if (
      p.credential.state === "VERIFIED" &&
      (!attest ||
        !p.credential.reference.trim() ||
        !p.credential.expiresAt ||
        Date.parse(p.credential.expiresAt) <= Date.now())
    ) {
      toast.error("Registra referencia vigente y confirma la revisión documental");
      return;
    }
    setBusy(true);
    try {
      if (getVF().userId?.startsWith("demo-")) {
        toast.success("Cambios de demostración; no se guardan datos reales");
        return;
      }
      await checkedWrite(
        db
          .from("org_settings")
          .upsert({
            key: `specialist-profile:${id}`,
            value: {
              ...p,
              credential: {
                ...p.credential,
                reviewedAt: new Date().toISOString(),
                reviewedBy: getVF().userId,
              },
            },
            updated_by: getVF().userId,
          })
          .select("key"),
      );
      toast.success("Perfil actualizado");
      setEdit(null);
      await data.settings.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title={s.name} subtitle={`${s.specialty} · ${s.city}`} />
      <Chips
        value={tab}
        onChange={setTab}
        options={["resumen", "disponibilidad", "credenciales", "historial"].map((value) => ({
          value,
          label:
            {
              resumen: "Resumen",
              disponibilidad: "Disponibilidad",
              credenciales: "Credenciales",
              historial: "Remisiones",
            }[value] ?? value,
        }))}
      />
      {tab === "disponibilidad" ? (
        <ManualAvailability id={id} />
      ) : tab === "historial" ? (
        <SpecialistReferralList name={s.name} />
      ) : (
        <>
          <SectionTitle>
            {tab === "credenciales" ? "Revisión profesional" : "Datos del especialista"}
          </SectionTitle>
          <p className="mb-3 font-bold">{CREDENTIAL_LABEL[state]}</p>
          {tab === "resumen" && (
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                className={input}
                aria-label="Modalidad de conexión"
                disabled={!director}
                value={p.mode}
                onChange={(e) => update("mode", e.target.value)}
              >
                {Object.entries(CONNECTION_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
              {(
                [
                  ["center", "Centro"],
                  ["address", "Dirección"],
                  ["phone", "Teléfono"],
                  ["email", "Correo"],
                  ["contact", "Persona de contacto"],
                  ["zones", "Zonas"],
                  ["channel", "Canal de contacto"],
                  ["conditions", "Condiciones"],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="text-sm">
                  {label}
                  <input
                    className={input}
                    disabled={!director}
                    value={p[key]}
                    onChange={(e) => update(key, e.target.value)}
                  />
                </label>
              ))}
            </div>
          )}
          {tab === "credenciales" && (
            <div className="space-y-3">
              <label className="block">
                Estado documental
                <select
                  className={input}
                  disabled={!director}
                  aria-label="Estado documental"
                  value={p.credential.state}
                  onChange={(e) => {
                    const parsed = ProfileSchema.shape.credential.shape.state.safeParse(
                      e.target.value,
                    );
                    if (parsed.success)
                      setEdit({ ...p, credential: { ...p.credential, state: parsed.data } });
                  }}
                >
                  {Object.entries(CREDENTIAL_LABEL).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                Referencia del procedimiento de revisión
                <input
                  className={input}
                  disabled={!director}
                  aria-label="Referencia de verificación"
                  value={p.credential.reference}
                  onChange={(e) =>
                    setEdit({ ...p, credential: { ...p.credential, reference: e.target.value } })
                  }
                />
              </label>
              <label className="block">
                Vigente hasta
                <input
                  className={input}
                  type="datetime-local"
                  disabled={!director}
                  aria-label="Vigencia documental"
                  value={p.credential.expiresAt ? p.credential.expiresAt.slice(0, 16) : ""}
                  onChange={(e) =>
                    setEdit({
                      ...p,
                      credential: {
                        ...p.credential,
                        expiresAt: e.target.value
                          ? new Date(`${e.target.value}-05:00`).toISOString()
                          : "",
                      },
                    })
                  }
                />
              </label>
              {director && (
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={attest}
                    onChange={(e) => setAttest(e.target.checked)}
                  />
                  Revisé la documentación por el procedimiento autorizado
                </label>
              )}
              <p className="text-sm text-muted-foreground">
                {p.credential.reviewedAt
                  ? `Última revisión: ${new Date(p.credential.reviewedAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}`
                  : "Sin revisión registrada"}
              </p>
            </div>
          )}
          {director && (
            <Btn
              className="mt-4"
              disabled={busy || !data.settings.rows}
              onClick={() => void save()}
            >
              <Save className="h-4 w-4" />
              Guardar revisión
            </Btn>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {connectionPolicy(p.mode).source}. No hay calendario externo conectado.
          </p>
        </>
      )}
      <Link
        className="mt-5 block font-bold text-primary"
        to={`${base}/remisiones/nueva?especialista=${encodeURIComponent(s.name)}` as never}
      >
        Crear remisión
      </Link>
    </>
  );
}
function SpecialistReferralList({ name }: { name: string }) {
  const refs = useVF((s) => s.referrals.filter((r) => r.specialist === name));
  const roles = useVF((s) => s.roles);
  return (
    <>
      {refs.map((r) => (
        <Link
          key={r.id}
          className="mt-3 block font-bold text-primary"
          to={`${referralBase(roles)}/remisiones/${r.id}/gestion` as never}
        >
          {r.pet} · {r.specialty}
        </Link>
      ))}
      {!refs.length && <Empty title="Sin remisiones asignadas" />}
    </>
  );
}
export function ManualAvailability({ id }: { id: string }) {
  const data = useDirectoryData();
  const roles = useVF((s) => s.roles);
  const can = roles.some((r) => ["coordinador", "recepcion", "luis", "administrador"].includes(r));
  const [f, setF] = useState({
    date: "",
    start: "09:00",
    end: "12:00",
    duration: "30",
    capacity: "1",
    expiry: "",
    source: "",
    location: "",
    fee: "",
  });
  const [busy, setBusy] = useState(false);
  const save = async () => {
    const w: ReportedWindow = {
      specialistId: id,
      date: f.date,
      start: f.start,
      end: f.end,
      duration: Number(f.duration),
      capacity: Number(f.capacity),
      expiresAt: f.expiry ? new Date(`${f.expiry}-05:00`).toISOString() : "",
      source: f.source,
      location: f.location,
      fee: f.fee ? Number(f.fee) : null,
      timezone: "America/Bogota",
    };
    const error = validateWindow(w, new Date());
    if (error) {
      toast.error(error);
      return;
    }
    setBusy(true);
    try {
      if (getVF().userId?.startsWith("demo-")) {
        toast.success("Horario de demostración; no es una reserva");
        return;
      }
      await checkedWrite(
        db
          .from("records")
          .insert({
            kind: "specialist_window",
            scope: "staff",
            ref_id: id,
            title: `${f.date} ${f.start}–${f.end}`,
            detail: f.source,
            status: "informada",
            data: w,
            created_by: getVF().userId,
          })
          .select("id"),
      );
      await data.windows.reload();
      toast.success("Ventana informada registrada; falta confirmar el cupo");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo guardar");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <SectionTitle>Horarios comunicados</SectionTitle>
      {can && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["date", "Fecha", "date"],
              ["start", "Hora inicial", "time"],
              ["end", "Hora final", "time"],
              ["duration", "Duración (minutos)", "number"],
              ["capacity", "Capacidad informada", "number"],
              ["expiry", "Vence", "datetime-local"],
              ["source", "Quién informó y por qué canal", "text"],
              ["location", "Lugar", "text"],
              ["fee", "Tarifa informada COP (opcional)", "number"],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="text-sm">
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
            Registrar ventana
          </Btn>
        </div>
      )}
      {data.windows.error && <p role="alert">{data.windows.error}</p>}
      {data.slots
        .filter((w) => w.specialistId === id)
        .map((w, i) => (
          <Card key={i} className="mb-2">
            <b>
              {w.date} · {w.start}–{w.end}
            </b>
            <p>
              {w.location} · {w.duration} min · {w.capacity} cupos informados
            </p>
            <p className="text-sm">{w.source}</p>
            <p className="text-sm">
              {windowState(w, new Date()) === "EXPIRED"
                ? "Vencida"
                : w.capacity === 0
                  ? "Sin cupos informados"
                  : "Sujeto a confirmación del especialista"}
            </p>
            <p className="text-xs text-muted-foreground">
              America/Bogota · Vence{" "}
              {new Date(w.expiresAt).toLocaleString("es-CO", { timeZone: "America/Bogota" })}
            </p>
          </Card>
        ))}
      {!data.slots.some((w) => w.specialistId === id) && (
        <Empty title="Sin disponibilidad informada" />
      )}
    </>
  );
}
