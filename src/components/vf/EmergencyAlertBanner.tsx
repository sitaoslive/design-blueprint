import { useState, useEffect } from "react";
import { AlertTriangle, Bell, BellOff, PhoneCall, X, ShieldAlert } from "lucide-react";
import { emergencyAlert } from "@/lib/vf/emergencyAlert";
import { Btn } from "./ui";

export function EmergencyAlertBanner() {
  const [active, setActive] = useState(false);
  const [patient, setPatient] = useState("Luna");
  const [reason, setReason] = useState("Dificultad respiratoria súbita y vómito");
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    // Escuchar eventos globales de emergencia
    const onTrigger = (e: CustomEvent<{ patient: string; reason: string }>) => {
      setPatient(e.detail?.patient || "Luna");
      setReason(e.detail?.reason || "Dificultad respiratoria súbita");
      setActive(true);
      if (soundEnabled) {
        emergencyAlert.triggerEmergency(e.detail?.patient, e.detail?.reason);
      }
    };

    window.addEventListener("vet-emergency-alert" as never, onTrigger as never);
    return () => {
      window.removeEventListener("vet-emergency-alert" as never, onTrigger as never);
      emergencyAlert.stopEmergency();
    };
  }, [soundEnabled]);

  if (!active) return null;

  const handleDismiss = () => {
    emergencyAlert.stopEmergency();
    setActive(false);
  };

  const handleToggleSound = () => {
    if (soundEnabled) {
      emergencyAlert.stopEmergency();
      setSoundEnabled(false);
    } else {
      setSoundEnabled(true);
      emergencyAlert.triggerEmergency(patient, reason);
    }
  };

  return (
    <div
      role="alert"
      className="relative mb-4 animate-bounce overflow-hidden rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-red-900 shadow-xl dark:bg-red-950/60 dark:text-red-100"
    >
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-red-600 p-2 text-white animate-pulse">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white">
              🚨 Alerta de Urgencia Vital
            </span>
            <button
              onClick={handleDismiss}
              className="rounded-lg p-1 text-red-700 hover:bg-red-200 dark:text-red-300 dark:hover:bg-red-900"
              aria-label="Cerrar alerta"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-base font-extrabold">
            Paciente: {patient} · Prioridad 1 (Atención Inmediata)
          </p>
          <p className="text-sm font-medium opacity-90">{reason}</p>
          <p className="mt-1 text-xs text-red-700 dark:text-red-300">
            🔔 Sonando en altavoz del teléfono y transmitiendo vibración a Apple Watch.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href="tel:+573225829583"
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white shadow transition hover:bg-red-700"
            >
              <PhoneCall className="h-4 w-4" />
              Llamar al Tutor
            </a>
            <button
              onClick={handleToggleSound}
              className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3 py-2 text-xs font-bold text-red-800 shadow-sm transition hover:bg-red-50 dark:border-red-800 dark:bg-red-900/40 dark:text-red-100"
            >
              {soundEnabled ? (
                <>
                  <BellOff className="h-4 w-4 text-red-600" /> Silenciar Alarma
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 text-green-600" /> Reactivar Sirena
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Función global auxiliar para disparar la alarma desde cualquier componente o demo
 */
export function fireEmergencyAlert(patient = "Luna", reason = "Dificultad respiratoria súbita y vómito") {
  if (typeof window !== "undefined") {
    void emergencyAlert.requestNotificationPermission();
    window.dispatchEvent(
      new CustomEvent("vet-emergency-alert", {
        detail: { patient, reason },
      })
    );
  }
}
