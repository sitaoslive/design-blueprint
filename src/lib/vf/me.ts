import { useVF } from "./store";
/** Team member linked to the signed-in account, and whether items without a link are visible (directors yes, others no). */
export function useMyStaff() {
  const uid = useVF((s) => s.userId); const staff = useVF((s) => s.staff); const roles = useVF((s) => s.roles);
  const me = staff.find((m) => (m as { userId?: string | null }).userId === uid);
  const seeAll = !me && roles.some((r) => r === "luis" || r === "administrador");
  return { me, mine: (staffId: string | null | undefined) => (me ? staffId === me.id : seeAll) };
}
