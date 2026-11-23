import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Download, 
  FileText, 
  ArrowUpRight, 
  Share2, 
  ShieldCheck, 
  BarChart3,
  Calendar,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from './context/ContractorI18nContext';
import { ContractorHeader } from './components/ContractorHeader';

export const ContractorValueDashboard: React.FC = () => {
  const { lang, formatMoney, t } = useContractorI18n();

  // Metrics Data (Section 326 & 341 ROI Attribution)
  const metrics = {
    inquiriesCaptured: 38,
    bookingStarts: 44,
    completedBookings: 29,
    estimatesViewed: 24,
    estimatesApproved: 19,
    approvalRatePercent: 79.2,
    onlineCollectionsUSD: 33650,
    averageDsoDays: 1.8, // Paid in under 48 hours via portal checkout
    repeatBookings: 14,
    membershipRenewals: 8,
    referralsQualified: 6,
    selfServiceActions: 114, // Reschedules, doc downloads, online approvals
    adminHoursSaved: 39.9, // 114 actions * ~21 mins
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <ContractorHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-bold">
                CUSTOMER EXPERIENCE · BUSINESS IMPACT
              </Badge>
              <span className="text-xs text-slate-400 font-mono">ROI ENGINE</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              {lang === 'es' ? 'Impacto Comercial del Portal de Clientes' : 'Contractor Value & ROI Dashboard'}
            </h1>
            <p className="text-xs text-slate-400">
              {lang === 'es'
                ? 'Mide con precisión cómo la app de clientes convierte cotizaciones, acelera cobros y fideliza de por vida'
                : 'Auditable metrics on conversion velocity, accelerated collections, and retained lifetime bookings'}
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast.success(
                lang === 'es'
                  ? 'Generando Reporte Ejecutivo de ROI en PDF...'
                  : 'Generating Executive ROI Impact Report (PDF)...'
              )
            }
            className="border-slate-800 text-slate-200 hover:text-white text-xs gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'es' ? 'Exportar Reporte Mensual' : 'Export Monthly Report'}</span>
          </Button>
        </div>

        {/* 1. TOP-LINE 4 VALUE PILLARS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* VALUE 1: RECAUDO EN LÍNEA */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>{lang === 'es' ? 'Recaudo Recibido en App' : 'Online Collections'}</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-2xl font-black text-emerald-400 font-mono block">
              {formatMoney(metrics.onlineCollectionsUSD)}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
              <span>{lang === 'es' ? 'Pago promedio en 1.8 días' : 'Average DSO: 1.8 days'}</span>
            </span>
          </div>

          {/* VALUE 2: CONVERSIÓN DE COTIZACIONES */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>{lang === 'es' ? 'Tasa de Aprobación de Cotizaciones' : 'Proposal Approval Rate'}</span>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono block">
              {metrics.approvalRatePercent}%
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              {metrics.estimatesApproved} {lang === 'es' ? 'de' : 'of'} {metrics.estimatesViewed} {lang === 'es' ? 'aprobadas en portal' : 'approved in-portal'}
            </span>
          </div>

          {/* VALUE 3: REPETICIÓN & MEMBRESÍAS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>{lang === 'es' ? 'Reagendamientos con 1-Toque' : '1-Tap Rebookings'}</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-2xl font-black text-blue-400 font-mono block">
              {metrics.repeatBookings}
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              +{metrics.membershipRenewals} {lang === 'es' ? 'renovaciones VIP anuales' : 'annual VIP renewals'}
            </span>
          </div>

          {/* VALUE 4: HORAS ADMINISTRATIVAS AHORRADAS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>{lang === 'es' ? 'Tiempo Admin Ahorrado' : 'Admin Time Saved'}</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-2xl font-black text-purple-400 font-mono block">
              {metrics.adminHoursSaved}h
            </span>
            <span className="text-[11px] text-slate-400 block font-mono">
              {metrics.selfServiceActions} {lang === 'es' ? 'trámites de autoservicio' : 'self-service client actions'}
            </span>
          </div>
        </div>

        {/* 2. DETAILED BREAKDOWN & TRANSPARENT ATTRIBUTION AUDIT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Conversion Funnel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>{lang === 'es' ? 'Embudo de Conversión de Clientes en el App' : 'Client In-App Conversion Velocity'}</span>
              </h3>
              <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                Last 30 Days
              </Badge>
            </div>

            <div className="space-y-3">
              {[
                { stage: lang === 'es' ? '1. Solicitudes de Servicio Iniciadas' : '1. Service Requests Initiated', count: metrics.bookingStarts, percent: 100 },
                { stage: lang === 'es' ? '2. Citas Confirmadas y Agendadas' : '2. Confirmed & Booked Work Orders', count: metrics.completedBookings, percent: 66 },
                { stage: lang === 'es' ? '3. Cotizaciones Entregadas y Vistas' : '3. Proposals Delivered & Viewed', count: metrics.estimatesViewed, percent: 55 },
                { stage: lang === 'es' ? '4. Propuestas Aprobadas con Firma' : '4. Approved Proposals Signed Off', count: metrics.estimatesApproved, percent: 43 },
              ].map((step, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{step.stage}</span>
                    <span className="text-amber-400 font-mono font-bold">{step.count} ({step.percent}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                      style={{ width: `${step.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Transparent ROI Assumptions & Model (Section 341) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'es' ? 'Metodología & Supuestos de Ahorro Administrativo' : 'Defensible Attribution Model'}</span>
              </h3>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-[10px]">VERIFIED</Badge>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">
                  {lang === 'es' ? 'Autoservicio de Reprogramaciones & Citas:' : 'Self-Service Rescheduling:'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {lang === 'es'
                    ? '34 clientes cambiaron fecha o confirmaron acceso sin llamar a secretaría. (~15 mins ahorrados por llamada eliminada).'
                    : '34 clients adjusted arrival windows or confirmed site access without receptionist calls (~15 min saved/call).'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">
                  {lang === 'es' ? 'Aprobación de Órdenes de Cambio en Obra:' : 'On-Site Change Order Authorizations:'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {lang === 'es'
                    ? '19 órdenes adicionales autorizadas en <12 mins mediante foto de evidencia, evitando paradas de cuadrilla.'
                    : '19 change orders approved in under 12 minutes with photo evidence, preventing field crew idling.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">
                  {lang === 'es' ? 'Cobro & Descarga Autónoma de Facturas:' : 'Self-Serve Payment & Receipt Vault:'}
                </span>
                <p className="text-[11px] text-slate-400">
                  {lang === 'es'
                    ? '61 recibos y certificados descargados directamente por clientes sin solicitudes por email.'
                    : '61 receipts and warranty certificates downloaded directly by clients without email dispatch overhead.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
