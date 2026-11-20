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
- Each role area (`/luis`, `/coordinacion`, `/cliente`, `/equipo`) is a layout route using `AppShell`; secondary modules resolve through `$modulo` + `components/vf/pages/registry.tsx`; why: one place to add modules per role.
- Traceability docs live in `/docs` (ledger, integrations, continuation); update them when scope changes.
