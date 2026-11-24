import React, { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { 
  Wrench, 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  HardHat, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Play,
  CheckCircle2,
  Camera,
  Layers,
  FileText,
  Sliders,
  Smartphone,
  ChevronRight,
  Globe
} from 'lucide-react';
import { ContractorHeader } from '@/features/contractors/components/ContractorHeader';
import { ContractorLeadsKanban } from '@/features/contractors/components/ContractorLeadsKanban';
import { ContractorJobsList } from '@/features/contractors/components/ContractorJobsList';
import { ContractorI18nProvider, useContractorI18n } from '@/features/contractors/context/ContractorI18nContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { meta } from '@/lib/vf/meta';

export const Route = createFileRoute('/contractors/')({
  ssr: false,
  head: () =>
    meta(
      'Alpha Service OS · Contractor Platform | Field Operations & Dispatch',
      'The modern operating system for USA & Canada service contractors. Automated dispatch, mobile PWA quotes, Good/Better/Best options, and instant payments.'
    ),
  component: () => (
    <ContractorI18nProvider>
      <ContractorMasterPage />
    </ContractorI18nProvider>
  ),
});

function ContractorMasterPage() {
  const [viewMode, setViewMode] = useState<'SALES_DEMO' | 'OPERATIONS'>('SALES_DEMO');
  const [activeTab, setActiveTab] = useState<'LEADS' | 'JOBS'>('LEADS');
  const { t, formatMoney, lang } = useContractorI18n();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      <ContractorHeader activeLeadsCount={5} activeJobsCount={3} />

      {/* Main View Mode Selector */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">
              {lang === 'es' ? 'Modo de Visualización:' : 'View Mode:'}
            </span>
            <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('SALES_DEMO')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'SALES_DEMO'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{lang === 'es' ? 'Venta & Demo Comercial' : 'Sales & Interactive Demo'}</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('OPERATIONS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  viewMode === 'OPERATIONS'
                    ? 'bg-slate-800 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'es' ? 'Panel Operativo en Calle' : 'Field Operations Hub'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/contractors/demo"
              className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              <Play className="w-3.5 h-3.5 fill-amber-400" />
              <span>{lang === 'es' ? 'Abrir Demo 8 Pasos →' : 'Open 8-Step Interactive Demo →'}</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ========================================================= */}
        {/* VIEW 1: SALES & COMMERCIAL DEMO SHOWCASE */}
        {/* ========================================================= */}
        {viewMode === 'SALES_DEMO' && (
          <div className="space-y-12">
            
            {/* Hero Section */}
            <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-8 sm:p-12 border border-amber-500/30 shadow-2xl overflow-hidden">
              <div className="max-w-3xl space-y-5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <HardHat className="w-3.5 h-3.5 text-amber-400" />
                  CONTRACTOR FIELD SERVICE OS · USA, CANADA & LATAM
                </div>

                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                  {lang === 'es' 
                    ? 'El Motor Definitivo para Cerrar Más Obras y Gestionar Cuadrillas'
                    : 'The Ultimate Engine to Win More Jobs & Manage Field Crews'}
                </h1>

                <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                  {lang === 'es'
                    ? 'Construido específicamente para contratistas de HVAC, plomería, electricidad, pintura y remodelaciones. Cotizador en campo con margen markup, Kanban de prospectos y bóveda fotográfica antes/después con firma digital.'
                    : 'Engineered for HVAC, plumbing, electrical, painting, and remodeling contractors. On-site markup estimating, leads Kanban, and geolocated before/after photo vaults.'}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <Link to="/contractors/demo">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-xs uppercase tracking-wider py-4 px-6 gap-2 shadow-xl shadow-amber-500/20">
                      <Play className="w-4 h-4 fill-slate-950" />
                      <span>{lang === 'es' ? 'Iniciar Demo Interactiva (8 Pasos)' : 'Launch Interactive Demo (8 Steps)'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>

                  <Button
                    variant="outline"
                    onClick={() => setViewMode('OPERATIONS')}
                    className="w-full sm:w-auto border-slate-700 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-4 px-6 gap-2"
                  >
                    <Wrench className="w-4 h-4 text-amber-400" />
                    <span>{lang === 'es' ? 'Ver Panel Operativo en Vivo' : 'Inspect Live Operations Hub'}</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 3 Core Pillars of the Contractor App */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'es' ? '1. Cotizador en Campo con Markup' : '1. On-Site Estimating with Markup'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'es'
                    ? 'Calcula costos de materiales, horas-hombre y aplica tu margen de ganancia automáticamente (ej. 35%). Entrega propuestas Bueno/Mejor/Excelente en el celular del cliente.'
                    : 'Calculate material costs, labor hours, and apply profit markup automatically. Present tiered Good/Better/Best proposals right on the client’s phone.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
                  <Camera className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'es' ? '2. Bóveda Fotográfica Antes/Después' : '2. Before/After Photo Vault'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'es'
                    ? 'Cada foto tomada por el técnico queda georreferenciada con coordenadas GPS y sellada en el tiempo, protegiendo a la empresa contra reclamos y facilitando la cobranza.'
                    : 'Every technician photo is geolocated with GPS coordinates and timestamped, safeguarding the business against liability and streamlining client approval.'}
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'es' ? '3. Portal PWA con Marca Propia' : '3. 100% White-Labeled Client PWA'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'es'
                    ? 'El cliente abre un enlace con el logo y colores de tu empresa. Aprueba presupuestos con firma digital y paga mediante tarjeta o transferencia sin comisiones abusivas.'
                    : 'Clients open a branded portal with your logo and colors. They sign proposals digitally and settle invoices online with zero third-party branding.'}
                </p>
              </div>

            </div>

            {/* Pricing Section (in USD for USA/Canada & international) */}
            <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-8 sm:p-10 space-y-8">
              <div className="text-center space-y-2">
                <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/30 text-xs font-mono font-bold">
                  {lang === 'es' ? 'PLANES CONTRACTOR OS (USD)' : 'CONTRACTOR OS PLANS (USD)'}
                </Badge>
                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {lang === 'es' ? 'Elige el Plan para tu Empresa de Servicios' : 'Select the Right Plan for Your Trade Business'}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-white">Starter Contractor</h4>
                    <div className="text-3xl font-black text-white font-mono">$97 <span className="text-xs text-slate-400">USD/mo</span></div>
                    <p className="text-xs text-slate-400">1 cuadrilla, cotizador móvil y tablero Kanban de leads.</p>
                  </div>
                  <Link to="/contractors/demo">
                    <Button variant="outline" className="w-full border-slate-700 text-xs font-bold">
                      {lang === 'es' ? 'Probar 14 Días' : 'Start 14-Day Trial'}
                    </Button>
                  </Link>
                </div>

                <div className="rounded-2xl bg-slate-900 p-6 border-2 border-amber-500 flex flex-col justify-between space-y-4 shadow-xl shadow-amber-500/10">
                  <div className="space-y-3">
                    <Badge className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase">Most Popular</Badge>
                    <h4 className="text-base font-bold text-white">Growth Pro</h4>
                    <div className="text-4xl font-black text-amber-300 font-mono">$197 <span className="text-xs text-slate-400">USD/mo</span></div>
                    <p className="text-xs text-slate-400">Hasta 5 cuadrillas, bóveda fotográfica antes/después y portal de clientes bilingüe.</p>
                  </div>
                  <Link to="/contractors/demo">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs">
                      {lang === 'es' ? 'Activar Growth Pro' : 'Activate Growth Pro'}
                    </Button>
                  </Link>
                </div>

                <div className="rounded-2xl bg-slate-950 p-6 border border-slate-800 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-base font-bold text-white">Enterprise Fleet</h4>
                    <div className="text-3xl font-black text-white font-mono">$397 <span className="text-xs text-slate-400">USD/mo</span></div>
                    <p className="text-xs text-slate-400">Cuadrillas ilimitadas, dominio propio, integraciones y soporte VIP.</p>
                  </div>
                  <Link to="/contractors/demo">
                    <Button variant="outline" className="w-full border-slate-700 text-xs font-bold">
                      {lang === 'es' ? 'Consultar Flotas' : 'Contact Fleet Sales'}
                    </Button>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: OPERATIONAL FIELD HUB (KANBAN & JOBS) */}
        {/* ========================================================= */}
        {viewMode === 'OPERATIONS' && (
          <div className="space-y-8">
            
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-slate-800 shadow-xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-semibold">
                    {t('dash.heroBadge')}
                  </Badge>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">{t('dash.tradesPill')}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {t('dash.title')}
                </h2>
                <p className="text-sm text-slate-400 max-w-2xl">
                  {t('dash.subtitle')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link to="/contractors/leads">
                  <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-lg shadow-amber-500/20">
                    <Users className="w-4 h-4" />
                    <span>{t('dash.viewLeads')}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* 4 Live KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{t('dash.kpi.leads')}</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white font-mono">5</span>
                  <span className="text-xs text-emerald-400 font-medium">{t('dash.kpi.leads.today')}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {t('dash.kpi.leads.sub')} <strong className="text-amber-400">{formatMoney(14625)}</strong>
                </p>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{t('dash.kpi.jobs')}</span>
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white font-mono">3</span>
                  <span className="text-xs text-blue-400 font-medium">3 {t('dash.kpi.jobs.sub')}</span>
                </div>
                <p className="text-[11px] text-slate-500">{t('dash.kpi.jobs.status')}</p>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{t('dash.kpi.receivables')}</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-white font-mono">{formatMoney(2912)}</span>
                </div>
                <p className="text-[11px] text-slate-500">{t('dash.kpi.receivables.sub')}</p>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">{t('dash.kpi.revenue')}</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-emerald-400 font-mono">{formatMoney(8412)}</span>
                </div>
                <p className="text-[11px] text-slate-500">{t('dash.kpi.revenue.sub')}</p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab('LEADS')}
                  className={`flex items-center gap-2 pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'LEADS'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>{t('dash.tab.leads')}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">5</span>
                </button>

                <button
                  onClick={() => setActiveTab('JOBS')}
                  className={`flex items-center gap-2 pb-2 px-1 text-sm font-semibold border-b-2 transition-colors ${
                    activeTab === 'JOBS'
                      ? 'border-amber-500 text-amber-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  <Briefcase className="w-4 h-4" />
                  <span>{t('dash.tab.jobs')}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">3</span>
                </button>
              </div>

              {activeTab === 'LEADS' ? (
                <ContractorLeadsKanban />
              ) : (
                <ContractorJobsList />
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
