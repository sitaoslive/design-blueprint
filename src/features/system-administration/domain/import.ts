import Papa from "papaparse";
import { bogotaDate } from "@/features/finance/domain/presentation";
export const importFields = [
  ["externalId", "Referencia OKVET", true], ["visitId", "ID de cita Vet Freedom", false],
  ["petId", "ID de mascota", true], ["staffId", "ID de profesional", true],
  ["date", "Fecha", true], ["status", "Estado", true],
] as const;
export type ImportField = (typeof importFields)[number][0];
export type FieldMapping = Record<ImportField, string>;
export type ImportRow = Record<ImportField, string>;
export type LocalVisit = { id: string; pet_id: string; staff_id: string | null; date: string; operational_on: string | null; status: string; okvet_ref: string | null; address: string };
export type Finding = { row: number; code: string; detail: string; severity: "error" | "review" };
export const normalizeHeader = (s: string) => s.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\s_-]+/g, "");
const aliases: Record<ImportField, string[]> = {
  externalId: ["externalid", "referenciaokvet", "okvetref", "idexterno"],
  visitId: ["visitid", "idcita", "citavf"], petId: ["petid", "idmascota"],
  staffId: ["staffid", "idprofesional"], date: ["date", "fecha"], status: ["status", "estado"],
};
export function suggestFieldMapping(headers: string[]): FieldMapping {
  return Object.fromEntries(importFields.map(([key]) => {
    const matches = headers.filter((h) => aliases[key].includes(normalizeHeader(h)));
    return [key, matches.length === 1 ? matches[0] ?? "" : ""];
  })) as FieldMapping;
}
export function parseImportCsv(name: string, text: string) {
  if (!/\.csv$/i.test(name)) throw new Error("Solo se permiten archivos CSV");
  if (new TextEncoder().encode(text).length > 1_000_000) throw new Error("El archivo supera 1 MB");
  const parsed = Papa.parse<string[]>(text.replace(/^\uFEFF/, ""), { skipEmptyLines: "greedy" });
  if (parsed.errors.some((e) => e.code !== "UndetectableDelimiter")) throw new Error("CSV no interpretable: revisa comillas y separadores");
  const [headers, ...rows] = parsed.data;
  if (!headers?.length || !rows.length) throw new Error("El archivo no tiene encabezados y registros");
  if (headers.length > 40 || rows.length > 2000) throw new Error("Máximo 40 columnas y 2000 registros");
  if (headers.some((h) => !h.trim()) || new Set(headers.map(normalizeHeader)).size !== headers.length) throw new Error("Encabezados vacíos o duplicados");
  if (rows.some((r) => r.length !== headers.length)) throw new Error("Hay filas con un número distinto de columnas");
  return { headers, rows };
}
export function buildImportPreview(headers: string[], rows: string[][], mapping: FieldMapping) {
  const findings: Finding[] = [];
  const selected = Object.values(mapping).filter(Boolean);
  if (new Set(selected).size !== selected.length) findings.push({ row: 0, code: "MAPPING_DUPLICATE", detail: "Una columna está asignada a varios campos", severity: "error" });
  for (const [key, label, required] of importFields) {
    if ((required && !mapping[key]) || (mapping[key] && !headers.includes(mapping[key]))) findings.push({ row: 0, code: "MISSING_COLUMN", detail: `${label}: columna obligatoria o correspondencia inválida`, severity: "error" });
  }
  const data = rows.map((r, index) => {
    const row = Object.fromEntries(importFields.map(([key]) => [key, (r[headers.indexOf(mapping[key])] ?? "").trim()])) as ImportRow;
    for (const [key, label, required] of importFields) {
      if (required && !row[key]) findings.push({ row: index + 1, code: "MISSING_VALUE", detail: `${label}: dato faltante`, severity: "error" });
      if (row[key].length > 200) findings.push({ row: index + 1, code: "VALUE_TOO_LONG", detail: `${label}: valor excede 200 caracteres`, severity: "error" });
    }
    if (row.date && !bogotaDate(row.date)) findings.push({ row: index + 1, code: "INVALID_DATE", detail: "Fecha incorrecta; usa AAAA-MM-DD o timestamp con zona horaria", severity: "error" });
    if (row.status && !["pendiente", "confirmada", "en_curso", "finalizada", "cancelada"].includes(row.status)) findings.push({ row: index + 1, code: "INVALID_STATUS", detail: "Estado no reconocido; no se convirtió automáticamente", severity: "error" });
    return row;
  });
  const seen = new Map<string, number[]>();
  data.forEach((r, i) => { if (r.externalId) seen.set(r.externalId, [...(seen.get(r.externalId) ?? []), i + 1]); });
  for (const [ref, indices] of seen) if (indices.length > 1) for (const row of indices) findings.push({ row, code: "DUPLICATE_REFERENCE", detail: `Referencia ${ref} repetida en filas ${indices.join(", ")}`, severity: "error" });
  return { data, findings };
}
export function reconcileImport(row: ImportRow, visits: LocalVisit[]) {
  const byId = row.visitId ? visits.filter((v) => v.id === row.visitId) : [];
  const byRef = row.externalId ? visits.filter((v) => v.okvet_ref === row.externalId) : [];
  if (byRef.length > 1 || byId.length > 1) return { state: "CONFLICT", visit: null, differences: ["Referencia local duplicada"] };
  if (byId[0] && byRef[0] && byId[0].id !== byRef[0].id) return { state: "CONFLICT", visit: null, differences: ["ID y referencia apuntan a citas diferentes"] };
  const visit = byId[0] ?? byRef[0];
  if (!visit) {
    const candidates = visits.filter((v) => v.pet_id === row.petId && bogotaDate(v.operational_on ?? v.date) === bogotaDate(row.date));
    return { state: candidates.length ? "POSSIBLE_MATCH" : "UNMATCHED", visit: null, differences: [candidates.length ? `${candidates.length} posibles coincidencias por ID de mascota y fecha; requieren selección humana` : "Sin ID o referencia local inequívoca"] };
  }
  const differences = [
    visit.pet_id !== row.petId ? "Mascota diferente" : "",
    visit.staff_id !== row.staffId ? "Profesional diferente" : "",
    bogotaDate(visit.operational_on ?? visit.date) !== bogotaDate(row.date) ? "Fecha diferente" : "",
    visit.status !== row.status ? "Estado diferente" : "",
    visit.okvet_ref !== row.externalId ? "Referencia oficial diferente o faltante" : "",
  ].filter(Boolean);
  return { state: differences.length ? "CONFLICT" : "MATCHED", visit, differences };
}
export function evaluateVisitQuality(visits: LocalVisit[]): Finding[] {
  const findings: Finding[] = [];
  visits.forEach((v, i) => {
    if (!bogotaDate(v.operational_on ?? v.date)) findings.push({ row: i + 1, code: "MISSING_DATE", detail: `${v.id}: fecha incompleta o incorrecta`, severity: "review" });
    if (!v.pet_id || !v.staff_id) findings.push({ row: i + 1, code: "MISSING_IDENTIFIER", detail: `${v.id}: mascota o responsable faltante`, severity: "review" });
    if (v.status === "confirmada" && !v.okvet_ref?.trim()) findings.push({ row: i + 1, code: "MISSING_OFFICIAL_REFERENCE", detail: `${v.id}: confirmada sin referencia oficial`, severity: "error" });
    if (!v.address?.trim()) findings.push({ row: i + 1, code: "MISSING_ADDRESS", detail: `${v.id}: dirección faltante`, severity: "review" });
    if (v.okvet_ref && visits.filter((x) => x.okvet_ref === v.okvet_ref).length > 1) findings.push({ row: i + 1, code: "DUPLICATE_REFERENCE", detail: `${v.id}: referencia externa repetida`, severity: "error" });
  });
  return findings;
}