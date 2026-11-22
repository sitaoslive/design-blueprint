import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Plane,
  QrCode,
  Download,
  Share2,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  ChevronLeft,
  FileCheck,
  Award,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { meta } from "@/lib/vf/meta";
import { PageTitle, Card, Btn } from "@/components/vf/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cliente/pasaporte/$id")({
  head: () =>
    meta(
      "Pasaporte de Salud & Viaje",
      "Certificado médico veterinario oficial digital con verificación QR para vuelos nacionales e internacionales."
    ),
  component: HealthPassportPage,
});

function HealthPassportPage() {
  const { id } = Route.useParams();
  const passportCode = id || "PAS-CO-2026-9821";

  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    toast.success("Enlace de verificación oficial copiado al portapapeles.");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPdf = () => {
    toast.success(
      "Generando PDF oficial timbrado con firma COMVEZCOL-001 y código QR de seguridad..."
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back button */}
      <Link
        to="/cliente"
        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
      >
        <ChevronLeft className="h-4 w-4" />
        Volver al Panel del Tutor
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase text-emerald-600 dark:text-emerald-400">
            ✓ Certificado Oficial Verificado
          </span>
          <h1 className="mt-2 text-2xl font-black text-foreground md:text-3xl">
            Pasaporte Sanitario & Certificado de Viaje
          </h1>
          <p className="text-xs text-muted-foreground">
            Documento digital acreditado ante autoridades aeroportuarias (ICA / CDC / IATA).
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
          >
            <Share2 className="h-4 w-4" />
            <span>{copied ? "¡Copiado!" : "Compartir QR"}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            <span>Descargar PDF Oficial</span>
          </button>
        </div>
      </div>

      {/* Official Passport Card Body */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-emerald-500/30 bg-card p-6 shadow-2xl">
        {/* Top Official Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <Plane className="h-7 w-7" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                REPÚBLICA DE COLOMBIA · SERVICIO VETERINARIO DOMICILIARIO
              </p>
              <h2 className="text-lg font-black text-foreground">
                CERTIFICADO DE SALUD Y APTITUD DE VIAJE
              </h2>
            </div>
          </div>

          <div className="text-right">
            <span className="block text-[10px] font-bold text-muted-foreground">
              CÓDIGO ÚNICO DE PASAPORTE:
            </span>
            <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
              {passportCode}
            </span>
          </div>
        </div>

        {/* Grid: Patient data + Verifiable QR */}
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {/* Patient Details */}
          <div className="space-y-4 md:col-span-2">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-secondary/60 p-4 text-xs">
              <div>
                <span className="text-muted-foreground">Paciente:</span>
                <p className="font-black text-foreground text-sm">
                  Samantha
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Especie & Raza:</span>
                <p className="font-bold text-foreground">Felino · Doméstico (DSH)</p>
              </div>
              <div>
                <span className="text-muted-foreground">Sexo & Estado:</span>
                <p className="font-bold text-foreground">Hembra · Esterilizada</p>
              </div>
              <div>
                <span className="text-muted-foreground">Peso Actual:</span>
                <p className="font-mono font-bold text-foreground">4.20 kg</p>
              </div>
              <div>
                <span className="text-muted-foreground">Microchip ISO 11784:</span>
                <p className="font-mono font-black text-foreground">
                  981 098 102 938 475
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Tutor Acreditado:</span>
                <p className="font-bold text-foreground">Nathalia Andrea Robles</p>
              </div>
            </div>

            {/* Travel Route & Carrier */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-black text-indigo-700 dark:text-indigo-300">
                <Plane className="h-4 w-4" />
                <span>Itinerario y Condiciones de Viaje Autorizadas</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div>
                  <span className="text-muted-foreground">Destino:</span>
                  <p className="font-bold text-foreground">Estados Unidos (MIA)</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Modalidad:</span>
                  <p className="font-bold text-foreground">Cabina de Pasajeros</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Vigencia Certificado:</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    Válido hasta 17 Dic 2026
                  </p>
                </div>
              </div>
            </div>

            {/* Clinical Verifications */}
            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                Dictámenes Clínicos Obligatorios Aprobados:
              </h4>
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                <div className="flex items-start gap-2 rounded-xl bg-card p-3 border border-border">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <b className="text-foreground">Examen Físico: APTO</b>
                    <p className="text-[11px] text-muted-foreground">
                      Sin signos de enfermedades infectocontagiosas ni ectoparásitos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-card p-3 border border-border">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <b className="text-foreground">Vacuna Rabia Vigente</b>
                    <p className="text-[11px] text-muted-foreground">
                      Rabisin Lote #849201 · Apl: 15/10/26 · Vence: 15/10/27
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-card p-3 border border-border">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <b className="text-foreground">Desparasitación Pre-Vuelo</b>
                    <p className="text-[11px] text-muted-foreground">
                      NexGard Combo + Praziquantel dentro de ventana reglamentaria.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl bg-card p-3 border border-border">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <b className="text-foreground">Firma & Sello COMVEZCOL</b>
                    <p className="text-[11px] text-muted-foreground">
                      Emitido por Dr. Luis Eduardo Ríos (COMVEZCOL-001)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Verifiable QR Box */}
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-emerald-500/40 bg-emerald-500/5 p-6 text-center">
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-300">
              Escaneo en Aeropuerto
            </span>

            {/* High visual QR Code simulation */}
            <div className="mt-4 rounded-2xl bg-white p-4 shadow-xl">
              <div className="relative grid h-44 w-44 place-items-center rounded-xl border border-stone-200 bg-white">
                {/* SVG QR Code Illustration */}
                <svg
                  viewBox="0 0 100 100"
                  className="h-40 w-40 text-stone-900"
                  fill="currentColor"
                >
                  {/* Top-left marker */}
                  <rect x="10" y="10" width="24" height="24" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" />

                  {/* Top-right marker */}
                  <rect x="66" y="10" width="24" height="24" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" />

                  {/* Bottom-left marker */}
                  <rect x="10" y="66" width="24" height="24" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="18" y="74" width="8" height="8" />

                  {/* Data modules */}
                  <rect x="38" y="12" width="6" height="6" />
                  <rect x="48" y="12" width="6" height="12" />
                  <rect x="38" y="24" width="12" height="6" />
                  <rect x="12" y="38" width="6" height="6" />
                  <rect x="24" y="38" width="12" height="6" />
                  <rect x="42" y="38" width="16" height="6" />
                  <rect x="66" y="38" width="8" height="16" />
                  <rect x="80" y="38" width="10" height="6" />
                  <rect x="12" y="48" width="18" height="6" />
                  <rect x="36" y="48" width="8" height="8" />
                  <rect x="50" y="48" width="12" height="12" />
                  <rect x="78" y="48" width="12" height="6" />
                  <rect x="38" y="66" width="8" height="14" />
                  <rect x="52" y="66" width="18" height="6" />
                  <rect x="76" y="66" width="14" height="10" />
                  <rect x="42" y="82" width="14" height="8" />
                  <rect x="62" y="80" width="8" height="10" />
                  <rect x="76" y="82" width="14" height="8" />
                </svg>
              </div>
            </div>

            <p className="mt-3 text-[11px] font-black text-foreground">
              Validación Criptográfica en Línea
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
              Permite a los inspectores de aduanas y aerolíneas verificar la autenticidad en tiempo real.
            </p>
            <span className="mt-2 font-mono text-[9px] text-emerald-600 dark:text-emerald-400">
              vetfreedom.co/verificar/{passportCode}
            </span>
          </div>
        </div>

        {/* Footer Attestation */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>
              Certificado expedido y firmado digitalmente por{" "}
              <b className="text-foreground">Dr. Luis Eduardo Ríos</b> · Tarjeta COMVEZCOL-001
            </span>
          </div>
          <span>Medellín, Colombia · {new Date().toLocaleDateString("es-CO")}</span>
        </div>
      </div>
    </div>
  );
}
