/** Presentation policy only; Cloud and protected contracts remain authoritative. */
export function canManageQuality(roles: string[]) {
  return roles.some((r) => ["luis", "administrador", "coordinador", "recepcion"].includes(r));
}
export function canPersistDraft(roles: string[]) {
  return roles.some((r) => ["luis", "administrador"].includes(r));
}
export function canOpenQualityPath(path: string, roles: string[]) {
  if (path.startsWith("/app/")) return roles.includes("cliente") || canPersistDraft(roles);
  if (path.startsWith("/admin/") || path.startsWith("/direccion/")) return canPersistDraft(roles);
  return canManageQuality(roles);
}