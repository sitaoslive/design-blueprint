import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Wrench, 
  Key, 
  Plus, 
  ShieldCheck, 
  Calendar, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2, 
  HardHat 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { ClientProperty, ClientEquipment } from './clientPortalTypes';

interface ClientPropertyEquipmentHubProps {
  properties: ClientProperty[];
  equipmentList: ClientEquipment[];
  onRequestMaintenance: (equipId: string) => void;
}

export const ClientPropertyEquipmentHub: React.FC<ClientPropertyEquipmentHubProps> = ({
  properties,
  equipmentList,
  onRequestMaintenance,
}) => {
  const { lang, t } = useContractorI18n();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || 'p1');

  const activeProperty = properties.find((p) => p.id === selectedPropertyId) || properties[0];
  const propertyEquipment = equipmentList.filter((e) => e.propertyId === selectedPropertyId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">
          {lang === 'es' ? 'Mis Propiedades & Equipos Registrados' : 'My Properties & Equipment Assets'}
        </h2>
        <p className="text-xs text-slate-400">
          {lang === 'es'
            ? 'Gestiona ubicaciones, códigos de acceso e historial técnico de cada equipo'
            : 'Manage premises, gate codes and equipment service history in one place'}
        </p>
      </div>

      {/* Property Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {properties.map((prop) => (
          <button
            key={prop.id}
            onClick={() => setSelectedPropertyId(prop.id)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
              selectedPropertyId === prop.id
                ? 'border-amber-500 bg-amber-500/10 text-white shadow-md'
                : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{prop.name}</span>
            {prop.isPrimary && (
              <Badge className="bg-amber-500 text-slate-950 text-[9px] py-0 px-1 font-bold">
                {lang === 'es' ? 'PRINCIPAL' : 'PRIMARY'}
              </Badge>
            )}
          </button>
        ))}

        <button
          onClick={() => toast.info(lang === 'es' ? 'Formulario para agregar propiedad' : 'Add property modal')}
          className="px-3 py-2 rounded-xl text-xs font-semibold shrink-0 border border-dashed border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{lang === 'es' ? 'Nueva Propiedad' : 'Add Property'}</span>
        </button>
      </div>

      {/* Selected Property Card */}
      {activeProperty && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white">{activeProperty.name}</span>
                <Badge className="bg-slate-800 text-slate-300 text-[10px]">{activeProperty.type}</Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{activeProperty.streetAddress}, {activeProperty.city}, {activeProperty.stateProvince} {activeProperty.postalCode}</span>
              </div>
            </div>

            {activeProperty.accessInstructions && (
              <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2 text-xs text-slate-300 self-start sm:self-auto">
                <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono text-[11px]">{activeProperty.accessInstructions}</span>
              </div>
            )}
          </div>

          {/* Equipment List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs text-slate-300 uppercase tracking-wider">
                {lang === 'es' ? 'Equipos & Maquinaria Instalada' : 'Installed Equipment & Systems'} ({propertyEquipment.length})
              </h3>
              <button
                onClick={() => toast.info(lang === 'es' ? 'Registrar nuevo equipo' : 'Register equipment')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                + {lang === 'es' ? 'Agregar Equipo' : 'Add Equipment'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {propertyEquipment.map((eq) => (
                <div
                  key={eq.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400 font-semibold uppercase">
                        {eq.equipmentType}
                      </span>
                      <Badge
                        className={`text-[9px] py-0 ${
                          eq.status === 'OPERATIONAL'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {eq.status}
                      </Badge>
                    </div>
                    <h4 className="font-bold text-sm text-white">{eq.name}</h4>
                    <p className="text-xs text-slate-400 font-mono">
                      {eq.manufacturer} · Mod: {eq.modelNumber}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                    <div className="flex justify-between">
                      <span>{lang === 'es' ? 'Serial:' : 'Serial:'}</span>
                      <span className="font-mono text-slate-300">{eq.serialNumber}</span>
                    </div>
                    {eq.filterSize && (
                      <div className="flex justify-between">
                        <span>{lang === 'es' ? 'Tamaño Filtro:' : 'Filter Size:'}</span>
                        <span className="font-mono text-slate-300">{eq.filterSize}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>{lang === 'es' ? 'Garantía hasta:' : 'Warranty Exp:'}</span>
                      <span className="font-mono text-emerald-400">{eq.warrantyExpiration}</span>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onRequestMaintenance(eq.id);
                      toast.success(
                        lang === 'es' ? 'Mantenimiento solicitado para este equipo' : 'Maintenance requested for this equipment'
                      );
                    }}
                    className="w-full border-slate-800 text-amber-400 hover:bg-slate-900 text-xs gap-1.5"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{lang === 'es' ? 'Solicitar Mantenimiento' : 'Request Maintenance'}</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
