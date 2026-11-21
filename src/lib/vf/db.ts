import { supabase } from "@/integrations/supabase/client";
import { IMG } from "./data";
import { demoDb, isDemo } from "./demoDb";

// Untyped handle: generated types are refreshed separately; shapes mirror data.ts.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const real = supabase as any;
/** In /demo mode every table read returns sample rows and writes do nothing. */
export const db: any = new Proxy({}, { get: (_t, prop) => { const src = isDemo() ? demoDb : real; const v = (src as any)[prop]; return typeof v === "function" ? v.bind(src) : v; } });

const photo = (k: string | null | undefined) => (k && k in IMG ? IMG[k as keyof typeof IMG] : k || IMG.dog);

export async function loadAll() {
  const q = (t: string, order?: string) => (order ? db.from(t).select("*").order(order) : db.from(t).select("*"));
  const [pets, staff, visits, reqs, inc, ap, pay, tasks, items, courses, refs, specs, tr, notif, audit, absence, chat, integ, participants] = await Promise.all([
    q("pets", "created_at"), q("staff_members"), q("visits", "time"), q("service_requests", "at"), q("incidents", "created_at"), q("approvals"),
    q("payments"), q("tasks"), q("inventory_items"), q("courses"), q("referrals"), q("specialists"), q("treatments"), q("notifications", "created_at"),
    db.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100), db.from("absence_plans").select("*").eq("active", true).limit(1),
    q("assistant_messages", "created_at"), q("integrations"), q("visit_participants"),
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = (r: { data: unknown[] | null }) => (r.data ?? []) as any[];
  return {
    pets: d(pets).map((p) => ({ id: p.id, name: p.name, species: p.species, breed: p.breed, age: p.age, photo: photo(p.photo), owner: p.owner_name, ownerId: p.owner_id, allergies: p.allergies })),
    staff: d(staff).map((s) => ({ id: s.id, name: s.name, short: s.short, role: s.role, zone: s.zone, status: s.status, nextVisit: s.next_visit ?? undefined, photo: photo(s.photo), skills: s.skills, load: s.load, userId: s.user_id ?? null })),
    visits: d(visits).map((v) => ({ id: v.id, petId: v.pet_id, staffId: v.staff_id, service: v.service, date: v.date, time: v.time, operationalOn: v.operational_on ?? null, status: v.status, zone: v.zone, address: v.address, step: v.step, prep: v.prep, okvetRef: v.okvet_ref ?? null })),
    participants: d(participants).map((p) => ({ id: p.id, visitId: p.visit_id, staffId: p.staff_id, active: p.active, supportState: p.support_state, version: p.version, prepChecked: p.prep_checked })),
    requests: d(reqs) as never[], incidents: d(inc) as never[], approvals: d(ap) as never[],
    payments: d(pay).map((p) => ({ ...p, amount: Number(p.amount) })) as never[],
    tasks: d(tasks).map((t) => ({ id: t.id, title: t.title, done: t.done, staffId: t.staff_id })),
    items: d(items) as never[], courses: d(courses) as never[], referrals: d(refs) as never[], specialists: d(specs) as never[],
    treatments: d(tr) as never[], notifications: d(notif) as never[],
    audit: d(audit).map((a) => ({ id: a.id, at: new Date(a.created_at).toLocaleString("es-CO"), action: a.action })),
    absence: d(absence)[0] ? { coordinator: d(absence)[0]!.coordinator, replacements: d(absence)[0]!.replacements, limits: d(absence)[0]!.limits, from: d(absence)[0]!.date_from, to: d(absence)[0]!.date_to, active: true, id: d(absence)[0]!.id } : null,
    chat: d(chat).map((m) => ({ id: m.id, from: m.sender, text: m.text, proposal: m.proposal ?? undefined })),
    integrations: d(integ) as { id: string; name: string; purpose: string; status: string; note: string }[],
  };
}

export async function write(p: PromiseLike<{ error: { message: string } | null }>) {
  const { error } = await p;
  if (error) {
    const { toast } = await import("sonner");
    toast.error("No se pudo guardar: " + error.message);
    return false;
  }
  return true;
}
