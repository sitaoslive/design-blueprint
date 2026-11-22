import { useState, useEffect } from "react";
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AntiNoShowDepositModalProps {
  onClose?: () => void;
  lang?: "es" | "en";
}

export function AntiNoShowDepositModal({
  onClose,
  lang = "es",
}: AntiNoShowDepositModalProps) {
  const [depositTier, setDepositTier] = useState<"30" | "50" | "100">("30");
  const [paymentMethod, setPaymentMethod] = useState<"nequi" | "card" | "pse">(
    "nequi"
  );
  const [status, setStatus] = useState<"pending" | "processing" | "success">(
    "pending"
  );
  const [timeLeft, setTimeLeft] = useState(899); // 14:59
  const [nequiPhone, setNequiPhone] = useState("300 123 4567");

  useEffect(() => {
    if (status !== "pending") return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [status]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const amounts = {
    "30": { cop: 35000, usd: 9, label: "30% Anticipo de Reserva" },
    "50": { cop: 55000, usd: 14, label: "50% Anticipo Bloqueado" },
    "100": { cop: 104500, usd: 27, label: "100% Pago Total (5% Desc. Pronto Pago)" },
  };

  const handleSimulatePayment = () => {
    setStatus("processing");
    setTimeout(() => {
      setStatus("success");
      toast.success(
        lang === "es"
          ? "¡Pago confirmado con éxito! Cupo asegurado en agenda."
          : "Deposit confirmed! Appointment locked in schedule."
      );
    }, 1800);
  };

  const handleReset = () => {
    setStatus("pending");
    setTimeLeft(899);
  };

  return (
    <div className="rounded-3xl border-2 border-emerald-500/30 bg-card p-6 shadow-2xl transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
                {lang === "es" ? "Pasarela Anti-No-Show" : "Anti-No-Show Deposit"}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Lock className="h-3 w-3 text-emerald-500" />
                SSL 256-Bit
              </span>
            </div>
            <h3 className="text-lg font-black text-foreground">
              {lang === "es"
                ? "Reserva Segura de Turno Domiciliario"
                : "Secure Mobile Appointment Deposit"}
            </h3>
          </div>
        </div>

        {status === "pending" && (
          <div className="flex items-center gap-1.5 rounded-2xl bg-amber-500/10 px-3 py-1.5 text-xs font-black text-amber-700 dark:text-amber-400">
            <Clock className="h-4 w-4 animate-spin" />
            <span>
              {lang === "es" ? "Cupo reservado:" : "Slot reserved:"}{" "}
              <b className="font-mono text-sm">{formatTimer(timeLeft)}</b>
            </span>
          </div>
        )}
      </div>

      {/* Appointment Summary Box */}
      <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">
              {lang === "es" ? "Paciente:" : "Patient:"}
            </span>{" "}
            <b className="text-foreground">Kenji (Canino, 3 años)</b>
          </div>
          <div>
            <span className="text-muted-foreground">
              {lang === "es" ? "Tutor:" : "Pet Parent:"}
            </span>{" "}
            <b className="text-foreground">Sara Velásquez</b>
          </div>
          <div>
            <span className="text-muted-foreground">
              {lang === "es" ? "Médico Asignado:" : "Assigned Vet:"}
            </span>{" "}
            <b className="text-foreground">Dr. Luis Eduardo Ríos</b>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          📍 El Poblado, Medellín · Jueves 26 Nov, 10:30 AM
        </div>
      </div>

      {status === "pending" && (
        <div className="mt-6 space-y-6">
          {/* Tier Selector */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {lang === "es"
                ? "Selecciona el monto de garantía:"
                : "Choose deposit option:"}
            </label>
            <div className="mt-2 grid gap-3 sm:grid-cols-3">
              {(["30", "50", "100"] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setDepositTier(tier)}
                  className={cn(
                    "flex flex-col items-start rounded-2xl border-2 p-3 text-left transition active:scale-95",
                    depositTier === tier
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                      : "border-border bg-card hover:border-emerald-500/50"
                  )}
                >
                  <span className="text-xs font-bold text-muted-foreground">
                    {amounts[tier].label}
                  </span>
                  <span className="mt-1 font-mono text-lg font-black text-foreground">
                    ${amounts[tier].cop.toLocaleString("es-CO")} COP
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    (~${amounts[tier].usd} USD)
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              {lang === "es" ? "Medio de Pago Inmediato:" : "Immediate Payment Method:"}
            </label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("nequi")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border-2 p-3 font-bold transition",
                  paymentMethod === "nequi"
                    ? "border-purple-600 bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <Smartphone className="h-4 w-4" />
                <span className="text-sm">Nequi / Bre-B</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border-2 p-3 font-bold transition",
                  paymentMethod === "card"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-sm">Tarjeta Crédito</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("pse")}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-2xl border-2 p-3 font-bold transition",
                  paymentMethod === "pse"
                    ? "border-blue-600 bg-blue-500/10 text-blue-700 dark:text-blue-300"
                    : "border-border bg-card text-muted-foreground"
                )}
              >
                <Sparkles className="h-4 w-4" />
                <span className="text-sm">PSE / Bancos</span>
              </button>
            </div>
          </div>

          {/* Method Details */}
          {paymentMethod === "nequi" && (
            <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4">
              <p className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                📲 {lang === "es"
                  ? "Ingresa tu número registrado en Nequi para recibir notificación push de aprobación en tu app:"
                  : "Enter your Nequi mobile phone number to approve push request:"}
              </p>
              <div className="mt-2 flex gap-2">
                <input
                  type="tel"
                  value={nequiPhone}
                  onChange={(e) => setNequiPhone(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm font-mono font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="300 000 0000"
                />
              </div>
            </div>
          )}

          {/* Policy Notice */}
          <div className="rounded-2xl bg-secondary/80 p-3 text-xs text-muted-foreground">
            <div className="flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <p>
                <b>
                  {lang === "es"
                    ? "Garantía de Compromiso Mutuo:"
                    : "Mutual Commitment Policy:"}
                </b>{" "}
                {lang === "es"
                  ? "Si cancelas con al menos 3 horas de antelación recibes 100% de devolución automática. En caso de ausencia injustificada (No-Show), el valor compensa el desplazamiento reservado del doctor."
                  : "Free cancellation up to 3 hours prior with 100% instant refund. In the event of an unexcused no-show, deposit covers travel & doctor time."}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleSimulatePayment}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-black text-white shadow-xl transition hover:bg-emerald-700 active:scale-98"
          >
            <span>
              {lang === "es"
                ? `Confirmar Anticipo de $${amounts[depositTier].cop.toLocaleString("es-CO")} COP`
                : `Confirm Deposit of $${amounts[depositTier].cop.toLocaleString("es-CO")} COP`}
            </span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {status === "processing" && (
        <div className="py-12 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
          <h4 className="mt-4 text-lg font-black text-foreground">
            {lang === "es"
              ? "Procesando pago con pasarela bancaria..."
              : "Processing secure transaction..."}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {lang === "es"
              ? "Validando token y registrando bloqueo de agenda en tiempo real."
              : "Verifying authorization token and locking schedule."}
          </p>
        </div>
      )}

      {status === "success" && (
        <div className="mt-6 space-y-4 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <h4 className="text-xl font-black text-foreground">
            {lang === "es"
              ? "¡Anticipo Pagado & Cita Bloqueada!"
              : "Deposit Paid & Appointment Confirmed!"}
          </h4>
          <p className="mx-auto max-w-md text-xs text-muted-foreground">
            {lang === "es"
              ? "Comprobante #DEP-2026-9812 emitido. La cita ha sido protegida contra No-Show y sincronizada con el calendario del Dr. Luis."
              : "Receipt #DEP-2026-9812 issued. Slot is guaranteed against no-show and synced to Dr. Luis's Google Calendar."}
          </p>

          {/* WhatsApp Notification Simulator */}
          <div className="rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-4 text-left">
            <div className="flex items-center gap-2 text-xs font-black text-emerald-800 dark:text-emerald-300">
              <Smartphone className="h-4 w-4" />
              <span>
                {lang === "es"
                  ? "Notificación Instantánea Enviada por WhatsApp al Tutor:"
                  : "Instant WhatsApp Notification Sent to Pet Parent:"}
              </span>
            </div>
            <div className="mt-2 rounded-xl bg-card p-3 font-sans text-xs leading-relaxed text-foreground shadow-sm">
              <p>
                «¡Hola Sara! 🎉 Tu pago de anticipo de{" "}
                <b>${amounts[depositTier].cop.toLocaleString("es-CO")} COP</b> para{" "}
                <b>Kenji</b> ha sido recibido con éxito.
              </p>
              <p className="mt-1">
                📅 <b>Fecha:</b> Jueves 26 Nov · 10:30 AM
                <br />
                🩺 <b>Médico:</b> Dr. Luis Eduardo Ríos
                <br />
                📍 <b>Lugar:</b> El Poblado, Calle 10 #43E-12
              </p>
              <p className="mt-2 text-emerald-600 dark:text-emerald-400">
                🚀 Sigue la llegada del doctor en tiempo real aquí:
                <br />
                <span className="font-mono underline">
                  https://vetfreedom.co/t/kenji-live-982
                </span>
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-secondary"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{lang === "es" ? "Reiniciar Simulador" : "Reset Simulator"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
