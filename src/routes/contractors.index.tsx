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
  Sparkles 
} from 'lucide-react';
import { ContractorHeader } from '@/features/contractors/components/ContractorHeader';
import { ContractorLeadsKanban } from '@/features/contractors/components/ContractorLeadsKanban';
import { ContractorJobsList } from '@/features/contractors/components/ContractorJobsList';
import { ContractorI18nProvider, useContractorI18n } from '@/features/contractors/context/ContractorI18nContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/contractors/')({
  component: () => (
    <ContractorI18nProvider>
      <ContractorDashboardPage />
    </ContractorI18nProvider>
  ),
});

function ContractorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'LEADS' | 'JOBS'>('LEADS');
  const { t, formatMoney } = useContractorI18n();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <ContractorHeader activeLeadsCount={5} activeJobsCount={3} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-semibold">
                {t('dash.heroBadge')}
              </Badge>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">{t('dash.tradesPill')}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('dash.title')}
            </h1>
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
      </main>
    </div>
  );
}
