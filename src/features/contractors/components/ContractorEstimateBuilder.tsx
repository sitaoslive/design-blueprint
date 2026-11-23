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

interface EstimateLineItem {
  id: string;
  type: 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'PERMIT';
  description: string;
  quantity: number;
  unit: string;
  unitCostCOP: number;
}

export const ContractorEstimateBuilder: React.FC = () => {
  const navigate = useNavigate();

  // Customer & Project Info
  const [customerName, setCustomerName] = useState('Alejandro Restrepo');
  const [customerPhone, setCustomerPhone] = useState('+57 300 999 8877');
  const [projectAddress, setProjectAddress] = useState('Calle 10 # 43E-20, El Poblado, Medellín');
  const [projectTitle, setProjectTitle] = useState('Instalación Sistema Mini-Split Inverter 18.000 BTU');
  const [scopeOfWork, setScopeOfWork] = useState(
    'Suministro e instalación de unidad evaporadora y condensadora, tubería de cobre aislada, soporte antivibratorio, cableado de potencia y pruebas de vacío con nitrógeno.'
  );

  // Line items
  const [items, setItems] = useState<EstimateLineItem[]>([
    {
      id: 'item-1',
      type: 'MATERIAL',
      description: 'Unidad Mini-Split Inverter 18K BTU R410A',
      quantity: 1,
      unit: 'UND',
      unitCostCOP: 2200000,
    },
    {
      id: 'item-2',
      type: 'MATERIAL',
      description: 'Kit de tubería de cobre 1/4 y 1/2 con aislamiento térmico (5m)',
      quantity: 1,
      unit: 'KIT',
      unitCostCOP: 280000,
    },
    {
      id: 'item-3',
      type: 'LABOR',
      description: 'Mano de obra técnica: Montaje, vacío y puesta en marcha',
      quantity: 8,
      unit: 'HORA',
      unitCostCOP: 65000,
    },
    {
      id: 'item-4',
      type: 'EQUIPMENT',
      description: 'Bomba de vacío y manómetros digitales de alta precisión',
      quantity: 1,
      unit: 'DIA',
      unitCostCOP: 95000,
    },
  ]);

  // Financial parameters
  const [markupPercent, setMarkupPercent] = useState<number>(25);
  const [applyTax, setApplyTax] = useState<boolean>(true);

  // Calculations
  const materialsCost = items
    .filter((i) => i.type === 'MATERIAL')
    .reduce((acc, i) => acc + i.quantity * i.unitCostCOP, 0);

  const laborCost = items
    .filter((i) => i.type === 'LABOR')
    .reduce((acc, i) => acc + i.quantity * i.unitCostCOP, 0);

  const otherCost = items
    .filter((i) => i.type === 'EQUIPMENT' || i.type === 'PERMIT')
    .reduce((acc, i) => acc + i.quantity * i.unitCostCOP, 0);

  const directSubtotal = materialsCost + laborCost + otherCost;
  const markupValue = Math.round(directSubtotal * (markupPercent / 100));
  const subtotalWithMarkup = directSubtotal + markupValue;
  const taxValue = applyTax ? Math.round(subtotalWithMarkup * 0.19) : 0;
  const grandTotal = subtotalWithMarkup + taxValue;
  const initialDeposit = Math.round(grandTotal * 0.50);

  const formatCOP = (val: number) => `$${val.toLocaleString('es-CO')} COP`;

  // Item Handlers
  const addItem = () => {
    const newItem: EstimateLineItem = {
      id: `item-${Date.now()}`,
      type: 'MATERIAL',
      description: 'Nueva partida...',
      quantity: 1,
      unit: 'UND',
      unitCostCOP: 100000,
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
      toast.error('El presupuesto debe contener al menos 1 partida');
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleApproveAndConvert = () => {
    toast.success('¡Presupuesto Aprobado! Orden de Trabajo creada con factura de anticipo del 50%.', {
      description: `Anticipo a cobrar: ${formatCOP(initialDeposit)}`,
    });
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
              Cotizador Digital & Generador de Presupuestos
            </h1>
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
              FEAT-CONT-EST-001
            </Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Cálculo instantáneo de costos directos, margen de ganancia configurable y propuesta lista para firma en terreno.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs gap-1.5"
            onClick={() => toast.info('Borrador guardado localmente')}
          >
            Guardar Borrador
          </Button>

          <Button
            onClick={handleApproveAndConvert}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs gap-1.5 shadow-md shadow-amber-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Aprobar & Crear Obra</span>
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
              <h3 className="font-semibold text-sm text-white">Datos del Cliente y Ubicación de la Obra</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Cliente / Razón Social</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">Teléfono / WhatsApp</label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Dirección del Proyecto</label>
              <Input
                value={projectAddress}
                onChange={(e) => setProjectAddress(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Título de la Obra</label>
              <Input
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Alcance de los Trabajos (Scope)</label>
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
                <h3 className="font-semibold text-sm text-white">Desglose de Partidas (Materiales & Mano de Obra)</h3>
              </div>
              <Button
                size="sm"
                onClick={addItem}
                className="bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs gap-1 border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Agregar Partida</span>
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
                        <SelectItem value="MATERIAL">Material</SelectItem>
                        <SelectItem value="LABOR">Mano de Obra</SelectItem>
                        <SelectItem value="EQUIPMENT">Herramienta</SelectItem>
                        <SelectItem value="PERMIT">Permiso / Trámite</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Description */}
                  <div className="col-span-12 sm:col-span-4">
                    <Input
                      value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      placeholder="Descripción de la partida..."
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
                    <Input
                      type="number"
                      value={item.unitCostCOP}
                      onChange={(e) =>
                        updateItem(item.id, 'unitCostCOP', parseFloat(e.target.value) || 0)
                      }
                      className="bg-slate-800 border-slate-700 text-xs text-white font-mono"
                    />
                  </div>

                  {/* Total & Delete */}
                  <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Eliminar partida"
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
              <h3 className="font-semibold text-sm text-white">Resumen Financiero & Margen</h3>
            </div>

            {/* Direct Costs Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Materiales:</span>
                <span className="font-mono text-white">{formatCOP(materialsCost)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Mano de Obra:</span>
                <span className="font-mono text-white">{formatCOP(laborCost)}</span>
              </div>
              {otherCost > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Equipos / Otros:</span>
                  <span className="font-mono text-white">{formatCOP(otherCost)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold pt-2 border-t border-slate-800 text-slate-200">
                <span>Costo Directo Total:</span>
                <span className="font-mono text-amber-400">{formatCOP(directSubtotal)}</span>
              </div>
            </div>

            {/* Markup Slider */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1">
                  <Percent className="w-3.5 h-3.5 text-amber-400" />
                  Margen de Utilidad (Markup):
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
                <span>10% (Bajo)</span>
                <span>25% (Recomendado)</span>
                <span>50% (Premium)</span>
              </div>
            </div>

            {/* Tax & Total */}
            <div className="space-y-2 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Utilidad Estimada:</span>
                <span className="font-mono text-emerald-400">+{formatCOP(markupValue)}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyTax}
                    onChange={(e) => setApplyTax(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-amber-500"
                  />
                  <span>Aplicar IVA (19%)</span>
                </label>
                <span className="font-mono text-slate-300">+{formatCOP(taxValue)}</span>
              </div>

              {/* Grand Total Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1 mt-3">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block font-semibold">
                  Precio Total al Cliente
                </span>
                <span className="text-xl font-black text-white font-mono block">
                  {formatCOP(grandTotal)}
                </span>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs text-slate-400">
                  <span>Anticipo 50%:</span>
                  <strong className="font-mono text-emerald-400">{formatCOP(initialDeposit)}</strong>
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
                <span>Aprobar & Crear Obra</span>
              </Button>

              <a
                href={`https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=Hola%20${encodeURIComponent(
                  customerName
                )},%20te%20compartimos%20la%20cotización%20formal%20para%20tu%20proyecto:%20${encodeURIComponent(
                  projectTitle
                )}.%20Valor%20Total:%20${encodeURIComponent(formatCOP(grandTotal))}%20(Anticipo:%20${encodeURIComponent(
                  formatCOP(initialDeposit)
                )}).`}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-xs font-semibold transition-colors border border-emerald-500/30"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Propuesta por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
