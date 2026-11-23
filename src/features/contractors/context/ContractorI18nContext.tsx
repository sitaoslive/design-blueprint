import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'es';
export type Currency = 'USD' | 'CAD' | 'COP';

interface ContractorI18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  formatMoney: (val?: number, sourceCurrency?: 'USD' | 'COP') => string;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Brand & Header
    'brand.title': 'CONTRACTOR OS',
    'brand.subtitle': 'Field Service, Crew Dispatch & Trade Invoicing',
    'nav.leads': 'Leads & Inquiries',
    'nav.jobs': 'Active Work Orders',
    'nav.estimator': 'Field Estimator',
    'nav.newLead': '+ New Lead',
    'nav.superAdmin': 'Super Admin',
    'nav.switchLanguage': 'Language',
    'nav.switchCurrency': 'Currency',

    // Dashboard Overview
    'dash.heroBadge': 'ALPHA SERVICE OS · US & CA EDITION',
    'dash.tradesPill': 'HVAC · Plumbing · Roofing · Electrical · Remodeling',
    'dash.title': 'Contractor Operations & Crew Dispatch',
    'dash.subtitle': 'Unified command center for residential & commercial trade contractors across USA & Canada: WhatsApp/SMS lead capture, field estimating, crew tracking, and progressive billing.',
    'dash.viewLeads': 'View All Leads',
    'dash.kpi.leads': 'Pipeline Leads',
    'dash.kpi.leads.sub': 'Potential value: ',
    'dash.kpi.leads.today': '+2 today',
    'dash.kpi.jobs': 'Active Work Orders',
    'dash.kpi.jobs.sub': 'crews deployed',
    'dash.kpi.jobs.status': '1 en route, 1 in progress, 1 completed',
    'dash.kpi.receivables': 'Outstanding Receivables',
    'dash.kpi.receivables.sub': 'milestone balances due',
    'dash.kpi.revenue': 'Monthly Revenue',
    'dash.kpi.revenue.sub': 'Collected deposits & finals',
    'dash.tab.leads': 'Sales Pipeline (Kanban)',
    'dash.tab.jobs': 'Field Jobs & Photo Vault',

    // Trades / Services
    'trade.all': 'All Trades',
    'trade.hvac': 'HVAC & Climate',
    'trade.plumbing': 'Plumbing & Drainage',
    'trade.electrical': 'Electrical & Lighting',
    'trade.roofing': 'Roofing & Siding',
    'trade.painting': 'Painting & Drywall',
    'trade.remodel': 'General Remodeling',

    // Urgency
    'urgency.emergency': '🔴 EMERGENCY (< 2h)',
    'urgency.urgent': '🟠 URGENT (Same Day)',
    'urgency.standard': '🟡 STANDARD (This Week)',
    'urgency.flexible': '🟢 FLEXIBLE (Scheduled)',

    // Kanban Columns
    'kanban.stage.new': '1. New Leads',
    'kanban.stage.contacted': '2. Contacted',
    'kanban.stage.scheduled': '3. Estimate Scheduled',
    'kanban.stage.proposal': '4. Proposal Sent',
    'kanban.stage.won': '5. Won / Approved',
    'kanban.score': 'Score:',
    'kanban.budget': 'Est. Budget',
    'kanban.filterTrade': 'Filter Trade:',
    'kanban.allTrades': 'All',
    'kanban.newLeadBtn': '+ New Lead',
    'kanban.empty': 'No leads in this stage',
    'kanban.moveBack': 'Move back',
    'kanban.moveForward': 'Advance stage',
    'kanban.sendWa': 'Send WhatsApp / SMS',
    'kanban.call': 'Call customer',

    // Lead Modal
    'leadModal.title': 'Create New Project Lead',
    'leadModal.desc': 'Direct intake to CRM and automated n8n notification dispatch.',
    'leadModal.customerName': 'Customer / Business Name *',
    'leadModal.customerPlaceholder': 'e.g. Apex Property Management',
    'leadModal.phone': 'Phone / Mobile *',
    'leadModal.phonePlaceholder': '+1 (555) 234-5678',
    'leadModal.service': 'Trade Specialty *',
    'leadModal.serviceSelect': 'Select trade specialty',
    'leadModal.urgency': 'Operational Urgency *',
    'leadModal.address': 'Job Site Address *',
    'leadModal.addressPlaceholder': 'e.g. 742 Evergreen Terrace, Suite 200',
    'leadModal.budget': 'Estimated Budget *',
    'leadModal.notes': 'Project Scope / Job Notes',
    'leadModal.notesPlaceholder': 'Describe issues, equipment model, access codes...',
    'leadModal.cancel': 'Cancel',
    'leadModal.submit': 'Save & Launch Lead',

    // Estimator Builder
    'est.back': 'Back to Jobs',
    'est.badge': 'DIGITAL FIELD ESTIMATOR',
    'est.title': 'Digital Field Estimator & Quotation Builder',
    'est.subtitle': 'Instant material/labor costing, real-time markup slider, and on-site customer approval.',
    'est.saveDraft': 'Save Draft',
    'est.approve': 'Approve & Create Work Order',
    'est.customerSection': 'Customer & Project Site Information',
    'est.customerName': 'Customer Name / Entity',
    'est.phone': 'Phone / SMS',
    'est.address': 'Project Address',
    'est.projectTitle': 'Project Title',
    'est.scope': 'Detailed Scope of Work',
    'est.itemsSection': 'Line Items (Materials, Labor & Equipment)',
    'est.addItem': '+ Add Line Item',
    'est.colType': 'Type',
    'est.colDesc': 'Description',
    'est.colQty': 'Qty',
    'est.colUnit': 'Unit',
    'est.colUnitCost': 'Unit Cost',
    'est.colSubtotal': 'Subtotal',
    'est.type.material': 'Material',
    'est.type.labor': 'Labor',
    'est.type.equipment': 'Equipment',
    'est.type.permit': 'Permit / Code',
    'est.financialSummary': 'Financial Summary & Markup Engine',
    'est.materials': 'Materials Total:',
    'est.labor': 'Labor Total:',
    'est.equipment': 'Equipment / Other:',
    'est.directCost': 'Total Direct Cost:',
    'est.markup': 'Profit Margin (Markup):',
    'est.tax': 'Apply Sales Tax / GST (8.25% - 19%):',
    'est.profit': 'Estimated Profit:',
    'est.totalPrice': 'Total Customer Price',
    'est.deposit': 'Required Upfront Deposit (50%):',
    'est.balance': 'Final Balance on Completion:',
    'est.whatsappSend': 'Send Proposal via SMS / WhatsApp',

    // Jobs List
    'jobs.pageTitle': 'Work Orders & Field Crew Dispatch',
    'jobs.pageDesc': 'Real-time job site monitoring, before/after evidence photos, and field payment collection.',
    'jobs.filterStatus': 'Filter Status:',
    'jobs.status.all': 'All Statuses',
    'jobs.status.inProgress': '🔨 In Progress',
    'jobs.status.enRoute': '🚚 En Route',
    'jobs.status.scheduled': '📅 Scheduled',
    'jobs.status.completed': '✔ Completed',
    'jobs.card.total': 'Total Job Price:',
    'jobs.card.deposit': 'Upfront 50% Deposit:',
    'jobs.card.balance': 'Balance Due:',
    'jobs.card.crew': 'Crew:',
    'jobs.card.safety': 'Safety Verified',
    'jobs.card.viewDetail': 'View Details & Photo Vault',

    // Job Detail Modal
    'jobModal.title': 'Work Order Details',
    'jobModal.clientPhone': 'Customer & Phone',
    'jobModal.site': 'Job Site Address',
    'jobModal.crew': 'Assigned Crew',
    'jobModal.schedule': 'Scheduled Time',
    'jobModal.unassigned': 'Unassigned',
    'jobModal.vault': 'Before & After Photo Evidence Vault',
    'jobModal.beforeTab': 'Before (Initial State)',
    'jobModal.afterTab': 'After (Completed Work)',
    'jobModal.safetyBadge': 'OSHA / Canadian Safety Standards Verified (PPE, Lockout/Tagout, Pressure Check).',
    'jobModal.totalPrice': 'Total Job Cost:',
    'jobModal.depositPaid': 'Deposit (50% Paid):',
    'jobModal.balanceDue': 'Final Balance Due:',
    'jobModal.portalLink': 'Open Customer Self-Service Portal (Link for Client)',
    'jobModal.close': 'Close',
    'jobModal.emitInvoice': 'Issue Final Invoice',

    // Customer Portal
    'portal.headerBadge': 'Customer Self-Service & Job Sign-Off Portal',
    'portal.callContractor': 'Call Contractor',
    'portal.status.pending': '🔨 WORK COMPLETED · FINAL BALANCE DUE',
    'portal.status.paid': '✔ PROJECT COMPLETED & PAID IN FULL',
    'portal.location': 'Job Site Location',
    'portal.leadTech': 'Field Lead Technician',
    'portal.completedDate': 'Completion Date',
    'portal.photoVault': 'Before & After Photo Evidence Vault',
    'portal.photoVaultSub': 'Inspect high-resolution photo documentation verified on-site by your trade crew.',
    'portal.beforePhotos': '1. Initial State (Before)',
    'portal.afterPhotos': '2. Finished Work (After)',
    'portal.safetyCert': 'Technical Quality & Safety Protocol Certified',
    'portal.safetyCertSub': 'Pressure testing, electrical insulation, and calibration verified on-site.',
    'portal.statement': 'Billing Statement & Settlement',
    'portal.statementSub': 'Transparent milestone summary and electronic invoice',
    'portal.totalPrice': 'Total Project Cost:',
    'portal.depositPaid': 'Upfront Deposit (50%):',
    'portal.paidBadge': 'PAID',
    'portal.finalBalance': 'Final Balance Due (50%):',
    'portal.payNow': 'Pay Remaining Balance Online',
    'portal.payNowSub': 'Protected payment via Stripe, Apple Pay, Google Pay, ACH, Interac or Credit Card.',
    'portal.payBtn': 'Pay Remaining Balance',
    'portal.paidInFull': 'This project is 100% paid in full. Thank you for your business!',
    'portal.downloadInvoice': 'Download Invoice (PDF)',
    'portal.signOff': 'Customer Acceptance & Review',
    'portal.signOffSub': 'Confirm technical completion and rate crew service quality',
    'portal.ratingQuestion': 'How would you rate the quality of the work?',
    'portal.ratingExcellent': 'Excellent (5/5)',
    'portal.commentsLabel': 'Client comments or notes for the contractor:',
    'portal.commentsPlaceholder': 'The crew was punctual, kept the area clean, and the equipment runs perfectly...',
    'portal.signBtn': 'Sign & Accept Work Order',
    'portal.signedBadge': 'Acceptance certificate digitally signed by client.',

    // Online Checkout Modal
    'checkout.title': 'Secure Online Payment Portal',
    'checkout.amount': 'Amount to Pay (Final 50% Balance)',
    'checkout.beneficiary': 'Beneficiary:',
    'checkout.selectMethod': 'Select Payment Method:',
    'checkout.stripe': 'Credit / Debit Card (Stripe)',
    'checkout.ach': 'ACH Bank Transfer (USA)',
    'checkout.interac': 'Interac e-Transfer (Canada)',
    'checkout.applePay': 'Apple Pay / Google Pay',
    'checkout.nequi': 'Nequi / Bancolombia (COP)',
    'checkout.confirm': 'Confirm Payment of',
    'checkout.cancel': 'Cancel',
  },
  es: {
    // Brand & Header
    'brand.title': 'CONTRACTOR OS',
    'brand.subtitle': 'Plataforma Operativa de Obras, Cuadrillas & Facturación',
    'nav.leads': 'Prospectos (Leads)',
    'nav.jobs': 'Obras en Curso',
    'nav.estimator': 'Cotizador en Campo',
    'nav.newLead': '+ Nuevo Prospecto',
    'nav.superAdmin': 'Super Admin',
    'nav.switchLanguage': 'Idioma',
    'nav.switchCurrency': 'Moneda',

    // Dashboard Overview
    'dash.heroBadge': 'ALPHA SERVICE OS · EDICIÓN EE.UU. Y CANADÁ',
    'dash.tradesPill': 'HVAC · Plomería · Techos · Electricidad · Remodelación',
    'dash.title': 'Panel Maestro de Contratista & Obras',
    'dash.subtitle': 'Control unificado de captación de clientes por WhatsApp/SMS, presupuestos en terreno con firma digital, despacho de cuadrillas y facturación progresiva.',
    'dash.viewLeads': 'Ver Todos los Leads',
    'dash.kpi.leads': 'Leads en Pipeline',
    'dash.kpi.leads.sub': 'Valor potencial: ',
    'dash.kpi.leads.today': '+2 hoy',
    'dash.kpi.jobs': 'Obras en Curso',
    'dash.kpi.jobs.sub': 'cuadrillas desplegadas',
    'dash.kpi.jobs.status': '1 en camino, 1 en ejecución, 1 finalizada',
    'dash.kpi.receivables': 'Por Cobrar (Saldos)',
    'dash.kpi.receivables.sub': 'facturas de saldo final emitidas',
    'dash.kpi.revenue': 'Recaudo del Mes',
    'dash.kpi.revenue.sub': 'Anticipos 50% y cierres pagados',
    'dash.tab.leads': 'Embudos de Venta (Kanban)',
    'dash.tab.jobs': 'Obras en Terreno & Fotos',

    // Trades / Services
    'trade.all': 'Todos los Oficios',
    'trade.hvac': 'Climatización / HVAC',
    'trade.plumbing': 'Plomería & Redes Hidráulicas',
    'trade.electrical': 'Redes Eléctricas & Iluminación',
    'trade.roofing': 'Tejados, Cubiertas & Fachadas',
    'trade.painting': 'Pintura & Drywall',
    'trade.remodel': 'Remodelación General',

    // Urgency
    'urgency.emergency': '🔴 EMERGENCIA (< 2h)',
    'urgency.urgent': '🟠 URGENTE (Mismo Día)',
    'urgency.standard': '🟡 ESTÁNDAR (Esta Semana)',
    'urgency.flexible': '🟢 FLEXIBLE (Planificado)',

    // Kanban Columns
    'kanban.stage.new': '1. Nuevos Leads',
    'kanban.stage.contacted': '2. Contactados',
    'kanban.stage.scheduled': '3. Visita Agendada',
    'kanban.stage.proposal': '4. Cotización Enviada',
    'kanban.stage.won': '5. Ganados / Obra Aprobada',
    'kanban.score': 'Score:',
    'kanban.budget': 'Presupuesto Est.',
    'kanban.filterTrade': 'Filtrar Oficio:',
    'kanban.allTrades': 'Todos',
    'kanban.newLeadBtn': '+ Nuevo Prospecto',
    'kanban.empty': 'Sin prospectos en esta etapa',
    'kanban.moveBack': 'Regresar etapa',
    'kanban.moveForward': 'Avanzar etapa',
    'kanban.sendWa': 'Enviar WhatsApp / SMS',
    'kanban.call': 'Llamar directamente',

    // Lead Modal
    'leadModal.title': 'Ingresar Nuevo Prospecto de Obra',
    'leadModal.desc': 'Ingreso directo al CRM y flujo automático de notificación n8n WF-001.',
    'leadModal.customerName': 'Nombre del Cliente / Empresa *',
    'leadModal.customerPlaceholder': 'Ej. Inversiones Poblado SAS',
    'leadModal.phone': 'Teléfono / Móvil *',
    'leadModal.phonePlaceholder': '+57 300 123 4567',
    'leadModal.service': 'Tipo de Servicio *',
    'leadModal.serviceSelect': 'Seleccionar oficio',
    'leadModal.urgency': 'Urgencia Operativa *',
    'leadModal.address': 'Dirección de la Obra / Sitio *',
    'leadModal.addressPlaceholder': 'Ej. Calle 10 # 43E-20, El Poblado',
    'leadModal.budget': 'Presupuesto Estimado *',
    'leadModal.notes': 'Detalles del Requerimiento / Alcance',
    'leadModal.notesPlaceholder': 'Describe fallas observadas, marca del equipo, acceso...',
    'leadModal.cancel': 'Cancelar',
    'leadModal.submit': 'Guardar e Iniciar Lead',

    // Estimator Builder
    'est.back': 'Volver a Obras',
    'est.badge': 'COTIZADOR DIGITAL EN TERRENO',
    'est.title': 'Cotizador Digital & Generador de Presupuestos',
    'est.subtitle': 'Cálculo instantáneo de costos directos, margen de ganancia configurable y propuesta lista para firma en terreno.',
    'est.saveDraft': 'Guardar Borrador',
    'est.approve': 'Aprobar & Crear Obra',
    'est.customerSection': 'Datos del Cliente y Ubicación de la Obra',
    'est.customerName': 'Cliente / Razón Social',
    'est.phone': 'Teléfono / WhatsApp',
    'est.address': 'Dirección del Proyecto',
    'est.projectTitle': 'Título de la Obra',
    'est.scope': 'Alcance de los Trabajos (Scope)',
    'est.itemsSection': 'Desglose de Partidas (Materiales, Mano de Obra & Equipos)',
    'est.addItem': '+ Agregar Partida',
    'est.colType': 'Tipo',
    'est.colDesc': 'Descripción',
    'est.colQty': 'Cant.',
    'est.colUnit': 'Unidad',
    'est.colUnitCost': 'Costo Unit.',
    'est.colSubtotal': 'Subtotal',
    'est.type.material': 'Material',
    'est.type.labor': 'Mano de Obra',
    'est.type.equipment': 'Equipo',
    'est.type.permit': 'Permiso / Licencia',
    'est.financialSummary': 'Resumen Financiero & Margen',
    'est.materials': 'Materiales:',
    'est.labor': 'Mano de Obra:',
    'est.equipment': 'Equipos / Otros:',
    'est.directCost': 'Costo Directo Total:',
    'est.markup': 'Margen de Utilidad (Markup):',
    'est.tax': 'Aplicar Impuesto (IVA / Tax):',
    'est.profit': 'Utilidad Estimada:',
    'est.totalPrice': 'Precio Total al Cliente',
    'est.deposit': 'Anticipo Requerido (50%):',
    'est.balance': 'Saldo Final al Culminar:',
    'est.whatsappSend': 'Enviar Propuesta por SMS / WhatsApp',

    // Jobs List
    'jobs.pageTitle': 'Órdenes de Trabajo & Despacho de Cuadrillas en Campo',
    'jobs.pageDesc': 'Supervisión en tiempo real, trazabilidad de cuadrillas, checklist de seguridad y bóveda de evidencia fotográfica antes / después.',
    'jobs.filterStatus': 'Filtrar Estado:',
    'jobs.status.all': 'Todos los Estados',
    'jobs.status.inProgress': '🔨 En Ejecución',
    'jobs.status.enRoute': '🚚 En Camino',
    'jobs.status.scheduled': '📅 Programadas',
    'jobs.status.completed': '✔ Finalizadas',
    'jobs.card.total': 'Total Obra:',
    'jobs.card.deposit': 'Anticipo 50%:',
    'jobs.card.balance': 'Saldo Pendiente:',
    'jobs.card.crew': 'Cuadrilla:',
    'jobs.card.safety': 'Seguridad Verificada',
    'jobs.card.viewDetail': 'Ver Detalle & Bóveda de Fotos',

    // Job Detail Modal
    'jobModal.title': 'Detalle de la Orden de Trabajo',
    'jobModal.clientPhone': 'Cliente & Teléfono',
    'jobModal.site': 'Sitio de Obra',
    'jobModal.crew': 'Cuadrilla Asignada',
    'jobModal.schedule': 'Horario Programado',
    'jobModal.unassigned': 'Sin Asignar',
    'jobModal.vault': 'Bóveda de Evidencia Fotográfica Antes / Después',
    'jobModal.beforeTab': 'Antes (Estado Inicial)',
    'jobModal.afterTab': 'Después (Obra Finalizada)',
    'jobModal.safetyBadge': 'Protocolo de Seguridad Verificado (EPP, Bloqueo de Energía y Pruebas).',
    'jobModal.totalPrice': 'Total Obra:',
    'jobModal.depositPaid': 'Anticipo (50% Pagado):',
    'jobModal.balanceDue': 'Saldo por Cobrar:',
    'jobModal.portalLink': 'Abrir Portal de Autogestión del Cliente (Link Compartible)',
    'jobModal.close': 'Cerrar',
    'jobModal.emitInvoice': 'Emitir Factura de Cierre',

    // Customer Portal
    'portal.headerBadge': 'Portal de Seguimiento & Entrega de Obra',
    'portal.callContractor': 'Llamar a Contratista',
    'portal.status.pending': '🔨 OBRA FINALIZADA · PENDIENTE SALDO',
    'portal.status.paid': '✔ OBRA ENTREGADA Y PAGADA',
    'portal.location': 'Ubicación de la Obra',
    'portal.leadTech': 'Líder Técnico en Sitio',
    'portal.completedDate': 'Fecha de Cierre',
    'portal.photoVault': 'Bóveda de Evidencia Fotográfica',
    'portal.photoVaultSub': 'Inspecciona las fotografías tomadas por la cuadrilla técnica antes y después de la intervención.',
    'portal.beforePhotos': '1. Estado Inicial (Antes)',
    'portal.afterPhotos': '2. Obra Finalizada (Después)',
    'portal.safetyCert': 'Norma Técnica & Protocolo de Seguridad Verificado',
    'portal.safetyCertSub': 'Pruebas de presión, aislamiento térmico y calibración certificadas en sitio.',
    'portal.statement': 'Estado de Cuenta & Liquidación',
    'portal.statementSub': 'Resumen transparente de cobros y facturación electrónica',
    'portal.totalPrice': 'Precio Total de la Obra:',
    'portal.depositPaid': 'Anticipo de Inicio (50%):',
    'portal.paidBadge': 'PAGADO',
    'portal.finalBalance': 'Saldo Final por Pagar (50%):',
    'portal.payNow': 'Pagar Saldo Restante en Línea',
    'portal.payNowSub': 'Transacción protegida vía Stripe, Apple Pay, Google Pay, ACH, Interac o Tarjeta.',
    'portal.payBtn': 'Pagar Saldo Restante',
    'portal.paidInFull': 'Esta obra se encuentra 100% saldada y facturada. ¡Gracias por confiar en nosotros!',
    'portal.downloadInvoice': 'Descargar Factura Electrónica (PDF)',
    'portal.signOff': 'Recepción de Obra & Calificación',
    'portal.signOffSub': 'Evalúa la calidad del servicio técnico recibido',
    'portal.ratingQuestion': '¿Cómo calificarías el trabajo realizado?',
    'portal.ratingExcellent': 'Excelente (5/5)',
    'portal.commentsLabel': 'Comentarios u observaciones para el contratista:',
    'portal.commentsPlaceholder': 'La cuadrilla fue puntual, dejaron el área limpia y los equipos quedaron funcionando perfectamente...',
    'portal.signBtn': 'Firmar y Recibir Obra a Conformidad',
    'portal.signedBadge': 'Acta firmada digitalmente a conformidad por el cliente.',

    // Online Checkout Modal
    'checkout.title': 'Pasarela de Pago Seguro en Línea',
    'checkout.amount': 'Monto a Pagar (Saldo Final 50%)',
    'checkout.beneficiary': 'Beneficiario:',
    'checkout.selectMethod': 'Selecciona Medio de Pago:',
    'checkout.stripe': 'Tarjeta de Crédito / Débito (Stripe)',
    'checkout.ach': 'Transferencia Bancaria ACH (EE.UU.)',
    'checkout.interac': 'Interac e-Transfer (Canadá)',
    'checkout.applePay': 'Apple Pay / Google Pay',
    'checkout.nequi': 'Nequi / Bancolombia (COP)',
    'checkout.confirm': 'Confirmar Pago de',
    'checkout.cancel': 'Cancelar',
  },
};

const ContractorI18nContext = createContext<ContractorI18nContextType | undefined>(undefined);

export const ContractorI18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Defaults to English for USA / Canada market
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('contractor_lang');
      if (saved === 'en' || saved === 'es') return saved;
    }
    return 'en';
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('contractor_currency');
      if (saved === 'USD' || saved === 'CAD' || saved === 'COP') return saved;
    }
    return 'USD';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('contractor_lang', newLang);
    }
  };

  const setCurrency = (newCurr: Currency) => {
    setCurrencyState(newCurr);
    if (typeof window !== 'undefined') {
      localStorage.setItem('contractor_currency', newCurr);
    }
  };

  // Base conversions:
  // 1 USD = 1.38 CAD = 4,000 COP
  const formatMoney = (val?: number, sourceCurrency: 'USD' | 'COP' = 'USD'): string => {
    let valUSD = val || 0;
    // Auto-detect if value was supplied in COP (>= 100,000)
    if (sourceCurrency === 'COP' || valUSD >= 100000) {
      valUSD = valUSD / 4000;
    }

    if (currency === 'CAD') {
      const cad = valUSD * 1.38;
      return `$${Math.round(cad).toLocaleString('en-CA')} CAD`;
    }
    if (currency === 'COP') {
      const cop = valUSD * 4000;
      return `$${Math.round(cop).toLocaleString('es-CO')} COP`;
    }
    return `$${Math.round(valUSD).toLocaleString('en-US')} USD`;
  };

  const t = (key: string): string => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  return (
    <ContractorI18nContext.Provider
      value={{
        lang,
        setLang,
        currency,
        setCurrency,
        formatMoney,
        t,
      }}
    >
      {children}
    </ContractorI18nContext.Provider>
  );
};

export const useContractorI18n = (): ContractorI18nContextType => {
  const context = useContext(ContractorI18nContext);
  if (!context) {
    throw new Error('useContractorI18n must be used within a ContractorI18nProvider');
  }
  return context;
};
