-- ==============================================================================
-- Migration: 017_security_advisors_tuning.sql
-- Description: Move pg_trgm to extensions schema and revoke execution on
--              internal event trigger function rls_auto_enable.
-- Module: Security Architecture
-- ==============================================================================

-- 1. MOVE pg_trgm TO extensions SCHEMA
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION "pg_trgm" SET SCHEMA extensions;

-- 2. REVOKE EXECUTION ON INTERNAL EVENT TRIGGER FUNCTION FROM WEB ROLES
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM anon, authenticated, public;
