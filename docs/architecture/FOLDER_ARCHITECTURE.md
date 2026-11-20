# Arquitectura de carpetas (equivalencias con PROMPT 01C §10–16)
El proyecto ya tenía una estructura modular; no se duplicaron carpetas vacías (regla de 01C).

| 01C | Este proyecto |
|---|---|
| src/app/routing, layouts, guards | src/routes (TanStack, un layout por rol) + src/lib/vf/session.ts (guardas por rol) |
| src/components/ui, shared | src/components/ui (shadcn), src/components/vf/ui.tsx, src/components/vf/shared |
| src/features/* | src/components/vf/screens/{client,admin,ops,other,aux,roles,sim,c01}.tsx + src/lib/vf/* (reglas puras) |
| src/services/events, integrations | src/services/events/contracts.ts, src/services/integrations/registry.ts |
| supabase/functions/* | No se usan Edge Functions: lógica de servidor con createServerFn (ej. src/lib/vf/triage.functions.ts) y RLS/triggers SQL |
| supabase/tests/rls | docs/database/RLS_MATRIX.md + pruebas en src/test |
| integrations/contracts, automation/n8n/contracts | integrations/contracts/README.md, automation/n8n/contracts/README.md |
| tests/* | src/test (Vitest); pruebas de navegador con Playwright ejecutadas en la sesión |
| .github/workflows | .github/workflows/ci.yml |
| config/environments | config/environments/.env.example (sin secretos) |
