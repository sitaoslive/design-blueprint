import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Square } from "lucide-react";
import { toast } from "sonner";
import { Btn, Card } from "@/components/vf/ui";
import { db } from "@/lib/vf/db";
import { getVF, useVF } from "@/lib/vf/store";
import { freshLocations, minutesAgo, type LiveLocation } from "../domain/liveLocation";

const SEND_EVERY_MS = 15000;

/** Shares this device's position only while the visit is en route, after an explicit tap. */
export function LocationShare({ visitId, staffId, enRoute }: { visitId: string; staffId: string | null | undefined; enRoute: boolean }) {
  const [sharing, setSharing] = useState(false);
  const watch = useRef<number | null>(null); const last = useRef(0);
  const demo = getVF().userId?.startsWith("demo-");
  const stop = async (silent = false) => {
    if (watch.current !== null) navigator.geolocation.clearWatch(watch.current);
    watch.current = null; setSharing(false);
    if (!demo) await db.from("staff_locations").delete().eq("user_id", getVF().userId);
    if (!silent) toast("Dejaste de compartir tu ubicación");
  };
  useEffect(() => { if (!enRoute && sharing) void stop(true); }, [enRoute]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (watch.current !== null) navigator.geolocation.clearWatch(watch.current); }, []);
  if (!enRoute || !staffId) return null;
  const start = () => {
    if (!("geolocation" in navigator)) { toast.error("Este teléfono no permite compartir ubicación"); return; }
    setSharing(true);
    if (demo) {
      toast.success("Ubicación en vivo activa (Modo Demostración): Coordinación y Luis ya ven tu avance en el mapa.");
      return;
    }
    watch.current = navigator.geolocation.watchPosition(async (pos) => {
      if (Date.now() - last.current < SEND_EVERY_MS) return; last.current = Date.now();
      const { error } = await db.from("staff_locations").upsert({ user_id: getVF().userId, staff_id: staffId, visit_id: visitId, lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
      if (error) { toast.error("No se pudo enviar tu ubicación"); }
    }, (err) => { toast.error(err.code === err.PERMISSION_DENIED ? "Permiso de ubicación denegado en el teléfono" : "No se pudo obtener tu ubicación"); void stop(true); }, { enableHighAccuracy: true, maximumAge: 10000, timeout: 20000 });
  };
  return <Card className="mb-3">
    <p className="flex items-center gap-2 font-bold"><Navigation className="h-5 w-5 text-primary" />Ubicación en vivo</p>
    <p className="mt-1 text-sm text-muted-foreground">{sharing ? "Coordinación y Luis ven dónde vas. Se apaga sola al registrar la llegada." : "Solo mientras vas a esta visita. Coordinación y Luis la verán en el mapa."}</p>
    {sharing ? <Btn variant="outline" className="mt-3 w-full" onClick={() => void stop()}><Square className="h-4 w-4" />Dejar de compartir</Btn>
      : <Btn className="mt-3 w-full" onClick={start}><MapPin className="h-5 w-5" />Compartir mi ubicación</Btn>}
  </Card>;
}

/** Live map of the team for operations and directors; positions older than the freshness window are hidden. */
export function LiveTeamMap({ visitId }: { visitId?: string } = {}) {
  const staff = useVF((s) => s.staff); const pets = useVF((s) => s.pets); const visits = useVF((s) => s.visits);
  const [rows, setRows] = useState<LiveLocation[] | null>(null); const [now, setNow] = useState(Date.now());
  const el = useRef<HTMLDivElement>(null); const map = useRef<import("leaflet").Map | null>(null); const layer = useRef<import("leaflet").LayerGroup | null>(null);
  const demo = useVF((s) => s.userId)?.startsWith("demo-");
  useEffect(() => {
    if (demo) {
      let tick = 0;
      const updateDemo = () => {
        tick++;
        const demoLocations: LiveLocation[] = [
          {
            user_id: "demo-camila",
            staff_id: "camila",
            visit_id: "v1",
            lat: 4.7185 + Math.sin(tick * 0.15) * 0.0018,
            lng: -74.0385 + Math.cos(tick * 0.15) * 0.0018,
            accuracy: 8,
            updated_at: new Date(Date.now() - 15000).toISOString(),
          },
          {
            user_id: "demo-valeria",
            staff_id: "valeria",
            visit_id: "v2",
            lat: 4.6958 + Math.cos(tick * 0.12) * 0.0014,
            lng: -74.0325 + Math.sin(tick * 0.12) * 0.0014,
            accuracy: 6,
            updated_at: new Date(Date.now() - 30000).toISOString(),
          },
          {
            user_id: "demo-luis",
            staff_id: "luis",
            visit_id: "v3",
            lat: 4.6750,
            lng: -74.0480,
            accuracy: 5,
            updated_at: new Date(Date.now() - 45000).toISOString(),
          },
        ];
        setRows(visitId ? demoLocations.filter((d) => d.visit_id === visitId || d.staff_id === "camila") : demoLocations);
        setNow(Date.now());
      };
      updateDemo();
      const t = setInterval(updateDemo, 3500);
      return () => clearInterval(t);
    }
    const load = async () => { const q = db.from("staff_locations").select("*"); const { data } = await (visitId ? q.eq("visit_id", visitId) : q); setRows((data as LiveLocation[] | null) ?? []); setNow(Date.now()); };
    void load(); const t = setInterval(() => void load(), 15000); return () => clearInterval(t);
  }, [demo, visitId]);
  const live = freshLocations(rows ?? [], now);
  useEffect(() => {
    let off = false;
    void (async () => {
      if (!el.current) return;
      const L = (await import("leaflet")).default; await import("leaflet/dist/leaflet.css");
      if (off) return;
      if (!map.current) { map.current = L.map(el.current, { zoomControl: true }).setView([4.69, -74.04], 12); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map.current); layer.current = L.layerGroup().addTo(map.current); }
      layer.current?.clearLayers();
      live.forEach((r) => {
        const isAux = r.staff_id === "camila";
        const m = staff.find((s) => s.id === r.staff_id) ?? { name: isAux ? "Camila Rincón (Auxiliar)" : r.staff_id === "valeria" ? "Dra. Valeria Torres" : "Dr. Luis Ríos", short: isAux ? "CR" : r.staff_id === "valeria" ? "VT" : "LR" };
        const icon = L.divIcon({ className: "", html: `<div style="display:grid;place-items:center;width:40px;height:40px;border-radius:9999px;background:${isAux ? '#0284c7' : 'var(--primary)'};color:#ffffff;font-weight:800;font-size:13px;border:3px solid #ffffff;box-shadow:0 4px 14px rgba(0,0,0,0.3)">${(m?.short ?? "?").slice(0, 2)}</div>`, iconSize: [40, 40], iconAnchor: [20, 20] });
        L.marker([r.lat, r.lng], { icon }).bindPopup(`<b>${m?.name ?? "Equipo"}</b><br/>${isAux ? "Auxiliar de Veterinaria" : "Médico Veterinario"}<br/>📍 En ruta · GPS activo`).addTo(layer.current!);
      });
      if (live.length) map.current.fitBounds(live.map((r) => [r.lat, r.lng] as [number, number]), { maxZoom: 15, padding: [40, 40] });
    })();
    return () => { off = true; };
  }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);
  return <div className="mb-4">
    <div ref={el} className="relative z-0 h-72 w-full overflow-hidden rounded-3xl border border-border" aria-label="Mapa del equipo en vivo" />
    <div className="mt-2 space-y-1.5">
      {rows === null ? <p className="text-sm text-muted-foreground">Cargando ubicaciones…</p>
        : live.length ? live.map((r) => {
          const isAux = r.staff_id === "camila";
          const m = staff.find((s) => s.id === r.staff_id) ?? { name: isAux ? "Camila Rincón" : r.staff_id === "valeria" ? "Dra. Valeria Torres" : "Dr. Luis Ríos" };
          const v = visits.find((x) => x.id === r.visit_id);
          const pet = pets.find((p) => p.id === v?.petId) ?? (isAux ? { name: "Luna" } : { name: "Toby" });
          const roleTitle = isAux ? "Auxiliar de Veterinaria" : "Veterinaria de Campo";
          const eta = isAux ? "8 min" : "14 min";
          const speed = isAux ? "32 km/h" : "28 km/h";
          return (
            <div key={r.user_id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-3 shadow-sm">
              <span className="flex items-center gap-2.5">
                <span className={`grid h-8 w-8 place-items-center rounded-full text-white text-xs font-bold ${isAux ? "bg-sky-600" : "bg-primary"}`}>
                  {isAux ? "CR" : "VT"}
                </span>
                <span>
                  <b className="block text-sm">{m?.name} · {roleTitle}</b>
                  <span className="text-xs text-muted-foreground">{visitId ? "En camino a tu domicilio" : <>En camino a <b>{pet.name}</b></>} · hace {minutesAgo(r.updated_at, now)} min</span>
                </span>
              </span>
              <span className="text-right">
                <span className="inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  ETA {eta}
                </span>
                <span className="block text-[11px] text-muted-foreground">{speed}</span>
              </span>
            </div>
          );
        })
        : <p className="text-sm text-muted-foreground">{visitId ? "Aún no hay ubicación en vivo. Aparecerá aquí cuando el equipo salga hacia tu casa." : "Nadie está compartiendo ubicación ahora. Aparece cuando alguien del equipo va en camino y la activa."}</p>}
    </div>
  </div>;
}
