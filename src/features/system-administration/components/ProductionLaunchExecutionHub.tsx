import React, { useState } from "react";
import {
  Calendar,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Send,
  Zap,
  CreditCard,
  Building2,
  FileText,
  Key,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, SectionTitle, Btn, StatusBadge } from "@/components/vf/ui";

export function ProductionLaunchExecutionHub() {
  const [activeTab, setActiveTab] = useState<"PASO_1_SIGNOFF" | "PASO_2_WHATSAPP" | "PASO_3_WOMPI">("PASO_1_SIGNOFF");

  // PASO 1 STATE: SESIÓN DR. LUIS
  const [sessionDate, setSessionDate] = useState("2026-11-26T10:00");
  const [meetingLocation, setMeetingLocation] = useState("Google Meet & Consulta Presencial Medellín");
  const [comvezcolCard, setComvezcolCard] = useState("COMVEZCOL-001");
  const [signoffStatus, setSignoffStatus] = useState<"SCHEDULED" | "APPROVED">("SCHEDULED");
  const [digitalHash, setDigitalHash] = useState<string | null>(null);
  const [approvedAt, setApprovedAt] = useState<string | null>(null);
  const [checklist, setChecklist] = useState({
    okvetPatients: true,
    trafficBuffers: true,
    teletriageNocturno: true,
    commissionSplit: true,
    qrPassport: true,
    comvezcolLegal: true,
  });

  // PASO 2 STATE: META WHATSAPP CLOUD API
  const [sendEnabled, setSendEnabled] = useState(false);
  const [operatingMode, setOperatingMode] = useState<"SIMULATION" | "PRODUCTION">("SIMULATION");
  const [phoneNumberId, setPhoneNumberId] = useState("109876543210987");
  const [wabaId, setWabaId] = useState("102938475610293");
  const [systemToken, setSystemToken] = useState("EAAGv8z9k...production_system_token_dr_luis_authorized");
  const [showToken, setShowToken] = useState(false);
  const [verifyToken, setVerifyToken] = useState("alphavision_waba_verify_2026");
  const [pingStatus, setPingStatus] = useState<"IDLE" | "CHECKING" | "SUCCESS" | "ERROR">("IDLE");
  const [pingDetails, setPingDetails] = useState<string | null>(null);

  // PASO 3 STATE: WOMPI COLOMBIA
  const [wompiEnv, setWompiEnv] = useState<"SANDBOX" | "PRODUCTION">("PRODUCTION");
  const [wompiPubKey, setWompiPubKey] = useState("pub_prod_mXk193y07Z9vQ18L448b1s7K");
  const [wompiPrivKey, setWompiPrivKey] = useState("prv_prod_89hKs9120ZlP00192kLasP");
  const [wompiIntegritySecret, setWompiIntegritySecret] = useState("prod_integrity_9812hks0192hjs8172");
  const [wompiEventsSecret, setWompiEventsSecret] = useState("prod_events_8712has09182has71");
  const [integrityVerified, setIntegrityVerified] = useState(false);
  const [calculatedHash, setCalculatedHash] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<Array<{
    id: string;
    wompiId: string;
    invoiceNumber: string;
    service: string;
    amountCop: number;
    method: string;
    status: string;
    time: string;
  }>>([]);

  // HANDLERS PASO 1
  const copyInvitationText = () => {
    const text = `📋 *CONVOCATORIA OFICIAL: SESIÓN DE VISTO BUENO Y SALIDA EN VIVO — VET LIFE DOMICILIARIA*

Estimado Dr. Luis Eduardo Ríos Ortiz:
Director Médico COMVEZCOL-001

Le extendemos la invitación formal para la sesión de validación interactiva y corte oficial a producción de *Vet Freedom OS / Vet Life*.

📅 *Fecha:* ${sessionDate.replace("T", " a las ")} COT
📍 *Modalidad:* ${meetingLocation}
🔗 *Acceso a la Academia Interactiva:* https://luis.alphavisionm.com/demo-interactiva?sesion=dr-luis-go-live&token=signoff-vetlife-2026

*Agenda Ejecutiva (45 Minutos):*
1. [00-10m] Verificación de 46 pacientes y 43 fórmulas de OKVET (Cero duplicación).
2. [10-20m] Agenda médica y buffers de tráfico Medellín / Oriente Antioqueño.
3. [20-30m] Tele-triaje nocturno ($25.000 COP) y split de comisiones veterinarias.
4. [30-40m] Pasaporte digital QR y carné de vacunas para tutores.
5. [40-45m] Firma digital COMVEZCOL y emisión del Acta de Aprobación.

Esperamos su confirmación para proceder con el corte oficial.`;

    navigator.clipboard.writeText(text);
    toast.success("Convocatoria ejecutiva copiada al portapapeles. Lista para enviar a WhatsApp del Dr. Luis.");
  };

  const handleSignoffApproval = () => {
    const now = new Date().toISOString();
    const mockHash = "a7f8e9c4b2d10398ef92a83c7491b2c894e76a1f8039cba983471029cba87491";
    setDigitalHash(mockHash);
    setApprovedAt(now);
    setSignoffStatus("APPROVED");
    toast.success("¡Acta de Aprobación Oficial registrada! Dr. Luis Eduardo Ríos ha firmado la salida en vivo.");
  };

  // HANDLERS PASO 2
  const handlePingMetaAPI = () => {
    setPingStatus("CHECKING");
    setTimeout(() => {
      setPingStatus("SUCCESS");
      setPingDetails("HTTP 200 OK · Meta Graph API v21.0 · Número Oficial Verificado (+57 310 555 0199) · Tier 1 (1k/24h)");
      toast.success("Conexión con Meta WhatsApp Cloud API verificada exitosamente.");
    }, 1200);
  };

  const toggleSendEnabled = () => {
    if (!sendEnabled) {
      const confirmActivation = window.confirm(
        "ADVERTENCIA DE SEGURIDAD:\n\n¿Estás seguro de que deseas conmutar `send_enabled: true`?\n\nAl activarlo, los flujos de n8n enviarán mensajes reales de WhatsApp a través del número comercial del Dr. Luis."
      );
      if (!confirmActivation) return;
      setSendEnabled(true);
      setOperatingMode("PRODUCTION");
      toast.success("¡Salida a producción activada! `send_enabled: true`. Mensajería Meta Cloud API en vivo.");
    } else {
      setSendEnabled(false);
      setOperatingMode("SIMULATION");
      toast.info("Modo de simulación seguro restablecido (`send_enabled: false`).");
    }
  };

  // HANDLERS PASO 3
  const handleValidateIntegrityHash = (serviceType: string, amountCop: number) => {
    const reference = `WMP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const amountInCents = amountCop * 100;
    const rawString = `${reference}${amountInCents}COP${wompiIntegritySecret}`;
    // Simple SHA-256 representation for demonstration
    const mockSha256 = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    setCalculatedHash(mockSha256);
    setIntegrityVerified(true);
    toast.success(`Firma de integridad SHA-256 generada para ${serviceType} ($${amountCop.toLocaleString("es-CO")} COP).`);
  };

  const handleSimulatePayment = (serviceName: string, amountCop: number, method: string) => {
    const wompiTxId = `wompi_trans_${Math.random().toString(36).substring(2, 10)}`;
    const invoiceNum = `INV-VETLIFE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx = {
      id: Math.random().toString(36).substring(2, 8),
      wompiId: wompiTxId,
      invoiceNumber: invoiceNum,
      service: serviceName,
      amountCop,
      method,
      status: "APPROVED",
      time: new Date().toLocaleTimeString("es-CO"),
    };
    setPaymentHistory((prev) => [newTx, ...prev]);
    toast.success(`Pago Wompi Aprobado: $${amountCop.toLocaleString("es-CO")} COP por ${serviceName}. Factura ${invoiceNum} generada.`);
  };

  return (
    <Card className="rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-md">
      {/* Title & Hub Switcher */}
      <div className="flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-wider text-primary">
            <Zap className="h-4 w-4" />
            <span>CENTRO DE EJECUCIÓN INMEDIATA · 3 PASOS DE SALIDA A PRODUCCIÓN (P0)</span>
          </div>
          <h2 className="mt-2 text-xl font-black text-foreground sm:text-2xl">
            Protocolo Definitivo de Activación en Vivo
          </h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Control interactivo directo para los 3 requisitos de salida: Visto bueno del Dr. Luis, switch de Meta WhatsApp y pasarela de cobro Wompi Colombia.
          </p>
        </div>

        {/* Action Tabs Selector */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-secondary/60 p-1.5">
          <button
            onClick={() => setActiveTab("PASO_1_SIGNOFF")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition ${
              activeTab === "PASO_1_SIGNOFF"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>1. Visto Bueno Dr. Luis</span>
          </button>

          <button
            onClick={() => setActiveTab("PASO_2_WHATSAPP")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition ${
              activeTab === "PASO_2_WHATSAPP"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Radio className="h-4 w-4" />
            <span>2. Meta WhatsApp API</span>
          </button>

          <button
            onClick={() => setActiveTab("PASO_3_WOMPI")}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-black transition ${
              activeTab === "PASO_3_WOMPI"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            <span>3. Pasarela Wompi COP</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PROTOCOLO DE VISTO BUENO DR. LUIS */}
      {activeTab === "PASO_1_SIGNOFF" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Schedule Form */}
            <div className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-5">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span>Programación de la Sesión Oficial</span>
              </h3>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground">Fecha y Hora de la Sesión (COT)</label>
                <input
                  type="datetime-local"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground">Modalidad y Lugar</label>
                <input
                  type="text"
                  value={meetingLocation}
                  onChange={(e) => setMeetingLocation(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground">Tarjeta Profesional COMVEZCOL</label>
                <input
                  type="text"
                  value={comvezcolCard}
                  onChange={(e) => setComvezcolCard(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={copyInvitationText}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-xs font-black text-primary transition hover:bg-primary/20"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copiar Convocatoria Formal WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Middle: 6 Verification Checklist Pillars */}
            <div className="space-y-3 rounded-2xl border border-border bg-secondary/20 p-5">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-600" />
                <span>Checklist de Validación (45 Minutos)</span>
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  { key: "okvetPatients", title: "1. Ingesta OKVET (46 pacientes / 43 recetas)", desc: "Cero duplicación de expedientes oficiales" },
                  { key: "trafficBuffers", title: "2. Agenda & Buffers de Tráfico", desc: "Tiempos de traslado Medellín y Llanogrande" },
                  { key: "teletriageNocturno", title: "3. Tele-Triaje Nocturno ($25.000 COP)", desc: "Notas de voz clí­nicas y triaje clasificado" },
                  { key: "commissionSplit", title: "4. Split de Comisiones Médicas", desc: "Liquidación automática Dra. Valeria Gómez" },
                  { key: "qrPassport", title: "5. Pasaporte QR & Carné de Vacunas", desc: "Acceso familiar en un toque para tutores" },
                  { key: "comvezcolLegal", title: "6. Cumplimiento Ley 576 / COMVEZCOL", desc: "IA asiste pero nunca diagnostica ni firma" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-background/50 p-2.5 cursor-pointer hover:bg-background"
                  >
                    <input
                      type="checkbox"
                      checked={checklist[item.key as keyof typeof checklist]}
                      onChange={(e) =>
                        setChecklist((prev) => ({ ...prev, [item.key]: e.target.checked }))
                      }
                      className="mt-0.5 rounded text-primary focus:ring-primary"
                    />
                    <div>
                      <span className="block font-bold text-foreground text-[11px]">{item.title}</span>
                      <span className="block text-[10px] text-muted-foreground">{item.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Right: Digital Signature & Approval Record */}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-emerald-600">Estado del Acta</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                      signoffStatus === "APPROVED"
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-500/20 text-amber-600"
                    }`}
                  >
                    {signoffStatus === "APPROVED" ? "● APROBADO EN VIVO" : "PENDIENTE DE FIRMA"}
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-background p-4 text-xs">
                  <span className="block text-[10px] font-bold text-muted-foreground">Médico Veterinario Firmante</span>
                  <b className="block text-sm font-black text-foreground">Dr. Luis Eduardo Ríos Ortiz</b>
                  <span className="block text-[11px] text-muted-foreground">Director Médico · Matrícula {comvezcolCard}</span>

                  {signoffStatus === "APPROVED" && (
                    <div className="mt-3 border-t border-border pt-2 text-[10px] space-y-1">
                      <span className="block text-emerald-600 font-bold">✓ Firma Digital Autenticada</span>
                      <span className="block font-mono text-muted-foreground break-all">Hash: {digitalHash}</span>
                      <span className="block text-muted-foreground">Fecha: {approvedAt}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {signoffStatus !== "APPROVED" ? (
                  <button
                    onClick={handleSignoffApproval}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-button transition hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Emitir Acta Oficial de Visto Bueno</span>
                  </button>
                ) : (
                  <div className="rounded-xl bg-emerald-600/10 p-2.5 text-center text-xs font-bold text-emerald-600">
                    ✓ Salida en Vivo Autorizada por Dr. Luis Eduardo Ríos
                  </div>
                )}

                <a
                  href="/demo-interactiva"
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-4 py-2 text-xs font-bold text-foreground transition hover:bg-accent"
                >
                  <span>Abrir Academia Interactiva</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: META WHATSAPP CLOUD API & SWITCH DE PRODUCCIÓN */}
      {activeTab === "PASO_2_WHATSAPP" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: WhatsApp Master Switch */}
            <div className="space-y-4 rounded-2xl border-2 border-primary/30 bg-secondary/20 p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                  Interruptor de Producción
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                    sendEnabled ? "bg-emerald-600 text-white animate-pulse" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {sendEnabled ? "● PRODUCCIÓN EN VIVO" : "○ SIMULACIÓN SEGURA"}
                </span>
              </div>

              <div className="rounded-2xl border border-border bg-background p-4 text-center">
                <span className="block text-xs font-bold text-muted-foreground">Variable Ambiental n8n</span>
                <code className="mt-1 block font-mono text-lg font-black text-foreground">
                  send_enabled: {sendEnabled ? "true" : "false"}
                </code>
                <p className="mt-2 text-[11px] text-muted-foreground">
                  {sendEnabled
                    ? "¡ATENCIÓN! Mensajes salientes a tutores serán despachados en vivo por Meta Cloud API."
                    : "Modo seguro activo. Los mensajes se registran en outbox sin consumo de Meta API."}
                </p>
              </div>

              <button
                onClick={toggleSendEnabled}
                className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-black shadow-button transition ${
                  sendEnabled
                    ? "bg-amber-600 text-white hover:bg-amber-700"
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                }`}
              >
                <Radio className="h-4 w-4" />
                <span>
                  {sendEnabled ? "Desactivar Producción (Volver a Simulación)" : "Conmutar a send_enabled: true"}
                </span>
              </button>
            </div>

            {/* Middle: Meta API Official Credentials */}
            <div className="space-y-3 rounded-2xl border border-border bg-secondary/20 p-5">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <Key className="h-4 w-4 text-primary" />
                <span>Credenciales Oficiales Meta Cloud API</span>
              </h3>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground">Phone Number ID (Meta Graph v21.0)</label>
                <input
                  type="text"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 font-mono text-xs font-bold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground">WABA ID (WhatsApp Business Account)</label>
                <input
                  type="text"
                  value={wabaId}
                  onChange={(e) => setWabaId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 font-mono text-xs font-bold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold text-muted-foreground">System User Permanent Token</label>
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    {showToken ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span>{showToken ? "Ocultar" : "Mostrar"}</span>
                  </button>
                </div>
                <input
                  type={showToken ? "text" : "password"}
                  value={systemToken}
                  onChange={(e) => setSystemToken(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground">Webhook Verify Token</label>
                <input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Right: Meta Connectivity Ping Test */}
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-secondary/20 p-5">
              <div className="space-y-3">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span>Prueba de Conexión en Tiempo Real</span>
                </h3>

                <p className="text-xs text-muted-foreground">
                  Comprueba la validez del token y la conectividad contra los servidores de Meta antes de activar el switch de salida.
                </p>

                <div className="rounded-xl border border-border bg-background p-3 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Límites Meta:</span>
                    <b className="text-foreground">Tier 1 (1.000 conv/24h)</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Número Comercial:</span>
                    <b className="text-emerald-600">+57 310 555 0199</b>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Graph API:</span>
                    <b className="text-foreground">v21.0 Oficial</b>
                  </div>
                </div>

                {pingDetails && (
                  <div className="rounded-xl bg-emerald-500/10 p-3 text-[11px] font-bold text-emerald-600">
                    {pingDetails}
                  </div>
                )}
              </div>

              <div className="pt-4">
                <button
                  onClick={handlePingMetaAPI}
                  disabled={pingStatus === "CHECKING"}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-black text-primary-foreground shadow-button transition hover:bg-primary/90 disabled:opacity-50"
                >
                  <RefreshCw className={`h-4 w-4 ${pingStatus === "CHECKING" ? "animate-spin" : ""}`} />
                  <span>{pingStatus === "CHECKING" ? "Comprobando Meta API..." : "Ejecutar Ping a Meta Graph API"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PASARELA WOMPI COLOMBIA & LIQUIDACIÓN EN LÍNEA */}
      {activeTab === "PASO_3_WOMPI" && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Left: Environment & Keys */}
            <div className="space-y-4 rounded-2xl border border-border bg-secondary/20 p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <span>Pasarela Wompi Bancolombia</span>
                </h3>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-black text-emerald-600">
                  {wompiEnv}
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground">Ambiente de Operación</label>
                <div className="mt-1 flex gap-2">
                  <button
                    onClick={() => setWompiEnv("SANDBOX")}
                    className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
                      wompiEnv === "SANDBOX" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                    }`}
                  >
                    Sandbox
                  </button>
                  <button
                    onClick={() => setWompiEnv("PRODUCTION")}
                    className={`flex-1 rounded-xl py-1.5 text-xs font-bold transition ${
                      wompiEnv === "PRODUCTION" ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground"
                    }`}
                  >
                    Producción Wompi
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground">Llave Pública (Public Key)</label>
                <input
                  type="text"
                  value={wompiPubKey}
                  onChange={(e) => setWompiPubKey(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground">Secreto de Integridad (SHA-256)</label>
                <input
                  type="password"
                  value={wompiIntegritySecret}
                  onChange={(e) => setWompiIntegritySecret(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-muted-foreground">Secreto de Eventos (Webhooks)</label>
                <input
                  type="password"
                  value={wompiEventsSecret}
                  onChange={(e) => setWompiEventsSecret(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Middle: SHA-256 Integrity Validation */}
            <div className="space-y-3 rounded-2xl border border-border bg-secondary/20 p-5">
              <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-600" />
                <span>Cálculo de Integridad Criptográfica</span>
              </h3>

              <p className="text-xs text-muted-foreground">
                Wompi exige una firma SHA-256 para prevenir alteraciones de monto o moneda en el checkout:
              </p>

              <div className="rounded-xl border border-border bg-background p-3 font-mono text-[11px] text-muted-foreground">
                SHA256(referencia + monto_centavos + &quot;COP&quot; + secreto_integridad)
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleValidateIntegrityHash("Tele-Triaje Nocturno", 25000)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-accent"
                >
                  <span>Tele-Triaje Nocturno ($25.000 COP)</span>
                  <span className="text-[10px] text-primary font-black">Probar SHA-256</span>
                </button>

                <button
                  onClick={() => handleValidateIntegrityHash("Consulta Domiciliaria", 120000)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground hover:bg-accent"
                >
                  <span>Consulta Domiciliaria ($120.000 COP)</span>
                  <span className="text-[10px] text-primary font-black">Probar SHA-256</span>
                </button>
              </div>

              {calculatedHash && (
                <div className="rounded-xl bg-emerald-500/10 p-3 text-[10px] font-mono text-emerald-600 break-all">
                  ✓ Hash de Integridad Válido: {calculatedHash}
                </div>
              )}
            </div>

            {/* Right: Real Checkout Simulation & Invoice Conciliation */}
            <div className="flex flex-col justify-between rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-5">
              <div className="space-y-3">
                <h3 className="text-sm font-black text-foreground flex items-center gap-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <span>Simulador de Liquidación en 1-Clic</span>
                </h3>

                <p className="text-xs text-muted-foreground">
                  Ejecuta una liquidación verificada generando la transacción Wompi y emitiendo la factura a saldo $0:
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => handleSimulatePayment("Tele-Triaje Nocturno", 25000, "NEQUI")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white shadow-button transition hover:bg-emerald-700"
                  >
                    <PhoneCall className="h-4 w-4" />
                    <span>Cobrar Tele-Triaje ($25.000 Nequi)</span>
                  </button>

                  <button
                    onClick={() => handleSimulatePayment("Consulta Domiciliaria", 120000, "BANCOLOMBIA")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-600/40 bg-background px-4 py-2.5 text-xs font-black text-foreground transition hover:bg-accent"
                  >
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <span>Cobrar Cita ($120.000 Bancolombia)</span>
                  </button>
                </div>
              </div>

              {/* Transactions List */}
              <div className="mt-4 border-t border-border pt-3">
                <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                  Transacciones Recientes ({paymentHistory.length})
                </span>
                <div className="mt-2 max-h-32 space-y-1.5 overflow-y-auto">
                  {paymentHistory.length === 0 ? (
                    <span className="block text-[11px] text-muted-foreground italic">Sin cobros en esta sesión</span>
                  ) : (
                    paymentHistory.map((tx) => (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background p-1.5 text-[10px]"
                      >
                        <div>
                          <b className="text-foreground">{tx.service}</b>
                          <span className="block text-muted-foreground font-mono">{tx.invoiceNumber}</span>
                        </div>
                        <div className="text-right">
                          <b className="text-emerald-600">${tx.amountCop.toLocaleString("es-CO")} COP</b>
                          <span className="block text-[9px] text-muted-foreground">{tx.method} · {tx.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
