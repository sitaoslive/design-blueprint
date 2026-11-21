# Access-rule flow sweep — 2026-11-21

## Rule and change boundary
People may inspect only the accounts, operational records and private visit evidence they are authorized to access. Losing a visit assignment must prevent new access to its evidence, including for the original uploader. Authorized director oversight and unrelated standalone-file access remain available.

The user limited changes to nine specified scan findings. Those fixes and statuses remain unchanged. This follow-up **does not change other permissions, settings, example data, or settled records**. Three related unselected role-query problems were confirmed and await permission to expand the fix scope. No new finding was dismissed or marked fixed.

## What was inspected now
Read current source access expressions for 39 directory/assignment consumers, the shared adapters and session/offline code; read all 40 related live database function definitions; read the field-evidence and client-document storage policies; read all four application server-function modules. Separate acquisition of data from rendering it: seeing a scoped array in a component is not independent end-to-end acceptance of every screen.

`SECURITY_FLOW_LOCATIONS.json` enumerates the exact consumer locations and live-function status. Related code was traced through the shared store, authenticated browser reads, protected server functions and direct database calls, not merely through the page first fixed.

## User-facing paths and code-read results
Every row below refers to the relevant access code inspected in this sweep. **CODE_READ** means no different read-authorization path was found; it is not a claim of a new full UI test.

| Screen/flow | Source | Rule result |
|---|---|---|
| Users and permissions; role toggles | components/vf/pages/admin.tsx; screens/c01.tsx:370–380 | CODE_READ: direct protected role-table reads/writes; director checks remain authoritative |
| Specialist-account links and staff-account links | screens/admin-extra.tsx:18–45,94–114; screens/ops.tsx:186–200 | CODE_READ: scoped directories and protected role-table management |
| Operational module switches | screens/p02.tsx:23–33 | CODE_READ: corrected feature-flags policy applies; no privileged read adapter |
| Client agenda, visit detail, professional detail and referral specialist selection | routes/cliente.agenda.tsx; screens/client.tsx:21–23,132–133,193 | CODE_READ: staff/specialist rows come from scoped hydration; relevant appointment/referral exceptions preserved |
| Coordination dashboard, agenda, appointment assignment, team list/detail, route list/detail | routes/coordinacion.index.tsx; pages/ops.tsx; screens/ops.tsx:71–159 | CODE_READ: shared scoped arrays, not a bypassing administrative client |
| Routes, reorganization, absence proposals | pages/modules.tsx:40–41,59–65,166–173 | CODE_READ: scoped staff sources; existing official-action blocks unchanged |
| Staff home, agenda, preparation and task lists | screens/aux.tsx; screens/ops.tsx:297–306; lib/vf/me.ts | CODE_READ: stable linked staff ID and active-participant filters; backend reads still authoritative |
| Legacy staff profile, visits, capacity, skills, shifts, simulations | screens/other.tsx:94–101,122–127,181–212 | CODE_READ: scoped sources; legacy first-staff presentation fallback remains unmodified and is not authorization |
| Visit commitments, day-close summaries, calendar sync/conflicts, shift requests, route detail, specialist grouping, employee training and setup health | screens/c01.tsx:116,161,183,213,251–294,339,443–457,523 | CODE_READ: scoped sources and existing guarded writes; no new account-role oracle here |
| Administration health/data counts | screens/admin.tsx:165–167 | CODE_READ: counts derive from caller-visible store rows |
| Simulator wizard, alternatives, execution review, profile comparison | screens/sim.tsx; lib/vf/sim.ts; lib/vf/simAdvanced.ts; features/simulator/domain/index.ts | CODE_READ: calculations use supplied scoped rows; official execution behavior outside the selected read findings was not changed |
| Complaints, complaint responsibility, standards, quality actions and operational sources | customer-experience/pages/Complaints.tsx,Quality.tsx; components/OfficialActions.tsx; adapters/sources.ts | CODE_READ: scoped store, account-reset source reads and protected quality commands |
| Luis agenda/current visit/patients, specialist reminders, team oversight | features/luis/LuisPages.tsx:26–30,43–57,76–79 | CODE_READ: own staff lookup explicitly uses user ID; director-wide authorized reads retained |
| Assistant chat, people filters, responsibilities, absence drafts, agenda/workload summaries | executive-assistant/components/ExecutiveChat.tsx; pages/ExecutivePages.tsx; application/queries.ts:63–94 | CODE_READ: useFinanceRows supplies account/role-stamped protected reads |
| Dispatch, professional filters, family tracking and visit duration | live-dispatch/components/Dispatch.tsx:32–55 | CODE_READ: account-stamped reads plus own-assignment/active-participant filters |
| Referral directory, specialist profile, hub, wizard and visit-referral panel | referrals/components/Directory.tsx,ReferralHub.tsx,Workflow.tsx | CODE_READ: scoped specialists/staff, not unscoped service-role directory reads |
| Availability search, capacity, replacements, quick appointment and monthly calendar | scheduling/adapters/useSchedulingContext.ts; components/SchedulerPages.tsx; domain/engine.ts,capacity.ts | CODE_READ: pure evaluation of supplied scoped data; no independent privileged reads |
| Importer administrative comparisons and visit-quality evaluation | system-administration/domain/import.ts:65–88 | CODE_READ: compares supplied rows and stable IDs; no role queries or privileged acquisition |
| Tasks and commitments; shared visit team/support; kits; academy; day-close and handovers | field-operations/components/AdvancedPages.tsx,FieldPages.tsx | CODE_READ: current staff/participant checks, protected read helpers and existing transitions |
| Payment evidence: staff/auxiliary collection forms and finance/operations review | field-operations/components/FieldExtras.tsx:66–97; FieldPages.tsx:132–134 | CODE_READ: every evidence button uses openFieldEvidence → field-evidence read policy → corrected can_read_field_file |
| Message attachments: staff/auxiliary/operations, visit/task threads and direct/broadcast messages | FieldExtras.tsx:100–134; FieldPages.tsx:135 | CODE_READ: same corrected download helper; upload metadata binds exact visit/task/recipient context |
| Private field file upload/download, failed-upload cleanup | field-operations/components/advancedData.ts:23–35 | CODE_READ: private bucket, metadata authorization, fresh five-minute signed link; no public URL |
| Client documents and staff document browser, implemented separately | screens/p02.tsx:70–106; live documentos policies | CODE_READ: owner or authorized ops/director/clinical access; distinct client documents are not reassigned visit evidence |
| Demo versions of the above | lib/vf/demoDb.ts; store.ts:72–80; session.ts:38–43 | CODE_READ: explicit synthetic adapter/identity only; no real authority inferred from demo roles |

## Shared data and background paths
- `lib/vf/db.ts:13–31`: ordinary authenticated reads, including staff and specialist directories, hydrate the single store. No administrative read client is used.
- `session.ts:26–54` and `store.ts:66–84`: current protected roles, empty real state, clear-before-denial and rehydrate on changed role sets.
- `finance/application/sources.ts:37–94`: polling data is stamped by user, roles, table and purpose; obsolete responses are cancelled and invisible.
- `customer-experience/adapters/sources.ts:33–94`: source polling resets for changed identity/roles and rejects late responses.
- `field-operations/components/advancedData.ts:8–16` and `FieldExtras.tsx:105–106`: existing field/message polling still uses protected database reads. These hooks lack the same account-stamped result wrapper as finance. Full account-switch/cache behavior was **not runtime-tested** here; it is not certified equivalent.
- `offlineQueue.ts:13–40,47–51`: account-specific drafts; replay checks the current owner before every write. No evidence uploads/downloads or role lookup is queued. Existing draft expiry and settled history are unchanged.
- `list_http_schedules` returned **no registered schedules**. Direct cron-internal inspection is unavailable through the query tool; no claim is made about unlisted SQL jobs or external n8n workflows. No job was edited or run.
- The four server-function modules were read: priority suggestions check only `context.userId` using has_any_role; import preparation and duration proposals check only that same identity using is_director; quality reads/commands use caller-scoped context and guarded quality functions. None exposes the helper’s arbitrary target parameter directly.

## Database-function sweep
All forty following live definitions were read in this sweep. Trigger functions are invoked by database writes, not treated as ordinary callable application endpoints just because an execute grant exists.

| Functions | Relevant result |
|---|---|
| has_role, has_any_role, is_ops, is_staff | FIXED previously: invoker reads respect protected role rows; prior real tests confirmed denial and director preservation |
| is_director | FIXED previously: explicit caller/authorized-director/service checks; raw self-check avoids policy recursion |
| can_read_field_file | FIXED previously: current assignment/active participation; uploader identity cannot bypass visit/task context |
| **is_clinical, can_refer, is_aux_only** | **FAIL, confirmed now with actual customer requests**: definer wrappers still accept another user ID and reveal role membership through nested helpers; outside the nine selected findings |
| aux_sees_pet, can_access_field_visit, can_see_visit | CODE_READ: target record access is bound to auth.uid()/linked staff; broader clinical visit visibility remains existing policy, distinct from stricter evidence access |
| consultant_metrics, inventory_availability | CODE_READ: caller’s own allowed role, aggregated outputs; no caller-selected account role query |
| field_billing_balance, field_day_pending, field_supplies_ready, field_task_transition | CODE_READ: current caller role and exact visit/staff/task assignment checks |
| reserve_supply, settle_reservation | CODE_READ: exact current visit access before reservation operation; no changes to inventory or settled reservations |
| quality_checked_command, quality_command, quality_family_cases | CODE_READ: verified caller identity, purpose/owner/role/version checks; public checked entry and owner-scoped sanitized family reads; internal command not granted directly |
| guard_advanced_task, guard_aux_record, guard_aux_visit, guard_client_visit | CODE_READ: current actor and assignment/role validation on writes; no other-account role lookup returned |
| guard_field_collection, guard_field_collection_contract, guard_field_day_close, guard_field_message_context | CODE_READ: current role, collection/visit/task/evidence context, immutable reported money and guarded day close |
| guard_handover_identity, guard_kit_assignment, guard_support_participant, guard_task_transfer_integrity | CODE_READ: linked actor, current assignments and guarded transfer; no returned role membership |
| guard_memory, guard_referral_case, guard_reserved_preparation, guard_simulation, guard_visit_execution | CODE_READ: current actor and purpose/state/version checks; existing private/official authority retained |

Field metadata SELECT and field-evidence SELECT both use the corrected helper. The separate owner-only field-file deletion/unlinked-object cleanup policies were read but left unchanged, as they are not the selected read-disclosure findings. Previously issued signed links are bearer grants until their five-minute expiry; the fix prevents new links after reassignment, not revocation of already-issued ones.

## New evidence and limitations
An isolated temporary customer account performed three read-only calls: is_clinical(known director), can_refer(known director), and is_aux_only(known auxiliary). All returned true, confirming additional account-role disclosure. This test changed no permissions or operational records. Results and reproduction are in `evidence/security-selected/alternate-role-results.json` and `scripts/security-selected/alternate_role_checks.py`. Temporary account cleanup is managed by the auth-session lifecycle; demo profiles were not touched.

Prior evidence remains valid and is not replaced by this code sweep: 61 live assertions for the selected fixes; 505 automated regression tests passed. The basic recheck reported no issues in its completed checks. The new deep task reported completion but returned the **earlier, stale deep-analysis timestamp**, so fresh deep coverage could not be verified; platform feedback was submitted. This is not penetration testing or exhaustive runtime acceptance of every listed screen.

## Next decision
Ask the user to authorize fixing the three additional role-query wrappers; do not change them under the original nine-finding limit. Account-switch behavior of the legacy polling hooks and complete storage/download runtime testing are separately unverified, not declared fixed.