import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const dir = join(process.cwd(), "drizzle/migrations");
const sql = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort().map((f) => readFileSync(join(dir, f), "utf8")).join("\n");

/** Latest CREATE POLICY statement for a table/policy name across all migrations. */
function latestPolicy(table: string, name: string): string {
  const re = new RegExp(`CREATE POLICY "${name}" ON public\\.${table}[\\s\\S]*?;`, "g");
  const all = sql.match(re) ?? [];
  const last = all[all.length - 1];
  if (!last) throw new Error(`missing policy ${table}.${name}`);
  return last.replace(/\s+/g, " ");
}

describe("privacidad del servidor — barrido 2026-11-21", () => {
  it("un cliente no puede crear informes de especialista: requiere rol clínico o especialista", () => {
    const p = latestPolicy("specialist_reports", "rep insert");
    expect(p).toContain("public.is_clinical(auth.uid())");
    expect(p).toContain("public.has_role(auth.uid(), 'especialista')");
    expect(p).toContain("public.my_specialist_name()");
  });

  it("solo especialistas o el equipo publican horarios de especialista", () => {
    expect(latestPolicy("specialist_slots", "slots own")).toMatch(/WITH CHECK \(user_id = auth\.uid\(\) AND \(public\.has_role\(auth\.uid\(\), 'especialista'\) OR public\.is_staff/);
  });

  it("los auxiliares no leen aprobaciones (cobros y montos de familias)", () => {
    expect(latestPolicy("approvals", "appr read")).toContain("NOT public.is_aux_only(auth.uid())");
  });

  it("los auxiliares solo ven incidencias propias o asignadas", () => {
    expect(latestPolicy("incidents", "inc staff")).toContain("NOT public.is_aux_only(auth.uid())");
    const own = latestPolicy("incidents", "inc aux own");
    expect(own).toContain("created_by = auth.uid()");
    expect(own).toContain("assignee_staff IN (SELECT public.my_staff_ids())");
  });

  it("la vigencia de ofertas de remisión solo la consulta el dueño o el equipo", () => {
    const defs = sql.match(/CREATE OR REPLACE FUNCTION public\.offer_is_live[\s\S]*?\$\$;/g) ?? [];
    expect(defs[defs.length - 1]).toContain("public.owns_referral(_ref) OR public.is_staff(auth.uid())");
  });

  it("las funciones internas de pasos de campo no se pueden invocar directamente", () => {
    for (const fn of ["apply_field_handover", "escalate_blocked_field_task", "guard_field_collection_contract"]) {
      expect(sql).toContain(`REVOKE EXECUTE ON FUNCTION public.${fn}() FROM PUBLIC, anon, authenticated;`);
    }
  });
});
