/**
 * VET FREEDOM OS — SISTEMA DE ALERTA DE URGENCIA CRÍTICA
 * Produce sonido de alarma médica (Web Audio API), vibración háptica
 * (compatible con Celular y Apple Watch / WearOS) y notificación push de navegador.
 */

class EmergencyAlertService {
  private audioCtx: AudioContext | null = null;
  private isAlerting = false;
  private intervalId: number | null = null;

  private initAudio() {
    if (!this.audioCtx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
  }

  /**
   * Emite un tono dual de alta prioridad médica (880 Hz a 1320 Hz)
   */
  private playPulseTone() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      if (this.audioCtx.state === "suspended") {
        void this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      // Alternar tono de sirena de urgencia
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch (e) {
      console.warn("Audio alert failed", e);
    }
  }

  /**
   * Dispara vibración háptica en el teléfono móvil y Apple Watch conectado
   */
  private triggerVibration() {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      // Patrón de urgencia: vibra 300ms, pausa 150ms, vibra 300ms, pausa 150ms, vibra 600ms
      navigator.vibrate([300, 150, 300, 150, 600]);
    }
  }

  /**
   * Lanza notificación nativa al sistema operativo (espejada en Apple Watch)
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    if (Notification.permission === "granted") return true;
    if (Notification.permission !== "denied") {
      const res = await Notification.requestPermission();
      return res === "granted";
    }
    return false;
  }

  /**
   * Inicia la alarma sonora y háptica de urgencia
   */
  public triggerEmergency(patientName = "Luna", reason = "Dificultad respiratoria súbita") {
    this.initAudio();
    this.isAlerting = true;

    // Primer pulso inmediato
    this.playPulseTone();
    this.triggerVibration();

    // Notificación en pantalla / reloj
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      try {
        new Notification(`🚨 ¡URGENCIA VETERINARIA VET LIFE!`, {
          body: `Paciente: ${patientName} · Motivo: ${reason}. Requiere atención inmediata.`,
          icon: "/favicon.ico",
          tag: "vet-urgency",
          requireInteraction: true,
        });
      } catch (e) {
        console.warn("Push notification failed", e);
      }
    }

    // Repetir alarma sonora y vibración cada 2 segundos por 12 segundos (o hasta silenciar)
    if (this.intervalId !== null) clearInterval(this.intervalId);
    let count = 0;
    this.intervalId = window.setInterval(() => {
      count++;
      if (count > 6 || !this.isAlerting) {
        this.stopEmergency();
        return;
      }
      this.playPulseTone();
      this.triggerVibration();
    }, 2000);
  }

  /**
   * Silencia la alarma
   */
  public stopEmergency() {
    this.isAlerting = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(0);
    }
  }

  public get isActive() {
    return this.isAlerting;
  }
}

export const emergencyAlert = new EmergencyAlertService();
