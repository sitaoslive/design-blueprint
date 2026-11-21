# Registro de módulos backend
| Módulo | Entidades | Servicio / RPC | Permisos | Estado |
|---|---|---|---|---|
| Quality & Experience (P10) | sources: conversations, service_requests, visits, incidents, referral_cases, referral_reminders; records quality_*_draft | saveQualityDraft (immutable draft only), protected contracts pending | draft scope director; existing RLS for sources | Existing reads and reserved drafts integrated; official state/consent/publication authority pending |
| Identity & Access | profiles, user_roles | handle_new_user, has_role, has_any_role; MFA TOTP (auth) | dirección otorga roles | Real |
| Customers & Pets | pets, client_settings | tablas + RLS | dueño / staff | Real |
| Caregivers | pet_caregivers | is_caregiver_of | por mascota | Real |
| Customer Memory | records memoria_* | — | staff | Real |
| Appointments / Quick booking | visits, records bloqueo | guard_client_visit | staff / cliente | Real |
| Workforce / Shifts | staff_members, shifts, records solicitud_* | — | ops aprueba | Real |
| Routes | visits + records ruta_* | — | ops | Real (sin mapas) |
| Simulator | simulations | trigger de aprobación | ops / dirección | Real |
| Specialists & Referrals | specialists, referrals, specialist_reports, records rem_* | my_specialist_name, can_refer | mínimo privilegio | Real |
| Finance | payments, records pago_informado | — | finanzas | Real (sin pasarela) |
| AI Assistant Tools | approvals | aiTriage (createServerFn + AI Gateway) | ops/dirección; humano confirma | Real |
| Consultant | — | consultant_metrics() | agregado | Real |
| OKVET / WhatsApp / n8n / Calendar / Maps | integrations | — | registrado | No conectado |
