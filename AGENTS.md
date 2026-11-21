<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules
- `src/lib/vf/store.ts` is the single client store: area layouts hydrate it from Lovable Cloud (`db.ts` loadAll) after the role guard in `session.ts`, and every action updates locally then writes the row; RLS decides what each role sees. Seed data lives in the migration; `data.ts` holds typed sample data that seeds the initial store state and demo mode.
- Roles live in `public.user_roles` (first signup = luis+administrador, later = cliente); only directors grant roles; why: no self-escalation.
- Business rules (absence coverage, autonomy index, COP formatting) live as pure functions in `src/lib/vf/` with tests in `src/test/`; why: keep rules testable apart from UI.
- Each role area (`/luis`, `/coordinacion`, `/cliente`, `/equipo`, `/auxiliar`) is a layout route using `AppShell`; secondary modules resolve through `$modulo` + `components/vf/pages/registry.tsx`; why: one place to add modules per role.
- Traceability docs live in `/docs` (ledger, integrations, continuation); update them when scope changes.
- Every screen from the specs is registered in `src/lib/vf/screens.ts` (id, spec path, role, status, `href` to the functional page); spec prefixes (`/app`, `/auxiliar`, `/operaciones`, `/direccion`, `/admin`, `/cuidador`, `/especialista`, `/equipo`) use splat routes rendering `ScaffoldPage` until a dedicated page exists; why: whole structure navigable while screens are filled in batches. When building a screen, set its `href`/status in the registry.
- Registry screens without a dedicated route render real-data pages via `components/vf/screens/{client,admin,other,ops}.tsx` (pattern → component, checked first in `ScaffoldPage`); org config lives in `org_settings` (key → jsonb) and client prefs/consents/addresses in `client_settings`; why: fill splat screens without new route files.
- Caregiver access is per pet via `pet_caregivers` (owner links a caregiver by their user-id code); external specialists use role `especialista` + `specialists.user_id` and see only referrals naming them; why: least-privilege access without exposing other clients.
- Shared UI lives in `src/components/vf/shared` (spec 16 library: cards, states, timelines, modals); import from there before writing a new card/state; why: avoid near-duplicate components.
- Agenda simulator: pure `src/lib/vf/sim.ts` (SIM-01..10, state machine) + `simulations` table whose trigger only allows `ejecutado` after `aprobado` by a director; why: simulation never touches real visits until approved.
- Reception/finance/support/consultant portals (`/recepcion`, `/finanzas`, `/soporte`, `/consultor`) reuse ops/admin pages via `screens/roles.tsx`; consultant data only through the aggregated `consultant_metrics()` function; why: no admin permission inheritance.
- PROMPT 01C screens resolve in `screens/c01.tsx` (checked first in `ScaffoldPage`); entities without their own table use the generic `records` table (kind, scope staff|director|client, ref_id) via `screens/records.tsx`; why: real persistence without one table per minor entity.
- AI priority suggestions run server-side in `src/lib/vf/triage.functions.ts` (AI Gateway, ops/director only) with rules as fallback; a human confirms every decision; why: AI never acts on its own.
- Appointment status changes go through `src/lib/vf/visitState.ts` and the `visits_state_guard` trigger (confirming requires `okvet_ref`); domain events are written only by DB triggers into `event_outbox`; why: rules enforced server-side and events never emitted for failed writes.
- `/demo` enters a role area without login via a sessionStorage flag read in `guardArea`; it loads seed data only (store `loaded` stays false, so nothing is written); why: show each role's UI without exposing real accounts or data.
- WhatsApp concierge: rules in `src/lib/vf/concierge.ts` (intents, clinical safety, replies only from approved `knowledge_articles`); DB triggers enforce human takeover (AI blocked), conversation state machine + version, and outbound policy (suppression, template approval, 24 h window, real send off unless `external_notifications_enabled`); why: the model or UI can never bypass safety or send for real.
- Scheduling (Prompt 05): pure domain in `src/features/scheduling/domain` (engine, replacement, capacity, recurrence, waitlist, holds) with tests in `src/test/scheduling.test.ts`; UI reads it through `adapters/useSchedulingContext`; proposals never move visits (replacements go to `approvals`), and real holds/atomic booking stay backend-owned; why: one constraint evaluator shared by booking, replacements and the simulator.
- Field operations (Prompt 06): pure domain in `src/features/field-operations/domain` tested in `src/test/field-operations.test.ts`; pages resolve via `fieldPage()` checked first in `ScaffoldPage`; visit execution lives in `visit_executions` (trigger `guard_visit_execution` enforces transitions, roles, version, reason, prep), supplies are reserved/consumed only via `reserve_supply`/`settle_reservation` RPCs, internal chat in `staff_messages`; handovers, day closes and field collections use `records`; offline queue (localStorage, 24 h purge) only holds non-official actions; why: server is the authority, execution stays separate from appointment status and payment.
- Simulator decision layer (Prompt 07): pure `src/features/simulator/domain` (snapshot, freshness, hard constraints, alternatives, scoring profiles, affected clients, execution plan) over `src/lib/vf/sim.ts`, tested in `src/test/simulator-p07.test.ts`; snapshot saved in `simulations.params.snapshot`, execution blocked when STALE; why: decisions explainable and never executed on stale data.
- Referral hub (Prompt 08): pure `src/features/referrals/domain` + tests; server authority `referral_cases` + trigger `guard_referral_case` (transitions, clinical vs ops actor, version, evidence, live offers, client choice) replace the earlier `records` referral kinds; clients read offers only via `my_referral_offers()` and answer in `referral_choices`; reminders in `referral_reminders` (staff, no aux); why: rules enforced server-side.
