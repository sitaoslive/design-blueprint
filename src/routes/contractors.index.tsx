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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/contractors/')({
  component: ContractorDashboardPage,
});

function ContractorDashboardPage() {
  const [activeTab, setActiveTab] = useState<'LEADS' | 'JOBS'>('LEADS');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <ContractorHeader activeLeadsCount={5} activeJobsCount={3} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 p-6 rounded-2xl border border-slate-800 shadow-xl">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-semibold">
                ALPHA SERVICE OS
              </Badge>
              <span className="text-xs text-slate-400 font-mono">HVAC · Plomería · Techos · Electricidad</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Panel Maestro de Contratista & Obras
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Control unificado de captación de clientes por WhatsApp, presupuestos en terreno con firma digital, despacho de cuadrillas y facturación progresiva.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/contractors/leads">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-1.5 shadow-lg shadow-amber-500/20">
                <Users className="w-4 h-4" />
                <span>Ver Todos los Leads</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Live KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Leads en Pipeline</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">5</span>
              <span className="text-xs text-emerald-400 font-medium">+2 hoy</span>
            </div>
            <p className="text-[11px] text-slate-500">Valor potencial: $58.500.000 COP</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Obras en Curso</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">3</span>
              <span className="text-xs text-blue-400 font-medium">3 cuadrillas</span>
            </div>
            <p className="text-[11px] text-slate-500">1 en camino, 1 en ejecución, 1 finalizada</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Por Cobrar (Saldos)</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white font-mono">$11.650.000</span>
              <span className="text-xs text-slate-400">COP</span>
            </div>
            <p className="text-[11px] text-slate-500">2 facturas de saldo final emitidas</p>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-md space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-400">Recaudo del Mes</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-emerald-400 font-mono">$33.650.000</span>
              <span className="text-xs text-slate-400">COP</span>
            </div>
            <p className="text-[11px] text-slate-500">Anticipos 50% y cierres pagados</p>
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
              <span>Embudos de Venta (Kanban de Leads)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">5</span>
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
              <span>Obras en Terreno & Fotos</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">3</span>
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
