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
    watch.current = navigator.geolocation.watchPosition(async (pos) => {
      if (Date.now() - last.current < SEND_EVERY_MS) return; last.current = Date.now();
      if (demo) return;
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
    if (demo) { setRows([]); return; }
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
      if (!map.current) { map.current = L.map(el.current, { zoomControl: true }).setView([4.65, -74.08], 11); L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map.current); layer.current = L.layerGroup().addTo(map.current); }
      layer.current?.clearLayers();
      live.forEach((r) => {
        const m = staff.find((s) => s.id === r.staff_id);
        const icon = L.divIcon({ className: "", html: `<div style="display:grid;place-items:center;width:36px;height:36px;border-radius:9999px;background:var(--primary);color:var(--primary-foreground);font-weight:800;border:3px solid var(--card);box-shadow:0 4px 12px rgb(0 0 0/.25)">${(m?.short ?? "?").slice(0, 2)}</div>`, iconSize: [36, 36], iconAnchor: [18, 18] });
        L.marker([r.lat, r.lng], { icon }).bindPopup(`${m?.name ?? "Equipo"} · hace ${minutesAgo(r.updated_at, now)} min`).addTo(layer.current!);
      });
      if (live.length) map.current.fitBounds(live.map((r) => [r.lat, r.lng] as [number, number]), { maxZoom: 15, padding: [40, 40] });
    })();
    return () => { off = true; };
  }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { map.current?.remove(); map.current = null; }, []);
  return <div className="mb-4">
    <div ref={el} className="relative z-0 h-72 w-full overflow-hidden rounded-3xl border border-border" aria-label="Mapa del equipo en vivo" />
    <div className="mt-2 space-y-1">
      {rows === null ? <p className="text-sm text-muted-foreground">Cargando ubicaciones…</p>
        : live.length ? live.map((r) => { const m = staff.find((s) => s.id === r.staff_id); const v = visits.find((x) => x.id === r.visit_id); const pet = pets.find((p) => p.id === v?.petId);
          return <p key={r.user_id} className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-primary" /><b>{m?.name ?? "Equipo"}</b> {visitId ? "va en camino a tu casa" : <>en camino{pet ? ` a ${pet.name}` : ""}</>} · hace {minutesAgo(r.updated_at, now)} min</p>; })
        : <p className="text-sm text-muted-foreground">{demo ? "DEMO: la ubicación en vivo solo funciona con cuentas reales." : visitId ? "Aún no hay ubicación en vivo. Aparecerá aquí cuando el equipo salga hacia tu casa." : "Nadie está compartiendo ubicación ahora. Aparece cuando alguien del equipo va en camino y la activa."}</p>}
    </div>
  </div>;
}
