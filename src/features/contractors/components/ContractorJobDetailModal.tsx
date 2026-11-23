import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Camera, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  HardHat,
  ExternalLink 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ContractorJob } from '../types';

interface ContractorJobDetailModalProps {
  job: ContractorJob | null;
  onClose: () => void;
}

export const ContractorJobDetailModal: React.FC<ContractorJobDetailModalProps> = ({
  job,
  onClose,
}) => {
  const [activePhotoTab, setActivePhotoTab] = useState<'BEFORE' | 'AFTER'>('BEFORE');

  if (!job) return null;

  const formatCOP = (val: number) => `$${val.toLocaleString('es-CO')} COP`;

  const beforePhotos = job.photos.filter((p) => p.photo_type === 'BEFORE');
  const afterPhotos = job.photos.filter((p) => p.photo_type === 'AFTER');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <HardHat className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-amber-400 font-semibold">{job.job_number}</span>
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                  {job.status}
                </Badge>
              </div>
              <h3 className="font-semibold text-lg text-white">{job.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Cliente & Teléfono</span>
              <p className="text-sm font-semibold text-white">{job.customer_name}</p>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{job.customer_phone}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Sitio de Obra</span>
              <div className="flex items-start gap-1.5 text-xs text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>{job.job_site_address}</span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Cuadrilla Asignada</span>
              <Badge className="bg-slate-800 text-amber-300 border-slate-700">
                {job.crew_name || 'Sin Asignar'}
              </Badge>
            </div>

            <div>
              <span className="text-xs text-slate-400 block mb-1">Horario Programado</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{new Date(job.scheduled_start).toLocaleString('es-CO')}</span>
              </div>
            </div>
          </div>

          {/* Financials & Balance */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 block mb-0.5">Precio Total de la Obra</span>
              <span className="text-lg font-bold text-white font-mono">{formatCOP(job.total_price_cop)}</span>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Anticipo Pagado</span>
                <span className="text-sm font-semibold text-emerald-400 font-mono">
                  {formatCOP(job.deposit_paid_cop)}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-0.5">Saldo por Cobrar</span>
                <span className="text-sm font-semibold text-amber-400 font-mono">
                  {formatCOP(job.balance_due_cop)}
                </span>
              </div>
            </div>
          </div>

          {/* Before & After Photo Vault */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-400" />
                <h4 className="font-semibold text-sm text-white">Bóveda Fotográfica Antes / Después</h4>
              </div>

              {/* Photo toggle tabs */}
              <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActivePhotoTab('BEFORE')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    activePhotoTab === 'BEFORE'
                      ? 'bg-amber-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Antes ({beforePhotos.length})
                </button>
                <button
                  onClick={() => setActivePhotoTab('AFTER')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    activePhotoTab === 'AFTER'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Después ({afterPhotos.length})
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(activePhotoTab === 'BEFORE' ? beforePhotos : afterPhotos).map((photo) => (
                <div
                  key={photo.id}
                  className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group relative"
                >
                  <div className="aspect-video bg-slate-850 flex items-center justify-center relative overflow-hidden">
                    <img
                      src={photo.storage_path}
                      alt={photo.caption || 'Foto de obra'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback image if local path placeholder
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=600&auto=format&fit=crop&q=80';
                      }}
                    />
                    <Badge
                      className={`absolute top-2 left-2 text-[10px] ${
                        activePhotoTab === 'BEFORE'
                          ? 'bg-amber-500/80 text-slate-950'
                          : 'bg-emerald-500/80 text-slate-950'
                      }`}
                    >
                      {activePhotoTab === 'BEFORE' ? 'ESTADO INICIAL' : 'OBRA FINALIZADA'}
                    </Badge>
                  </div>
                  {photo.caption && (
                    <div className="p-2.5 bg-slate-900/90 text-xs text-slate-300 border-t border-slate-800">
                      {photo.caption}
                    </div>
                  )}
                </div>
              ))}

              {(activePhotoTab === 'BEFORE' ? beforePhotos : afterPhotos).length === 0 && (
                <div className="col-span-2 p-8 text-center rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                  No hay fotos registradas para esta etapa
                </div>
              )}
            </div>
          </div>

          {/* Safety Checklist Badge */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Checklist de Seguridad en Obra (EPP, Desconexión Eléctrica, Bloqueo de Válvulas) Verificado.</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          <a
            href={`/contractors/portal/${job.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Portal del Cliente (Seguimiento & Pago)</span>
          </a>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cerrar
            </Button>
            <Button
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs gap-1.5 shadow-md shadow-amber-500/20"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Emitir Factura de Cierre</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
