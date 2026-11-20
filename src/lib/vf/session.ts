import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { db } from "./db";
import { getVF, hydrateVF, startDemo, clearVF } from "./store";
import type { RoleId } from "./roles";

export const AREA_ROLES: Record<string, RoleId[]> = {
  luis: ["luis", "administrador"],
  coordinacion: ["coordinador", "recepcion", "luis", "administrador"],
  equipo: ["veterinario", "auxiliar", "luis", "administrador"],
  cliente: ["cliente", "cuidador", "luis", "administrador"],
  app: ["cliente", "luis", "administrador"],
  cuidador: ["cuidador", "cliente", "luis", "administrador"],
  operaciones: ["coordinador", "recepcion", "luis", "administrador"],
  direccion: ["luis", "administrador"],
  admin: ["administrador", "luis"],
  especialista: ["especialista", "luis", "administrador"],
  auxiliar: ["auxiliar", "luis", "administrador"],
  recepcion: ["recepcion", "luis", "administrador"],
  finanzas: ["finanzas", "luis", "administrador"],
  soporte: ["soporte", "luis", "administrador"],
  consultor: ["consultor", "luis", "administrador"],
};

export async function currentUser() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: rows } = await db.from("user_roles").select("role").eq("user_id", data.user.id);
  const roles = ((rows ?? []) as { role: string }[]).map((r) => r.role);
  const name = (data.user.user_metadata?.["full_name"] as string | undefined) ?? data.user.email?.split("@")[0] ?? "";
  return { id: data.user.id, email: data.user.email ?? "", name, roles };
}

/** beforeLoad guard for a role area: signed in + allowed role, then load data. */
export async function guardArea(area: keyof typeof AREA_ROLES, href: string) {
  const demo = demoRole();
  if (demo) {
    if (!AREA_ROLES[area]!.includes(demo.role as RoleId)) throw redirect({ to: "/demo" });
    if (getVF().userId !== "demo-" + demo.role) startDemo(demo.role, demo.name);
    return { user: { id: "demo-" + demo.role, email: "", name: demo.name, roles: [demo.role] } };
  }
  const u = await currentUser();
  if (!u) throw redirect({ to: "/auth", search: { next: href } });
  if (!u.roles.some((r) => AREA_ROLES[area]!.includes(r as RoleId))) throw redirect({ to: "/sin-acceso" });
  if (getVF().userId !== u.id || !getVF().loaded) await hydrateVF(u.id, u.roles, u.name);
  return { user: u };
}

const DEMO_KEY = "vf_demo";
export function demoRole(): { role: string; name: string } | null {
  if (typeof sessionStorage === "undefined") return null;
  try { return JSON.parse(sessionStorage.getItem(DEMO_KEY) ?? "null"); } catch { return null; }
}
export function enterDemo(role: string, name: string) { sessionStorage.setItem(DEMO_KEY, JSON.stringify({ role, name })); startDemo(role, name); }
export function exitDemo() { sessionStorage.removeItem(DEMO_KEY); clearVF(); }
