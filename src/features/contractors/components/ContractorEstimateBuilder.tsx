import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  DollarSign, 
  Percent, 
  Send, 
  CheckCircle2, 
  User, 
  MapPin, 
  Phone, 
  Briefcase, 
  Sparkles, 
  ArrowLeft 
} from 'lucide-react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';

interface EstimateLineItem {
  id: string;
  type: 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'PERMIT';
  description: string;
  quantity: number;
  unit: string;
  unitCostUSD: number;
}

export const ContractorEstimateBuilder: React.FC = () => {
  const navigate = useNavigate();
  const { t, formatMoney, currency, lang } = useContractorI18n();

  // Customer & Project Info (US/Canada friendly defaults with bilingual support)
  const [customerName, setCustomerName] = useState('Alejandro Restrepo (Apex Properties)');
  const [customerPhone, setCustomerPhone] = useState('+1 (305) 555-8877');
  const [projectAddress, setProjectAddress] = useState('1200 Brickell Ave, Suite 1400, Miami, FL');
  const [projectTitle, setProjectTitle] = useState('Commercial Inverter Multi-Zone Heat Pump Installation');
  const [scopeOfWork, setScopeOfWork] = useState(
    'Supply & install condenser and wall evaporator units, insulated ACR copper lineset, vibration isolation pads, electrical disconnect whip and nitrogen pressure decay certification.'
  );

  // Line items stored in canonical base USD
  const [items, setItems] = useState<EstimateLineItem[]>([
    {
      id: 'item-1',
      type: 'MATERIAL',
      description: 'Commercial 18k BTU Inverter Heat Pump & Condenser (SEER2 20+)',
      quantity: 1,
      unit: 'EA',
      unitCostUSD: 550,
    },
    {
      id: 'item-2',
      type: 'MATERIAL',
      description: 'Insulated 1/4 & 1/2 Copper Lineset Kit with UV Sleeving (25ft)',
      quantity: 1,
      unit: 'KIT',
      unitCostUSD: 70,
    },
    {
      id: 'item-3',
      type: 'LABOR',
      description: 'Certified Trade Technician: Mounting, vacuum evacuation & commissioning',
      quantity: 8,
      unit: 'HR',
      unitCostUSD: 65,
    },
    {
      id: 'item-4',
      type: 'EQUIPMENT',
      description: 'Two-stage vacuum pump and digital wireless micron gauge test kit',
      quantity: 1,
      unit: 'DAY',
      unitCostUSD: 85,
    },
  ]);

  // Financial parameters
  const [markupPercent, setMarkupPercent] = useState<number>(25);
  const [applyTax, setApplyTax] = useState<boolean>(true);

  // Calculations in USD
  const materialsCost = items
    .filter((i) => i.type === 'MATERIAL')
    .reduce((acc, i) => acc + i.quantity * i.unitCostUSD, 0);

  const laborCost = items
    .filter((i) => i.type === 'LABOR')
    .reduce((acc, i) => acc + i.quantity * i.unitCostUSD, 0);

  const otherCost = items
    .filter((i) => i.type === 'EQUIPMENT' || i.type === 'PERMIT')
    .reduce((acc, i) => acc + i.quantity * i.unitCostUSD, 0);

  const directSubtotal = materialsCost + laborCost + otherCost;
  const markupValue = Math.round(directSubtotal * (markupPercent / 100));
  const subtotalWithMarkup = directSubtotal + markupValue;
  // 10% tax in US/CA or 19% in CO
  const taxRate = currency === 'COP' ? 0.19 : 0.0825;
  const taxValue = applyTax ? Math.round(subtotalWithMarkup * taxRate) : 0;
  const grandTotal = subtotalWithMarkup + taxValue;
  const initialDeposit = Math.round(grandTotal * 0.50);

  // Item Handlers
  const addItem = () => {
    const newItem: EstimateLineItem = {
      id: `item-${Date.now()}`,
      type: 'MATERIAL',
      description: lang === 'es' ? 'Nueva partida...' : 'New line item...',
      quantity: 1,
      unit: 'EA',
      unitCostUSD: 100,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const updateItem = (id: string, field: keyof EstimateLineItem, val: any) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: val } : i))
    );
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) {
      toast.error(lang === 'es' ? 'El presupuesto debe contener al menos 1 partida' : 'Estimate must contain at least 1 item');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleApproveAndConvert = () => {
    toast.success(
      lang === 'es'
        ? '¡Presupuesto Aprobado! Orden de Trabajo creada con factura de anticipo del 50%.'
        : 'Estimate Approved! Work order created with 50% upfront deposit invoice.',
      {
        description: `${t('est.deposit')} ${formatMoney(initialDeposit)}`,
      }
    );
    setTimeout(() => {
      void navigate({ to: '/contractors/jobs' });
    }, 1200);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/contractors/leads" className="text-slate-400 hover:text-white p-1 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {t('est.title')}
            </h1>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              FEAT-CONT-EST-001
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            {t('est.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5"
            onClick={() => toast.info(lang === 'es' ? 'Borrador guardado localmente' : 'Draft saved locally')}
          >
            {t('est.saveDraft')}
          </Button>

          <Button
            onClick={handleApproveAndConvert}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs gap-1.5 shadow-md shadow-amber-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('est.approve')}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Form & Line Items (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Site Details Card */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <User className="w-4 h-4 text-amber-400" />
              <h3 className="font-semibold text-sm text-white">{t('est.customerSection')}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">{t('est.customerName')}</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">{t('est.phone')}</label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">{t('est.address')}</label>
              <Input
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">{t('est.projectTitle')}</label>
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">{t('est.scope')}</label>
              <Textarea
                rows={2}
                value={scopeOfWork}
                onChange={(e) => setScopeOfWork(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm resize-none"
              />
            </div>
          </div>

          {/* Line Items Table Card */}
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                <h3 className="font-semibold text-sm text-white">{t('est.itemsSection')}</h3>
              </div>
              <Button
                size="sm"
                onClick={addItem}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs gap-1 border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('est.addItem')}</span>
              </Button>
            </div>

            {/* Items List */}
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 grid grid-cols-12 gap-3 items-center"
                >
                  {/* Type */}
                  <div className="col-span-12 sm:col-span-3">
                    <Select
                      value={item.type}
                      onValueChange={(val) => updateItem(item.id, 'type', val)}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-xs text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="MATERIAL">{t('est.type.material')}</SelectItem>
                        <SelectItem value="LABOR">{t('est.type.labor')}</SelectItem>
                        <SelectItem value="EQUIPMENT">{t('est.type.equipment')}</SelectItem>
                        <SelectItem value="PERMIT">{t('est.type.permit')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="col-span-12 sm:col-span-4">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder={t('est.colDesc')}
                      className="bg-slate-800 border-slate-700 text-xs text-white"
                    />
                  </div>

                  {/* Quantity & Unit */}
                  <div className="col-span-4 sm:col-span-2 flex items-center gap-1.5">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)
                      }
                      className="bg-slate-800 border-slate-700 text-xs text-white w-16"
                    />
                    <span className="text-[11px] text-slate-400 font-mono">{item.unit}</span>
                  </div>

                  {/* Unit Cost */}
                  <div className="col-span-6 sm:col-span-2">
                    <div className="relative">
                      <Input
                        type="number"
                        value={item.unitCostUSD}
                        onChange={(e) =>
                          updateItem(item.id, 'unitCostUSD', parseFloat(e.target.value) || 0)
                        }
                        className="bg-slate-800 border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Total & Delete */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Markup Engine (1 Col) */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 space-y-5 sticky top-20 shadow-xl">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <h3 className="font-semibold text-sm text-white">{t('est.financialSummary')}</h3>
            </div>

            {/* Direct Costs Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{t('est.materials')}</span>
                <span className="font-mono text-white">{formatMoney(materialsCost)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>{t('est.labor')}</span>
                <span className="font-mono text-white">{formatMoney(laborCost)}</span>
              </div>
              {otherCost > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>{t('est.equipment')}</span>
                  <span className="font-mono text-white">{formatMoney(otherCost)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t border-slate-800 text-slate-200">
                <span>{t('est.directCost')}</span>
                <span className="font-mono text-amber-400">{formatMoney(directSubtotal)}</span>
              </div>
            </div>

            {/* Markup Slider */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  {t('est.markup')}
                </span>
                <span className="font-mono text-amber-400 font-bold">{markupPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={markupPercent}
                onChange={(e) => setMarkupPercent(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>10% ({lang === 'es' ? 'Bajo' : 'Low'})</span>
                <span>25% ({lang === 'es' ? 'Recomendado' : 'Recommended'})</span>
                <span>50% ({lang === 'es' ? 'Premium' : 'Premium'})</span>
              </div>
            </div>

            {/* Tax & Total */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t('est.profit')}</span>
                <span className="font-mono text-emerald-400">+{formatMoney(markupValue)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyTax}
                    onChange={(e) => setApplyTax(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-amber-500"
                  />
                  <span>{t('est.tax')}</span>
                </label>
                <span className="font-mono text-slate-300">+{formatMoney(taxValue)}</span>
              </div>

              {/* Grand Total Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 mt-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  {t('est.totalPrice')}
                </span>
                <span className="text-xl font-black text-white font-mono block">
                  {formatMoney(grandTotal)}
                </span>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                  <span>{t('est.deposit')}</span>
                  <strong className="font-mono text-emerald-400">{formatMoney(initialDeposit)}</strong>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleApproveAndConvert}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 shadow-lg shadow-amber-500/20 text-xs py-2.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('est.approve')}</span>
              </Button>

              <a
                href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(
                  customerName
                )},%20here%20is%20the%20estimate%20for%20your%20project:%20${encodeURIComponent(
                  projectTitle
                )}.%20Total:%20${encodeURIComponent(formatMoney(grandTotal))}%20(Deposit:%20${encodeURIComponent(
                  formatMoney(initialDeposit)
                )}).`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold transition-colors border border-emerald-500/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('est.whatsappSend')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
