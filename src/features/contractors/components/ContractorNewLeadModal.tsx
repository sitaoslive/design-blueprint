import React, { useState } from 'react';
import { X, Sparkles, Building2, Phone, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ContractorLead, ContractorServiceType, ContractorUrgencyLevel } from '../types';
import { useContractorI18n } from '../context/ContractorI18nContext';

interface ContractorNewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (newLead: ContractorLead) => void;
}

export const ContractorNewLeadModal: React.FC<ContractorNewLeadModalProps> = ({
  isOpen,
  onClose,
  onLeadCreated,
}) => {
  const { t, currency } = useContractorI18n();
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceType, setServiceType] = useState<ContractorServiceType>('HVAC');
  const [urgency, setUrgency] = useState<ContractorUrgencyLevel>('STANDARD');
  const [address, setAddress] = useState('');
  const [budget, setBudget] = useState(currency === 'COP' ? '4000000' : '1000');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !phone || !address) return;

    const parsedBudget = parseFloat(budget) || 0;
    // Normalize to COP for database schema consistency
    const budgetCOP = currency === 'COP' ? Math.round(parsedBudget) : Math.round(parsedBudget * (currency === 'CAD' ? 2900 : 4000));

    const newLead: ContractorLead = {
      id: `lead-${Date.now()}`,
      organization_id: 'org-contractor-demo',
      lead_number: `LEAD-2611-${Math.floor(1000 + Math.random() * 9000)}`,
      contact_name: contactName,
      phone,
      service_type: serviceType,
      urgency_level: urgency,
      project_address: address,
      city: address.includes(',') ? address.split(',').pop()?.trim() || 'Austin' : 'Austin',
      estimated_budget_cop: budgetCOP,
      pipeline_stage: 'NEW',
      lead_score: urgency === 'EMERGENCY' ? 95 : urgency === 'URGENT' ? 80 : 60,
      lead_source: 'MANUAL',
      notes,
      created_at: new Date().toISOString(),
    };

    onLeadCreated(newLead);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{t('leadModal.title')}</h3>
              <p className="text-xs text-slate-400">{t('leadModal.desc')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">{t('leadModal.customerName')}</label>
              <Input
                required
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder={t('leadModal.customerPlaceholder')}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">{t('leadModal.phone')}</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <Input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t('leadModal.phonePlaceholder')}
                  className="bg-slate-800 border-slate-700 text-white pl-9 placeholder:text-slate-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">{t('leadModal.service')}</label>
              <Select value={serviceType} onValueChange={(v) => setServiceType(v as ContractorServiceType)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white text-sm">
                  <SelectValue placeholder={t('leadModal.serviceSelect')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="HVAC">{t('trade.hvac')}</SelectItem>
                  <SelectItem value="PLUMBING">{t('trade.plumbing')}</SelectItem>
                  <SelectItem value="ELECTRICAL">{t('trade.electrical')}</SelectItem>
                  <SelectItem value="ROOFING">{t('trade.roofing')}</SelectItem>
                  <SelectItem value="PAINTING">{t('trade.painting')}</SelectItem>
                  <SelectItem value="GENERAL_REMODEL">{t('trade.remodel')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">{t('leadModal.urgency')}</label>
              <Select value={urgency} onValueChange={(v) => setUrgency(v as ContractorUrgencyLevel)}>
                <SelectTrigger className="bg-slate-800 border-slate-700 text-white text-sm">
                  <SelectValue placeholder={t('leadModal.urgency')} />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  <SelectItem value="EMERGENCY">{t('urgency.emergency')}</SelectItem>
                  <SelectItem value="URGENT">{t('urgency.urgent')}</SelectItem>
                  <SelectItem value="STANDARD">{t('urgency.standard')}</SelectItem>
                  <SelectItem value="FLEXIBLE">{t('urgency.flexible')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">{t('leadModal.address')}</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t('leadModal.addressPlaceholder')}
                className="bg-slate-800 border-slate-700 text-white pl-9 placeholder:text-slate-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              {t('leadModal.budget')} ({currency})
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="1500"
                className="bg-slate-800 border-slate-700 text-white pl-9 placeholder:text-slate-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">{t('leadModal.notes')}</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('leadModal.notesPlaceholder')}
              rows={3}
              className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 text-sm resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-400 hover:text-white"
            >
              {t('leadModal.cancel')}
            </Button>
            <Button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold gap-2 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              {t('leadModal.submit')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
