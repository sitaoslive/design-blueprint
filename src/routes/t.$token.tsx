/**
 * VET FREEDOM OS — PORTAL PÚBLICO DE SEGUIMIENTO PARA PROPIETARIOS
 * Ruta: /t/:token
 * Dirección Médica: Dr. Luis Eduardo Ríos
 * Dirección Estratégica: Alpha Vision Method
 * Fecha: 22 de Noviembre de 2026
 */

import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { meta } from "@/lib/vf/meta";
import {
  Clock,
  MapPin,
  CheckCircle2,
  Navigation,
  Car,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Phone
} from "lucide-react";

export const Route = createFileRoute("/t/$token")({
  head: () => meta("Seguimiento de Visita en Vivo", "Portal público de seguimiento en tiempo real y hora estimada de llegada de Vet Life."),
  component: CustomerTrackingPage
});

interface TrackingViewData {
  authorized: boolean;
  error?: string;
  appointmentId?: string;
  status?: string;
  scheduledStart?: string;
  predictedArrival?: string;
  predictedTravelMinutes?: number;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNAVAILABLE';
  currentLocation?: {
    latitude: number;
    longitude: number;
    observedAt: string;
  } | null;
}

export function CustomerTrackingPage() {
  const { token } = Route.useParams();
  const [data, setData] = useState<TrackingViewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchTracking = async () => {
    try {
      // La función de validación por token aún no está publicada en el backend;
      // hasta entonces la página falla cerrada mostrando «enlace no disponible».
      const rpc = supabase.rpc as unknown as (
        fn: string,
        args: Record<string, unknown>
      ) => Promise<{ data: unknown; error: { message: string } | null }>;
      const { data: res, error } = await rpc("validate_customer_tracking_view", {
        p_token: token
      });

      if (error || !res) {
        setData({
          authorized: false,
          error: error?.message || "INVALID_TOKEN"
        });
      } else {
        setData(res as TrackingViewData | null);
        setLastRefreshed(new Date());
      }
    } catch (err: any) {
      setData({
        authorized: false,
        error: err.message || "NETWORK_ERROR"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    // Auto refrescar cada 30 segundos si el estado es EN_ROUTE
    const interval = setInterval(() => {
      fetchTracking();
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          Cargando información de su visita en vivo...
        </p>
      </div>
    );
  }

  if (!data?.authorized) {
    return (
      <div className="mx-auto max-w-lg p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-xl font-black">Enlace no disponible o expirado</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Por razones de seguridad y privacidad familiar, los enlaces de seguimiento tienen una vigencia limitada y caducan una vez culminada la atención.
        </p>
        <div className="mt-6 rounded-2xl bg-secondary p-4 text-left">
          <p className="text-xs font-bold text-primary">¿Necesita asistencia inmediata?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Comuníquese con nuestra línea de atención veterinaria autorizada para consultar el estado de su servicio.
          </p>
          <a
            href="https://wa.me/573105550199"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground"
          >
            <Phone className="h-3.5 w-3.5" /> Contactar a Vet Life
          </a>
        </div>
      </div>
    );
  }

  const isEnRoute = data.status === "EN_ROUTE";
  const isArrived = data.status === "ARRIVED" || data.status === "IN_SERVICE";
  const isCompleted = data.status === "COMPLETED";

  return (
    <div className="mx-auto max-w-xl space-y-6 p-4 sm:p-6">
      {/* Cabecera de la Marca */}
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-black text-primary">
          <ShieldCheck className="h-4 w-4" /> Vet Life — Dr. Luis Eduardo Ríos
        </span>
        <h1 className="mt-2 text-2xl font-black tracking-tight">
          Seguimiento en Vivo de su Visita
        </h1>
        <p className="text-xs text-muted-foreground">
          Atención veterinaria a domicilio en Bogotá · Horarios en hora local
        </p>
      </div>

      {/* Estado Principal */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              isCompleted
                ? "bg-emerald-500/10 text-emerald-600"
                : isEnRoute
                ? "bg-blue-500/10 text-blue-600"
                : isArrived
                ? "bg-purple-500/10 text-purple-600"
                : "bg-secondary text-primary"
            }`}>
              {isCompleted ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : isEnRoute ? (
                <Car className="h-6 w-6 animate-pulse" />
              ) : isArrived ? (
                <MapPin className="h-6 w-6" />
              ) : (
                <Clock className="h-6 w-6" />
              )}
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground">ESTADO ACTUAL</span>
              <h2 className="text-lg font-black">
                {isCompleted && "Visita Completada"}
                {isEnRoute && "Equipo en Camino hacia su Domicilio"}
                {isArrived && "Equipo en Domicilio / Atención en Curso"}
                {!isCompleted && !isEnRoute && !isArrived && "Cita Confirmada en Agenda"}
              </h2>
            </div>
          </div>
          <button
            onClick={fetchTracking}
            title="Actualizar datos"
            className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Tarjeta de ETA y Tiempo Estimado */}
        {data.predictedArrival && isEnRoute && (
          <div className="mt-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-blue-800 dark:text-blue-300">
                  HORA ESTIMADA DE LLEGADA (ETA)
                </span>
                <p className="mt-1 text-2xl font-black text-blue-900 dark:text-blue-100">
                  {new Date(data.predictedArrival).toLocaleTimeString("es-CO", {
                    timeZone: "America/Bogota",
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </p>
                {data.predictedTravelMinutes && (
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Aproximadamente {data.predictedTravelMinutes} minutos en trayecto
                  </p>
                )}
              </div>
              <span className="rounded-full bg-blue-500/20 px-2.5 py-1 text-[11px] font-bold text-blue-800 dark:text-blue-200">
                Confianza: {data.confidence || "ALTA"}
              </span>
            </div>
          </div>
        )}

        {/* Programación Base */}
        {data.scheduledStart && !isEnRoute && (
          <div className="mt-4 rounded-2xl bg-secondary p-4 text-xs">
            <span className="font-bold text-muted-foreground">VENTANA PROGRAMADA:</span>
            <p className="mt-1 text-sm font-black">
              {new Date(data.scheduledStart).toLocaleDateString("es-CO", {
                weekday: "long",
                day: "numeric",
                month: "long"
              })} · {new Date(data.scheduledStart).toLocaleTimeString("es-CO", {
                timeZone: "America/Bogota",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </p>
          </div>
        )}
      </div>

      {/* Mapa y Coordenadas en Vivo (Guardia de Privacidad) */}
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-bold">
          <Navigation className="h-4 w-4 text-primary" /> Ubicación del Equipo
        </h3>

        {isEnRoute && data.currentLocation ? (
          <div className="mt-3 space-y-3">
            <p className="text-xs text-muted-foreground">
              Ubicación transmitida en tiempo real conforme a la política de telemetría de Vet Freedom OS:
            </p>
            <div className="rounded-2xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between text-xs">
                <span>Lat: {data.currentLocation.latitude.toFixed(4)}</span>
                <span>Lng: {data.currentLocation.longitude.toFixed(4)}</span>
              </div>
              <a
                href={`https://www.google.com/maps?q=${data.currentLocation.latitude},${data.currentLocation.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <MapPin className="h-3.5 w-3.5" /> Abrir coordenadas en Google Maps
              </a>
            </div>
            <span className="block text-[10px] text-muted-foreground">
              Última señal recibida: {new Date(data.currentLocation.observedAt).toLocaleTimeString("es-CO", { timeZone: "America/Bogota" })}
            </span>
          </div>
        ) : (
          <div className="mt-3 rounded-2xl bg-secondary/50 p-4 text-xs text-muted-foreground">
            <p>
              Por políticas de privacidad de nuestro equipo médico, la ubicación satelital en vivo se activa únicamente cuando el profesional inicia el trayecto hacia su dirección.
            </p>
          </div>
        )}
      </div>

      {/* Pie de Página */}
      <div className="text-center text-[11px] text-muted-foreground">
        Vet Life — Veterinaria a Domicilio · Sistema Vet Freedom OS · Bogotá D.C.
      </div>
    </div>
  );
}
