import { financeInput } from "@/features/finance/components/FinanceControls";
export function DurationPreview({ suggested, value, onChange }: { suggested: number; value: number; onChange: (minutes: number) => void }) {
  const valid = Number.isInteger(value) && value > 0 && value <= 480;
  return <div className="my-3 border-y border-border py-3"><label>Duración de esta cita (min)<input className={financeInput} type="number" min={1} max={480} aria-label="Duración de esta cita" value={value} onChange={(e) => onChange(Number(e.target.value))} /></label>
    <p className="mt-2 text-sm">Sugerencia de planificación: {suggested} min · No es duración profesional aprobada.</p>
    {!valid && <p role="alert">Duración de previsualización inválida.</p>}
    {value !== suggested && <p role="status" className="mt-2 font-bold text-primary">Previsualización recalculada. Guardar una duración personalizada requiere autorización verificada; creación bloqueada.</p>}
  </div>;
}