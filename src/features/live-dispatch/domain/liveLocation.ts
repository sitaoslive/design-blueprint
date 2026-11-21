export type LiveLocation = { user_id: string; staff_id: string; visit_id: string; lat: number; lng: number; accuracy: number | null; updated_at: string };
/** Positions older than this are treated as unknown, never shown as current. */
export const LIVE_FRESH_MINUTES = 15;
export function minutesAgo(at: string, now: number): number { return Math.max(0, Math.floor((now - Date.parse(at)) / 60000)); }
export function freshLocations(rows: LiveLocation[], now: number): LiveLocation[] {
  return rows.filter((r) => Number.isFinite(r.lat) && Number.isFinite(r.lng) && minutesAgo(r.updated_at, now) < LIVE_FRESH_MINUTES);
}
