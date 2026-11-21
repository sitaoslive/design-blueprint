import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "@/lib/vf/db";
import { ACCOUNT_PROFILES, accountProfile, type AccountProfileId } from "@/lib/vf/roles";
import { useVF, actions } from "@/lib/vf/store";
import { PageTitle, Card, Empty, Btn } from "../ui";
import { PermissionDenied } from "../shared";

type Row = { id: string; display_name: string; roles: string[] };

export function UsersPage({ targetId }: { targetId?: string } = {}) {
  const me = useVF((s) => s.userId);
  const mine = useVF((s) => s.roles);
  const authorized = mine.some((role) => role === "luis" || role === "administrador");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [selected, setSelected] = useState<Record<string, AccountProfileId>>({});
  const load = async () => {
    const [{ data: p }, { data: r }] = await Promise.all([
      db.from("profiles").select("id, display_name").order("created_at"),
      db.from("user_roles").select("user_id, role"),
    ]);
    const roles = (r ?? []) as { user_id: string; role: string }[];
    setRows(
      ((p ?? []) as { id: string; display_name: string }[]).map((x) => ({
        ...x,
        roles: roles.filter((y) => y.user_id === x.id).map((y) => y.role),
      })),
    );
  };
  useEffect(() => {
    setRows(null);
    if (authorized) void load().catch(() => setError("No se pudieron cargar las cuentas"));
  }, [me, authorized]);
  const assign = async (u: Row, profile: AccountProfileId) => {
    if (
      u.id === me ||
      !window.confirm(
        `¿Asignar el perfil ${ACCOUNT_PROFILES.find((p) => p.id === profile)?.label} a ${u.display_name}?`,
      )
    )
      return;
    if (me?.startsWith("demo-")) {
      toast.info("La demo no cambia permisos de cuentas reales");
      return;
    }
    setBusy(u.id);
    try {
      const { error: failure, data } = await db.rpc("set_account_profile", {
        _user_id: u.id,
        _profile: profile,
      });
      if (failure || !data) {
        toast.error("No se pudo asignar el perfil: " + (failure?.message ?? "Sin confirmación"));
        return;
      }
      await load();
      toast.success("Perfil asignado y verificado");
    } catch {
      toast.error("No se pudo guardar el perfil");
    } finally {
      setBusy(null);
    }
  };
  if (!authorized) return <PermissionDenied />;
  return (
    <>
      <PageTitle title="Usuarios y permisos" subtitle="Asigna los perfiles de cada persona" />
      {error && <p role="alert">{error}</p>}
      {rows === null ? (
        <p className="text-muted-foreground">Cargando…</p>
      ) : rows.length === 0 ? (
        <Empty title="Sin usuarios" />
      ) : (
        <div className="space-y-3">
          {rows
            .filter((u) => !targetId || u.id === targetId)
            .map((u) => (
              <Card key={u.id}>
                <b className="text-lg">{u.display_name || "Sin nombre"}</b>
                {u.id === me && <span className="ml-2 text-sm text-muted-foreground">(tú)</span>}
                <p className="mt-1 text-sm text-muted-foreground">
                  {ACCOUNT_PROFILES.find((p) => p.id === accountProfile(u.roles))?.label ??
                    "Perfil histórico"}
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <select
                    aria-label={`Perfil de ${u.display_name}`}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-background p-3"
                    disabled={
                      u.id === me ||
                      busy === u.id ||
                      (u.roles.includes("luis") && !mine.includes("luis"))
                    }
                    value={selected[u.id] ?? accountProfile(u.roles) ?? "cliente"}
                    onChange={(e) => {
                      const profile = ACCOUNT_PROFILES.find((p) => p.id === e.target.value);
                      if (profile) setSelected({ ...selected, [u.id]: profile.id });
                    }}
                  >
                    {ACCOUNT_PROFILES.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        disabled={p.id === "luis" && !mine.includes("luis")}
                      >
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <Btn
                    disabled={
                      u.id === me ||
                      busy === u.id ||
                      (u.roles.includes("luis") && !mine.includes("luis"))
                    }
                    onClick={() =>
                      void assign(u, selected[u.id] ?? accountProfile(u.roles) ?? "cliente")
                    }
                  >
                    Asignar perfil
                  </Btn>
                </div>
              </Card>
            ))}
        </div>
      )}
      <p className="mt-4 text-sm text-muted-foreground">
        Las cuentas nuevas comienzan como Cliente. Luis conserva Dueño y Veterinario. Los perfiles
        históricos no se eliminan.
      </p>
    </>
  );
}

const STATES = ["NO CONFIGURADA", "PREPARADA", "CONECTADA", "EN PRUEBAS", "VERIFICADA", "ERROR"];
export function IntegrationsPage() {
  const list = useVF((s) => s.integrations);
  const roles = useVF((s) => s.roles);
  const canEdit = roles.includes("luis") || roles.includes("administrador");
  return (
    <>
      <PageTitle title="Integraciones" subtitle="Estado real de cada conexión" />
      <div className="space-y-2">
        {list.map((i) => (
          <Card key={i.id}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <b>{i.name}</b>
                <p className="text-muted-foreground">{i.purpose}</p>
                {i.note && <p className="text-sm text-muted-foreground">{i.note}</p>}
              </div>
              {canEdit ? (
                <select
                  aria-label={`Estado de ${i.name}`}
                  value={i.status}
                  onChange={(e) => actions.setIntegration(i.id, e.target.value)}
                  className="rounded-full bg-accent px-3 py-1.5 text-sm font-bold"
                >
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <span className="rounded-full bg-accent px-3 py-1.5 text-sm font-bold">
                  {i.status}
                </span>
              )}
            </div>
          </Card>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Marca CONECTADA o VERIFICADA solo con evidencia real.
      </p>
    </>
  );
}
