# VET FREEDOM OS — REFERRAL ROW LEVEL SECURITY (RLS)
## Políticas de Seguridad a Nivel de Fila (RLS) y Control de Acceso en PostgreSQL 17
**Módulo:** VET-CORE-11 | SPECIALIST COORDINATION  
**Migración:** `033_specialist_referrals_and_coordination_hub.sql`  
**Base de Datos:** PostgreSQL 17.12.0 (Supabase Managed)  

---

## 1. Estado de Blindaje de Tablas

En cumplimiento estricto con los estándares de seguridad de Vet Freedom OS, las 22 tablas introducidas en el subsistema de remisiones cuentan con `ROW LEVEL SECURITY` habilitado (`rowsecurity = true`) y políticas explícitas:

```sql
ALTER TABLE public.specialty_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_availability_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_availability_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_availability_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_option_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_option_offer_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_offer_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_external_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_appointment_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_appointment_cancellations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_attendance_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_document_access_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_document_access_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_report_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_report_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_escalations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialist_referral_audit ENABLE ROW LEVEL SECURITY;
```

---

## 2. Matriz de Permisos por Rol

| Entidad / Tabla | Rol `anon` | Rol `authenticated` (Staff) | Rol `veterinarian` | Rol `service_role` (n8n) |
|---|---|---|---|---|
| `specialty_catalog` | SELECT (Solo Activas) | SELECT | SELECT | ALL |
| `specialist_profiles` | Prohibido | SELECT (Verificados) | SELECT | ALL |
| `specialist_referrals` | Prohibido | SELECT / INSERT (DRAFT) | ALL (Aprobación/Revisión) | ALL |
| `specialist_referral_documents` | Prohibido | Prohibido (Confidencial) | ALL | ALL |
| `specialist_report_reviews` | Prohibido | SELECT | ALL (Solo Vet Habilitado) | ALL |
| `specialist_referral_audit` | Prohibido | SELECT (Solo Lectura) | SELECT (Solo Lectura) | INSERT |

---

## 3. Revocación de Permisos de Ejecución a `anon`

Para mitigar riesgos de inyección y ejecuciones no autorizadas, se revoca de manera total la ejecución de las funciones RPC para el rol anónimo:

```sql
REVOKE EXECUTE ON FUNCTION public.create_specialist_referral FROM anon;
REVOKE EXECUTE ON FUNCTION public.approve_specialist_referral FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_specialist_availability_response FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_and_dispatch_client_offer FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_client_slot_selection FROM anon;
REVOKE EXECUTE ON FUNCTION public.confirm_external_specialist_booking FROM anon;
REVOKE EXECUTE ON FUNCTION public.grant_external_document_access FROM anon;
REVOKE EXECUTE ON FUNCTION public.record_and_review_specialist_report FROM anon;
REVOKE EXECUTE ON FUNCTION public.close_specialist_referral_verified FROM anon;
```
