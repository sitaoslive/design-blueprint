# PROMPT-010 · Quality, experience and loyalty · v10.0

## Actualización de autoridad interna — 2026-11-21
Esta matriz describe el lote inicial. QA-04/05/06/07/10, CRM-03/07/10 ahora tienen creación/transición/revisión/publicación **interna** según rol, versión e historial; evidencia y límites en P10_INTERNAL_2026-11-21.md. CRM-04/05/06/08/09 y entregas externas siguen parciales: permisos individuales no publican testimonios ni autorizan campañas. Las 29 operaciones conservan transporte no disponible cuando no hay implementación; 13 están conectadas a comandos/lecturas internos concretos. No se certifica la aceptación original completa.

Source: Writing_VET_FREEDOM_OS_-_PROMPT_10_VET_pasted.txt (1,717 lines), fully inspected. Existing master prompts, role layouts, memory, conversations, commitments, consent preferences, referrals, field execution and financial contracts were compared before adding the module. Original Parts 2/3 are not independently available as separate source files here; their complete acceptance coverage is not certified.

## Status vocabulary
FRONTEND READY and DOMAIN LOGIC READY refer to the implemented application layer. BACKEND CONTRACT READY means a typed contract exists, **not** an endpoint. SERVER AUTHORITY PENDING applies to official complaints, consent, reviews, survey publication/answers and improvement decisions. BACKEND INTEGRATED applies only to existing operational reads and director-only immutable drafts. EXTERNAL DELIVERY VERIFIED and PROCESS RESOLVED are not asserted.

## Requirement matrix
| ID | Screen | Component/service/rule | Contract/dependency | Evidence/status |
|---|---|---|---|---|
| QA-01 | /operaciones/calidad; /direccion/calidad; /operaciones/calidad/pendientes | QualityDashboard, useQualitySources, evaluateQualityFindings | getQualityOverview, listQualityFindings; source dates and approved escalation thresholds | Operational reads + local filter; domain tests. No invented clinical severity. |
| QA-02 | /operaciones/calidad/conversaciones | QualityConversations; direct original-chat link | Existing conversations; assignment through existing chat | FRONTEND READY; existing read integration; no second inbox. |
| QA-03 | /admin/calidad/ia | AssistantQuality; actual messages/questions | Review authority and approved-source linkage unavailable | Read-only review screen; sensitive verdict persistence blocked. No external AI calls. |
| QA-04 | /operaciones/quejas(/nueva,/:id) | ComplaintList/Create/Detail; draft schema, association checks | createComplaint, getQualityCase, getComplaintTimeline | Real director-only drafts; demo machine. Official creation/roles/state authority pending. |
| QA-05 | /operaciones/calidad/escalamientos | prepareEscalation; clinical actor vs operational due date | requestComplaintEscalation | DOMAIN LOGIC READY; official escalation/assignment pending. |
| QA-06 | /operaciones/quejas/:id | ComplaintDetail, AuditTimeline, transitionComplaint | assignComplaint, submitResolutionProposal, recordResolutionEvidence | Demo transitions record actor/reason/version/evidence; closed and reopened rules tested. Real official transitions disabled. |
| QA-07 | /admin/encuestas(/nueva,/:id); /app/encuestas/:id | SurveyBuilder, Surveys, CustomerSurvey; calculateSurveyMetrics | createSurveyDraft, publishApprovedSurvey, getSurveyResponses/Metrics | Director draft save + reload verified. Synthetic mobile answer verified. Official publication, invitations and answers pending. |
| QA-08 | /operaciones/calidad/duelo | SensitiveContext; eligibility engine | Existing CEM; verified authorized context | DOMAIN LOGIC READY; links to original memory. No new grief tags, no marketing segmentation. |
| QA-09 | /operaciones/calidad/causas; /patrones | QualityPatterns, groupOperationalFindings | getRootCauseFindings; historical data + human cause verification | Grouping/filter UI and domain rules; no causal conclusion. Full historical comparison/confirmed cause authority pending. |
| QA-10 | /operaciones/calidad/mejoras; /admin/calidad/procedimientos-correctivos | Improvements, validateImprovementTransition, prepareCorrectiveAction | createCorrectiveAction; approval + evidence + post-period measurements | Immutable director proposal; demo transition evaluator. Official changes, audit and Academy procedure publication pending. |
| CRM-01 | /operaciones/clientes/:id/experiencia; /operaciones/fidelizacion | FamilyExperience, customerHealth | getCustomerJourneyQuality; existing pets/visits/CEM/chat | Source-backed journey without a second memory. Full shared commitment/referral lineage and official health overview pending. |
| CRM-02 | /operaciones/fidelizacion/recordatorios | Preventive, evaluatePreventiveReminder | getPreventiveFollowUps, prepareFollowUpRequest | Existing plans shown; no invented next-control dates or universal vaccination frequencies. Protected professional date/validity contract pending. |
| CRM-03 | /admin/contenido-educativo(/nuevo,/:id); /app/recursos | Education, approvedEducation | getApprovedEducationContent; clinical reviewer + expiry | Director draft + existing approved knowledge reads; only source/reviewer/date/validity-backed content in client library. Official publication/version review pending. |
| CRM-04 | /operaciones/fidelizacion/resenas; /testimonios | Reviews, validateReviewRequest, validateTestimonialConsent | prepareReviewRequest, getReviewRequestStatus | Neutral preview + eligibility; no review gating; history, testimonial permission management and external review URLs pending. |
| CRM-05 | /operaciones/fidelizacion/referidos | Reviews(referrals), validateReferralRequest | getReferralProgramStatus; approved programme/link/events | UI and no-third-party-marketing rule; authorised code/link generation, attribution and programme policy pending. |
| CRM-06 | /operaciones/fidelizacion/recuperacion | Recovery, evaluateRecoveryActions | getCustomerRecoveryOpportunities; existing finance adjustment request | Source-backed administrative opportunities; cancelled cases excluded; no discounts/refunds applied. Protected recovery agreement/history pending. |
| CRM-07 | /operaciones/fidelizacion/consentimientos; /app/notificaciones/preferencias | Eligibility; existing preference page | getConsentStatus/Suppressions; per-purpose channel/source/version | Legacy preferences are not presented as legal proof. Real per-purpose authorisation editor unavailable; no consent simulated as real. |
| CRM-08 | /operaciones/fidelizacion/frecuencia | evaluateFrequencyLimit, evaluateCommunicationEligibility | getCommunicationEligibility; server revalidation before delivery | Deterministic evaluator and synthetic controls; live missing data fails closed; official organisation limits/history pending. |
| CRM-09 | /operaciones/fidelizacion/instagram | Attribution | Approved attribution events/provider | Existing channel only; campaign attribution unknown. API integration blocked; no inferred Instagram conversions. |
| CRM-10 | /operaciones/fidelizacion/marca | BrandStandards | Approved organisational policy/version | Proposed standards visible; approval/publishing authority pending. |

## Related experiences
- Client help uses the original `service_requests` source and owner-constrained pet selection. It is an initial help request, not an official complaint or resolution. Real request acceptance verification recorded separately in QA evidence.
- Luis keeps his five-tab navigation; Quality and Continuity are secondary entries under Más. No role is added to real people.
- Coordinator and Reception can read existing allowed sources; new reserved drafts remain Director/Administration only. Auxiliary, external specialists and consultants do not gain access to private quality cases from frontend changes.
- Changes in appointments remain in the existing appointment/scheduler modules. Quality links to them; it never silently cancels, confirms or changes them.
- Compensation requests reuse Prompt 09; no discount, refund or professional incentive is created automatically.

## Workflows
| IDs | Mapping | Execution state |
|---|---|---|
| WF-015, WF-016 | complaint intake → human review → resolution evidence → legitimate reopening | Demo application + draft + typed contract; protected official workflow pending |
| WF-017 | sensitive CEM reference → suppress commercial/review/referral purpose | Evaluator ready; external sender revalidation pending |
| WF-018, WF3-044 | existing commitments → source-backed due-date monitoring | Existing reads; no second commitment system |
| WF-077, WF-078 | relationship/visit journey and optional service follow-up | Application proposals; no n8n execution |
| WF-079, WF-080 | verified professional plan + verified due date + no equivalent confirmed visit | Domain ready; complete authorised plan data contract pending |
| WF-081 | versioned survey + valid answer → CSAT/NPS + known denominators | Draft/demo verified; official invitation/response service pending |
| WF-082 | optional neutral review request, not gated by satisfaction | Contact evaluator; provider/policy/link/delivery pending |
| WF-083, WF-084 | open complaint → administrative recovery → evidence-backed resolution | Demo machine and real draft only; official recovery operations pending |
| WF-085, WF-086 | revocation + frequency + duplicate-event suppression | Rules tested; authoritative consent and outbound service pending |
| WF-013, WF-041 | abandoned/unfinished requests → recovery opportunities | Existing requests; no automatic reactivation of cancelled cases |
| WF-025–030 | purpose/channel/source/identity/authorised communications | Contract ready, no external execution |
| WF3-053, WF3-056 | original referral cases and reminders → continuity | Existing source integration; no external specialist bookings created |

## Contracts
`src/features/customer-experience/application/contracts.ts`: 29 proposed operations, request/response/error schemas, version, idempotency key, correlation, organisation, freshness, server authentication/authorization and audit requirements. Endpoint is null for each. Calling the disconnected gateway throws INTEGRATION_UNAVAILABLE; never returns fabricated success. Per-operation provider schemas and transport wiring must be reconciled with Antigravity before any official execution.

## Acceptance and remaining work
- 34 quality/loyalty/client paths registered in the separate hand-maintained catalog; generated registry is not edited. Four leaf route heads use app-specific quality names and descriptions.
- Deterministic rule coverage is in `src/test/customer-experience-p10.test.ts`; it does not certify every QA10/SUR10/COM10/CRM10/IMP10 criterion or original prompt acceptance.
- UI management for real consent histories, testimonial permissions, referral programme, approval reviews and sensitive case decisions remains dependent on protected APIs; unavailable actions do not imply completed functionality.
- Provider integrations, n8n, real WhatsApp, public reviews, attribution, official survey delivery, compensation execution and multi-device concurrency are BLOCKED, not verified.
- No schema changes, SQL migrations, duplicate memory/messaging/commitment engine or external sends were added for Prompt 10.