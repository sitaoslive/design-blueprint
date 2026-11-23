import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  Send, 
  DollarSign, 
  Clock, 
  ArrowLeft, 
  Star, 
  Check 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientProposal, ProposalTierOption } from './clientPortalTypes';

interface ClientProposalViewerProps {
  proposal: ClientProposal;
  onApproveProposal: (tier: 'GOOD' | 'BETTER' | 'BEST', signature: string) => void;
  onBack: () => void;
}

export const ClientProposalViewer: React.FC<ClientProposalViewerProps> = ({
  proposal,
  onApproveProposal,
  onBack,
}) => {
  const { lang, formatMoney, t } = useContractorI18n();
  const [selectedTier, setSelectedTier] = useState<'GOOD' | 'BETTER' | 'BEST'>('BETTER');
  const [clientSignature, setClientSignature] = useState<string>('Alejandro Restrepo');
  const [questionText, setQuestionText] = useState<string>('');
  const [questions, setQuestions] = useState(proposal.questions);

  const activeOption = proposal.options.find((o) => o.tier === selectedTier) || proposal.options[1];

  const handleSendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    const newQ = {
      id: `q-${Date.now()}`,
      sender: 'CLIENT' as const,
      senderName: 'You (Client)',
      message: questionText,
      timestamp: 'Just now',
    };

    setQuestions((prev) => [...prev, newQ]);
    setQuestionText('');
    toast.success(
      lang === 'es' ? 'Pregunta enviada al contratista' : 'Question sent to contractor'
    );

    // Simulated staff response
    setTimeout(() => {
      setQuestions((prev) => [
        ...prev,
        {
          id: `q-${Date.now() + 1}`,
          sender: 'STAFF' as const,
          senderName: 'Carlos (Master Tech)',
          message:
            lang === 'es'
              ? 'Con gusto! La opción Recomendada incluye además el lavado de serpentín y certificación de presión.'
              : 'Absolutely! The Better option includes complete condenser coil cleansing and nitrogen decay test.',
          timestamp: 'Just now',
        },
      ]);
    }, 1500);
  };

  const handleApprove = () => {
    if (!clientSignature.trim()) {
      toast.error(lang === 'es' ? 'Por favor ingresa tu nombre de firma' : 'Please type your signature name');
      return;
    }
    onApproveProposal(selectedTier, clientSignature);
    toast.success(
      lang === 'es' ? '¡Propuesta Aprobada con Éxito!' : 'Proposal Approved Successfully!',
      {
        description: `${lang === 'es' ? 'Opción:' : 'Option:'} ${activeOption?.tierName} (${formatMoney(activeOption?.priceUSD || 0)})`,
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-xs text-slate-400 hover:text-white gap-1.5 p-0 h-auto">
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'es' ? 'Volver al Inicio' : 'Back to Dashboard'}</span>
        </Button>

        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
          {proposal.status === 'ACCEPTED' ? '✔ APPROVED' : 'AWAITING APPROVAL'}
        </Badge>
      </div>

      <div>
        <span className="text-xs font-mono text-amber-400 font-semibold">{proposal.estimateId}</span>
        <h1 className="text-xl sm:text-2xl font-bold text-white mt-0.5">{proposal.projectTitle}</h1>
        <p className="text-xs text-slate-400 mt-1">
          {lang === 'es'
            ? 'Compara las tres opciones estructuradas y selecciona la que mejor se adapte a tus necesidades.'
            : 'Compare the three tiered options below and approve the scope that best fits your requirements.'}
        </p>
      </div>

      {/* 3-TIER OPTION SELECTOR (GOOD / BETTER / BEST) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {proposal.options.map((opt) => {
          const isSelected = selectedTier === opt.tier;
          return (
            <div
              key={opt.tier}
              onClick={() => setSelectedTier(opt.tier)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
              }`}
            >
              {opt.isRecommended && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider shadow">
                  {lang === 'es' ? '⭐ RECOMENDADO' : '⭐ RECOMMENDED'}
                </Badge>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-semibold uppercase text-slate-400">
                    {opt.tier}
                  </span>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white">{opt.tierName}</h3>
                  <div className="mt-2">
                    <span className="text-xl font-black text-white font-mono">
                      {formatMoney(opt.priceUSD)}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{opt.warrantyLabel}</span>
                </div>

                <ul className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                  {opt.scopeBullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-tight">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-2">
                <Button
                  size="sm"
                  variant={isSelected ? 'default' : 'outline'}
                  className={`w-full text-xs font-bold ${
                    isSelected
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                      : 'border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {isSelected ? (lang === 'es' ? 'Seleccionada' : 'Selected') : (lang === 'es' ? 'Elegir' : 'Select')}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED TIER DETAILS & DIGITAL SIGN-OFF */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-xs text-slate-400 block">{lang === 'es' ? 'Opción a Aprobar:' : 'Option to Approve:'}</span>
            <h3 className="font-bold text-base text-white">{activeOption?.tierName}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">{lang === 'es' ? 'Total:' : 'Total Price:'}</span>
            <span className="text-xl font-black text-amber-400 font-mono">
              {formatMoney(activeOption?.priceUSD || 0)}
            </span>
          </div>
        </div>

        {/* Digital Signature Pad */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-300 block">
            {lang === 'es' ? 'Firma Digital de Aceptación (Escribe tu nombre completo) *' : 'Digital Signature of Acceptance (Type full legal name) *'}
          </label>
          <Input
            value={clientSignature}
            onChange={(e) => setClientSignature(e.target.value)}
            placeholder="e.g. Alejandro Restrepo"
            className="bg-slate-950 border-slate-800 text-white font-mono text-sm"
          />
          <p className="text-[11px] text-slate-500">
            {lang === 'es'
              ? 'Al firmar, autorizas el inicio de los trabajos y confirmas la aceptación de los términos v2026.1.'
              : 'By signing, you authorize commencement of work under terms v2026.1.'}
          </p>
        </div>

        <Button
          onClick={handleApprove}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm py-2.5 shadow-lg shadow-emerald-500/20 gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>
            {lang === 'es'
              ? `Firmar y Aprobar Propuesta (${formatMoney(activeOption?.priceUSD || 0)})`
              : `Sign & Approve Proposal (${formatMoney(activeOption?.priceUSD || 0)})`}
          </span>
        </Button>
      </div>

      {/* QUESTIONS & REVISION THREAD (§ 258) */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <h3 className="font-semibold text-sm text-white">
            {lang === 'es' ? 'Preguntas o Solicitud de Cambios' : 'Ask Questions or Request Revisions'}
          </h3>
        </div>

        {/* Messages stream */}
        <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
          {questions.map((q) => (
            <div
              key={q.id}
              className={`p-3 rounded-xl text-xs space-y-1 ${
                q.sender === 'CLIENT'
                  ? 'bg-slate-950 ml-6 border border-slate-800 text-slate-200'
                  : 'bg-amber-500/10 mr-6 border border-amber-500/20 text-amber-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>{q.senderName}</span>
                <span>{q.timestamp}</span>
              </div>
              <p>{q.message}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendQuestion} className="flex gap-2">
          <Input
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder={
              lang === 'es'
                ? 'Pregunta sobre alcances, garantías o formas de pago...'
                : 'Ask a question about scope, materials or timeline...'
            }
            className="bg-slate-950 border-slate-800 text-xs text-white placeholder:text-slate-500"
          />
          <Button type="submit" size="sm" className="bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0">
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>
    </div>
  );
};
