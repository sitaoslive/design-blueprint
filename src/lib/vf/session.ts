import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { db } from "./db";
import { getVF, hydrateVF } from "./store";
import type { RoleId } from "./roles";

export const AREA_ROLES: Record<string, RoleId[]> = {
  luis: ["luis", "administrador", "finanzas", "soporte", "consultor"],
  coordinacion: ["coordinador", "recepcion", "luis", "administrador"],
  equipo: ["veterinario", "auxiliar", "luis", "administrador"],
  cliente: ["cliente", "cuidador", "luis", "administrador"],
  app: ["cliente", "luis", "administrador"],
  cuidador: ["cuidador", "cliente", "luis", "administrador"],
  operaciones: ["coordinador", "recepcion", "luis", "administrador"],
  direccion: ["luis", "administrador"],
  admin: ["administrador", "luis", "soporte"],
  especialista: ["especialista", "luis", "administrador"],
  auxiliar: ["auxiliar", "luis", "administrador"],
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
  const u = await currentUser();
  if (!u) throw redirect({ to: "/auth", search: { next: href } });
  if (!u.roles.some((r) => AREA_ROLES[area]!.includes(r as RoleId))) throw redirect({ to: "/sin-acceso" });
  if (getVF().userId !== u.id || !getVF().loaded) await hydrateVF(u.id, u.roles, u.name);
  return { user: u };
}
