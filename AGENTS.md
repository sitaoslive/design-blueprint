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
- `src/lib/vf/store.ts` is the single client store: area layouts hydrate it from Lovable Cloud (`db.ts` loadAll) after the role guard in `session.ts`, and every action updates locally then writes the row; RLS decides what each role sees. Seed data lives in the migration; `data.ts` only types/fallback for tests.
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
