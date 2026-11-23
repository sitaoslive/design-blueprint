import React, { useState } from 'react';
import { 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Download, 
  Camera, 
  Video, 
  Play, 
  Phone, 
  Calendar, 
  DollarSign, 
  ChevronRight, 
  HardHat, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientProjectRoom, ProjectMilestone } from './clientPortalTypes';

interface ClientProjectRoomProps {
  projectRoom: ClientProjectRoom;
  onOpenDecisionModal?: (decisionId: string) => void;
  onBack?: () => void;
}

export const ClientProjectRoomView: React.FC<ClientProjectRoomProps> = ({
  projectRoom,
  onOpenDecisionModal,
  onBack,
}) => {
  const { lang, formatMoney, t } = useContractorI18n();
  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'DOCUMENTS' | 'DECISIONS'>('TIMELINE');
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const completedMilestones = projectRoom.milestones.filter((m) => m.status === 'COMPLETED').length;
  const progressPercent = Math.round((completedMilestones / projectRoom.milestones.length) * 100);

  return (
    <div className="space-y-6">
      {/* 1. PROJECT ROOM HEADER & SUMMARY */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[11px] font-bold">
                MY PROJECT ROOM
              </Badge>
              <span className="text-xs text-slate-400 font-mono">ID: {projectRoom.id}</span>
            </div>
            <h2 className="text-xl font-black text-white">{projectRoom.projectTitle}</h2>
            <p className="text-xs text-slate-300">{projectRoom.approvedScopeSummary}</p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-right sm:text-right shrink-0">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              {lang === 'es' ? 'Presupuesto Total Aprobado' : 'Total Approved Budget'}
            </span>
            <span className="text-xl font-black text-amber-400 font-mono">
              {formatMoney(projectRoom.totalBudgetUSD)}
            </span>
          </div>
        </div>

        {/* Project Manager Bar & Video Walkthrough */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-3 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
              <HardHat className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-slate-400 block font-medium">
                {lang === 'es' ? 'Líder / Project Manager' : 'Project Manager'}
              </span>
              <span className="font-semibold text-white text-xs truncate block">
                {projectRoom.contractorLead}
              </span>
            </div>
            <a
              href={`tel:${projectRoom.contractorPhone}`}
              className="p-2 rounded-lg bg-slate-800 text-amber-400 hover:bg-slate-700 transition-colors"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>

          {/* Video Walkthrough Card (Section 313 & 331) */}
          <div 
            onClick={() => setIsVideoModalOpen(true)}
            className="flex items-center gap-3 bg-slate-950/50 hover:bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/30 cursor-pointer transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Play className="w-5 h-5 fill-amber-400" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors block">
                {lang === 'es' ? 'Video Explicativo de Obra' : 'Site Video Walkthrough'}
              </span>
              <span className="text-[11px] text-slate-400 block">
                {lang === 'es' ? 'Grabado por Carlos (1 min 42 seg)' : 'Recorded by Lead Tech (1m 42s)'}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-300">
              {lang === 'es' ? 'Progreso General del Proyecto' : 'Overall Project Completion'}
            </span>
            <span className="text-amber-400 font-mono font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. SUBTABS (TIMELINE | DOCUMENTS | DECISIONS) */}
      <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'TIMELINE'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'es' ? 'Línea de Tiempo (12 Hitos)' : 'Timeline (12 Milestones)'}
        </button>
        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'DOCUMENTS'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'es' ? 'Documentos & Planos' : 'Documents & Blueprints'}
        </button>
        <button
          onClick={() => setActiveTab('DECISIONS')}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all relative ${
            activeTab === 'DECISIONS'
              ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang === 'es' ? 'Centro de Decisiones' : 'Decision Center'}
          {projectRoom.decisions.some((d) => d.status === 'PENDING') && (
            <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {/* TIMELINE TAB */}
      {activeTab === 'TIMELINE' && (
        <div className="space-y-3">
          {projectRoom.milestones.map((m) => {
            const isDone = m.status === 'COMPLETED';
            const isCurrent = m.status === 'IN_PROGRESS';
            return (
              <div
                key={m.index}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                    : isDone
                    ? 'bg-slate-900/60 border-slate-800 text-slate-300'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : isCurrent
                          ? 'bg-amber-500 text-slate-950 font-black animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : m.index}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white block">{m.title}</span>
                        {isCurrent && (
                          <Badge className="bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                            {lang === 'es' ? 'En Curso' : 'In Progress'}
                          </Badge>
                        )}
                      </div>
                      {m.notes && <p className="text-xs text-slate-300">{m.notes}</p>}
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {m.completedAt ? m.completedAt : m.targetDate}
                  </span>
                </div>

                {/* Milestone Photos */}
                {m.photos && m.photos.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-2 overflow-x-auto pb-1">
                    {m.photos.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Milestone photo"
                        className="w-20 h-16 rounded-lg object-cover border border-slate-700 hover:scale-105 transition-transform cursor-pointer"
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* DOCUMENTS TAB */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-3">
          {projectRoom.documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">{doc.title}</span>
                  <span className="text-[11px] text-slate-400">
                    {doc.category} · {doc.date} · {doc.size}
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  toast.success(
                    lang === 'es' ? 'Descargando documento oficial...' : 'Downloading official document...'
                  )
                }
                className="border-slate-700 text-slate-200 hover:text-white text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'es' ? 'Descargar' : 'Download'}</span>
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* DECISIONS TAB */}
      {activeTab === 'DECISIONS' && (
        <div className="space-y-3">
          {projectRoom.decisions.map((dec) => (
            <div
              key={dec.id}
              className={`p-4 rounded-xl border space-y-3 ${
                dec.status === 'PENDING'
                  ? 'bg-amber-500/10 border-amber-500/40'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{dec.title}</span>
                    <Badge
                      className={
                        dec.status === 'PENDING'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }
                    >
                      {dec.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300">{dec.description}</p>
                </div>

                {dec.impactUSD && (
                  <span className="text-xs font-mono font-bold text-amber-400 shrink-0">
                    +{formatMoney(dec.impactUSD)}
                  </span>
                )}
              </div>

              {dec.status === 'PENDING' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <Button
                    size="sm"
                    onClick={() => {
                      toast.success(
                        lang === 'es' ? '¡Decisión Aprobada!' : 'Decision Approved & Signed!'
                      );
                    }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{lang === 'es' ? 'Aprobar Elección' : 'Approve Selection'}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      toast.info(lang === 'es' ? 'Elección rechazada' : 'Selection declined');
                    }}
                    className="text-slate-400 hover:text-white text-xs"
                  >
                    {lang === 'es' ? 'Rechazar' : 'Decline'}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Video Walkthrough Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-sm">
                  {lang === 'es' ? 'Video Explicativo de Obra' : 'Site Video Walkthrough'}
                </h3>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="aspect-video bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&auto=format&fit=crop&q=80"
                alt="Walkthrough Preview"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 space-y-2">
                <div className="w-14 h-14 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 fill-slate-950 ml-1" />
                </div>
                <span className="text-xs font-semibold text-white drop-shadow">
                  {lang === 'es'
                    ? 'Carlos explica el avance del manifold y anclaje de amortiguadores'
                    : 'Carlos explains chiller manifold progress and spring vibration isolation'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => setIsVideoModalOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                {lang === 'es' ? 'Cerrar' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
