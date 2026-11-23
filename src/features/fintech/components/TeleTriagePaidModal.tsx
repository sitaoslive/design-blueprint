import { useState } from "react";
import {
  Stethoscope,
  Moon,
  Clock,
  Camera,
  Video,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Send,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TeleTriagePaidModalProps {
  onClose?: () => void;
  lang?: "es" | "en";
}

export function TeleTriagePaidModal({
  onClose,
  lang = "es",
}: TeleTriagePaidModalProps) {
  const [selectedPet, setSelectedPet] = useState("Nilo (Canino, 4 años)");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    "Vómito leve",
  ]);
  const [description, setDescription] = useState(
    "Ha vomitado dos veces en las últimas 3 horas después de comer césped en el parque. Está algo decaído pero toma agua."
  );
  const [hasMedia, setHasMedia] = useState(true);
  const [status, setStatus] = useState<"idle" | "submitting" | "active_case">(
    "idle"
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const symptomOptions = [
    { id: "vomit", label: "Vómito / Arcadas" },
    { id: "diarrhea", label: "Diarrea súbita" },
    { id: "toxic", label: "Ingesta de tóxico / chocolate" },
    { id: "lethargy", label: "Letargia o decaimiento" },
    { id: "cough", label: "Tos / Dificultad leve" },
    { id: "allergy", label: "Reacción en piel / picadura" },
  ];

  const toggleSymptom = (label: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const handleSubmit = () => {
    setStatus("submitting");
    setTimeout(() => {
      setStatus("active_case");
      toast.success(
        lang === "es"
          ? "¡Caso de Triaje asignado al Dr. Luis Eduardo Ríos!"
          : "Triage incident assigned to on-call veterinarian Dr. Luis!"
      );
    }, 2000);
  };

  const handleReset = () => {
    setStatus("idle");
    setIsPlayingAudio(false);
  };

  return (
    <div className="rounded-3xl border-2 border-indigo-500/30 bg-card p-6 shadow-2xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400">
            <Moon className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
                {lang === "es" ? "Tele-Triaje Asincrónico 24/7" : "24/7 Async Tele-Triage"}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {lang === "es" ? "Médico en Guardia" : "On-Call Vet Active"}
              </span>
            </div>
            <h3 className="text-lg font-black text-foreground">
              {lang === "es"
                ? "Consulta Rápida Nocturna y Festivos"
                : "Night & Weekend Quick Triage"}
            </h3>
          </div>
        </div>

        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 px-3 py-1.5 text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {lang === "es" ? "Tarifa Fija Oficial" : "Official Fixed Fee"}
          </span>
          <span className="font-mono text-base font-black text-foreground">
            $25.000 COP{" "}
            <span className="text-xs font-normal text-muted-foreground">(~$7 USD)</span>
          </span>
        </div>
      </div>

      {status === "idle" && (
        <div className="mt-4 space-y-5">
          {/* Active Vet Status Card */}
          <div className="flex items-center justify-between rounded-2xl bg-secondary/60 p-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-full bg-primary/20 text-primary grid place-items-center font-bold">
                LR
              </div>
              <div>
                <p className="font-bold text-foreground">
                  Dr. Luis Eduardo Ríos (COMVEZCOL-001)
                </p>
                <p className="text-muted-foreground">
                  {lang === "es"
                    ? "Turno Nocturno Activo · Respuesta garantizada < 25 min"
                    : "Active Night Shift · Guaranteed response < 25 min"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
              <Clock className="h-3.5 w-3.5" />
              <span>~16 min</span>
            </div>
          </div>

          {/* Pet Selector */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {lang === "es" ? "Mascota con Síntomas:" : "Pet with Symptoms:"}
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {["Kenji (Canino)", "Nilo (Canino)", "Samantha (Felino)"].map(
                (pet) => (
                  <button
                    key={pet}
                    type="button"
                    onClick={() => setSelectedPet(pet)}
                    className={cn(
                      "rounded-xl border p-2.5 text-center text-xs font-bold transition",
                      selectedPet.startsWith(pet.split(" ")[0] ?? "")
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary"
                    )}
                  >
                    {pet}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Symptom Tags */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {lang === "es" ? "Síntomas observados:" : "Observed Symptoms:"}
            </label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {symptomOptions.map((sym) => {
                const isSelected = selectedSymptoms.includes(sym.label);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.label)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-bold transition",
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    )}
                  >
                    {sym.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description & Media */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {lang === "es" ? "Detalle de lo que ves:" : "What do you see?"}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-border bg-card p-3 text-xs leading-relaxed text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="mt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setHasMedia(!hasMedia)}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>
                  {hasMedia
                    ? lang === "es"
                      ? "📸 1 Foto y 1 Video de vómito adjuntados"
                      : "📸 1 Photo & 1 Video attached"
                    : lang === "es"
                    ? "+ Adjuntar Foto o Video"
                    : "+ Attach Photo or Video"}
                </span>
              </button>
              <span className="text-[10px] text-muted-foreground">
                {lang === "es"
                  ? "Sube fotos claras para acelerar el triaje"
                  : "Clear photos help fast triage"}
              </span>
            </div>
          </div>

          {/* Warning Disclaimer */}
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3 text-[11px] text-muted-foreground leading-relaxed">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <p>
                <b>
                  {lang === "es" ? "Regla Clínica Irrenunciable:" : "Clinical Safety Rule:"}
                </b>{" "}
                {lang === "es"
                  ? "El tele-triaje es un filtro orientador para evaluar gravedad. Si el paciente presenta convulsiones continuas, hemorragia profusa o shock, el sistema generará de inmediato remisión a clínica hospitalaria 24H con Waze preconfigurado."
                  : "Tele-triage assesses urgency. If your pet suffers uncontrolled seizures, acute shock, or severe bleeding, the system directs you immediately to a 24H emergency hospital via Waze."}
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-6 py-4 text-base font-black text-white shadow-xl transition hover:bg-indigo-700 active:scale-98"
          >
            <span>
              {lang === "es"
                ? "Pagar $25.000 COP y Despachar Triaje al Doctor"
                : "Pay $25,000 COP & Dispatch Triage to Vet"}
            </span>
            <Send className="h-5 w-5" />
          </button>
        </div>
      )}

      {status === "submitting" && (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <h4 className="mt-4 text-lg font-black text-foreground">
            {lang === "es"
              ? "Confirmando pago de $25.000 COP y notificando al Dr. Luis..."
              : "Confirming $25,000 COP fee & alerting Dr. Luis..."}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === "es"
              ? "Generando caso en cola de guardia prioritaria."
              : "Generating priority night shift ticket."}
          </p>
        </div>
      )}

      {status === "active_case" && (
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/30">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  CASO #TRI-2026-4410
                </span>
                <h4 className="text-sm font-black text-foreground">
                  {lang === "es"
                    ? "En evaluación activa por Dr. Luis Eduardo Ríos"
                    : "Actively being evaluated by Dr. Luis"}
                </h4>
              </div>
            </div>
            <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white animate-pulse">
              {lang === "es" ? "En Revisión" : "Reviewing"}
            </span>
          </div>

          {/* Simulated Vet Audio Response */}
          <div className="rounded-2xl border-2 border-indigo-500/30 bg-card p-4 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                <Volume2 className="h-4 w-4" />
                {lang === "es"
                  ? "Respuesta Médica de Voz del Dr. Luis (1:08 min):"
                  : "Dr. Luis's Clinical Voice Note (1:08 min):"}
              </span>
              <span className="text-muted-foreground">Hace 2 minutos</span>
            </div>

            {/* Audio Waveform Simulator */}
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-secondary/80 p-3">
              <button
                type="button"
                onClick={() => {
                  setIsPlayingAudio(!isPlayingAudio);
                  toast.info(
                    isPlayingAudio
                      ? "Audio pausado"
                      : "Reproduciendo indicación del Dr. Luis: 'Hola Catalina, revisé el video de Nilo...'"
                  );
                }}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-600 text-white transition active:scale-95"
              >
                {isPlayingAudio ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-0.5" />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-1">
                  {[40, 60, 20, 80, 50, 90, 70, 30, 85, 45, 65, 35, 75, 55, 95, 30, 60].map(
                    (height, i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-1.5 rounded-full transition-all",
                          isPlayingAudio ? "bg-indigo-600 animate-pulse" : "bg-muted-foreground/30"
                        )}
                        style={{ height: `${height * 0.28}px` }}
                      />
                    )
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>{isPlayingAudio ? "0:24" : "0:00"}</span>
                  <span>1:08</span>
                </div>
              </div>
            </div>

            {/* Transcription Summary */}
            <div className="mt-3 rounded-xl bg-indigo-500/5 p-3 text-xs leading-relaxed text-foreground">
              <p>
                <b>Transcripción Clínica:</b> «Hola Catalina, acabo de revisar el
                video de Nilo. Las mucosas se observan de buen color rosado y no
                hay distensión abdominal aguda. Retira el plato de comida por 4
                horas, suminístrale suero en pequeñas tomas de 15 ml con jeringa.
                Te dejo la cita prioritaria agendada para mañana 8:30 AM para
                chequeo presencial si no tolera los líquidos.»
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{lang === "es" ? "Probar Otra Consulta" : "Test Another Case"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
