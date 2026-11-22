import { useState } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface TimeSlotOption {
  time: string;
  available: boolean;
}

export function BookingTimeSelector({
  onConfirm,
  selectedPetName = "tu mascota",
}: {
  onConfirm?: (date: string, time: string, address: string) => void;
  selectedPetName?: string;
}) {
  const [selectedDayIndex, setSelectedDayIndex] = useState(2); // Default to Wednesday
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [address, setAddress] = useState("Calle 93 # 14-20, Apto 502, Chicó");
  const [confirmed, setConfirmed] = useState(false);

  // 5 days window
  const days = [
    { label: "Lun", date: "23", month: "Nov", full: "2026-11-23" },
    { label: "Mar", date: "24", month: "Nov", full: "2026-11-24" },
    { label: "Mié", date: "25", month: "Nov", full: "2026-11-25" },
    { label: "Jue", date: "26", month: "Nov", full: "2026-11-26" },
    { label: "Vie", date: "27", month: "Nov", full: "2026-11-27" },
  ];

  const slots: TimeSlotOption[] = [
    { time: "08:30 AM", available: true },
    { time: "10:00 AM", available: true },
    { time: "11:30 AM", available: false },
    { time: "02:00 PM", available: true },
    { time: "03:30 PM", available: true },
    { time: "05:00 PM", available: false },
  ];

  const handleBooking = () => {
    setConfirmed(true);
    toast.success("¡Visita a domicilio agendada con éxito!", {
      description: `El Dr. Luis Eduardo Ríos llegará a tu hogar el ${days[selectedDayIndex]?.label} ${days[selectedDayIndex]?.date} a las ${selectedTime}.`,
    });
    if (onConfirm) {
      onConfirm(days[selectedDayIndex]!.full, selectedTime, address);
    }
  };

  return (
    <div className="rounded-[2rem] border border-border bg-card p-5 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-foreground">Agendar Visita a Domicilio</h3>
          <p className="text-xs text-muted-foreground">Atención médica en la comodidad de tu hogar</p>
        </div>
        <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-primary">
          Dr. Luis Ríos
        </span>
      </div>

      {/* Date selector pills (Image 3 Petido inspired) */}
      <div className="mt-4">
        <label className="text-xs font-bold text-foreground">Seleccionar Fecha</label>
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {days.map((d, idx) => {
            const active = selectedDayIndex === idx;
            return (
              <button
                key={d.full}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={cn(
                  "flex min-w-[4.25rem] flex-col items-center rounded-2xl py-3 transition active:scale-95",
                  active
                    ? "bg-primary text-primary-foreground shadow-button"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                <span className="text-[11px] font-semibold opacity-80">{d.label}</span>
                <span className="text-lg font-black">{d.date}</span>
                <span className="text-[9px] font-bold opacity-80">{d.month}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time slot selector pills (Image 3 Petido inspired) */}
      <div className="mt-4">
        <label className="text-xs font-bold text-foreground">Seleccionar Horario</label>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {slots.map((s) => {
            const active = selectedTime === s.time;
            return (
              <button
                key={s.time}
                type="button"
                disabled={!s.available}
                onClick={() => setSelectedTime(s.time)}
                className={cn(
                  "rounded-xl border py-2.5 text-xs font-bold transition active:scale-95",
                  !s.available && "opacity-40 cursor-not-allowed bg-muted text-muted-foreground border-transparent",
                  s.available && active
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                )}
              >
                {s.time}
              </button>
            );
          })}
        </div>
      </div>

      {/* Domiciliary Address */}
      <div className="mt-4 rounded-xl bg-secondary/60 p-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary shrink-0" />
          <span className="text-xs font-bold text-foreground">Dirección de Atención Domiciliaria:</span>
        </div>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="mt-2 w-full rounded-lg bg-card px-3 py-2 text-xs font-medium border border-border"
          placeholder="Dirección, Apto, Barrio en Bogotá"
        />
        <p className="mt-1 text-[10px] text-muted-foreground">
          ✓ Zona con cobertura activa (Chicó / Usaquén / Chapinero)
        </p>
      </div>

      {/* CTA Button */}
      <button
        type="button"
        onClick={handleBooking}
        disabled={confirmed}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-4 text-sm font-extrabold text-primary-foreground shadow-button transition active:scale-[0.98]"
      >
        {confirmed ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            ¡Cita Confirmada para {selectedPetName}!
          </>
        ) : (
          <>
            Confirmar Reserva para {selectedPetName}
            <ArrowRight className="h-4 w-4" />
          </>
        )}
      </button>
    </div>
  );
}
