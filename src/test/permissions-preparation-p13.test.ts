import { describe, expect, it } from "vitest";
import { canAdminister, canReadFinance } from "@/features/system-administration/domain/access";
import { validatePreparation } from "@/features/system-administration/application/preparation";
const now = Date.parse("2026-11-21T17:00:00Z");
const draft = { requestId: "e374a1b5-301b-47e9-bb50-b095a6364ec4", source: "example.csv", fingerprint: "a".repeat(64), rowCount: 1, mapping: { externalId: "ref", visitId: "", petId: "pet", staffId: "staff", date: "date", status: "status" }, authorizedFile: true, mappingReviewed: true, evidence: "Responsable revisó el archivo", comparedAt: "2026-11-21T16:59:00Z", conflictCount: 1 };
describe("Acceso financiero y administrativo", () => {
  for (const role of ["cliente", "cuidador", "veterinario", "auxiliar", "coordinador", "recepcion", "soporte", "consultor", "especialista"]) it(`${role} no administra ni consulta finanzas globales`, () => { expect(canAdminister([role], "viewer")).toBe(false); expect(canReadFinance([role], "viewer")).toBe(false); });
  it("Finanzas consulta finanzas, no importa ni controla", () => { expect(canReadFinance(["finanzas"], "viewer")).toBe(true); expect(canAdminister(["finanzas"], "viewer")).toBe(false); });
  for (const role of ["luis", "administrador"]) it(`${role} mantiene ambos permisos`, () => { expect(canAdminister([role], "viewer")).toBe(true); expect(canReadFinance([role], "viewer")).toBe(true); });
  it("Sin sesión falla cerrado aunque haya roles", () => { expect(canAdminister(["administrador"], null)).toBe(false); expect(canReadFinance(["finanzas"], null)).toBe(false); });
});
describe("Preparación declarada, no importación", () => {
  it("Acepta un nombre de 200 caracteres y rechaza 201", () => {
    expect(validatePreparation({ ...draft, source: "a".repeat(196) + ".csv" }, now).source.length).toBe(200);
    expect(() => validatePreparation({ ...draft, source: "a".repeat(197) + ".csv" }, now)).toThrow();
  });
  it("Acepta encabezados de 100 caracteres y rechaza 101", () => {
    expect(validatePreparation({ ...draft, mapping: { ...draft.mapping, petId: "a".repeat(100) } }, now).mapping.petId.length).toBe(100);
    expect(() => validatePreparation({ ...draft, mapping: { ...draft.mapping, petId: "a".repeat(101) } }, now)).toThrow();
  });
  it("Guarda metadatos revisados incluso con comparaciones sin resolver", () => expect(validatePreparation(draft, now).conflictCount).toBe(1));
  it("Rechaza filas CSV y campos de autoridad inventados", () => { expect(() => validatePreparation({ ...draft, rows: [["sensible"]] }, now)).toThrow(); expect(() => validatePreparation({ ...draft, status: "APPLIED" }, now)).toThrow(); });
  it("Exige autorización de revisión", () => expect(() => validatePreparation({ ...draft, authorizedFile: false }, now)).toThrow());
  it("Exige mapeo revisado", () => expect(() => validatePreparation({ ...draft, mappingReviewed: false }, now)).toThrow());
  it("Rechaza comparación de más de dos minutos", () => expect(() => validatePreparation(draft, now + 61000)).toThrow("STALE"));
  it("Rechaza fecha futura", () => expect(() => validatePreparation({ ...draft, comparedAt: "2026-11-21T17:01:00Z" }, now)).toThrow("STALE"));
  it("Rechaza columna con dos significados", () => expect(() => validatePreparation({ ...draft, mapping: { ...draft.mapping, petId: "ref" } }, now)).toThrow());
});