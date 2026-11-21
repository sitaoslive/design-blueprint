# Antigravity integration handoff — v14

Application: existing TanStack Start/React app; browser state and presentation do not authorize transactions. Reuse existing Cloud, RLS, field execution, quality command, referral state and outbox authorities; no second infrastructure.

## Immediate backend review
| Dependency | Observed basis | Required result | Verification |
|---|---|---|---|
| AUTH-READ-SCOPE | SELECT true on staff_members/specialists/feature_flags | Least-privilege private column/row access or explicitly reviewed public-safe catalog | Family/aux/specialist/support cannot fetch private staff metadata; allowed directory fields still read |
| AUTH-ROLE-ORACLE | has_role/has_any_role/is_director/is_ops/is_staff accept arbitrary UUID | Caller-target checks without breaking policy helper uses | Unprivileged other-account requests rejected; own-role and director management checks still work |
| AUTH-FILE-REVOCATION | can_read_field_file accepts original uploader after reassignment | Current assignment-based authority for visit evidence with reviewed task/message exceptions | Withdrawn user cannot read metadata or create new signed URLs; active assignee/ops remain authorized |
| RELEASE-PROOF | No authoritative proof service | Authenticated immutable versioned checks, source reference, checkedAt/expiresAt, 17 gate results | Wrong version, missing/duplicate, stale/future/failed/untrusted proof never releases |

These findings are not marked fixed. Do not add migrations from Lovable. Keep existing schema/permission contracts intact until reviewed deployment from backend owner.

## Existing contract locations
`src/features/{finance,executive-assistant,customer-experience,system-administration,live-dispatch}/application/*contracts.ts`; `docs/architecture/API_CONTRACT_REGISTRY.md`; `src/services/events/contracts.ts`.

## Pending protected operations
| Operation | Caller and purpose | Expected input | Required output and side effects | Status |
|---|---|---|---|---|
| verifyPayment / reconcilePayment | Finance/director; establish distinct verified/reconciled facts | paymentId, evidence reference, expectedVersion, idempotencyKey, correlationId | Caller-authorized financial receipt, resulting version/state, audit reference; allocation atomic | BACKEND_PENDING |
| importOfficial / configurationPublish | Director; reviewed official change | metadata preparationId, source authority/evidence, expectedVersion, idempotencyKey, correlationId | Applied/rejected conflict result, versioned audit receipt; never use local CSV preview as clinical authority | BACKEND_PENDING |
| publishRoute / executeSimulation | Ops/director with per-operation approval | snapshot/version, approved plan, affected identities, consent references, idempotency/correlation | Atomic/recoverable result per step with revalidation and audit; no premature success | BACKEND_PENDING |
| activateAbsence / approveExecutiveAction | Director; approved scope/risk/delegation | actionId, approvalId, target entity/version, evidence, idempotency/correlation | Verified action receipt, permissions and audit; clinical actions prohibited | BACKEND_PENDING |
| adjustInventory / createInventoryProduct | Authorized inventory manager | catalog fields, approved reason, quantities/locations, expectedVersion, idempotency/correlation | Atomic ledger/balance receipt and audit; preserve reserve_supply/settle_reservation | BACKEND_PENDING |
| specialistShareDocument / externalConfirm | Assigned clinician/specialist/client per purpose | referral/document/offer IDs, exact recipients/consent, expiry/version, evidence | Authorized private delivery/confirmation receipt and history, not merely selection | BACKEND_PENDING |
| academyAssess / certifyCompetence | Assigned learner + reviewer | versioned approved evaluation and learner/submission IDs | Protected scoring/qualification evidence, expiry and audit; no answer-key exposure | BACKEND_PENDING |
| dispatchAppliedDuration / ETA / GPS / notify | Assigned staff/ops/family scoped | Visit ID/version, current approved duration or consented fresh observation | Verified source/time/version; missing remains unknown, external delivery separate | BACKEND_PENDING |

No HTTP endpoint or success payload is fabricated. All operation DTOs require backend agreement, including real methods, pagination and retention. Input validation cannot replace session and target authorization.

Errors: VALIDATION, UNAUTHENTICATED/401, FORBIDDEN/403, CONFLICT/409, STALE, RATE_LIMITED/429 (honor Retry-After), PROVIDER_FAILURE/5xx, OFFLINE, BACKEND_UNAVAILABLE. Retain recoverable drafts; never fallback to demo. Idempotent retries reuse a key only for identical canonical input. Return real operation/version/audit references and explicit partial results; accepted request is not verified completion.

Synthetic request example (proposal only): `{ "operationId":"verifyPayment", "paymentId":"qa-payment", "expectedVersion":3, "idempotencyKey":"qa-same-request", "correlationId":"qa-flow-G", "evidenceReference":"qa-bank-proof" }`. Not an actual provider or account record.

## Acceptance handoff
Use authorized staging, synthetic identities and fixtures. Test auth/target roles, stale version, duplicate retry, concurrent conflict, network failure, audit readback and cross-family denial. Execute A–L from `system-administration/domain/readiness.ts`; track every step PASS/FAIL/BLOCKED/NOT_RUN, never mark a blocked endpoint passed. Deploy only when 17 release gates reference one exact version, current proof and business approval.