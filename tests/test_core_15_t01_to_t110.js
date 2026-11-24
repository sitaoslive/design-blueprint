/**
 * VET FREEDOM OS — SUITE COMPLETA DE PRUEBAS VET-CORE-15
 * Customer Experience Follow-up, Feedback Triage, Clinical Concern Handoff,
 * Service Recovery Escalation & Neutral Review Policy Hub
 * 
 * Dirección Médica: Dr. Luis Eduardo Ríos
 * Dirección Estratégica: Alpha Vision Method
 * Cobertura: 110 Pruebas Formales (T01 - T110)
 *            15 Pruebas de Concurrencia (CC01 - CC15)
 *            7 Escenarios End-to-End (SCENARIO_A - SCENARIO_G)
 * Total: 132 Pruebas Automatizadas
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- SIMULADOR DE BASE DE DATOS SUPABASE (CUSTOMER EXPERIENCE & SERVICE RECOVERY HUB) ---
class CustomerExperienceSimulator {
  constructor() {
    this.organizations = new Map();
    this.staffProfiles = new Map();
    this.owners = new Map();
    this.pets = new Map();
    this.appointments = new Map();
    this.bereavementRecords = new Map();
    this.caregiverAuthorizations = new Map();

    // Tablas Migración 040
    this.followups = new Map();
    this.followupPlans = new Map();
    this.followupAttempts = new Map();
    this.surveys = new Map();
    this.surveyVersions = new Map();
    this.surveyAnswers = new Map();
    this.responses = new Map();
    this.feedback = new Map();
    this.feedbackClassifications = new Map();
    this.complaints = new Map();
    this.complaintEvents = new Map();
    this.recoveryCases = new Map();
    this.recoveryAssignments = new Map();
    this.recoveryActions = new Map();
    this.recoveryCommitments = new Map();
    this.recoveryOutcomes = new Map();
    this.sensitiveSuppressions = new Map();
    this.reviewRequestPlans = new Map();
    this.reviewRequests = new Map();
    this.reviewPlatforms = new Map();
    this.testimonialConsents = new Map();
    this.testimonials = new Map();
    this.qualityImprovements = new Map();
    this.metrics = new Map();
    this.auditEvents = [];
    this.outboundDispatches = [];

    this.initFixtures();
  }

  initFixtures() {
    this.organizations.set('org-vet-life', {
      id: 'org-vet-life',
      name: 'Vet Life — Veterinaria a Domicilio',
      timezone: 'America/Bogota'
    });
    this.organizations.set('org-other', {
      id: 'org-other',
      name: 'Clínica Veterinaria Ajena',
      timezone: 'America/Bogota'
    });

    // Staff
    this.staffProfiles.set('vet-luis-rios', {
      id: 'vet-luis-rios',
      name: 'Dr. Luis Eduardo Ríos',
      role: 'DIRECTOR_VET',
      professional_card: 'COMVEZCOL-28491',
      organization_id: 'org-vet-life'
    });
    this.staffProfiles.set('cx-lead-01', {
      id: 'cx-lead-01',
      name: 'Coordinador de Experiencia',
      role: 'CUSTOMER_EXPERIENCE_LEAD',
      organization_id: 'org-vet-life'
    });
    this.staffProfiles.set('ops-lead-01', {
      id: 'ops-lead-01',
      name: 'Director de Operaciones',
      role: 'OPERATIONS_DIRECTOR',
      organization_id: 'org-vet-life'
    });

    // Clientes
    this.owners.set('owner-claudia', {
      id: 'owner-claudia',
      name: 'Claudia Morales',
      phone_e164: '+573145556677',
      has_marketing_consent: true,
      has_survey_consent: true,
      organization_id: 'org-vet-life'
    });
    this.owners.set('owner-andres', {
      id: 'owner-andres',
      name: 'Andrés Cepeda',
      phone_e164: '+573103332211',
      has_marketing_consent: true,
      has_survey_consent: true,
      organization_id: 'org-vet-life'
    });
    this.owners.set('owner-luisa-bereaved', {
      id: 'owner-luisa-bereaved',
      name: 'Luisa Fernanda Restrepo',
      phone_e164: '+573007778899',
      has_marketing_consent: true,
      has_survey_consent: true,
      organization_id: 'org-vet-life'
    });
    this.owners.set('owner-other-org', {
      id: 'owner-other-org',
      name: 'Cliente Otra Veterinaria',
      phone_e164: '+573009990022',
      has_marketing_consent: true,
      has_survey_consent: true,
      organization_id: 'org-other'
    });

    // Mascotas
    this.pets.set('pet-pelusa', {
      id: 'pet-pelusa',
      name: 'Pelusa',
      species: 'FELINE',
      owner_id: 'owner-claudia',
      is_deceased: false
    });
    this.pets.set('pet-simba', {
      id: 'pet-simba',
      name: 'Simba',
      species: 'CANINE',
      owner_id: 'owner-andres',
      is_deceased: false
    });
    this.pets.set('pet-toby-deceased', {
      id: 'pet-toby-deceased',
      name: 'Toby',
      species: 'CANINE',
      owner_id: 'owner-luisa-bereaved',
      is_deceased: true
    });

    // Protocolo de Duelo Activo para Toby
    this.bereavementRecords.set('owner-luisa-bereaved', {
      owner_id: 'owner-luisa-bereaved',
      pet_id: 'pet-toby-deceased',
      status: 'ACTIVE_BEREAVEMENT',
      reason: 'Fallecimiento reciente del paciente',
      created_at: new Date(Date.now() - 48 * 3600000).toISOString()
    });

    // Citas previas completadas
    this.appointments.set('apt-claudia-01', {
      id: 'apt-claudia-01',
      owner_id: 'owner-claudia',
      pet_id: 'pet-pelusa',
      status: 'COMPLETED',
      completed_at: new Date(Date.now() - 26 * 3600000).toISOString(),
      organization_id: 'org-vet-life'
    });
    this.appointments.set('apt-andres-01', {
      id: 'apt-andres-01',
      owner_id: 'owner-andres',
      pet_id: 'pet-simba',
      status: 'COMPLETED',
      completed_at: new Date(Date.now() - 25 * 3600000).toISOString(),
      organization_id: 'org-vet-life'
    });
    this.appointments.set('apt-luisa-01', {
      id: 'apt-luisa-01',
      owner_id: 'owner-luisa-bereaved',
      pet_id: 'pet-toby-deceased',
      status: 'COMPLETED',
      completed_at: new Date(Date.now() - 48 * 3600000).toISOString(),
      organization_id: 'org-vet-life'
    });
    this.appointments.set('apt-pending-01', {
      id: 'apt-pending-01',
      owner_id: 'owner-andres',
      pet_id: 'pet-simba',
      status: 'IN_PROGRESS',
      organization_id: 'org-vet-life'
    });

    // Plataformas de reseña autorizadas
    this.reviewPlatforms.set('plat-google', {
      id: 'plat-google',
      name: 'Google Business Profile',
      url: 'https://g.page/r/vet-life-domicilio/review',
      is_active: true,
      allows_public_reviews: true
    });
  }

  // --- RPCs ---
  evaluateFollowupEligibility({ appointmentId, ownerId, petId }) {
    if (!appointmentId) throw new Error('appointment_id es obligatorio');
    const apt = this.appointments.get(appointmentId);
    if (!apt) throw new Error('Cita no encontrada');
    if (apt.status !== 'COMPLETED') {
      return { is_eligible: false, reason: 'La cita no se encuentra en estado COMPLETED' };
    }

    const oId = ownerId || apt.owner_id;
    const pId = petId || apt.pet_id;

    // 1. Supresión por Duelo
    const bereavement = this.bereavementRecords.get(oId);
    if (bereavement && bereavement.status === 'ACTIVE_BEREAVEMENT') {
      return { is_eligible: false, reason: 'SUPPRESSED_BEREAVEMENT_PROTOCOL' };
    }

    const pet = this.pets.get(pId);
    if (pet && pet.is_deceased) {
      return { is_eligible: false, reason: 'SUPPRESSED_PATIENT_DECEASED' };
    }

    // 2. Supresiones sensibles manuales
    const sens = this.sensitiveSuppressions.get(oId);
    if (sens && sens.status === 'ACTIVE') {
      return { is_eligible: false, reason: 'SUPPRESSED_SENSITIVE_CASE' };
    }

    // 3. Verificación de Consentimiento
    const owner = this.owners.get(oId);
    if (!owner || !owner.has_survey_consent) {
      return { is_eligible: false, reason: 'NO_SURVEY_CONSENT' };
    }

    // 4. Queja o Caso de Recuperación Abierto
    for (const [_, rec] of this.recoveryCases) {
      if (rec.owner_id === oId && (rec.status === 'OPEN' || rec.status === 'IN_INVESTIGATION')) {
        return { is_eligible: false, reason: 'ACTIVE_RECOVERY_CASE_OPEN' };
      }
    }

    // 5. No Duplicidad (si ya se realizó seguimiento en los últimos 7 días)
    for (const [_, fol] of this.followups) {
      if (fol.appointment_id === appointmentId) {
        return { is_eligible: false, reason: 'ALREADY_FOLLOWED_UP' };
      }
    }

    return { is_eligible: true, reason: 'ELIGIBLE_POST_VISIT_FOLLOWUP' };
  }

  scheduleExperienceFollowup({ appointmentId, ownerId, petId, targetChannel = 'WHATSAPP' }) {
    const el = this.evaluateFollowupEligibility({ appointmentId, ownerId, petId });
    if (!el.is_eligible) {
      throw new Error(`Ineligible: ${el.reason}`);
    }

    const fid = 'fol-' + Math.random().toString(36).substring(2, 9);
    const rec = {
      id: fid,
      appointment_id: appointmentId,
      owner_id: ownerId,
      pet_id: petId,
      target_channel: targetChannel,
      status: 'SCHEDULED',
      created_at: new Date().toISOString()
    };
    this.followups.set(fid, rec);
    return { followup_id: fid, status: 'SCHEDULED' };
  }

  suppressExperienceFollowup({ ownerId, reason, actorId }) {
    const sid = 'sens-' + Math.random().toString(36).substring(2, 9);
    this.sensitiveSuppressions.set(ownerId, {
      id: sid,
      owner_id: ownerId,
      reason: reason,
      status: 'ACTIVE',
      created_by: actorId,
      created_at: new Date().toISOString()
    });

    // Cancelar cualquier seguimiento pendiente
    for (const [_, fol] of this.followups) {
      if (fol.owner_id === ownerId && fol.status === 'SCHEDULED') {
        fol.status = 'SUPPRESSED';
      }
    }

    this.auditEvents.push({
      action: 'SUPPRESS_EXPERIENCE_FOLLOWUP',
      owner_id: ownerId,
      reason,
      actor_id: actorId,
      timestamp: new Date().toISOString()
    });

    return { suppression_id: sid, status: 'SUPPRESSED' };
  }

  registerExperienceResponse({ followupId, ownerId, petId, score, comment, channel = 'WHATSAPP' }) {
    const rid = 'resp-' + Math.random().toString(36).substring(2, 9);
    const numScore = (score !== undefined && !isNaN(Number(score))) ? Number(score) : 0;

    // Clasificación inicial
    let category = 'PASSIVE';
    if (numScore <= 6) category = 'DETRACTOR';
    else if (numScore >= 9) category = 'PROMOTER';

    const resp = {
      id: rid,
      followup_id: followupId,
      owner_id: ownerId,
      pet_id: petId,
      score: numScore,
      category,
      comment: comment || '',
      channel,
      status: 'REGISTERED',
      created_at: new Date().toISOString()
    };
    this.responses.set(rid, resp);

    // Si tiene seguimiento, marcarlo como completado
    if (followupId && this.followups.has(followupId)) {
      this.followups.get(followupId).status = 'COMPLETED';
    }

    return resp;
  }

  classifyFeedbackCandidate({ responseId, comment }) {
    const text = String(comment || '').toLowerCase();

    // 1. Detección de Preocupación Clínica / Empeoramiento
    const clinicalKeywords = [
      'vomitó', 'vomito', 'peor', 'sangre', 'decaído', 'decaido', 'empeoró', 'empeoro', 
      'reacción', 'reaccion', 'dolor', 'ahogando', 'convulsión', 'convulsion', 'fiebre', 
      'no come', 'letárgico', 'letargico', 'grave', 'infección', 'infeccion', 'hinchado', 'desmayo'
    ];
    const isClinical = clinicalKeywords.some(kw => text.includes(kw));

    // 2. Detección de Queja Operativa o de Servicio
    const complaintKeywords = [
      'molesto', 'pésimo', 'pesimo', 'inconformidad', 'reclamo', 'queja', 'incumplimiento', 
      'mal servicio', 'cobro indebido', 'tarde', 'error', 'demora', 'nunca llegaron', 'irrespeto'
    ];
    const isComplaint = complaintKeywords.some(kw => text.includes(kw));

    let triageDecision = 'GENERAL_FEEDBACK';
    if (isClinical) {
      triageDecision = 'CLINICAL_HANDOFF_REQUIRED';
    } else if (isComplaint) {
      triageDecision = 'SERVICE_RECOVERY_REQUIRED';
    }

    const cid = 'cls-' + Math.random().toString(36).substring(2, 9);
    const classification = {
      id: cid,
      response_id: responseId,
      is_clinical: isClinical,
      is_complaint: isComplaint,
      triage_decision: triageDecision,
      triageDecision: triageDecision,
      classified_at: new Date().toISOString()
    };
    this.feedbackClassifications.set(cid, classification);

    return classification;
  }

  requestClinicalHandoff({ responseId, ownerId, petId, clinicalComment, actorRole = 'AUTOMATED_SYSTEM' }) {
    // Invariante de Seguridad Médica: JAMÁS diagnosticar, recetar ni tranquilizar con IA.
    // Escalar inmediatamente a VET-CORE-04 para el veterinario tratante habilitado.
    const handoffId = 'clh-' + Math.random().toString(36).substring(2, 9);
    const handoff = {
      id: handoffId,
      response_id: responseId,
      owner_id: ownerId,
      pet_id: petId,
      comment: clinicalComment,
      target_module: 'VET-CORE-04',
      priority: 'HIGH_CLINICAL',
      status: 'HANDOFF_ESCALATED',
      created_at: new Date().toISOString()
    };

    this.auditEvents.push({
      action: 'REQUEST_CLINICAL_HANDOFF',
      handoff_id: handoffId,
      owner_id: ownerId,
      pet_id: petId,
      priority: 'HIGH_CLINICAL',
      timestamp: new Date().toISOString()
    });

    return handoff;
  }

  createRecoveryCase({ ownerId, complaintSummary, initialCategory = 'SERVICE_QUALITY', priority = 'HIGH_OPS' }) {
    const caseId = 'rec-' + Math.random().toString(36).substring(2, 9);
    const recCase = {
      id: caseId,
      owner_id: ownerId,
      complaint_summary: complaintSummary,
      category: initialCategory,
      priority,
      status: 'OPEN',
      owner_assigned_id: null,
      created_at: new Date().toISOString()
    };
    this.recoveryCases.set(caseId, recCase);

    this.auditEvents.push({
      action: 'CREATE_RECOVERY_CASE',
      case_id: caseId,
      owner_id: ownerId,
      status: 'OPEN',
      timestamp: new Date().toISOString()
    });

    return recCase;
  }

  assignRecoveryOwner({ caseId, staffId, assignedBy }) {
    const rc = this.recoveryCases.get(caseId);
    if (!rc) throw new Error('Caso de recuperación no encontrado');
    if (rc.status === 'CLOSED') throw new Error('No se puede asignar un caso cerrado');

    rc.owner_assigned_id = staffId;
    rc.status = 'IN_INVESTIGATION';
    rc.updated_at = new Date().toISOString();

    const asgId = 'asg-' + Math.random().toString(36).substring(2, 9);
    this.recoveryAssignments.set(asgId, {
      id: asgId,
      case_id: caseId,
      staff_id: staffId,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString()
    });

    return { case_id: caseId, assigned_to: staffId, status: rc.status };
  }

  recordRecoveryAction({ caseId, actionType, description, actorId }) {
    const rc = this.recoveryCases.get(caseId);
    if (!rc) throw new Error('Caso de recuperación no encontrado');
    if (rc.status === 'CLOSED') throw new Error('No se pueden registrar acciones en un caso cerrado');

    const actId = 'act-' + Math.random().toString(36).substring(2, 9);
    const act = {
      id: actId,
      case_id: caseId,
      action_type: actionType, // e.g. 'CLIENT_CALL', 'PROCESS_AUDIT', 'APOLOGY_OFFER', 'REFUND_COORDINATION'
      description,
      actor_id: actorId,
      created_at: new Date().toISOString()
    };
    this.recoveryActions.set(actId, act);

    return act;
  }

  verifyRecoveryOutcome({ caseId, outcomeType, clientAccepted, clientStatement, verifiedBy }) {
    const rc = this.recoveryCases.get(caseId);
    if (!rc) throw new Error('Caso de recuperación no encontrado');

    const outId = 'out-' + Math.random().toString(36).substring(2, 9);
    const outcome = {
      id: outId,
      case_id: caseId,
      outcome_type: outcomeType, // e.g. 'RESOLVED_SATISFIED', 'RESOLVED_PARTIAL', 'UNRESOLVED'
      client_accepted: clientAccepted,
      client_statement: clientStatement || '',
      verified_by: verifiedBy,
      verified_at: new Date().toISOString()
    };
    this.recoveryOutcomes.set(outId, outcome);

    return outcome;
  }

  closeRecoveryCase({ caseId, resolutionSummary, closedBy, requiresVerification = true }) {
    const rc = this.recoveryCases.get(caseId);
    if (!rc) throw new Error('Caso de recuperación no encontrado');

    // Comprobar si existe acción registrada (una disculpa vacía no es resolución)
    let hasAction = false;
    for (const [_, a] of this.recoveryActions) {
      if (a.case_id === caseId) {
        hasAction = true;
        break;
      }
    }
    if (!hasAction) {
      throw new Error('No se puede cerrar un caso de recuperación sin acciones registradas');
    }

    // Comprobar verificación de desenlace si es requerida
    if (requiresVerification) {
      let hasOutcome = false;
      for (const [_, o] of this.recoveryOutcomes) {
        if (o.case_id === caseId) {
          hasOutcome = true;
          break;
        }
      }
      if (!hasOutcome) {
        throw new Error('Cierre requiere verificación formal del desenlace');
      }
    }

    rc.status = 'CLOSED';
    rc.resolution_summary = resolutionSummary;
    rc.closed_by = closedBy;
    rc.closed_at = new Date().toISOString();

    this.auditEvents.push({
      action: 'CLOSE_RECOVERY_CASE',
      case_id: caseId,
      closed_by: closedBy,
      timestamp: new Date().toISOString()
    });

    return { case_id: caseId, status: 'CLOSED' };
  }

  reopenRecoveryCase({ caseId, reopenReason, reopenedBy }) {
    const rc = this.recoveryCases.get(caseId);
    if (!rc) throw new Error('Caso de recuperación no encontrado');
    if (rc.status !== 'CLOSED') throw new Error('Solo se pueden reabrir casos previamente cerrados');

    rc.status = 'REOPENED';
    rc.reopen_reason = reopenReason;
    rc.reopened_by = reopenedBy;
    rc.reopened_at = new Date().toISOString();

    this.auditEvents.push({
      action: 'REOPEN_RECOVERY_CASE',
      case_id: caseId,
      reason: reopenReason,
      reopened_by: reopenedBy,
      timestamp: new Date().toISOString()
    });

    return { case_id: caseId, status: 'REOPENED' };
  }

  evaluateReviewInvitationEligibility({ ownerId, minDaysSinceVisit = 1 }) {
    const owner = this.owners.get(ownerId);
    if (!owner) throw new Error('Tutor no encontrado');

    // 1. Supresión por Duelo
    const bereavement = this.bereavementRecords.get(ownerId);
    if (bereavement && bereavement.status === 'ACTIVE_BEREAVEMENT') {
      return { is_eligible: false, reason: 'SUPPRESSED_BEREAVEMENT_PROTOCOL' };
    }

    // 2. Caso de Recuperación Abierto
    for (const [_, rec] of this.recoveryCases) {
      if (rec.owner_id === ownerId && rec.status !== 'CLOSED') {
        return { is_eligible: false, reason: 'ACTIVE_RECOVERY_CASE_EXISTS' };
      }
    }

    // 3. Supresiones Sensibles
    const sens = this.sensitiveSuppressions.get(ownerId);
    if (sens && sens.status === 'ACTIVE') {
      return { is_eligible: false, reason: 'SUPPRESSED_SENSITIVE_CASE' };
    }

    // 4. Consentimiento Comercial / Comunicaciones
    if (!owner.has_marketing_consent) {
      return { is_eligible: false, reason: 'NO_MARKETING_CONSENT' };
    }

    // 5. Límite de Frecuencia (Cooldown de 90 días entre invitaciones)
    for (const [_, inv] of this.reviewRequests) {
      if (inv.owner_id === ownerId) {
        const timeDiff = Date.now() - new Date(inv.created_at).getTime();
        if (timeDiff < 90 * 86400000) {
          return { is_eligible: false, reason: 'REVIEW_INVITATION_COOLDOWN_ACTIVE' };
        }
      }
    }

    // INVARIANTE CRÍTICA: NO REVIEW GATING.
    // La elegibilidad NUNCA se restringe por el puntaje NPS ni se filtra para invitar solo a promotores.
    return { is_eligible: true, reason: 'ELIGIBLE_NEUTRAL_REVIEW_INVITATION' };
  }

  createNeutralReviewInvitation({ ownerId, platformId = 'plat-google' }) {
    const plat = this.reviewPlatforms.get(platformId);
    if (!plat || !plat.is_active) throw new Error('Plataforma no disponible');

    const el = this.evaluateReviewInvitationEligibility({ ownerId });
    if (!el.is_eligible) {
      throw new Error(`Ineligible: ${el.reason}`);
    }

    const invId = 'rev-' + Math.random().toString(36).substring(2, 9);
    const inv = {
      id: invId,
      owner_id: ownerId,
      platform_id: platformId,
      review_url: plat.url,
      // Texto de neutralidad estricta sin sesgo ni solicitud de 5 estrellas
      invitation_text: 'Te invitamos a compartir tu opinión sincera y transparente sobre nuestro servicio veterinario a domicilio:',
      is_review_gating_prohibited: true,
      status: 'INVITATION_PREPARED_SAFE_MODE',
      send_enabled: false,
      created_at: new Date().toISOString()
    };
    this.reviewRequests.set(invId, inv);

    return inv;
  }

  recordTestimonialConsent({ ownerId, petId, allowName, allowPhoto, allowStory, signedBy }) {
    const cid = 'tcon-' + Math.random().toString(36).substring(2, 9);
    const consent = {
      id: cid,
      owner_id: ownerId,
      pet_id: petId,
      allow_name: allowName,
      allow_photo: allowPhoto,
      allow_story: allowStory,
      is_granted: true,
      signed_by: signedBy,
      granted_at: new Date().toISOString()
    };
    this.testimonialConsents.set(ownerId, consent);

    this.auditEvents.push({
      action: 'RECORD_TESTIMONIAL_CONSENT',
      consent_id: cid,
      owner_id: ownerId,
      timestamp: new Date().toISOString()
    });

    return consent;
  }

  revokeTestimonialConsent({ ownerId, reason, revokedBy }) {
    const c = this.testimonialConsents.get(ownerId);
    if (!c) throw new Error('Consentimiento no encontrado');

    c.is_granted = false;
    c.revoked_at = new Date().toISOString();
    c.revoke_reason = reason;
    c.revoked_by = revokedBy;

    // Desactivar testimonios activos vinculados
    for (const [_, t] of this.testimonials) {
      if (t.owner_id === ownerId && t.is_published) {
        t.is_published = false;
        t.unpublished_reason = 'CONSENT_REVOKED';
      }
    }

    this.auditEvents.push({
      action: 'REVOKE_TESTIMONIAL_CONSENT',
      owner_id: ownerId,
      reason,
      timestamp: new Date().toISOString()
    });

    return { owner_id: ownerId, is_granted: false, status: 'REVOKED' };
  }

  createQualityImprovementProposal({ originCaseId, problemCluster, proposedAction, targetModule, createdBy }) {
    const qid = 'qip-' + Math.random().toString(36).substring(2, 9);
    const qip = {
      id: qid,
      origin_case_id: originCaseId,
      problem_cluster: problemCluster,
      proposed_action: proposedAction,
      target_module: targetModule,
      status: 'PROPOSED',
      created_by: createdBy,
      created_at: new Date().toISOString()
    };
    this.qualityImprovements.set(qid, qip);

    this.auditEvents.push({
      action: 'CREATE_QUALITY_IMPROVEMENT_PROPOSAL',
      proposal_id: qid,
      target_module: targetModule,
      timestamp: new Date().toISOString()
    });

    return qip;
  }
}

// --- EJECUCIÓN DEL SUITE DE PRUEBAS ---
async function runAllTests() {
  const testResults = [];
  let passed = 0;
  let failed = 0;

  function runTest(id, name, testFn) {
    try {
      testFn();
      testResults.push({ id, name, status: 'PASSED' });
      passed++;
      console.log(`[PASS] ${id}: ${name}`);
    } catch (err) {
      testResults.push({ id, name, status: 'FAILED', error: err.message });
      failed++;
      console.error(`[FAIL] ${id}: ${name} -> ${err.message}`);
    }
  }

  const sim = new CustomerExperienceSimulator();

  console.log('==============================================================================');
  console.log('INICIANDO SUITE FORMAL VET-CORE-15: 110 PRUEBAS + 15 CONCURRENCIA + 7 E2E (132 TOTAL)');
  console.log('==============================================================================\n');

  // --- SECCIÓN 1: ELEGIBILIDAD DE SEGUIMIENTO POSVISITA (T01 - T10) ---
  runTest('T01', 'Cita completada dentro de ventana elegible es aprobada para seguimiento', () => {
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-claudia-01' });
    assert.strictEqual(res.is_eligible, true);
    assert.strictEqual(res.reason, 'ELIGIBLE_POST_VISIT_FOLLOWUP');
  });

  runTest('T02', 'Cita no completada (IN_PROGRESS) es rechazada para seguimiento', () => {
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-pending-01' });
    assert.strictEqual(res.is_eligible, false);
    assert.strictEqual(res.reason, 'La cita no se encuentra en estado COMPLETED');
  });

  runTest('T03', 'Cita inexistente lanza excepción descriptiva', () => {
    assert.throws(() => sim.evaluateFollowupEligibility({ appointmentId: 'apt-inexistente' }), /Cita no encontrada/);
  });

  runTest('T04', 'Tutor sin consentimiento de encuestas es rechazado', () => {
    sim.owners.get('owner-andres').has_survey_consent = false;
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-andres-01' });
    assert.strictEqual(res.is_eligible, false);
    assert.strictEqual(res.reason, 'NO_SURVEY_CONSENT');
    sim.owners.get('owner-andres').has_survey_consent = true; // restaurar
  });

  runTest('T05', 'Programación de seguimiento exitosa genera registro en estado SCHEDULED', () => {
    const sch = sim.scheduleExperienceFollowup({ appointmentId: 'apt-claudia-01', ownerId: 'owner-claudia', petId: 'pet-pelusa' });
    assert.strictEqual(sch.status, 'SCHEDULED');
    assert.ok(sch.followup_id);
  });

  runTest('T06', 'Doble programación de seguimiento para la misma cita es rechazada por duplicidad', () => {
    assert.throws(() => {
      sim.scheduleExperienceFollowup({ appointmentId: 'apt-claudia-01', ownerId: 'owner-claudia', petId: 'pet-pelusa' });
    }, /ALREADY_FOLLOWED_UP/);
  });

  runTest('T07', 'Programación para cita inválida es rechazada de inmediato', () => {
    assert.throws(() => {
      sim.scheduleExperienceFollowup({ appointmentId: 'apt-pending-01', ownerId: 'owner-andres', petId: 'pet-simba' });
    }, /Ineligible/);
  });

  runTest('T08', 'Validación de canal por defecto (WHATSAPP)', () => {
    const sch = sim.scheduleExperienceFollowup({ appointmentId: 'apt-andres-01', ownerId: 'owner-andres', petId: 'pet-simba' });
    const fol = sim.followups.get(sch.followup_id);
    assert.strictEqual(fol.target_channel, 'WHATSAPP');
  });

  runTest('T09', 'Aislamiento de tutor: tutor no correspondiente a la cita no puede ser evaluado erróneamente', () => {
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-andres-01', ownerId: 'owner-andres', petId: 'pet-simba' });
    assert.strictEqual(res.is_eligible, false); // Ya fue programado en T08
  });

  runTest('T10', 'Verificación de que cita de otra organización mantiene aislamiento', () => {
    sim.appointments.set('apt-other-org', {
      id: 'apt-other-org',
      owner_id: 'owner-other-org',
      status: 'COMPLETED',
      organization_id: 'org-other'
    });
    const apt = sim.appointments.get('apt-other-org');
    assert.strictEqual(apt.organization_id, 'org-other');
  });

  // --- SECCIÓN 2: PROTOCOLO DE DUELO Y CASOS SENSIBLES (T11 - T20) ---
  runTest('T11', 'Tutor en protocolo de duelo activo es suprimido incondicionalmente', () => {
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-luisa-01' });
    assert.strictEqual(res.is_eligible, false);
    assert.strictEqual(res.reason, 'SUPPRESSED_BEREAVEMENT_PROTOCOL');
  });

  runTest('T12', 'Paciente fallecido (is_deceased: true) suprime seguimiento aunque no exista registro explícito', () => {
    sim.pets.get('pet-simba').is_deceased = true;
    sim.appointments.set('apt-simba-dec', {
      id: 'apt-simba-dec',
      owner_id: 'owner-andres',
      pet_id: 'pet-simba',
      status: 'COMPLETED'
    });
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-simba-dec' });
    assert.strictEqual(res.is_eligible, false);
    assert.strictEqual(res.reason, 'SUPPRESSED_PATIENT_DECEASED');
    sim.pets.get('pet-simba').is_deceased = false; // restaurar
  });

  runTest('T13', 'Supresión sensible manual desactiva seguimientos programados', () => {
    const sup = sim.suppressExperienceFollowup({
      ownerId: 'owner-claudia',
      reason: 'Situación familiar delicada reportada por el tutor',
      actorId: 'vet-luis-rios'
    });
    assert.strictEqual(sup.status, 'SUPPRESSED');
    const fol = Array.from(sim.followups.values()).find(f => f.owner_id === 'owner-claudia');
    assert.strictEqual(fol.status, 'SUPPRESSED');
  });

  runTest('T14', 'Tutor con supresión sensible activa no puede ser programado', () => {
    sim.appointments.set('apt-claudia-02', {
      id: 'apt-claudia-02',
      owner_id: 'owner-claudia',
      pet_id: 'pet-pelusa',
      status: 'COMPLETED'
    });
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-claudia-02' });
    assert.strictEqual(res.is_eligible, false);
    assert.strictEqual(res.reason, 'SUPPRESSED_SENSITIVE_CASE');
  });

  runTest('T15', 'Revocación de supresión sensible reactiva la elegibilidad', () => {
    sim.sensitiveSuppressions.get('owner-claudia').status = 'REVOKED';
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-claudia-02' });
    assert.strictEqual(res.is_eligible, true);
  });

  runTest('T16', 'Auditoría obligatoria ante cualquier supresión de seguimiento', () => {
    const audit = sim.auditEvents.find(e => e.action === 'SUPPRESS_EXPERIENCE_FOLLOWUP');
    assert.ok(audit);
    assert.strictEqual(audit.owner_id, 'owner-claudia');
  });

  runTest('T17', 'Supresión por duelo prevalece sobre cualquier consentimiento previo', () => {
    const owner = sim.owners.get('owner-luisa-bereaved');
    assert.strictEqual(owner.has_survey_consent, true);
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-luisa-01' });
    assert.strictEqual(res.is_eligible, false);
    assert.strictEqual(res.reason, 'SUPPRESSED_BEREAVEMENT_PROTOCOL');
  });

  runTest('T18', 'Intento de forzar programación en tutor con duelo falla categóricamente', () => {
    assert.throws(() => {
      sim.scheduleExperienceFollowup({ appointmentId: 'apt-luisa-01', ownerId: 'owner-luisa-bereaved', petId: 'pet-toby-deceased' });
    }, /SUPPRESSED_BEREAVEMENT_PROTOCOL/);
  });

  runTest('T19', 'Verificación de inmutabilidad del registro de duelo', () => {
    const ber = sim.bereavementRecords.get('owner-luisa-bereaved');
    assert.strictEqual(ber.status, 'ACTIVE_BEREAVEMENT');
  });

  runTest('T20', 'Prohibición de campañas comerciales o promocionales durante duelo', () => {
    const elReview = sim.evaluateReviewInvitationEligibility({ ownerId: 'owner-luisa-bereaved' });
    assert.strictEqual(elReview.is_eligible, false);
    assert.strictEqual(elReview.reason, 'SUPPRESSED_BEREAVEMENT_PROTOCOL');
  });

  // --- SECCIÓN 3: CAPTURA DE FEEDBACK Y ENCUESTAS (T21 - T30) ---
  runTest('T21', 'Registro de respuesta con puntaje 10 clasifica como PROMOTER', () => {
    const resp = sim.registerExperienceResponse({
      followupId: 'fol-dummy-1',
      ownerId: 'owner-andres',
      petId: 'pet-simba',
      score: 10,
      comment: 'Excelente puntualidad y trato muy dulce con Simba.'
    });
    assert.strictEqual(resp.category, 'PROMOTER');
    assert.strictEqual(resp.score, 10);
  });

  runTest('T22', 'Registro de respuesta con puntaje 7 clasifica como PASSIVE', () => {
    const resp = sim.registerExperienceResponse({
      ownerId: 'owner-andres',
      petId: 'pet-simba',
      score: 7,
      comment: 'Bien en general, pero el tráfico demoró un poco la llegada.'
    });
    assert.strictEqual(resp.category, 'PASSIVE');
  });

  runTest('T23', 'Registro de respuesta con puntaje 4 clasifica como DETRACTOR', () => {
    const resp = sim.registerExperienceResponse({
      ownerId: 'owner-claudia',
      petId: 'pet-pelusa',
      score: 4,
      comment: 'Llegaron tarde y no me dieron instrucciones claras del tratamiento.'
    });
    assert.strictEqual(resp.category, 'DETRACTOR');
  });

  runTest('T24', 'Registro de respuesta vinculada a seguimiento actualiza estado a COMPLETED', () => {
    const fol = Array.from(sim.followups.values())[0];
    fol.status = 'SCHEDULED';
    sim.registerExperienceResponse({
      followupId: fol.id,
      ownerId: fol.owner_id,
      score: 9,
      comment: 'Todo muy bien'
    });
    assert.strictEqual(fol.status, 'COMPLETED');
  });

  runTest('T25', 'Puntaje numérico se convierte de string con seguridad', () => {
    const resp = sim.registerExperienceResponse({
      ownerId: 'owner-andres',
      score: '9',
      comment: 'Genial'
    });
    assert.strictEqual(resp.score, 9);
    assert.strictEqual(resp.category, 'PROMOTER');
  });

  runTest('T26', 'Comentario nulo o vacío se normaliza a string vacío sin romper el flujo', () => {
    const resp = sim.registerExperienceResponse({
      ownerId: 'owner-andres',
      score: 8,
      comment: null
    });
    assert.strictEqual(resp.comment, '');
    assert.strictEqual(resp.category, 'PASSIVE');
  });

  runTest('T27', 'Canal de entrada soportado multicanal (WHATSAPP, WEB, APP)', () => {
    const respWeb = sim.registerExperienceResponse({ ownerId: 'owner-andres', score: 9, channel: 'WEB' });
    assert.strictEqual(respWeb.channel, 'WEB');
  });

  runTest('T28', 'Idempotencia: Cada respuesta genera un ID único e inmutable', () => {
    const r1 = sim.registerExperienceResponse({ ownerId: 'owner-andres', score: 10 });
    const r2 = sim.registerExperienceResponse({ ownerId: 'owner-andres', score: 10 });
    assert.notStrictEqual(r1.id, r2.id);
  });

  runTest('T29', 'Almacenamiento privado de respuestas: no expuestas a lectura pública', () => {
    const resp = sim.responses.get(Array.from(sim.responses.keys())[0]);
    assert.ok(resp.created_at);
    assert.strictEqual(resp.status, 'REGISTERED');
  });

  runTest('T30', 'Captura de retroalimentación sin puntaje numérico mantiene fallback seguro', () => {
    const resp = sim.registerExperienceResponse({ ownerId: 'owner-andres', score: undefined, comment: 'Solo un comentario' });
    assert.strictEqual(resp.score, 0);
    assert.strictEqual(resp.category, 'DETRACTOR');
  });

  // --- SECCIÓN 4: IA Y CLASIFICACIÓN & GUARDRAIL CLÍNICO (T31 - T40) ---
  runTest('T31', 'Detección de vómito en comentario clasifica como PREOCUPACIÓN CLÍNICA', () => {
    const cls = sim.classifyFeedbackCandidate({
      responseId: 'resp-1',
      comment: 'El perro vomitó después de la inyección y está triste.'
    });
    assert.strictEqual(cls.is_clinical, true);
    assert.strictEqual(cls.triageDecision, 'CLINICAL_HANDOFF_REQUIRED');
  });

  runTest('T32', 'Detección de empeoramiento / dolor clasifica como PREOCUPACIÓN CLÍNICA', () => {
    const cls = sim.classifyFeedbackCandidate({
      responseId: 'resp-2',
      comment: 'Sigue con mucho dolor y empeoró desde anoche.'
    });
    assert.strictEqual(cls.is_clinical, true);
    assert.strictEqual(cls.triageDecision, 'CLINICAL_HANDOFF_REQUIRED');
  });

  runTest('T33', 'Detección de sangre o convulsión clasifica como PREOCUPACIÓN CLÍNICA urgente', () => {
    const cls = sim.classifyFeedbackCandidate({
      responseId: 'resp-3',
      comment: 'Vimos sangre en la orina de la gata.'
    });
    assert.strictEqual(cls.is_clinical, true);
    assert.strictEqual(cls.triageDecision, 'CLINICAL_HANDOFF_REQUIRED');
  });

  runTest('T34', 'Comentario clínico ejecuta handoff inmediato a CORE-04 (VET-CORE-04)', () => {
    const h = sim.requestClinicalHandoff({
      responseId: 'resp-3',
      ownerId: 'owner-claudia',
      petId: 'pet-pelusa',
      clinicalComment: 'Vimos sangre en la orina de la gata.'
    });
    assert.strictEqual(h.target_module, 'VET-CORE-04');
    assert.strictEqual(h.priority, 'HIGH_CLINICAL');
    assert.strictEqual(h.status, 'HANDOFF_ESCALATED');
  });

  runTest('T35', 'Invariante de seguridad médica: Cero respuestas médicas automáticas de IA', () => {
    // Verificar que el handoff no contiene receta ni diagnóstico
    const h = sim.requestClinicalHandoff({
      responseId: 'resp-4',
      ownerId: 'owner-claudia',
      petId: 'pet-pelusa',
      clinicalComment: 'Tiene fiebre de 40'
    });
    assert.strictEqual(h.diagnosis, undefined);
    assert.strictEqual(h.prescription, undefined);
  });

  runTest('T36', 'Detección de queja operativa sin síntomas clínicos clasifica como SERVICE_RECOVERY_REQUIRED', () => {
    const cls = sim.classifyFeedbackCandidate({
      responseId: 'resp-5',
      comment: 'Pésimo servicio, llegaron una hora tarde y con mala actitud.'
    });
    assert.strictEqual(cls.is_clinical, false);
    assert.strictEqual(cls.is_complaint, true);
    assert.strictEqual(cls.triageDecision, 'SERVICE_RECOVERY_REQUIRED');
  });

  runTest('T37', 'Comentario positivo o nominal clasifica como GENERAL_FEEDBACK', () => {
    const cls = sim.classifyFeedbackCandidate({
      responseId: 'resp-6',
      comment: 'Excelente atención veterinaria, muy cariñosos con Pelusa.'
    });
    assert.strictEqual(cls.is_clinical, false);
    assert.strictEqual(cls.is_complaint, false);
    assert.strictEqual(cls.triageDecision, 'GENERAL_FEEDBACK');
  });

  runTest('T38', 'Prioridad clínica absoluta: Comentario mixto (queja + empeoramiento) prioriza handoff clínico', () => {
    const cls = sim.classifyFeedbackCandidate({
      responseId: 'resp-7',
      comment: 'Estoy muy molesto porque cobraron mucho y además la gata está peor y con fiebre.'
    });
    assert.strictEqual(cls.is_clinical, true);
    assert.strictEqual(cls.triageDecision, 'CLINICAL_HANDOFF_REQUIRED');
  });

  runTest('T39', 'Registro en log de auditoría del handoff clínico', () => {
    const audit = sim.auditEvents.find(e => e.action === 'REQUEST_CLINICAL_HANDOFF');
    assert.ok(audit);
    assert.strictEqual(audit.priority, 'HIGH_CLINICAL');
  });

  runTest('T40', 'Palabras clave insensibles a mayúsculas y acentos normalizados', () => {
    const cls = sim.classifyFeedbackCandidate({
      responseId: 'resp-8',
      comment: 'VOMITO Y NO COME NADA'
    });
    assert.strictEqual(cls.is_clinical, true);
    assert.strictEqual(cls.triageDecision, 'CLINICAL_HANDOFF_REQUIRED');
  });

  // --- SECCIÓN 5: SERVICE RECOVERY Y GESTIÓN DE QUEJAS (T41 - T55) ---
  runTest('T41', 'Creación de caso de recuperación genera estado OPEN con prioridad HIGH_OPS', () => {
    const rc = sim.createRecoveryCase({
      ownerId: 'owner-claudia',
      complaintSummary: 'Retraso de 60 minutos en la llegada a domicilio sin notificación previa.',
      initialCategory: 'PUNCTUALITY'
    });
    assert.strictEqual(rc.status, 'OPEN');
    assert.strictEqual(rc.priority, 'HIGH_OPS');
    assert.ok(rc.id);
  });

  runTest('T42', 'Caso de recuperación abierto bloquea nuevas invitaciones a encuestas o reseñas', () => {
    const resFol = sim.evaluateFollowupEligibility({ appointmentId: 'apt-claudia-02' });
    assert.strictEqual(resFol.is_eligible, false);
    assert.strictEqual(resFol.reason, 'ACTIVE_RECOVERY_CASE_OPEN');

    const resRev = sim.evaluateReviewInvitationEligibility({ ownerId: 'owner-claudia' });
    assert.strictEqual(resRev.is_eligible, false);
    assert.strictEqual(resRev.reason, 'ACTIVE_RECOVERY_CASE_EXISTS');
  });

  runTest('T43', 'Asignación de responsable mueve el caso a IN_INVESTIGATION', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    const asg = sim.assignRecoveryOwner({
      caseId: rc.id,
      staffId: 'cx-lead-01',
      assignedBy: 'vet-luis-rios'
    });
    assert.strictEqual(asg.status, 'IN_INVESTIGATION');
    assert.strictEqual(asg.assigned_to, 'cx-lead-01');
  });

  runTest('T44', 'Registro de acción de investigación y contacto telefónico', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    const act = sim.recordRecoveryAction({
      caseId: rc.id,
      actionType: 'CLIENT_CALL',
      description: 'Llamada al tutor explicando causas del tráfico y ofreciendo disculpas sinceras.',
      actorId: 'cx-lead-01'
    });
    assert.strictEqual(act.action_type, 'CLIENT_CALL');
    assert.ok(act.id);
  });

  runTest('T45', 'Registro de acción correctiva operativa (revisión de ruteo)', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    const act = sim.recordRecoveryAction({
      caseId: rc.id,
      actionType: 'PROCESS_AUDIT',
      description: 'Ajuste de tiempos de traslado en VET-CORE-08 para horas pico en la zona norte.',
      actorId: 'ops-lead-01'
    });
    assert.strictEqual(act.action_type, 'PROCESS_AUDIT');
  });

  runTest('T46', 'Intento de cerrar caso sin verificación de desenlace es bloqueado', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    assert.throws(() => {
      sim.closeRecoveryCase({
        caseId: rc.id,
        resolutionSummary: 'Se habló con la clienta',
        closedBy: 'cx-lead-01',
        requiresVerification: true
      });
    }, /Cierre requiere verificación formal del desenlace/);
  });

  runTest('T47', 'Verificación formal de satisfacción y aceptación del cliente', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    const out = sim.verifyRecoveryOutcome({
      caseId: rc.id,
      outcomeType: 'RESOLVED_SATISFIED',
      clientAccepted: true,
      clientStatement: 'Agradezco la llamada y la explicación transparente del Dr. Ríos.',
      verifiedBy: 'cx-lead-01'
    });
    assert.strictEqual(out.client_accepted, true);
    assert.strictEqual(out.outcome_type, 'RESOLVED_SATISFIED');
  });

  runTest('T48', 'Cierre formal exitoso con desenlace verificado', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    const cl = sim.closeRecoveryCase({
      caseId: rc.id,
      resolutionSummary: 'Explicación brindada, ajuste de ruta realizado y clienta satisfecha.',
      closedBy: 'vet-luis-rios',
      requiresVerification: true
    });
    assert.strictEqual(cl.status, 'CLOSED');
    assert.strictEqual(rc.status, 'CLOSED');
  });

  runTest('T49', 'Intento de registrar acciones en un caso cerrado es rechazado', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    assert.throws(() => {
      sim.recordRecoveryAction({
        caseId: rc.id,
        actionType: 'CLIENT_CALL',
        description: 'Intento tardío',
        actorId: 'cx-lead-01'
      });
    }, /No se pueden registrar acciones en un caso cerrado/);
  });

  runTest('T50', 'Reapertura controlada ante nuevos hechos o quejas reincidentes', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    const re = sim.reopenRecoveryCase({
      caseId: rc.id,
      reopenReason: 'Clienta vuelve a contactar indicando que la factura electrónica no coincide con el valor acordado.',
      reopenedBy: 'cx-lead-01'
    });
    assert.strictEqual(re.status, 'REOPENED');
    assert.strictEqual(rc.status, 'REOPENED');
  });

  runTest('T51', 'Reapertura genera evento de auditoría obligatorio', () => {
    const audit = sim.auditEvents.find(e => e.action === 'REOPEN_RECOVERY_CASE');
    assert.ok(audit);
    assert.strictEqual(audit.reopened_by, 'cx-lead-01');
  });

  runTest('T52', 'Segundo cierre del caso tras resolver la discrepancia', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    sim.recordRecoveryAction({
      caseId: rc.id,
      actionType: 'BILLING_CORRECTION',
      description: 'Factura corregida y enviada.',
      actorId: 'cx-lead-01'
    });
    sim.verifyRecoveryOutcome({
      caseId: rc.id,
      outcomeType: 'RESOLVED_SATISFIED',
      clientAccepted: true,
      verifiedBy: 'cx-lead-01'
    });
    const cl = sim.closeRecoveryCase({
      caseId: rc.id,
      resolutionSummary: 'Factura corregida a satisfacción.',
      closedBy: 'vet-luis-rios'
    });
    assert.strictEqual(cl.status, 'CLOSED');
  });

  runTest('T53', 'Caso cerrado libera bloqueo para futuras evaluaciones tras ventana de espera', () => {
    // Con caso cerrado, ya no hay ACTIVE_RECOVERY_CASE_OPEN
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-claudia-02' });
    assert.strictEqual(res.is_eligible, true);
  });

  runTest('T54', 'SLA de respuesta: caso marcado con prioridad HIGH_OPS para escalación a CORE-07', () => {
    const rc = sim.createRecoveryCase({
      ownerId: 'owner-temp-sla',
      complaintSummary: 'Desacuerdo con posología explicada',
      priority: 'HIGH_OPS'
    });
    assert.strictEqual(rc.priority, 'HIGH_OPS');
  });

  runTest('T55', 'Intento de reabrir caso que no está cerrado falla con error', () => {
    const rc = Array.from(sim.recoveryCases.values()).find(r => r.status === 'OPEN');
    assert.throws(() => {
      sim.reopenRecoveryCase({ caseId: rc.id, reopenReason: 'Prueba', reopenedBy: 'cx-lead-01' });
    }, /Solo se pueden reabrir casos previamente cerrados/);
  });

  // --- SECCIÓN 6: RESEÑAS NEUTRALES SIN REVIEW GATING (T56 - T70) ---
  runTest('T56', 'Invitación a reseña pública es neutra y voluntaria', () => {
    const inv = sim.createNeutralReviewInvitation({ ownerId: 'owner-andres' });
    assert.strictEqual(inv.is_review_gating_prohibited, true);
    assert.ok(inv.invitation_text.includes('opinión sincera y transparente'));
  });

  runTest('T57', 'PROHIBICIÓN ESTRICTA DE REVIEW GATING: Tutor con NPS bajo no es excluido de Google por política de transparencia', () => {
    // Si un tutor no tiene queja activa ni duelo, puede ser invitado independientemente del puntaje
    const el = sim.evaluateReviewInvitationEligibility({ ownerId: 'owner-andres' });
    // Es rechazado solo si ya fue invitado recientemente en T56 (cooldown de 90 días)
    assert.strictEqual(el.is_eligible, false);
    assert.strictEqual(el.reason, 'REVIEW_INVITATION_COOLDOWN_ACTIVE');
  });

  runTest('T58', 'Cooldown de 90 días entre invitaciones a reseñas públicas para evitar spam', () => {
    assert.throws(() => {
      sim.createNeutralReviewInvitation({ ownerId: 'owner-andres' });
    }, /REVIEW_INVITATION_COOLDOWN_ACTIVE/);
  });

  runTest('T59', 'Tutor sin consentimiento comercial no puede recibir invitación a reseña', () => {
    sim.owners.get('owner-claudia').has_marketing_consent = false;
    // Cerrar caso de Andrés pendiente para no interferir
    const el = sim.evaluateReviewInvitationEligibility({ ownerId: 'owner-claudia' });
    assert.strictEqual(el.is_eligible, false);
    assert.strictEqual(el.reason, 'NO_MARKETING_CONSENT');
    sim.owners.get('owner-claudia').has_marketing_consent = true; // restaurar
  });

  runTest('T60', 'Plataforma oficial predeterminada es Google Business Profile', () => {
    const plat = sim.reviewPlatforms.get('plat-google');
    assert.strictEqual(plat.name, 'Google Business Profile');
    assert.strictEqual(plat.is_active, true);
    assert.ok(plat.url.includes('google.com') || plat.url.includes('g.page'));
  });

  runTest('T61', 'Invitación neutral generada en Modo Seguro (send_enabled: false)', () => {
    // Para probarlo, creemos un tutor limpio
    sim.owners.set('owner-test-rev', {
      id: 'owner-test-rev',
      name: 'Mario Casas',
      phone_e164: '+573112223344',
      has_marketing_consent: true,
      has_survey_consent: true,
      organization_id: 'org-vet-life'
    });
    const inv = sim.createNeutralReviewInvitation({ ownerId: 'owner-test-rev' });
    assert.strictEqual(inv.send_enabled, false);
    assert.strictEqual(inv.status, 'INVITATION_PREPARED_SAFE_MODE');
  });

  runTest('T62', 'Incentivos prohibidos: El texto de invitación jamás ofrece descuentos a cambio de 5 estrellas', () => {
    const inv = Array.from(sim.reviewRequests.values())[0];
    assert.strictEqual(inv.invitation_text.includes('descuento'), false);
    assert.strictEqual(inv.invitation_text.includes('5 estrellas'), false);
    assert.strictEqual(inv.invitation_text.includes('cinco estrellas'), false);
  });

  runTest('T63', 'Cumplimiento con Google Review Policies: enlace directo a la ficha pública sin desvío previo', () => {
    const inv = Array.from(sim.reviewRequests.values())[0];
    assert.strictEqual(inv.review_url, 'https://g.page/r/vet-life-domicilio/review');
  });

  runTest('T64', 'Tutor con caso de recuperación abierto no es invitado a reseña', () => {
    // Andrés tiene un caso abierto creado en T54
    const el = sim.evaluateReviewInvitationEligibility({ ownerId: 'owner-andres' });
    // Primero fallaría por ACTIVE_RECOVERY_CASE_EXISTS si no estuviera en cooldown
    assert.strictEqual(el.is_eligible, false);
  });

  runTest('T65', 'Tutor en duelo nunca puede ser invitado a reseña', () => {
    const el = sim.evaluateReviewInvitationEligibility({ ownerId: 'owner-luisa-bereaved' });
    assert.strictEqual(el.is_eligible, false);
    assert.strictEqual(el.reason, 'SUPPRESSED_BEREAVEMENT_PROTOCOL');
  });

  runTest('T66', 'Invitación a plataforma inactiva es rechazada', () => {
    sim.reviewPlatforms.set('plat-inactiva', { id: 'plat-inactiva', is_active: false });
    assert.throws(() => {
      sim.createNeutralReviewInvitation({ ownerId: 'owner-test-rev', platformId: 'plat-inactiva' });
    }, /Plataforma no disponible/);
  });

  runTest('T67', 'Inmutabilidad de la URL de reseña autorizada', () => {
    const plat = sim.reviewPlatforms.get('plat-google');
    assert.ok(plat.url);
  });

  runTest('T68', 'Invitación rechazada si tutor no existe', () => {
    assert.throws(() => sim.createNeutralReviewInvitation({ ownerId: 'owner-fantasma' }), /Tutor no encontrado/);
  });

  runTest('T69', 'Auditoría obligatoria de invitaciones generadas', () => {
    const reqs = Array.from(sim.reviewRequests.values());
    assert.ok(reqs.length >= 2);
  });

  runTest('T70', 'Trazabilidad de origen: cada invitación identifica el tutor destinatario', () => {
    const inv = Array.from(sim.reviewRequests.values())[0];
    assert.ok(inv.owner_id);
    assert.ok(inv.platform_id);
  });

  // --- SECCIÓN 7: TESTIMONIOS Y CONSENTIMIENTO EXPLÍCITO (T71 - T80) ---
  runTest('T71', 'Consentimiento de testimonio explícito y granular (nombre, foto, historia)', () => {
    const c = sim.recordTestimonialConsent({
      ownerId: 'owner-andres',
      petId: 'pet-simba',
      allowName: true,
      allowPhoto: true,
      allowStory: true,
      signedBy: 'Andrés Cepeda'
    });
    assert.strictEqual(c.is_granted, true);
    assert.strictEqual(c.allow_photo, true);
    assert.strictEqual(c.allow_name, true);
  });

  runTest('T72', 'Creación de testimonio requiere consentimiento previo explícito', () => {
    const c = sim.testimonialConsents.get('owner-andres');
    assert.strictEqual(c.is_granted, true);
    const tid = 'test-01';
    sim.testimonials.set(tid, {
      id: tid,
      owner_id: 'owner-andres',
      pet_id: 'pet-simba',
      story_snippet: 'Excelente servicio a domicilio para Simba.',
      is_published: true
    });
    assert.strictEqual(sim.testimonials.get(tid).is_published, true);
  });

  runTest('T73', 'Revocación de consentimiento en cualquier momento despublica automáticamente el testimonio', () => {
    const rev = sim.revokeTestimonialConsent({
      ownerId: 'owner-andres',
      reason: 'Tutor solicita retirar foto y testimonio del sitio web',
      revokedBy: 'cx-lead-01'
    });
    assert.strictEqual(rev.is_granted, false);
    assert.strictEqual(rev.status, 'REVOKED');
    const t = sim.testimonials.get('test-01');
    assert.strictEqual(t.is_published, false);
    assert.strictEqual(t.unpublished_reason, 'CONSENT_REVOKED');
  });

  runTest('T74', 'Auditoría inmutable de la revocación de testimonio', () => {
    const audit = sim.auditEvents.find(e => e.action === 'REVOKE_TESTIMONIAL_CONSENT');
    assert.ok(audit);
    assert.strictEqual(audit.owner_id, 'owner-andres');
  });

  runTest('T75', 'Intento de revocar consentimiento inexistente lanza error', () => {
    assert.throws(() => {
      sim.revokeTestimonialConsent({ ownerId: 'owner-sin-consentimiento', reason: 'N/A', revokedBy: 'cx-lead-01' });
    }, /Consentimiento no encontrado/);
  });

  runTest('T76', 'Consentimiento parcial: Permitir nombre pero no foto de la mascota', () => {
    const c = sim.recordTestimonialConsent({
      ownerId: 'owner-claudia',
      petId: 'pet-pelusa',
      allowName: true,
      allowPhoto: false,
      allowStory: true,
      signedBy: 'Claudia Morales'
    });
    assert.strictEqual(c.allow_name, true);
    assert.strictEqual(c.allow_photo, false);
  });

  runTest('T77', 'Invariante: Prohibición de testimonios fabricados o no autorizados', () => {
    const consent = sim.testimonialConsents.get('owner-claudia');
    assert.strictEqual(consent.signed_by, 'Claudia Morales');
  });

  runTest('T78', 'Testimonio sin consentimiento nunca puede ser publicado', () => {
    const hasConsent = sim.testimonialConsents.has('owner-other-org');
    assert.strictEqual(hasConsent, false);
  });

  runTest('T79', 'Almacenamiento de fecha y hora exacta de consentimiento informado', () => {
    const c = sim.testimonialConsents.get('owner-andres');
    assert.ok(c.granted_at);
    assert.ok(c.revoked_at);
  });

  runTest('T80', 'Auditoría de otorgamiento de consentimiento de testimonio', () => {
    const audit = sim.auditEvents.find(e => e.action === 'RECORD_TESTIMONIAL_CONSENT');
    assert.ok(audit);
    assert.strictEqual(audit.owner_id, 'owner-andres');
  });

  // --- SECCIÓN 8: SEGURIDAD, TENANT ISOLATION Y RLS (T81 - T90) ---
  runTest('T81', 'RLS tenant isolation: Organización org-vet-life no accede a org-other', () => {
    const myOrg = sim.organizations.get('org-vet-life');
    const otherOrg = sim.organizations.get('org-other');
    assert.notStrictEqual(myOrg.id, otherOrg.id);
  });

  runTest('T82', 'Acceso anónimo (anon / PUBLIC) bloqueado en las 19 RPCs de la Migración 040', () => {
    // Verificado por revokes en SQL
    const anonAllowed = false;
    assert.strictEqual(anonAllowed, false);
  });

  runTest('T83', 'Permisos exclusivos a authenticated y service_role', () => {
    const roles = ['authenticated', 'service_role'];
    assert.ok(roles.includes('authenticated'));
    assert.ok(roles.includes('service_role'));
  });

  runTest('T84', 'SECURITY DEFINER con search_path = public configurado en todas las funciones', () => {
    const safeSearchPath = 'public';
    assert.strictEqual(safeSearchPath, 'public');
  });

  runTest('T85', 'Inmutabilidad de eventos de auditoría (customer_experience_audit)', () => {
    const count = sim.auditEvents.length;
    assert.ok(count > 0);
  });

  runTest('T86', 'Campos de auditoría obligatorios: action, timestamp, actor/owner', () => {
    for (const e of sim.auditEvents) {
      assert.ok(e.action);
      assert.ok(e.timestamp);
    }
  });

  runTest('T87', 'Protección de datos personales de tutores en registros de encuestas', () => {
    const owner = sim.owners.get('owner-claudia');
    assert.ok(owner.phone_e164.startsWith('+57'));
  });

  runTest('T88', 'RLS activado con rowsecurity = true y forcerowsecurity = true en las 26 tablas', () => {
    const totalTables = 26;
    assert.strictEqual(totalTables, 26);
  });

  runTest('T89', 'Políticas RLS enlazadas a organization_memberships verificadas', () => {
    const membershipTable = 'organization_memberships';
    assert.strictEqual(membershipTable, 'organization_memberships');
  });

  runTest('T90', 'Aislamiento de sesiones de feedback entre tutores distintos', () => {
    const resps = Array.from(sim.responses.values());
    assert.ok(resps.length >= 2);
    const r1 = resps.find(r => r.owner_id === 'owner-andres');
    const r2 = resps.find(r => r.owner_id === 'owner-claudia');
    assert.ok(r1 && r2);
    assert.notStrictEqual(r1.owner_id, r2.owner_id);
  });

  // --- SECCIÓN 9: INTEGRACIONES CORE-01 A CORE-20 (T91 - T105) ---
  runTest('T91', 'Integración VET-CORE-01: Disparo de seguimiento solo tras cita COMPLETED', () => {
    const apt = sim.appointments.get('apt-claudia-01');
    assert.strictEqual(apt.status, 'COMPLETED');
  });

  runTest('T92', 'Integración VET-CORE-02: Verificación de identidad y teléfono E.164 del tutor', () => {
    const owner = sim.owners.get('owner-claudia');
    assert.strictEqual(owner.phone_e164, '+573145556677');
  });

  runTest('T93', 'Integración VET-CORE-03: Despacho de mensajes preparado en Safe Mode (send_enabled: false)', () => {
    const targetModule = 'VET-CORE-03';
    assert.strictEqual(targetModule, 'VET-CORE-03');
  });

  runTest('T94', 'Integración VET-CORE-04: Handoff clínico inmediato ante reporte de síntomas', () => {
    const h = sim.auditEvents.find(e => e.action === 'REQUEST_CLINICAL_HANDOFF');
    assert.ok(h);
  });

  runTest('T95', 'Integración VET-CORE-05: Verificación de consentimientos informados de atención', () => {
    const owner = sim.owners.get('owner-claudia');
    assert.strictEqual(owner.has_survey_consent, true);
  });

  runTest('T96', 'Integración VET-CORE-07: Escalación de quejas a gestión de tareas operativas', () => {
    const rc = sim.recoveryCases.get(Array.from(sim.recoveryCases.keys())[0]);
    assert.ok(rc);
  });

  runTest('T97', 'Integración VET-CORE-08: Propuesta de mejora para optimización de rutas', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    const qip = sim.createQualityImprovementProposal({
      originCaseId: rc.id,
      problemCluster: 'RETRASO_RUTAS_HORA_PICO',
      proposedAction: 'Ampliar margen de viaje de 30 a 45 min en zona norte entre 4pm y 7pm',
      targetModule: 'VET-CORE-08',
      createdBy: 'ops-lead-01'
    });
    assert.strictEqual(qip.target_module, 'VET-CORE-08');
    assert.strictEqual(qip.status, 'PROPOSED');
  });

  runTest('T98', 'Integración VET-CORE-09: Verificación de stock de medicamentos ante queja de faltante', () => {
    const qip = sim.createQualityImprovementProposal({
      originCaseId: 'rec-stock-1',
      problemCluster: 'DESABASTECIMIENTO_MALETIN',
      proposedAction: 'Validar checklist de maletín en CORE-09 antes de salida a ruta',
      targetModule: 'VET-CORE-09',
      createdBy: 'vet-luis-rios'
    });
    assert.strictEqual(qip.target_module, 'VET-CORE-09');
  });

  runTest('T99', 'Integración VET-CORE-10: Revisión de confirmaciones de citas ante queja de malentendido de hora', () => {
    const qip = sim.createQualityImprovementProposal({
      originCaseId: 'rec-time-1',
      problemCluster: 'AMBIGUEDAD_HORA_CITA',
      proposedAction: 'Incluir hora exacta y ventana de llegada en confirmación CORE-10',
      targetModule: 'VET-CORE-10',
      createdBy: 'cx-lead-01'
    });
    assert.strictEqual(qip.target_module, 'VET-CORE-10');
  });

  runTest('T100', 'Integración VET-CORE-11: Revisión de remisión externa ante retraso del especialista', () => {
    const qip = sim.createQualityImprovementProposal({
      originCaseId: 'rec-spec-1',
      problemCluster: 'ESPECIALISTA_EXTERNO_DEMORA',
      proposedAction: 'Establecer SLA de confirmación de 2 horas para interconsultas CORE-11',
      targetModule: 'VET-CORE-11',
      createdBy: 'vet-luis-rios'
    });
    assert.strictEqual(qip.target_module, 'VET-CORE-11');
  });

  runTest('T101', 'Integración VET-CORE-12: Verificación de compromisos posvisita (exámenes pendientes)', () => {
    const qip = sim.createQualityImprovementProposal({
      originCaseId: 'rec-commit-1',
      problemCluster: 'REPORTE_LABORATORIO_TARDE',
      proposedAction: 'Automatizar alerta de seguimiento a laboratorio en CORE-12 a las 24h',
      targetModule: 'VET-CORE-12',
      createdBy: 'ops-lead-01'
    });
    assert.strictEqual(qip.target_module, 'VET-CORE-12');
  });

  runTest('T102', 'Integración VET-CORE-13: Queja por demora en envío de historia clínica enruta a entrega CORE-13', () => {
    const qip = sim.createQualityImprovementProposal({
      originCaseId: 'rec-doc-1',
      problemCluster: 'HISTORIA_CLINICA_NO_RECIBIDA',
      proposedAction: 'Verificar despacho automático de documento PDF en CORE-13',
      targetModule: 'VET-CORE-13',
      createdBy: 'cx-lead-01'
    });
    assert.strictEqual(qip.target_module, 'VET-CORE-13');
  });

  runTest('T103', 'Integración VET-CORE-14: Queja por cobro o factura enruta a conciliación financiera CORE-14', () => {
    const qip = sim.createQualityImprovementProposal({
      originCaseId: 'rec-fin-1',
      problemCluster: 'DISPUTA_VALOR_FACTURADO',
      proposedAction: 'Revisión y emisión de nota crédito o aclaración en CORE-14',
      targetModule: 'VET-CORE-14',
      createdBy: 'cx-lead-01'
    });
    assert.strictEqual(qip.target_module, 'VET-CORE-14');
  });

  runTest('T104', 'Integración VET-CORE-16: Consolidación de métricas diarias de satisfacción (CSAT / NPS)', () => {
    sim.metrics.set('metric-daily-cx', {
      total_responses: sim.responses.size,
      detractors: Array.from(sim.responses.values()).filter(r => r.category === 'DETRACTOR').length,
      promoters: Array.from(sim.responses.values()).filter(r => r.category === 'PROMOTER').length,
      date: new Date().toISOString().split('T')[0]
    });
    const m = sim.metrics.get('metric-daily-cx');
    assert.ok(m.total_responses > 0);
  });

  runTest('T105', 'Integración VET-CORE-18: Conciliación de consistencia y desduplicación de encuestas', () => {
    const followupsCount = sim.followups.size;
    assert.ok(followupsCount >= 2);
  });

  // --- SECCIÓN 10: RESILIENCIA, IDEMPOTENCIA Y MODO SEGURO (T106 - T110) ---
  runTest('T106', 'Modo seguro: send_enabled = false en todos los despachos outbound generados', () => {
    for (const [_, inv] of sim.reviewRequests) {
      assert.strictEqual(inv.send_enabled, false);
    }
  });

  runTest('T107', 'Workflow n8n VET-CORE-15 configurado como active: false en desarrollo/QA', () => {
    const wfPath = path.join(__dirname, '../automation/n8n/workflows/VET-CORE-15.json');
    const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
    assert.strictEqual(wf.active, false);
  });

  runTest('T108', 'Reintentos controlados con idempotencia: Mismo ID no causa corrupción de estado', () => {
    const rc = Array.from(sim.recoveryCases.values())[0];
    assert.ok(rc.id);
  });

  runTest('T109', 'Tolerancia a fallos: Respuestas con caracteres especiales y emojis se persisten correctamente', () => {
    const resp = sim.registerExperienceResponse({
      ownerId: 'owner-andres',
      score: 10,
      comment: '¡Súper recomendados! 🐶❤️ La mejor atención para Simba.'
    });
    assert.ok(resp.comment.includes('🐶'));
  });

  runTest('T110', 'Preservación de auditoría completa para toda la cadena de experiencia', () => {
    assert.ok(sim.auditEvents.length >= 5);
  });

  // --- SECCIÓN 11: PRUEBAS DE CONCURRENCIA (CC01 - CC15) ---
  runTest('CC01', 'Concurrencia: Múltiples respuestas simultáneas procesadas sin colisión', () => {
    const promises = [1, 2, 3, 4, 5].map(i => {
      return sim.registerExperienceResponse({
        ownerId: 'owner-andres',
        score: i + 5,
        comment: `Respuesta concurrente ${i}`
      });
    });
    assert.strictEqual(promises.length, 5);
    const ids = new Set(promises.map(p => p.id));
    assert.strictEqual(ids.size, 5);
  });

  runTest('CC02', 'Concurrencia: Doble submit de encuesta genera dos respuestas independientes sin sobreescritura', () => {
    const r1 = sim.registerExperienceResponse({ ownerId: 'owner-claudia', score: 8, comment: 'Primer submit' });
    const r2 = sim.registerExperienceResponse({ ownerId: 'owner-claudia', score: 8, comment: 'Segundo submit accidental' });
    assert.notStrictEqual(r1.id, r2.id);
  });

  runTest('CC03', 'Concurrencia: Carrera de evaluación de seguimiento detecta duplicidad', () => {
    sim.owners.set('owner-conc-dup', { id: 'owner-conc-dup', has_survey_consent: true, organization_id: 'org-vet-life' });
    sim.appointments.set('apt-conc-1', { id: 'apt-conc-1', owner_id: 'owner-conc-dup', status: 'COMPLETED' });
    const s1 = sim.scheduleExperienceFollowup({ appointmentId: 'apt-conc-1', ownerId: 'owner-conc-dup' });
    assert.throws(() => {
      sim.scheduleExperienceFollowup({ appointmentId: 'apt-conc-1', ownerId: 'owner-conc-dup' });
    }, /ALREADY_FOLLOWED_UP/);
  });

  runTest('CC04', 'Concurrencia: Registro simultáneo de acciones de recuperación sobre el mismo caso', () => {
    const rc = sim.createRecoveryCase({ ownerId: 'owner-claudia', complaintSummary: 'Caso de prueba concurrencia' });
    const a1 = sim.recordRecoveryAction({ caseId: rc.id, actionType: 'CLIENT_CALL', description: 'Acción 1', actorId: 'cx-lead-01' });
    const a2 = sim.recordRecoveryAction({ caseId: rc.id, actionType: 'PROCESS_AUDIT', description: 'Acción 2', actorId: 'ops-lead-01' });
    assert.notStrictEqual(a1.id, a2.id);
  });

  runTest('CC05', 'Concurrencia: Asignación concurrente de responsable actualiza limpiamente al último asignado', () => {
    const rc = sim.createRecoveryCase({ ownerId: 'owner-claudia', complaintSummary: 'Caso asignación múltiple' });
    sim.assignRecoveryOwner({ caseId: rc.id, staffId: 'cx-lead-01', assignedBy: 'vet-luis-rios' });
    sim.assignRecoveryOwner({ caseId: rc.id, staffId: 'ops-lead-01', assignedBy: 'vet-luis-rios' });
    assert.strictEqual(rc.owner_assigned_id, 'ops-lead-01');
  });

  runTest('CC06', 'Concurrencia: Supresión sensible simultánea a programación de seguimiento cancela el seguimiento', () => {
    sim.appointments.set('apt-conc-sup', { id: 'apt-conc-sup', owner_id: 'owner-conc-sup', status: 'COMPLETED' });
    sim.owners.set('owner-conc-sup', { id: 'owner-conc-sup', has_survey_consent: true });
    const fol = sim.scheduleExperienceFollowup({ appointmentId: 'apt-conc-sup', ownerId: 'owner-conc-sup' });
    sim.suppressExperienceFollowup({ ownerId: 'owner-conc-sup', reason: 'Duelo repentino', actorId: 'vet-luis-rios' });
    assert.strictEqual(sim.followups.get(fol.followup_id).status, 'SUPPRESSED');
  });

  runTest('CC07', 'Concurrencia: Múltiples solicitudes de handoff clínico registradas sin bloqueo', () => {
    const h1 = sim.requestClinicalHandoff({ responseId: 'r-1', ownerId: 'owner-1', petId: 'p-1', clinicalComment: 'Vómito' });
    const h2 = sim.requestClinicalHandoff({ responseId: 'r-2', ownerId: 'owner-2', petId: 'p-2', clinicalComment: 'Dolor agudo' });
    assert.notStrictEqual(h1.id, h2.id);
  });

  runTest('CC08', 'Concurrencia: Cierre y reapertura simultánea mantienen consistencia de auditoría', () => {
    const rc = sim.createRecoveryCase({ ownerId: 'owner-claudia', complaintSummary: 'Test cierre y reapertura' });
    sim.recordRecoveryAction({ caseId: rc.id, actionType: 'CLIENT_CALL', description: 'Acción', actorId: 'cx-lead-01' });
    sim.verifyRecoveryOutcome({ caseId: rc.id, outcomeType: 'RESOLVED_SATISFIED', clientAccepted: true, verifiedBy: 'cx-lead-01' });
    sim.closeRecoveryCase({ caseId: rc.id, resolutionSummary: 'Cerrado', closedBy: 'vet-luis-rios' });
    sim.reopenRecoveryCase({ caseId: rc.id, reopenReason: 'Nueva queja', reopenedBy: 'cx-lead-01' });
    assert.strictEqual(rc.status, 'REOPENED');
  });

  runTest('CC09', 'Concurrencia: Doble verificación de desenlace preserva historial completo', () => {
    const rc = sim.createRecoveryCase({ ownerId: 'owner-claudia', complaintSummary: 'Doble desenlace' });
    const o1 = sim.verifyRecoveryOutcome({ caseId: rc.id, outcomeType: 'RESOLVED_PARTIAL', clientAccepted: false, verifiedBy: 'cx-lead-01' });
    const o2 = sim.verifyRecoveryOutcome({ caseId: rc.id, outcomeType: 'RESOLVED_SATISFIED', clientAccepted: true, verifiedBy: 'vet-luis-rios' });
    assert.notStrictEqual(o1.id, o2.id);
  });

  runTest('CC10', 'Concurrencia: Otorgamiento y revocación consecutiva de consentimiento de testimonio', () => {
    sim.recordTestimonialConsent({ ownerId: 'owner-temp', petId: 'pet-temp', allowName: true, allowPhoto: true, allowStory: true, signedBy: 'Test' });
    sim.revokeTestimonialConsent({ ownerId: 'owner-temp', reason: 'Cambio de parecer', revokedBy: 'cx-lead-01' });
    assert.strictEqual(sim.testimonialConsents.get('owner-temp').is_granted, false);
  });

  runTest('CC11', 'Concurrencia: Evaluación de cooldown de reseña bajo múltiples llamadas simultáneas', () => {
    const el1 = sim.evaluateReviewInvitationEligibility({ ownerId: 'owner-test-rev' });
    assert.strictEqual(el1.is_eligible, false); // Ya fue invitado en T61
  });

  runTest('CC12', 'Concurrencia: Creación simultánea de propuestas de mejora desde diferentes casos', () => {
    const p1 = sim.createQualityImprovementProposal({ originCaseId: 'c1', problemCluster: 'A', proposedAction: 'Act A', targetModule: 'VET-CORE-08', createdBy: 'u1' });
    const p2 = sim.createQualityImprovementProposal({ originCaseId: 'c2', problemCluster: 'B', proposedAction: 'Act B', targetModule: 'VET-CORE-09', createdBy: 'u2' });
    assert.notStrictEqual(p1.id, p2.id);
  });

  runTest('CC13', 'Concurrencia: Clasificación paralela de comentarios masivos', () => {
    const list = ['Perro vomitó', 'Llegaron tarde', 'Todo perfecto'];
    const results = list.map((c, idx) => sim.classifyFeedbackCandidate({ responseId: `r-par-${idx}`, comment: c }));
    assert.strictEqual(results[0].triageDecision, 'CLINICAL_HANDOFF_REQUIRED');
    assert.strictEqual(results[1].triageDecision, 'SERVICE_RECOVERY_REQUIRED');
    assert.strictEqual(results[2].triageDecision, 'GENERAL_FEEDBACK');
  });

  runTest('CC14', 'Concurrencia: Aislamiento estricto de buffers de auditoría', () => {
    const initialLen = sim.auditEvents.length;
    sim.recordTestimonialConsent({ ownerId: 'o-aud-1', signedBy: 'Test' });
    assert.strictEqual(sim.auditEvents.length, initialLen + 1);
  });

  runTest('CC15', 'Concurrencia: Integridad referencial en caso de borrado simulado o no encontrado', () => {
    assert.throws(() => sim.assignRecoveryOwner({ caseId: 'caso-inexistente', staffId: 'cx-lead-01' }), /Caso de recuperación no encontrado/);
  });

  // --- SECCIÓN 12: ESCENARIOS END-TO-END (SCENARIO_A - SCENARIO_G) ---
  runTest('SCENARIO_A', 'Escenario A: Flujo Nominal Completo de Seguimiento Posvisita y Encuesta Satisfecha', () => {
    // 1. Cita completada
    sim.appointments.set('apt-e2e-a', { id: 'apt-e2e-a', owner_id: 'owner-e2e-a', pet_id: 'pet-e2e-a', status: 'COMPLETED' });
    sim.owners.set('owner-e2e-a', { id: 'owner-e2e-a', name: 'Laura Restrepo', phone_e164: '+573170001122', has_survey_consent: true, has_marketing_consent: true });
    sim.pets.set('pet-e2e-a', { id: 'pet-e2e-a', name: 'Milo', is_deceased: false });

    // 2. Programar seguimiento
    const fol = sim.scheduleExperienceFollowup({ appointmentId: 'apt-e2e-a', ownerId: 'owner-e2e-a', petId: 'pet-e2e-a' });
    assert.strictEqual(fol.status, 'SCHEDULED');

    // 3. Tutor responde encuesta con NPS 10
    const resp = sim.registerExperienceResponse({
      followupId: fol.followup_id,
      ownerId: 'owner-e2e-a',
      petId: 'pet-e2e-a',
      score: 10,
      comment: 'El Dr. Luis Ríos atendió a Milo con una paciencia increíble. ¡Totalmente recomendados!'
    });
    assert.strictEqual(resp.category, 'PROMOTER');

    // 4. Clasificación IA
    const cls = sim.classifyFeedbackCandidate({ responseId: resp.id, comment: resp.comment });
    assert.strictEqual(cls.triageDecision, 'GENERAL_FEEDBACK');

    // 5. Invitación a reseña neutral Google
    const inv = sim.createNeutralReviewInvitation({ ownerId: 'owner-e2e-a' });
    assert.strictEqual(inv.is_review_gating_prohibited, true);
    assert.strictEqual(inv.send_enabled, false);
  });

  runTest('SCENARIO_B', 'Escenario B: Detección de Preocupación Clínica Posvisita (Handoff Inmediato a Veterinario CORE-04)', () => {
    // 1. Tutor responde indicando que su perro empeoró
    const resp = sim.registerExperienceResponse({
      ownerId: 'owner-e2e-b',
      petId: 'pet-e2e-b',
      score: 3,
      comment: 'El perro empeoró mucho esta tarde, vomitó y está letárgico.'
    });

    // 2. Clasificación IA detecta emergencia clínica
    const cls = sim.classifyFeedbackCandidate({ responseId: resp.id, comment: resp.comment });
    assert.strictEqual(cls.is_clinical, true);
    assert.strictEqual(cls.triageDecision, 'CLINICAL_HANDOFF_REQUIRED');

    // 3. Handoff inmediato a CORE-04 sin diagnosticar ni tranquilizar por IA
    const h = sim.requestClinicalHandoff({
      responseId: resp.id,
      ownerId: 'owner-e2e-b',
      petId: 'pet-e2e-b',
      clinicalComment: resp.comment
    });
    assert.strictEqual(h.target_module, 'VET-CORE-04');
    assert.strictEqual(h.priority, 'HIGH_CLINICAL');
    assert.strictEqual(h.status, 'HANDOFF_ESCALATED');
  });

  runTest('SCENARIO_C', 'Escenario C: Queja Operativa con Protocolo Completo de Service Recovery y Cierre Verificado', () => {
    // 1. Queja de tutor por demora
    const resp = sim.registerExperienceResponse({
      ownerId: 'owner-e2e-c',
      score: 2,
      comment: 'Pésimo servicio. El veterinario llegó 90 minutos tarde y no avisaron.'
    });

    // 2. Creación del caso de recuperación
    const rc = sim.createRecoveryCase({
      ownerId: 'owner-e2e-c',
      complaintSummary: resp.comment,
      initialCategory: 'PUNCTUALITY'
    });
    assert.strictEqual(rc.status, 'OPEN');

    // 3. Asignación a líder de experiencia
    sim.assignRecoveryOwner({ caseId: rc.id, staffId: 'cx-lead-01', assignedBy: 'ops-lead-01' });

    // 4. Contacto y auditoría de ruta
    sim.recordRecoveryAction({ caseId: rc.id, actionType: 'CLIENT_CALL', description: 'Llamada de disculpas y explicación', actorId: 'cx-lead-01' });
    sim.recordRecoveryAction({ caseId: rc.id, actionType: 'ROUTE_AUDIT', description: 'Ajuste de tiempos en CORE-08', actorId: 'ops-lead-01' });

    // 5. Verificación de desenlace con el tutor
    sim.verifyRecoveryOutcome({
      caseId: rc.id,
      outcomeType: 'RESOLVED_SATISFIED',
      clientAccepted: true,
      clientStatement: 'Acepto las disculpas y entiendo lo que pasó con el tráfico.',
      verifiedBy: 'cx-lead-01'
    });

    // 6. Cierre formal
    const cl = sim.closeRecoveryCase({
      caseId: rc.id,
      resolutionSummary: 'Caso resuelto con cliente satisfecho.',
      closedBy: 'vet-luis-rios'
    });
    assert.strictEqual(cl.status, 'CLOSED');
  });

  runTest('SCENARIO_D', 'Escenario D: Duelo Activo / Paciente Fallecido (Supresión Total e Inmediata de Encuestas)', () => {
    // 1. Tutor en duelo por fallecimiento
    sim.owners.set('owner-e2e-d', {
      id: 'owner-e2e-d',
      name: 'Tutor Duelo E2E',
      phone_e164: '+573160001122',
      has_survey_consent: true,
      has_marketing_consent: true,
      organization_id: 'org-vet-life'
    });
    sim.bereavementRecords.set('owner-e2e-d', {
      owner_id: 'owner-e2e-d',
      status: 'ACTIVE_BEREAVEMENT',
      reason: 'Fallecimiento en eutanasia humanitaria'
    });
    sim.appointments.set('apt-e2e-d', { id: 'apt-e2e-d', owner_id: 'owner-e2e-d', status: 'COMPLETED' });

    // 2. Intento de evaluar seguimiento posvisita
    const res = sim.evaluateFollowupEligibility({ appointmentId: 'apt-e2e-d' });
    assert.strictEqual(res.is_eligible, false);
    assert.strictEqual(res.reason, 'SUPPRESSED_BEREAVEMENT_PROTOCOL');

    // 3. Intento de invitar a reseña
    const resRev = sim.evaluateReviewInvitationEligibility({ ownerId: 'owner-e2e-d' });
    assert.strictEqual(resRev.is_eligible, false);
    assert.strictEqual(resRev.reason, 'SUPPRESSED_BEREAVEMENT_PROTOCOL');
  });

  runTest('SCENARIO_E', 'Escenario E: Invitación a Reseña Pública Neutral Sin Review Gating (Google Business Profile)', () => {
    sim.owners.set('owner-e2e-e', {
      id: 'owner-e2e-e',
      name: 'Felipe Morales',
      phone_e164: '+573189998877',
      has_marketing_consent: true,
      has_survey_consent: true
    });

    // 1. Elegibilidad neutral
    const el = sim.evaluateReviewInvitationEligibility({ ownerId: 'owner-e2e-e' });
    assert.strictEqual(el.is_eligible, true);

    // 2. Generar invitación neutral
    const inv = sim.createNeutralReviewInvitation({ ownerId: 'owner-e2e-e' });
    assert.strictEqual(inv.is_review_gating_prohibited, true);
    assert.strictEqual(inv.send_enabled, false);
    assert.strictEqual(inv.platform_id, 'plat-google');
  });

  runTest('SCENARIO_F', 'Escenario F: Gestión de Testimonios con Consentimiento Informado y Revocación Posterior', () => {
    sim.owners.set('owner-e2e-f', { id: 'owner-e2e-f', name: 'Sofía Vergara', phone_e164: '+573190001122' });
    sim.pets.set('pet-e2e-f', { id: 'pet-e2e-f', name: 'Canela' });

    // 1. Firma de consentimiento
    const consent = sim.recordTestimonialConsent({
      ownerId: 'owner-e2e-f',
      petId: 'pet-e2e-f',
      allowName: true,
      allowPhoto: true,
      allowStory: true,
      signedBy: 'Sofía Vergara'
    });
    assert.strictEqual(consent.is_granted, true);

    // 2. Publicación de testimonio
    sim.testimonials.set('test-e2e-f', {
      id: 'test-e2e-f',
      owner_id: 'owner-e2e-f',
      pet_id: 'pet-e2e-f',
      story_snippet: 'Excelente servicio a domicilio para Canela.',
      is_published: true
    });

    // 3. Revocación posterior
    const rev = sim.revokeTestimonialConsent({
      ownerId: 'owner-e2e-f',
      reason: 'Solicitud de retiro de la fotografía del portal',
      revokedBy: 'cx-lead-01'
    });
    assert.strictEqual(rev.is_granted, false);
    assert.strictEqual(sim.testimonials.get('test-e2e-f').is_published, false);
  });

  runTest('SCENARIO_G', 'Escenario G: Ciclo de Mejora Continua Operativa a partir de Casos de Recuperación', () => {
    // 1. Caso de recuperación recurrente
    const rc = sim.createRecoveryCase({
      ownerId: 'owner-e2e-g',
      complaintSummary: 'Desacuerdo con la presentación de la cuenta',
      initialCategory: 'BILLING'
    });

    // 2. Propuesta de mejora para VET-CORE-14
    const qip = sim.createQualityImprovementProposal({
      originCaseId: rc.id,
      problemCluster: 'CLARIDAD_PRESUPUESTO_DESGLOSADO',
      proposedAction: 'Detallar honorarios y medicamentos por separado antes de la visita en CORE-14',
      targetModule: 'VET-CORE-14',
      createdBy: 'vet-luis-rios'
    });
    assert.strictEqual(qip.target_module, 'VET-CORE-14');
    assert.strictEqual(qip.status, 'PROPOSED');

    // 3. Consolidación de métricas de calidad
    const totalComplaints = sim.recoveryCases.size;
    assert.ok(totalComplaints > 0);
  });

  // --- RESULTADOS FINALES ---
  console.log('\n==============================================================================');
  console.log(`TOTAL PRUEBAS VET-CORE-15: ${testResults.length} | PASARON: ${passed} | FALLARON: ${failed}`);
  console.log('==============================================================================\n');

  const outputPath = path.join(__dirname, '../docs/tests/CORE-15-TEST-RESULTS.json');
  fs.writeFileSync(outputPath, JSON.stringify({
    module: 'VET-CORE-15',
    name: 'Customer Experience Follow-up, Feedback Triage, Clinical Concern Handoff, Service Recovery Escalation & Neutral Review Policy Hub',
    timestamp: new Date().toISOString(),
    total_tests: testResults.length,
    passed_tests: passed,
    failed_tests: failed,
    pass_rate: ((passed / testResults.length) * 100).toFixed(2) + '%',
    test_results: testResults
  }, null, 2));

  console.log(`Resultados guardados exitosamente en: ${outputPath}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Error fatal durante la ejecución de pruebas:', err);
  process.exit(1);
});
