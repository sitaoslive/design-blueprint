import { useEffect, useState } from "react";
import { Activity, CheckCircle2, RefreshCw, ShieldAlert } from "lucide-react";
import { db } from "@/lib/vf/db";
import { getVF, refreshVF, useVF } from "@/lib/vf/store";
import { Btn, PageTitle } from "@/components/vf/ui";
import { diagnoseSupport } from "./domain";

export function AutoSupport({ compact = false }: { compact?: boolean }) {
  const uid = useVF((state) => state.userId);
  const [online, setOnline] = useState(true);
  const [ownRead, setOwnRead] = useState<"ok" | "denied" | "unknown">("unknown");
  const [queueCount, setQueueCount] = useState(0);
  const [checking, setChecking] = useState(false);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const inspect = async (recover: boolean) => {
      const connected = navigator.onLine;
      setOnline(connected);
      setOwnRead("unknown");
      try {
        const rows: unknown = JSON.parse(
          localStorage.getItem(`vf-offline-queue:${uid ?? ""}`) ?? "[]",
        );
        setQueueCount(Array.isArray(rows) ? rows.length : 0);
      } catch {
        setQueueCount(0);
      }
      if (!uid || uid.startsWith("demo-") || !connected) {
        setCheckedAt(new Date().toLocaleTimeString("es-CO"));
        return;
      }
      setChecking(true);
      try {
        const result = await db.from("profiles").select("id").eq("id", uid).maybeSingle();
        if (!active || getVF().userId !== uid) return;
        setOwnRead(!result.error && result.data?.id === uid ? "ok" : "denied");
        if (recover && !result.error && result.data?.id === uid) await refreshVF();
      } catch {
        if (active) setOwnRead("unknown");
      } finally {
        if (active) {
          setChecking(false);
          setCheckedAt(new Date().toLocaleTimeString("es-CO"));
        }
      }
    };
    void inspect(false);
    const reconnect = () => void inspect(true);
    const disconnect = () => void inspect(false);
    addEventListener("online", reconnect);
    addEventListener("offline", disconnect);
    return () => {
      active = false;
      removeEventListener("online", reconnect);
      removeEventListener("offline", disconnect);
    };
  }, [uid]);
  const signals = diagnoseSupport({
    online,
    demo: Boolean(uid?.startsWith("demo-")),
    signedIn: Boolean(uid),
    ownRead,
    queueCount,
  });
  return (
    <section
      aria-label="Diagnóstico automático"
      className={compact ? "mt-4 border-t border-border pt-4" : ""}
    >
      {!compact && <PageTitle title="Soporte automático" subtitle="Veterinaria Dr. Luis Ríos" />}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-bold text-primary">
          <Activity className="h-5 w-5" />
          {checking ? "Comprobando tu conexión…" : "Diagnóstico automático"}
        </div>
        <span className="text-xs text-muted-foreground">{checkedAt ?? "Pendiente"}</span>
      </div>
      {signals.map((signal) => (
        <div key={signal.id} className="flex items-start gap-3 border-b border-border py-3">
          {signal.status === "ok" ? (
            <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-sage-foreground" />
          ) : (
            <ShieldAlert className="mt-1 h-5 w-5 shrink-0 text-amber-foreground" />
          )}
          <div className="min-w-0">
            <b className="text-sm">{signal.label}</b>
            <p className="mt-1 text-sm text-muted-foreground">{signal.detail}</p>
          </div>
        </div>
      ))}
      <p className="mt-3 text-xs text-muted-foreground">
        La reconexión vuelve a comprobar tu cuenta y recarga las lecturas permitidas. No altera
        permisos, citas ni pagos.
      </p>
      <Btn
        className="mt-4"
        variant="outline"
        disabled={checking || !online}
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="h-4 w-4" />
        Recargar esta página
      </Btn>
    </section>
  );
}
