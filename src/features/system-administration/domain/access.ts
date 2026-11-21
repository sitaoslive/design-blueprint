export function canAdminister(roles: readonly string[], viewer: string | null): boolean {
  return Boolean(viewer && roles.some((role) => role === "administrador" || role === "luis"));
}
export function canReadFinance(roles: readonly string[], viewer: string | null): boolean {
  return Boolean(viewer && roles.some((role) => ["finanzas", "administrador", "luis"].includes(role)));
}