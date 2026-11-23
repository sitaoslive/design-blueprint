import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Camera, 
  DollarSign, 
  CheckCircle2, 
  CreditCard, 
  Star, 
  Sparkles, 
  Share2, 
  Download, 
  Clock, 
  HardHat, 
  Check, 
  Send 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ContractorCustomerPortalProps {
  token?: string;
}

export const ContractorCustomerPortal: React.FC<ContractorCustomerPortalProps> = ({
  token = 'demo-token',
}) => {
  const [activePhotoTab, setActivePhotoTab] = useState<'BEFORE' | 'AFTER'>('AFTER');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [isSignedOff, setIsSignedOff] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'NEQUI' | 'BANCOLOMBIA' | 'CARD' | 'WOMPI'>('NEQUI');

  // Simulated project data
  const project = {
    jobNumber: 'JOB-2611-9921',
    title: 'Instalación & Puesta en Marcha 2 Chillers 50 Toneladas',
    companyName: 'HVAC Masters Colombia SAS',
    contractorPhone: '+57 300 999 8877',
    clientName: 'Hotel Dann Carlton Medellín',
    siteAddress: 'Cra 43A # 7-50, El Poblado, Medellín',
    crewLead: 'Ing. Carlos Mario Henao',
    completionDate: '23 de Noviembre, 2026',
    status: isPaid ? 'FINALIZADO_Y_PAGADO' : 'OBRA_FINALIZADA_PENDIENTE_SALDO',
    totalPriceCOP: 18500000,
    depositPaidCOP: 9250000,
    balanceDueCOP: isPaid ? 0 : 9250000,
    photosBefore: [
      {
        id: 'b1',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
        caption: 'Terraza técnica antes de la intervención (sistemas obsoletos desmontados)',
        timestamp: '23 Nov 2026 · 08:30 AM',
      },
      {
        id: 'b2',
        url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
        caption: 'Puntos de conexión hidráulica y eléctrica previos al montaje',
        timestamp: '23 Nov 2026 · 09:15 AM',
      },
    ],
    photosAfter: [
      {
        id: 'a1',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
        caption: 'Chillers nuevos anclados sobre amortiguadores y tuberías calorifugadas',
        timestamp: '23 Nov 2026 · 04:45 PM',
      },
      {
        id: 'a2',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        caption: 'Manifold de distribución de agua helada presurizado a 45 PSI sin fugas',
        timestamp: '23 Nov 2026 · 05:20 PM',
      },
    ],
  };

  const formatCOP = (val: number) => `$${val.toLocaleString('es-CO')} COP`;

  const handleSignOff = () => {
    setIsSignedOff(true);
    toast.success('¡Acta de Entrega Recibida a Conformidad!', {
      description: 'Gracias por certificar la culminación técnica de la obra.',
    });
  };

  const handleSimulatePayment = () => {
    setIsPaid(true);
    setIsPaymentModalOpen(false);
    toast.success('¡Pago de Saldo Confirmado Exitosamente!', {
      description: `Se registró el pago de ${formatCOP(project.balanceDueCOP)} vía ${paymentMethod}. Factura electrónica enviada al correo.`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Client Navbar */}
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">
                {project.companyName}
              </span>
              <span className="text-[11px] text-amber-400 font-mono">
                Portal de Seguimiento & Entrega de Obra
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${project.contractorPhone}`}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Llamar a Contratista</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Project Hero Card */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-400 font-semibold">
                  {project.jobNumber}
                </span>
                <Badge
                  className={
                    isPaid
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }
                >
                  {isPaid ? '✔ OBRA ENTREGADA Y PAGADA' : '🔨 OBRA FINALIZADA · PENDIENTE SALDO'}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-1">
                {project.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Enlace del portal copiado al portapapeles');
                }}
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Compartir</span>
              </Button>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Ubicación</span>
                <span className="font-medium text-white">{project.siteAddress}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <HardHat className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Líder Técnico en Sitio</span>
                <span className="font-medium text-white">{project.crewLead}</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block">Fecha de Cierre</span>
                <span className="font-medium text-white">{project.completionDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Before / After Photo Evidence Vault */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-white">Bóveda de Evidencia Fotográfica</h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspecciona las fotografías tomadas por la cuadrilla técnica antes y después de la intervención.
              </p>
            </div>

            {/* Photo Tabs Switcher */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setActivePhotoTab('BEFORE')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePhotoTab === 'BEFORE'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Estado Inicial (Antes)
              </button>
              <button
                onClick={() => setActivePhotoTab('AFTER')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePhotoTab === 'AFTER'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Obra Finalizada (Después)
              </button>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(activePhotoTab === 'BEFORE' ? project.photosBefore : project.photosAfter).map(
              (photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group shadow-lg flex flex-col justify-between"
                >
                  <div className="aspect-video relative overflow-hidden bg-slate-850">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge
                      className={`absolute top-2.5 left-2.5 text-[10px] font-bold ${
                        activePhotoTab === 'BEFORE'
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-emerald-500 text-slate-950'
                      }`}
                    >
                      {activePhotoTab === 'BEFORE' ? 'ESTADO INICIAL' : 'RESULTADO FINALIZADO'}
                    </Badge>
                  </div>
                  <div className="p-3 bg-slate-900/90 border-t border-slate-800 space-y-1">
                    <p className="text-xs text-slate-200 font-medium">{photo.caption}</p>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      {photo.timestamp}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Safety & Quality Assurance Badge */}
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <div>
              <strong className="block text-emerald-300">Norma Técnica & Protocolo de Seguridad Verificado</strong>
              <span>
                Pruebas de presión, aislamiento térmico y calibración eléctrica certificadas por el ingeniero responsable en sitio.
              </span>
            </div>
          </div>
        </div>

        {/* Financial Statement & Payment Section */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Estado de Cuenta & Liquidación</h2>
              <p className="text-xs text-slate-400">Resumen transparente de cobros y facturación electrónica</p>
            </div>
          </div>

          {/* Financials Breakdown */}
          <div className="bg-slate-950/70 p-5 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Precio Total de la Obra:</span>
              <span className="font-mono font-bold text-white text-base">
                {formatCOP(project.totalPriceCOP)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Anticipo de Inicio (50%):</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-semibold">
                  {formatCOP(project.depositPaidCOP)}
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">PAGADO</Badge>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-base">
              <span className="font-semibold text-slate-200">Saldo Final por Pagar (50%):</span>
              <span
                className={`font-mono font-black text-xl ${
                  isPaid ? 'text-emerald-400 line-through' : 'text-amber-400'
                }`}
              >
                {formatCOP(project.balanceDueCOP)}
              </span>
            </div>
          </div>

          {/* Payment CTA Box */}
          {!isPaid ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <h4 className="font-bold text-white text-sm">Pagar Saldo Restante en Línea</h4>
                <p className="text-xs text-slate-400">
                  Transacción protegida vía Wompi, Nequi, Bancolombia o Tarjeta de Crédito.
                </p>
              </div>

              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm gap-2 shadow-lg shadow-amber-500/20 px-6 py-2.5 w-full sm:w-auto"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pagar {formatCOP(project.balanceDueCOP)}</span>
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Esta obra se encuentra 100% saldada y facturada.</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 text-xs gap-1.5"
                onClick={() => toast.info('Descargando Factura Electrónica en PDF...')}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Factura</span>
              </Button>
            </div>
          )}
        </div>

        {/* Customer Satisfaction & Digital Sign-off */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-white">Recepción de Obra & Calificación</h2>
              <p className="text-xs text-slate-400">Evalúa la calidad del servicio técnico recibido</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <span className="text-xs text-slate-300 block">¿Cómo calificarías el trabajo realizado?</span>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-amber-400 ml-2">
                {rating === 5 ? 'Excelente (5/5)' : `${rating}/5`}
              </span>
            </div>
          </div>

          {/* Feedback Notes */}
          <div>
            <label className="text-xs text-slate-300 block mb-1.5">
              Comentarios u observaciones para el contratista:
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="La cuadrilla fue puntual, dejaron el área limpia y los equipos quedaron funcionando perfectamente..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder:text-slate-500 resize-none focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Signoff Button */}
          {!isSignedOff ? (
            <Button
              onClick={handleSignOff}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs gap-1.5 border border-slate-700 w-full sm:w-auto"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Firmar y Recibir Obra a Conformidad</span>
            </Button>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Acta firmada digitalmente por {project.clientName} ({new Date().toLocaleDateString('es-CO')}).</span>
            </div>
          )}
        </div>
      </main>

      {/* Online Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Pasarela de Pago en Línea</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase">Monto a Pagar (Saldo Final 50%)</span>
              <span className="text-2xl font-black text-amber-400 font-mono block">
                {formatCOP(project.balanceDueCOP)}
              </span>
              <span className="text-[11px] text-slate-500">Beneficiario: {project.companyName}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-xs text-slate-300 block font-medium">Selecciona Medio de Pago:</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'NEQUI', label: 'Nequi / Daviplata' },
                  { id: 'BANCOLOMBIA', label: 'Bancolombia Botón' },
                  { id: 'CARD', label: 'Tarjeta Crédito/Débito' },
                  { id: 'WOMPI', label: 'Wompi Checkout' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                      paymentMethod === m.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Payment Action */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleSimulatePayment}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm gap-2 shadow-lg shadow-emerald-500/20 py-2.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pago de {formatCOP(project.balanceDueCOP)}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-full text-slate-400 hover:text-white text-xs"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
