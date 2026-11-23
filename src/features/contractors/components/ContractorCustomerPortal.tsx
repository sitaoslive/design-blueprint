import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  Camera, 
  DollarSign, 
  CheckCircle2, 
  CreditCard, 
  Star, 
  Sparkles, 
  Share2, 
  Download, 
  Clock, 
  HardHat, 
  Check, 
  Send,
  Wrench,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useContractorI18n } from '../context/ContractorI18nContext';
import { 
  ClientTab, 
  ClientProperty, 
  ClientEquipment, 
  ClientProposal, 
  ClientChangeOrder, 
  ClientMaintenancePlan, 
  ClientWarranty 
} from '../client-portal/clientPortalTypes';

// Part 7 Client Portal Subcomponents
import { ClientPortalShell } from '../client-portal/ClientPortalShell';
import { ClientAdaptiveHome } from '../client-portal/ClientAdaptiveHome';
import { ClientBookingWizard } from '../client-portal/ClientBookingWizard';
import { ClientActivityHub } from '../client-portal/ClientActivityHub';
import { ClientAiConcierge } from '../client-portal/ClientAiConcierge';
import { ClientPropertyEquipmentHub } from '../client-portal/ClientPropertyEquipmentHub';
import { ClientMaintenanceWarrantyHub } from '../client-portal/ClientMaintenanceWarrantyHub';
import { ClientProposalViewer } from '../client-portal/ClientProposalViewer';
import { ClientChangeOrderModal } from '../client-portal/ClientChangeOrderModal';
import { ClientRebookModal } from '../client-portal/ClientRebookModal';
import { ClientRescheduleModal } from '../client-portal/ClientRescheduleModal';

interface ContractorCustomerPortalProps {
  token?: string;
}

export const ContractorCustomerPortal: React.FC<ContractorCustomerPortalProps> = ({
  token = 'demo-token',
}) => {
  const { t, formatMoney, lang, setLang, currency, setCurrency } = useContractorI18n();
  
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ClientTab>('HOME');
  const [accountSubTab, setAccountSubTab] = useState<'PROPERTIES' | 'MAINTENANCE'>('PROPERTIES');

  // Modal States
  const [isRebookOpen, setIsRebookOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isChangeOrderOpen, setIsChangeOrderOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Financial & Approval States
  const [isPaid, setIsPaid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'STRIPE' | 'APPLE_PAY' | 'ACH' | 'INTERAC' | 'NEQUI'>('STRIPE');
  const [changeOrderState, setChangeOrderState] = useState<'PENDING_APPROVAL' | 'APPROVED' | 'DECLINED'>('PENDING_APPROVAL');

  // Client Properties
  const [properties, setProperties] = useState<ClientProperty[]>([
    {
      id: 'p1',
      name: 'Brickell Medical Tower',
      type: 'COMMERCIAL',
      streetAddress: '1200 Brickell Ave, Suite 1400',
      city: 'Miami',
      stateProvince: 'FL',
      postalCode: '33131',
      accessInstructions: 'Security check-in at main lobby desk. Service elevator #4 to 14th floor rooftop equipment room. Gate code #8821.',
      isPrimary: true,
    },
    {
      id: 'p2',
      name: 'Coconut Grove Residence',
      type: 'RESIDENTIAL',
      streetAddress: '3420 Main Highway',
      city: 'Miami',
      stateProvince: 'FL',
      postalCode: '33133',
      accessInstructions: 'Side gate unlocked, alarm code 4521#. Watch out for golden retriever in backyard.',
      isPrimary: false,
    },
  ]);

  // Client Equipment Assets
  const [equipmentList, setEquipmentList] = useState<ClientEquipment[]>([
    {
      id: 'eq-1',
      propertyId: 'p1',
      name: 'Carrier 50-Ton Packaged Rooftop Chiller #1',
      equipmentType: 'HVAC / Chiller',
      manufacturer: 'Carrier Commercial',
      modelNumber: '50XC-050-A',
      serialNumber: 'CR-50X-2026-9912',
      installationDate: '2026-11-23',
      warrantyExpiration: '2031-11-23',
      filterSize: '24x24x2 MERV 13 (Qty: 8)',
      status: 'OPERATIONAL',
      lastServiceDate: '2026-11-23',
      nextMaintenanceDue: '2027-02-23',
    },
    {
      id: 'eq-2',
      propertyId: 'p1',
      name: 'Carrier 50-Ton Packaged Rooftop Chiller #2',
      equipmentType: 'HVAC / Chiller',
      manufacturer: 'Carrier Commercial',
      modelNumber: '50XC-050-B',
      serialNumber: 'CR-50X-2026-9913',
      installationDate: '2026-11-23',
      warrantyExpiration: '2031-11-23',
      filterSize: '24x24x2 MERV 13 (Qty: 8)',
      status: 'OPERATIONAL',
      lastServiceDate: '2026-11-23',
      nextMaintenanceDue: '2027-02-23',
    },
    {
      id: 'eq-3',
      propertyId: 'p2',
      name: 'Trane XR14 High-Efficiency Heat Pump',
      equipmentType: 'Residential Heat Pump',
      manufacturer: 'Trane Residential',
      modelNumber: '4TWR4036G1000A',
      serialNumber: 'TRN-2024-8841',
      installationDate: '2024-05-10',
      warrantyExpiration: '2029-05-10',
      filterSize: '20x25x4 MERV 11',
      status: 'NEEDS_ATTENTION',
      lastServiceDate: '2026-05-12',
      nextMaintenanceDue: '2026-12-01',
    },
  ]);

  // Client Good/Better/Best Proposal
  const [proposal, setProposal] = useState<ClientProposal>({
    id: 'prop-101',
    estimateId: 'est-501',
    projectTitle: 'Chilled Water Loop Automation & Smart VFD Retrofit',
    status: 'PENDING_APPROVAL',
    validUntil: '2026-12-15',
    options: [
      {
        tier: 'GOOD',
        tierName: 'Standard VFD Control',
        priceUSD: 3200,
        warrantyLabel: '1 Year Commercial Warranty',
        scopeBullets: [
          'Dual Yaskawa VFD installation on condenser pumps',
          'Standard digital pressure sensor hookup',
          'Manual frequency bypass switch',
          'Baseline test and balance report',
        ],
      },
      {
        tier: 'BETTER',
        tierName: 'Smart Connected System (Recommended)',
        priceUSD: 4450,
        warrantyLabel: '3 Years Full Parts & Labor Warranty',
        isRecommended: true,
        scopeBullets: [
          'High-efficiency ABB ACH580 HVAC drives with BACnet integration',
          'Differential pressure transducers with automated modulation',
          'Cloud IoT remote diagnostics & fault alerting gateway',
          'Dynamic load matching algorithm (estimated 28% power savings)',
          'Complete seasonal commissioning protocol',
        ],
      },
      {
        tier: 'BEST',
        tierName: 'Master AI Optimization Suite',
        priceUSD: 5900,
        warrantyLabel: '5 Years Comprehensive Care & Lifetime Support',
        scopeBullets: [
          'Everything in Smart Connected tier',
          'AI-driven predictive vibration and bearing wear telemetry',
          'Automated refrigerant leak sniffing sensor network',
          'VIP 2-hour priority emergency response dispatch contract',
          'Free annual preventative overhaul for 5 years included',
        ],
      },
    ],
    questions: [
      {
        id: 'q-1',
        sender: 'STAFF',
        senderName: 'Apex Commercial Estimating Team',
        message: 'Hello Alejandro, we have prepared three turnkey options for your chilled water loop retrofit. The "Better" tier is our primary engineering recommendation for the medical tower.',
        timestamp: 'Today at 09:15 AM',
      },
    ],
  });

  // Client Change Order
  const [changeOrder, setChangeOrder] = useState<ClientChangeOrder>({
    id: 'co-101',
    jobId: 'job-501',
    changeOrderNumber: 'CO-01',
    title: 'Hydraulic Manifold Isolation Valve Replacement (Discovered during pressure test)',
    description: 'During hydraulic manifold pressure testing at 45 PSI, two legacy 3-inch bronze gate valves showed hairline body fractures and failed isolation seal. Immediate replacement with stainless ball valves is required to prevent water damage.',
    additionalCostUSD: 480,
    additionalDays: 0,
    evidencePhotoUrl: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=800&auto=format&fit=crop&q=80',
    status: 'PENDING_APPROVAL',
  });

  // Maintenance Plans & Warranties
  const [maintenancePlans, setMaintenancePlans] = useState<ClientMaintenancePlan[]>([
    {
      id: 'plan-1',
      planName: 'Commercial VIP HVAC Maintenance Agreement',
      propertyName: 'Brickell Medical Tower',
      billingInterval: 'ANNUAL',
      priceUSD: 1450,
      visitsUsed: 3,
      visitsTotal: 4,
      renewalDate: '2027-05-15',
      priorityDispatch: true,
      status: 'ACTIVE',
    },
  ]);

  const [warranties, setWarranties] = useState<ClientWarranty[]>([
    {
      id: 'war-1',
      code: 'WRN-2611-0081',
      coverageTitle: 'Carrier Packaged Rooftop Chillers 5-Year Compressor Warranty',
      warrantyType: 'MANUFACTURER_COMMERCIAL',
      startDate: '2026-11-23',
      endDate: '2031-11-23',
      termsSummary: 'Covers 100% parts and compressor replacement in case of mechanical breakdown or refrigerant circuit failure.',
      status: 'ACTIVE',
    },
    {
      id: 'war-2',
      code: 'WRN-2611-0042',
      coverageTitle: 'Apex Workmanship Guarantee — Chilled Water Manifold',
      warrantyType: 'CONTRACTOR_LABOR',
      startDate: '2026-11-23',
      endDate: '2028-11-23',
      termsSummary: 'Zero-cost labor and diagnostic guarantee covering all welded flanges, vibration dampeners and hydraulic seals.',
      status: 'ACTIVE',
    },
  ]);

  // Project Balance Summary
  const baseBalanceDueUSD = isPaid ? 0 : (2312.5 + (changeOrderState === 'APPROVED' ? changeOrder.additionalCostUSD : 0));

  // Handlers
  const handleApproveProposal = (tier: 'GOOD' | 'BETTER' | 'BEST', signature: string) => {
    setProposal((prev) => ({
      ...prev,
      status: 'ACCEPTED',
      acceptedTier: tier,
    }));
    setIsProposalOpen(false);
    toast.success(
      lang === 'es' ? '¡Propuesta Aprobada con Firma Digital!' : 'Proposal Approved with Digital Signature!',
      {
        description: `${lang === 'es' ? 'Paquete seleccionado:' : 'Selected tier:'} ${tier} (${signature})`,
      }
    );
  };

  const handleChangeOrderDecision = (decision: 'APPROVED' | 'DECLINED') => {
    setChangeOrderState(decision);
    setChangeOrder((prev) => ({
      ...prev,
      status: decision,
    }));
  };

  const handleSimulatePayment = () => {
    setIsPaid(true);
    setIsPaymentModalOpen(false);
    toast.success(
      lang === 'es' ? '¡Pago Procesado Exitosamente!' : 'Payment Processed Successfully!',
      {
        description: `${formatMoney(baseBalanceDueUSD)} ${lang === 'es' ? 'recibido vía' : 'received via'} ${paymentMethod}.`,
      }
    );
  };

  return (
    <ClientPortalShell
      activeTab={activeTab}
      onTabChange={setActiveTab}
      pendingActionsCount={changeOrderState === 'PENDING_APPROVAL' || proposal.status === 'PENDING_APPROVAL' ? 2 : 0}
    >
      {/* If Proposal Viewer Modal is open */}
      {isProposalOpen ? (
        <ClientProposalViewer
          proposal={proposal}
          onApproveProposal={handleApproveProposal}
          onBack={() => setIsProposalOpen(false)}
        />
      ) : (
        <>
          {/* TAB 1: HOME */}
          {activeTab === 'HOME' && (
            <ClientAdaptiveHome
              onNavigateTab={setActiveTab}
              onOpenRebook={() => setIsRebookOpen(true)}
              onOpenReschedule={() => setIsRescheduleOpen(true)}
              onOpenProposal={() => setIsProposalOpen(true)}
              onOpenChangeOrder={() => setIsChangeOrderOpen(true)}
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              hasActiveJob={true}
              hasPendingProposal={proposal.status === 'PENDING_APPROVAL'}
              hasPendingChangeOrder={changeOrderState === 'PENDING_APPROVAL'}
              hasUnpaidBalance={!isPaid}
              proposal={proposal}
              changeOrder={changeOrder}
            />
          )}

          {/* TAB 2: BOOK SERVICE */}
          {activeTab === 'BOOK' && (
            <ClientBookingWizard
              properties={properties}
              onBookingConfirmed={(booking) => {
                setActiveTab('ACTIVITY');
              }}
              onCancel={() => setActiveTab('HOME')}
            />
          )}

          {/* TAB 3: ACTIVITY, JOBS, INVOICES */}
          {activeTab === 'ACTIVITY' && (
            <ClientActivityHub
              onOpenPaymentModal={() => setIsPaymentModalOpen(true)}
              onOpenProposal={() => setIsProposalOpen(true)}
              onOpenRebook={() => setIsRebookOpen(true)}
              proposal={proposal}
              isPaid={isPaid}
            />
          )}

          {/* TAB 4: AI CONCIERGE & MESSAGING */}
          {activeTab === 'MESSAGES' && <ClientAiConcierge />}

          {/* TAB 5: ACCOUNT, PROPERTIES, WARRANTIES */}
          {activeTab === 'ACCOUNT' && (
            <div className="space-y-6">
              {/* Account Sub-navigation Pills */}
              <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setAccountSubTab('PROPERTIES')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    accountSubTab === 'PROPERTIES'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'es' ? 'Propiedades & Equipos' : 'Properties & Equipment'}
                </button>
                <button
                  onClick={() => setAccountSubTab('MAINTENANCE')}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                    accountSubTab === 'MAINTENANCE'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lang === 'es' ? 'Mantenimiento & Garantías' : 'Plans & Warranties'}
                </button>
              </div>

              {accountSubTab === 'PROPERTIES' ? (
                <ClientPropertyEquipmentHub
                  properties={properties}
                  equipmentList={equipmentList}
                  onRequestMaintenance={(equipId) => {
                    setActiveTab('BOOK');
                    toast.info(
                      lang === 'es'
                        ? 'Iniciando solicitud para el equipo seleccionado...'
                        : 'Starting service booking for selected equipment...'
                    );
                  }}
                />
              ) : (
                <ClientMaintenanceWarrantyHub
                  plans={maintenancePlans}
                  warranties={warranties}
                  onClaimSubmitted={(claimNumber) => {
                    toast.info(`${lang === 'es' ? 'Número de ticket:' : 'Ticket number:'} ${claimNumber}`);
                  }}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL 1: REBOOK MODAL */}
      <ClientRebookModal
        isOpen={isRebookOpen}
        onClose={() => setIsRebookOpen(false)}
        onRebookSuccess={() => {
          setActiveTab('ACTIVITY');
        }}
      />

      {/* MODAL 2: RESCHEDULE MODAL */}
      <ClientRescheduleModal
        isOpen={isRescheduleOpen}
        onClose={() => setIsRescheduleOpen(false)}
        onRescheduleSuccess={() => {
          // Handled
        }}
      />

      {/* MODAL 3: CHANGE ORDER MODAL */}
      <ClientChangeOrderModal
        isOpen={isChangeOrderOpen}
        onClose={() => setIsChangeOrderOpen(false)}
        changeOrder={changeOrder}
        onDecision={handleChangeOrderDecision}
      />

      {/* MODAL 4: ONLINE BALANCE CHECKOUT */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">
                  {lang === 'es' ? 'Pagar Saldo en Línea' : 'Pay Outstanding Balance'}
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase">
                {lang === 'es' ? 'Total a Pagar' : 'Amount Due'}
              </span>
              <span className="text-3xl font-black text-amber-400 font-mono block">
                {formatMoney(baseBalanceDueUSD)}
              </span>
              <span className="text-[11px] text-slate-500">
                {lang === 'es' ? 'Beneficiario:' : 'Beneficiary:'} Apex Mechanical Contractors LLC
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-xs text-slate-300 block font-medium">
                {lang === 'es' ? 'Selecciona Método de Pago:' : 'Select Payment Method:'}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'STRIPE', label: 'Stripe / Card' },
                  { id: 'APPLE_PAY', label: 'Apple Pay' },
                  { id: 'ACH', label: 'ACH Transfer' },
                  { id: 'INTERAC', label: 'Interac e-Transfer' },
                  { id: 'NEQUI', label: 'Nequi / Bancolombia' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-3 rounded-xl border text-xs font-semibold transition-all text-center ${
                      paymentMethod === m.id
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Payment Action */}
            <div className="pt-2 space-y-2">
              <Button
                onClick={handleSimulatePayment}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm gap-2 shadow-lg shadow-emerald-500/20 py-2.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {lang === 'es' ? 'Pagar Ahora' : 'Pay Now'} {formatMoney(baseBalanceDueUSD)}
                </span>
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-full text-slate-400 hover:text-white text-xs"
              >
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ClientPortalShell>
  );
};
