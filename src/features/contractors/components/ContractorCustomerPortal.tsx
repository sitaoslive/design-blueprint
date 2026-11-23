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
import { useContractorI18n } from '../context/ContractorI18nContext';

interface ContractorCustomerPortalProps {
  token?: string;
}

export const ContractorCustomerPortal: React.FC<ContractorCustomerPortalProps> = ({
  token = 'demo-token',
}) => {
  const { t, formatMoney, lang, setLang, currency, setCurrency } = useContractorI18n();
  const [activePhotoTab, setActivePhotoTab] = useState<'BEFORE' | 'AFTER'>('AFTER');
  const [rating, setRating] = useState<number>(5);
  const [feedback, setFeedback] = useState<string>('');
  const [isSignedOff, setIsSignedOff] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [isPaid, setIsPaid] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'APPLE_PAY' | 'ACH' | 'INTERAC' | 'NEQUI'>('STRIPE');

  // Simulated project data in base USD ($4,625 total, $2,312.50 deposit paid, $2,312.50 balance)
  const project = {
    jobNumber: 'JOB-2611-9921',
    title: lang === 'es' ? 'Instalación & Puesta en Marcha 2 Chillers 50 Toneladas' : 'Commercial Installation & Commissioning 2x 50-Ton Chillers',
    companyName: 'Apex Mechanical Contractors LLC',
    contractorPhone: '+1 (305) 555-8877',
    clientName: 'Apex Properties & Medical Tower',
    siteAddress: '1200 Brickell Ave, Suite 1400, Miami, FL',
    crewLead: 'Carlos Mario Henao (Field Master Tech)',
    completionDate: lang === 'es' ? '23 de Noviembre, 2026' : 'November 23, 2026',
    status: isPaid ? 'PAID_IN_FULL' : 'COMPLETED_PENDING_BALANCE',
    totalPriceUSD: 4625,
    depositPaidUSD: 2312.5,
    balanceDueUSD: isPaid ? 0 : 2312.5,
    photosBefore: [
      {
        id: 'b1',
        url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
        caption: lang === 'es' ? 'Terraza técnica antes de la intervención (sistemas obsoletos desmontados)' : 'Rooftop staging zone before hoisting and equipment decommissioning',
        timestamp: '23 Nov 2026 · 08:30 AM',
      },
      {
        id: 'b2',
        url: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
        caption: lang === 'es' ? 'Puntos de conexión hidráulica y eléctrica previos al montaje' : 'Hydraulic manifold connection points and power disconnect prior to mount',
        timestamp: '23 Nov 2026 · 09:15 AM',
      },
    ],
    photosAfter: [
      {
        id: 'a1',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80',
        caption: lang === 'es' ? 'Chillers nuevos anclados sobre amortiguadores y tuberías calorifugadas' : 'New high-efficiency chillers anchored on vibration springs with insulated lines',
        timestamp: '23 Nov 2026 · 04:45 PM',
      },
      {
        id: 'a2',
        url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
        caption: lang === 'es' ? 'Manifold de distribución de agua helada presurizado a 45 PSI sin fugas' : 'Chilled water supply & return header pressurized at 45 PSI zero leaks',
        timestamp: '23 Nov 2026 · 05:20 PM',
      },
    ],
  };

  const handleSignOff = () => {
    setIsSignedOff(true);
    toast.success(
      lang === 'es'
        ? '¡Acta de Entrega Recibida a Conformidad!'
        : 'Work Order Acceptance Certificate Signed!',
      {
        description:
          lang === 'es'
            ? 'Gracias por certificar la culminación técnica de la obra.'
            : 'Thank you for certifying the technical completion of this project.',
      }
    );
  };

  const handleSimulatePayment = () => {
    setIsPaid(true);
    setIsPaymentModalOpen(false);
    toast.success(
      lang === 'es'
        ? '¡Pago de Saldo Confirmado Exitosamente!'
        : 'Balance Payment Confirmed Successfully!',
      {
        description:
          lang === 'es'
            ? `Se registró el pago de ${formatMoney(project.balanceDueUSD)} vía ${paymentMethod}. Factura electrónica enviada al correo.`
            : `Payment of ${formatMoney(project.balanceDueUSD)} processed via ${paymentMethod}. Invoice receipt emailed.`,
      }
    );
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
                {t('portal.headerBadge')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Currency selector for homeowner */}
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px] font-bold">
              {(['USD', 'CAD', 'COP'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    currency === curr
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Language toggle for homeowner */}
            <div className="inline-flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  lang === 'en'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇺🇸 EN
              </button>
              <button
                onClick={() => setLang('es')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  lang === 'es'
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🇪🇸 ES
              </button>
            </div>

            <a
              href={`tel:${project.contractorPhone}`}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t('portal.callContractor')}</span>
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
                  {isPaid ? t('portal.status.paid') : t('portal.status.pending')}
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
                className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success(lang === 'es' ? 'Enlace del portal copiado al portapapeles' : 'Portal link copied to clipboard');
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'es' ? 'Compartir' : 'Share'}</span>
              </Button>
            </div>
          </div>

          {/* Project Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                {t('portal.location')}
              </span>
              <p className="font-semibold text-white line-clamp-1">{project.siteAddress}</p>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <HardHat className="w-3.5 h-3.5 text-blue-400" />
                {t('portal.leadTech')}
              </span>
              <p className="font-semibold text-white">{project.crewLead}</p>
            </div>

            <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {t('portal.completedDate')}
              </span>
              <p className="font-semibold text-white">{project.completionDate}</p>
            </div>
          </div>
        </div>

        {/* Before & After Photo Vault */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-lg font-bold text-white">{t('portal.photoVault')}</h2>
                <p className="text-xs text-slate-400">
                  {t('portal.photoVaultSub')}
                </p>
              </div>
            </div>

            {/* Toggle Tab */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setActivePhotoTab('BEFORE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePhotoTab === 'BEFORE'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('portal.beforePhotos')}
              </button>
              <button
                onClick={() => setActivePhotoTab('AFTER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activePhotoTab === 'AFTER'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t('portal.afterPhotos')}
              </button>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(activePhotoTab === 'BEFORE' ? project.photosBefore : project.photosAfter).map(
              (photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group shadow-md"
                >
                  <div className="aspect-video bg-slate-850 relative overflow-hidden">
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge
                      className={`absolute top-2 left-2 text-[10px] ${
                        activePhotoTab === 'BEFORE'
                          ? 'bg-amber-500/85 text-slate-950'
                          : 'bg-emerald-500/85 text-slate-950'
                      }`}
                    >
                      {activePhotoTab === 'BEFORE' ? 'BEFORE' : 'AFTER'}
                    </Badge>
                  </div>
                  <div className="p-3 bg-slate-900/90 space-y-1">
                    <p className="text-xs font-medium text-slate-200">{photo.caption}</p>
                    <span className="text-[10px] text-slate-500 font-mono block">
                      {photo.timestamp}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Safety & Protocol Certification Stamp */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-emerald-400 text-xs">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">{t('portal.safetyCert')}</span>
              <p className="text-emerald-400/80">
                {t('portal.safetyCertSub')}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Settlement & Online Balance Payment */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white">{t('portal.statement')}</h2>
              <p className="text-xs text-slate-400">
                {t('portal.statementSub')}
              </p>
            </div>
          </div>

          {/* Breakdown Lines */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">{t('portal.totalPrice')}</span>
              <span className="font-mono font-bold text-white text-base">
                {formatMoney(project.totalPriceUSD)}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t('portal.depositPaid')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-emerald-400 font-semibold">
                  {formatMoney(project.depositPaidUSD)}
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">
                  {t('portal.paidBadge')}
                </Badge>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-base">
              <span className="font-semibold text-slate-200">{t('portal.finalBalance')}</span>
              <span
                className={`font-mono font-black text-xl ${
                  isPaid ? 'text-emerald-400 line-through' : 'text-amber-400'
                }`}
              >
                {formatMoney(project.balanceDueUSD)}
              </span>
            </div>
          </div>

          {/* Payment CTA Box */}
          {!isPaid ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <h4 className="font-bold text-white text-sm">{t('portal.payNow')}</h4>
                <p className="text-xs text-slate-400">
                  {t('portal.payNowSub')}
                </p>
              </div>

              <Button
                onClick={() => setIsPaymentModalOpen(true)}
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm gap-2 shadow-lg shadow-amber-500/20 px-6 py-2.5 w-full sm:w-auto"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t('portal.payBtn')} ({formatMoney(project.balanceDueUSD)})</span>
              </Button>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-emerald-300 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>{t('portal.paidInFull')}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20 text-xs gap-1.5"
                onClick={() => toast.info(lang === 'es' ? 'Descargando Factura Electrónica en PDF...' : 'Downloading PDF Invoice Receipt...')}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t('portal.downloadInvoice')}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Customer Satisfaction & Digital Sign-off */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-bold text-white">{t('portal.signOff')}</h2>
              <p className="text-xs text-slate-400">{t('portal.signOffSub')}</p>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <span className="text-xs text-slate-300 block">{t('portal.ratingQuestion')}</span>
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
                {rating === 5 ? t('portal.ratingExcellent') : `${rating}/5`}
              </span>
            </div>
          </div>

          {/* Feedback Notes */}
          <div>
            <label className="text-xs text-slate-300 block mb-1.5">
              {t('portal.commentsLabel')}
            </label>
            <textarea
              rows={2}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t('portal.commentsPlaceholder')}
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
              <span>{t('portal.signBtn')}</span>
            </Button>
          ) : (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {t('portal.signedBadge')} ({project.clientName} · {new Date().toLocaleDateString(lang === 'es' ? 'es-CO' : 'en-US')}).
              </span>
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
                <h3 className="font-bold text-white text-base">{t('checkout.title')}</h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase">{t('checkout.amount')}</span>
              <span className="text-2xl font-black text-amber-400 font-mono block">
                {formatMoney(project.balanceDueUSD)}
              </span>
              <span className="text-[11px] text-slate-500">{t('checkout.beneficiary')} {project.companyName}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-xs text-slate-300 block font-medium">{t('checkout.selectMethod')}</span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'STRIPE', label: t('checkout.stripe') },
                  { id: 'APPLE_PAY', label: t('checkout.applePay') },
                  { id: 'ACH', label: t('checkout.ach') },
                  { id: 'INTERAC', label: t('checkout.interac') },
                  { id: 'NEQUI', label: t('checkout.nequi') },
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
                <span>{t('checkout.confirm')} {formatMoney(project.balanceDueUSD)}</span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-full text-slate-400 hover:text-white text-xs"
              >
                {t('checkout.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
