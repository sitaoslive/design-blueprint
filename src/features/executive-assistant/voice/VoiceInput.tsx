import { useEffect, useRef, useState } from "react";
import { Mic, Square, X, Volume2, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { Btn } from "@/components/vf/ui";
import { unavailableVoiceGateway } from "../application/contracts";
export function VoiceInput({ onText }: { onText: (text: string) => void }) {
  const [state, setState] = useState("READY");
  const [transcript, setTranscript] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const audio = useRef<Blob | null>(null);
  const cancelled = useRef(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cleanup = () => {
    if (timeout.current) clearTimeout(timeout.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };
  useEffect(
    () => () => {
      cancelled.current = true;
      if (recorder.current?.state === "recording") recorder.current.stop();
      cleanup();
      audio.current = null;
    },
    [],
  );
  const cancel = () => {
    cancelled.current = true;
    if (recorder.current?.state === "recording") recorder.current.stop();
    cleanup();
    audio.current = null;
    setState("CANCELLED");
  };
  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setState("MICROPHONE_UNAVAILABLE");
      return;
    }
    setState("PERMISSION_REQUIRED");
    cancelled.current = false;
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (cancelled.current) {
        media.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = media;
      const chunks: BlobPart[] = [];
      const instance = new MediaRecorder(media);
      recorder.current = instance;
      instance.ondataavailable = (event) => {
        if (event.data.size) chunks.push(event.data);
      };
      instance.onstop = () => {
        cleanup();
        if (cancelled.current) return;
        audio.current = new Blob(chunks, { type: instance.mimeType });
        setState("PROCESSING_AUDIO");
        void unavailableVoiceGateway.transcribe(audio.current).catch((error) => {
          audio.current = null;
          setState("TRANSCRIPTION_FAILED");
          toast.error(error instanceof Error ? error.message : "No se pudo transcribir");
        });
      };
      instance.start();
      setState("RECORDING");
      timeout.current = setTimeout(() => {
        if (instance.state === "recording") instance.stop();
      }, 60000);
    } catch {
      cleanup();
      setState("PERMISSION_DENIED");
    }
  };
  return (
    <div className="mb-3 border-y border-border py-3">
      <div className="flex flex-wrap items-center gap-2">
        <Btn
          variant="outline"
          aria-label="Grabar voz"
          disabled={["RECORDING", "PERMISSION_REQUIRED", "PROCESSING_AUDIO"].includes(state)}
          onClick={() => void start()}
        >
          <Mic className="h-4 w-4" />
          Voz
        </Btn>
        {state === "RECORDING" && (
          <Btn variant="outline" onClick={() => recorder.current?.stop()}>
            <Square className="h-4 w-4" />
            Detener
          </Btn>
        )}
        <Btn variant="outline" aria-label="Cancelar grabación" onClick={cancel}>
          <X className="h-4 w-4" />
        </Btn>
        <p role="status" className="text-sm">
          {state === "RECORDING"
            ? "Grabando · máximo 60 segundos"
            : state === "PERMISSION_REQUIRED"
              ? "Esperando permiso del micrófono"
              : state === "PERMISSION_DENIED"
                ? "Permiso de micrófono denegado"
                : state === "TRANSCRIPTION_FAILED"
                  ? "Transcripción no disponible; audio descartado y no enviado"
                  : state === "MICROPHONE_UNAVAILABLE"
                    ? "Micrófono no disponible"
                    : state === "CANCELLED"
                      ? "Grabación cancelada"
                      : state === "PROCESSING_AUDIO"
                        ? "Revisando disponibilidad de transcripción"
                        : "Transcripción: proveedor pendiente"}
        </p>
      </div>
      {transcript && (
        <label className="mt-3 block">
          Revisar transcripción
          <textarea
            className="w-full rounded-lg border border-border bg-card p-3"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <Btn
            onClick={() => {
              onText(transcript);
              setTranscript("");
            }}
          >
            Usar texto revisado
          </Btn>
        </label>
      )}
    </div>
  );
}
export function ReadResponse({ text }: { text: string }) {
  const [enabled, setEnabled] = useState(false);
  useEffect(
    () => () => {
      if (enabled) window.speechSynthesis?.cancel();
    },
    [enabled],
  );
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-2 text-xs">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            if (!e.target.checked) window.speechSynthesis?.cancel();
          }}
        />
        Lectura en voz alta
      </label>
      {enabled && (
        <>
          <Btn
            variant="outline"
            aria-label="Leer respuesta"
            title="Leer respuesta"
            onClick={() => {
              if (!window.speechSynthesis) {
                toast.error("Lectura de voz no disponible");
                return;
              }
              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = "es-CO";
              window.speechSynthesis.speak(utterance);
            }}
          >
            <Volume2 className="h-4 w-4" />
          </Btn>
          <Btn
            variant="outline"
            aria-label="Pausar lectura"
            onClick={() => window.speechSynthesis?.pause()}
          >
            <Pause className="h-4 w-4" />
          </Btn>
          <Btn
            variant="outline"
            aria-label="Continuar lectura"
            onClick={() => window.speechSynthesis?.resume()}
          >
            <Play className="h-4 w-4" />
          </Btn>
        </>
      )}
    </div>
  );
}
