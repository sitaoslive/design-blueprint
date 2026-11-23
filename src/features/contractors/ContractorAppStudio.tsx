import React, { useState } from 'react';
import { 
  Palette, 
  Smartphone, 
  Sparkles, 
  Layout, 
  CheckCircle2, 
  Globe, 
  Save, 
  Layers, 
  Sliders, 
  MessageSquare, 
  Share2, 
  ShieldCheck, 
  DollarSign, 
  Briefcase,
  ChevronRight,
  Eye,
  Send,
  Zap,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from './context/ContractorI18nContext';
import { ContractorHeader } from './components/ContractorHeader';
import { ContractorAppStudioConfig } from './client-portal/clientPortalTypes';

export const ContractorAppStudio: React.FC = () => {
  const { lang, formatMoney, t } = useContractorI18n();

  // Studio Tab State
  const [activeStudioTab, setActiveStudioTab] = useState<
    'OVERVIEW' | 'DESIGN' | 'HOME' | 'BOOKING' | 'PROJECT_ROOM' | 'REFERRALS' | 'AI_CONCIERGE' | 'PUBLISH'
  >('DESIGN');

  // Personalization Level
  const [personalizationLevel, setPersonalizationLevel] = useState<'LEVEL_1' | 'LEVEL_2' | 'LEVEL_3'>('LEVEL_2');

  // AI Prompt for Level 3
  const [aiDesignPrompt, setAiDesignPrompt] = useState<string>('');

  // App Configuration State
  const [config, setConfig] = useState<ContractorAppStudioConfig>({
    designCollection: 'COPPER_CRAFTED',
    companyDisplayName: 'Apex Mechanical Contractors LLC',
    brandLogoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120',
    primaryColor: '#f59e0b',
    secondaryColor: '#0f172a',
    accentColor: '#10b981',
    welcomeHeadline: 'Everything about your property services, beautifully organized in one place.',
    enabledWidgets: {
      booking: true,
      estimates: true,
      invoices: true,
      projectRoom: true,
      propertyPassport: true,
      careCalendar: true,
      referrals: true,
      aiConcierge: true,
      commercialMode: true,
    },
    aiConciergeTone: 'PROFESSIONAL_HELPFUL',
    referralRewardUSD: 50,
    publishedVersion: 1,
  });

  const designCollections = [
    { id: 'COPPER_CRAFTED', name: 'Copper Crafted', palette: 'Amber & Deep Slate', previewClass: 'from-amber-500/20 to-slate-900' },
    { id: 'MIDNIGHT_COMMAND', name: 'Midnight Command', palette: 'Cyan & Carbon Black', previewClass: 'from-cyan-500/20 to-slate-950' },
    { id: 'SAGE_FIELD', name: 'Sage Field', palette: 'Emerald & Warm Earth', previewClass: 'from-emerald-500/20 to-stone-900' },
    { id: 'BLUEPRINT_PRO', name: 'Blueprint Pro', palette: 'Architect Blue & Crisp Steel', previewClass: 'from-blue-500/20 to-slate-900' },
    { id: 'IVORY_ATELIER', name: 'Ivory Atelier', palette: 'Warm Champagne & Charcoal', previewClass: 'from-amber-200/20 to-neutral-900' },
  ];

  const handleApplyAiDesign = () => {
    if (!aiDesignPrompt.trim()) return;
    toast.success(
      lang === 'es' ? '¡Estilo arquitectónico generado por IA aplicado!' : 'AI Luxury Architectural Theme Applied!'
    );
    setConfig((prev) => ({
      ...prev,
      designCollection: 'IVORY_ATELIER',
      primaryColor: '#d97706',
      welcomeHeadline: 'Bespoke architectural contracting and estate mechanical care.',
      aiConciergeTone: 'EXECUTIVE_FORMAL',
    }));
  };

  const handlePublishConfig = () => {
    const nextVer = config.publishedVersion + 1;
    setConfig((prev) => ({ ...prev, publishedVersion: nextVer }));
    toast.success(
      lang === 'es' ? `¡Versión ${nextVer} del Portal de Clientes Publicada con Éxito!` : `Client Portal Version ${nextVer} Published Successfully!`,
      {
        description: lang === 'es' ? 'Los cambios ya están activos en la nube para todos los clientes.' : 'Live updates dispatched to client PWA instances.',
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <ContractorHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Header Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-bold">
                CUSTOMER EXPERIENCE · APP STUDIO
              </Badge>
              <span className="text-xs text-slate-400 font-mono">v{config.publishedVersion}.0</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">
              {lang === 'es' ? 'Estudio de Personalización del Portal de Clientes' : 'Contractor Customer App Studio'}
            </h1>
            <p className="text-xs text-slate-400">
              {lang === 'es'
                ? 'Diseña la experiencia de tus clientes, activa módulos de obra y controla la identidad visual'
                : 'Configure your branded client PWA, toggle project rooms, and publish live without code'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handlePublishConfig}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Globe className="w-4 h-4" />
              <span>{lang === 'es' ? 'Publicar Cambios en Vivo' : 'Publish Live Updates'}</span>
            </Button>
          </div>
        </div>

        {/* Level Selector: Level 1 (Fast), Level 2 (Custom), Level 3 (AI) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'LEVEL_1',
              title: lang === 'es' ? 'Nivel 1: Configuración Rápida' : 'Level 1: Fast Setup',
              desc: lang === 'es' ? 'Aplica logotipo y paleta estándar en 30 segundos' : 'Preset themes & logo upload in 30 seconds',
            },
            {
              id: 'LEVEL_2',
              title: lang === 'es' ? 'Nivel 2: Personalización Comercial' : 'Level 2: Business Customization',
              desc: lang === 'es' ? 'Control de módulos, programa de referidos y tono de IA' : 'Toggle widgets, referral rules & AI concierge tone',
            },
            {
              id: 'LEVEL_3',
              title: lang === 'es' ? 'Nivel 3: Diseño Asistido por IA' : 'Level 3: Premium AI Design',
              desc: lang === 'es' ? 'Genera identidades con prompts en lenguaje natural' : 'Prompt-driven aesthetic styling for luxury trade brands',
            },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setPersonalizationLevel(lvl.id as any)}
              className={`p-4 rounded-xl border text-left transition-all ${
                personalizationLevel === lvl.id
                  ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-white">{lvl.title}</span>
                {personalizationLevel === lvl.id && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-xs text-slate-400">{lvl.desc}</p>
            </button>
          ))}
        </div>

        {/* Studio Workspace: Left Controls (60%) & Right Live Mobile Preview (40%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT CONTROLS (7 Cols) */}
          <div className="lg:col-span-7 space-y-5 bg-slate-900 border border-slate-800 rounded-2xl p-5">
            {/* Sub-tab Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800">
              {[
                { id: 'DESIGN', label: lang === 'es' ? 'Diseño & Marca' : 'Brand & Design' },
                { id: 'HOME', label: lang === 'es' ? 'Pantalla Inicio' : 'Home Widgets' },
                { id: 'PROJECT_ROOM', label: lang === 'es' ? 'Sala de Obras' : 'Project Room' },
                { id: 'REFERRALS', label: lang === 'es' ? 'Referidos VIP' : 'Referral Rules' },
                { id: 'AI_CONCIERGE', label: lang === 'es' ? 'Copiloto IA' : 'AI Concierge' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStudioTab(tab.id as any)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    activeStudioTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: DESIGN */}
            {activeStudioTab === 'DESIGN' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-300">
                    {lang === 'es' ? 'Colección de Diseño Arquitectónico:' : 'Select Design Collection:'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {designCollections.map((col) => (
                      <button
                        key={col.id}
                        onClick={() => setConfig({ ...config, designCollection: col.id })}
                        className={`p-3 rounded-xl border text-left transition-all bg-gradient-to-r ${col.previewClass} ${
                          config.designCollection === col.id
                            ? 'border-amber-500 ring-2 ring-amber-500/30'
                            : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs font-bold text-white block">{col.name}</span>
                        <span className="text-[10px] text-slate-400 block">{col.palette}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">
                      {lang === 'es' ? 'Nombre Comercial Visible:' : 'Display Company Name:'}
                    </label>
                    <Input
                      value={config.companyDisplayName}
                      onChange={(e) => setConfig({ ...config, companyDisplayName: e.target.value })}
                      className="bg-slate-950 border-slate-800 text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">
                      {lang === 'es' ? 'Color Primario de Acento:' : 'Primary Accent Hex:'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-700 cursor-pointer bg-transparent"
                      />
                      <Input
                        value={config.primaryColor}
                        onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Level 3 AI Design Prompt Input */}
                {personalizationLevel === 'LEVEL_3' && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                      <Sparkles className="w-4 h-4" />
                      <span>{lang === 'es' ? 'Prompt de Estilismo Asistido por IA' : 'AI Aesthetic Styling Prompt'}</span>
                    </div>
                    <Textarea
                      placeholder={
                        lang === 'es'
                          ? 'Ej: Haz que mi portal se sienta como una firma de arquitectura de lujo en Beverly Hills, con tonos arena, tipografía limpia y acentos dorados discretos...'
                          : 'E.g.: Style our client portal for high-end luxury estate remodels with warm stone palettes, minimalist headers and discrete champagne gold accents...'
                      }
                      value={aiDesignPrompt}
                      onChange={(e) => setAiDesignPrompt(e.target.value)}
                      className="bg-slate-950 border-slate-800 text-xs text-slate-200"
                    />
                    <Button
                      size="sm"
                      onClick={handleApplyAiDesign}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs gap-1.5"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{lang === 'es' ? 'Generar Configuración con IA' : 'Apply AI Styling'}</span>
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: HOME WIDGETS */}
            {activeStudioTab === 'HOME' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  {lang === 'es' ? 'Módulos Habilitados en el Portal del Cliente:' : 'Enabled Client Portal Widgets:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'booking', label: '8-Step Service Booking' },
                    { key: 'estimates', label: 'Good/Better/Best Proposals' },
                    { key: 'projectRoom', label: 'My Project Room (12 Milestones)' },
                    { key: 'propertyPassport', label: 'My Property Passport & Assets' },
                    { key: 'careCalendar', label: 'Annual Property Care Calendar' },
                    { key: 'referrals', label: 'Client VIP Referral Sharing' },
                    { key: 'aiConcierge', label: 'Service Concierge AI Copilot' },
                    { key: 'commercialMode', label: 'Commercial & Multi-Property Mode' },
                  ].map((widget) => {
                    const isEnabled = (config.enabledWidgets as any)[widget.key];
                    return (
                      <div
                        key={widget.key}
                        onClick={() =>
                          setConfig({
                            ...config,
                            enabledWidgets: {
                              ...config.enabledWidgets,
                              [widget.key]: !isEnabled,
                            },
                          })
                        }
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                          isEnabled
                            ? 'bg-amber-500/10 border-amber-500/40 text-white font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span>{widget.label}</span>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center ${
                            isEnabled ? 'bg-amber-500 text-slate-950' : 'bg-slate-800'
                          }`}
                        >
                          {isEnabled && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: PROJECT ROOM */}
            {activeStudioTab === 'PROJECT_ROOM' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  {lang === 'es' ? 'Configuración de la Sala de Proyectos (Obras Mayores)' : 'Project Room Milestone Stages:'}
                </span>
                <p className="text-xs text-slate-400">
                  {lang === 'es'
                    ? 'Los 12 hitos estándar se adaptan automáticamente al oficio (HVAC Comercial, Reformas, Techos, Electricidad)'
                    : '12 standard progressive stages are synchronized directly from field work order updates.'}
                </p>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Hitos 1 a 6: Consulta, Propuesta, Anticipo, Permisos, Acopio y Desmontaje</span>
                  </div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Hitos 7 a 12: Instalación, Manifold, Presurización 45 PSI, Remates, Acta y Garantía</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: REFERRALS */}
            {activeStudioTab === 'REFERRALS' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  {lang === 'es' ? 'Reglas del Programa de Referidos VIP:' : 'VIP Referral Program Incentives:'}
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">
                      {lang === 'es' ? 'Recompensa Cliente Referidor ($):' : 'Referrer Credit ($):'}
                    </label>
                    <Input
                      type="number"
                      value={config.referralRewardUSD}
                      onChange={(e) => setConfig({ ...config, referralRewardUSD: Number(e.target.value) })}
                      className="bg-slate-950 border-slate-800 text-xs font-mono text-amber-400 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">
                      {lang === 'es' ? 'Descuento para el Amigo ($):' : 'Referee Welcome Discount ($):'}
                    </label>
                    <Input
                      type="number"
                      defaultValue={25}
                      className="bg-slate-950 border-slate-800 text-xs font-mono text-emerald-400 font-bold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: AI CONCIERGE */}
            {activeStudioTab === 'AI_CONCIERGE' && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 block">
                  {lang === 'es' ? 'Tono y Personalidad del Service Concierge:' : 'AI Customer Concierge Tone:'}
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'PROFESSIONAL_HELPFUL', label: 'Professional & Helpful' },
                    { id: 'FRIENDLY_WARM', label: 'Friendly & Warm' },
                    { id: 'EXECUTIVE_FORMAL', label: 'Executive & Formal' },
                    { id: 'FIELD_DIRECT', label: 'Field Direct & Fast' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setConfig({ ...config, aiConciergeTone: t.id as any })}
                      className={`p-3 rounded-xl border text-xs text-left font-semibold transition-all ${
                        config.aiConciergeTone === t.id
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-950 text-slate-400'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT LIVE MOBILE PREVIEW SIMULATOR (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-[340px] bg-slate-950 border-4 border-slate-800 rounded-[36px] p-3 shadow-2xl relative overflow-hidden">
              {/* Phone Speaker Notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-b-xl mx-auto mb-3" />

              {/* Simulated Client App Screen */}
              <div className="bg-slate-900 rounded-[24px] p-3 space-y-3 min-h-[520px] text-xs">
                {/* Simulated Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] text-slate-950"
                      style={{ backgroundColor: config.primaryColor }}
                    >
                      A
                    </div>
                    <span className="font-bold text-white text-[11px] truncate max-w-[140px]">
                      {config.companyDisplayName}
                    </span>
                  </div>
                  <Badge className="bg-amber-500/20 text-amber-300 text-[9px] py-0 px-1.5 font-mono">
                    LIVE
                  </Badge>
                </div>

                {/* Simulated Adaptive Hero */}
                <div
                  className="p-3 rounded-xl border border-slate-800 space-y-1.5"
                  style={{ backgroundColor: `${config.primaryColor}15` }}
                >
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">
                    UPCOMING APPOINTMENT
                  </span>
                  <span className="font-bold text-white block text-xs">
                    Rooftop Chiller Overhaul
                  </span>
                  <span className="text-[10px] text-slate-300 block">
                    Tomorrow · 8:00 AM – 12:00 PM
                  </span>
                </div>

                {/* Simulated Project Room Widget */}
                {config.enabledWidgets.projectRoom && (
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white">Project Room</span>
                      <span className="text-amber-400 font-mono">75%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-full bg-amber-500 w-3/4" />
                    </div>
                  </div>
                )}

                {/* Simulated Referrals Widget */}
                {config.enabledWidgets.referrals && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Give $25, Get ${config.referralRewardUSD}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                )}

                {/* Simulated Bottom Navigation Bar */}
                <div className="pt-8">
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex items-center justify-around text-[9px] text-slate-400 font-medium">
                    <span className="text-amber-400 font-bold">Home</span>
                    <span>Book</span>
                    <span>Activity</span>
                    <span>AI Chat</span>
                    <span>Account</span>
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 mt-2 font-mono">
              Live Responsive Preview (iPhone 16 Pro)
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
