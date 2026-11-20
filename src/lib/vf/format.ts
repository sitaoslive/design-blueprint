export function formatCOP(value: number): string {
  const n = Math.round(value);
  const s = Math.abs(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${n < 0 ? "-" : ""}$ ${s} COP`;
}
