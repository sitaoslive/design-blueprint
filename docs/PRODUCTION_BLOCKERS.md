# Production blockers
- PROMPT 17 STATUS (2026-11-22): Conexión unificada GitHub ↔ Lovable ↔ Antigravity verificada. Holds atómicos de agendamiento (`create_appointment_hold`), puente asistido OKVET (`submit_okvet_human_confirmation`), motor Live Dispatch (18 capacidades ETA) y 22 flujos n8n ya implementados en el backend de Antigravity. Bloqueos de producción remanentes estrictamente documentados:
  1. Aprovisionamiento de credenciales vivas de Meta WhatsApp Business (WABA token en producción).
  2. API Key de Google Maps Routes con tráfico en tiempo real.
  3. OAuth de Google Calendar para sincronización bidireccional de médicos.
  4. Pasarela de pagos bancarios automatizada (actualmente operando bajo conciliación manual de transferencias).
  5. Modo seguro (`send_enabled: false`) activo por diseño hasta la aprobación formal de lanzamiento por el Dr. Luis Eduardo Ríos.

- The three additional role-disclosure paths are now gated by caller identity/director authorization, tested as client/anonymous/admin/auxiliary. Administrators alone no longer receive clinical authority; direct dose writes are guarded. See qa/PRIVACY_ACADEMY_JOURNEYS_2026-11-21.md. This is not a complete penetration test.
- Academy official publication, protected scoring, assignments, practical competency and credential contracts remain unavailable. Automated local support cannot certify or repair remote providers without authorized observability/repair contracts.
- Academy ordered plans/person/date, audience-filtered progress, linked revisions and local assessment rehearsal are verified preparations only (qa/ACADEMY_CONTINUATION_2026-11-21.md; 116-case P11 matrix). They do not remove any official authority/provider blocker.
- The nine selected backend findings (three wide reads, five role-oracle functions, field-file reassignment revocation) were fixed and tested: qa/SELECTED_SECURITY_2026-11-21.md. This does not certify unrelated security checks or production readiness.
- Atomic booking/holds and official OKVET confirmation.
- WhatsApp/calendar/maps/ETA/transcription/payment/invoice providers.
- Protected executive, financial, inventory/configuration/import, documentary and Academy authorities.
- Versioned recovery/monitoring/business approval and complete A–L acceptance.
- Original detailed P1–P3/170 tests and remaining screen/control/error-path evidence.
See integrations/ANTIGRAVITY_HANDOFF.md and qa/P14_AUDIT_2026-11-21.md. No production readiness claimed.