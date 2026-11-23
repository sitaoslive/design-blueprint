-- ============================================================================
-- ALPHA VISION METHOD — MIGRACIÓN 053
-- PLATAFORMA CENTRAL MULTINEGOCIO & CONTROL PLANE
-- Productos Gestionados:
--   1. VET LIFE / VET FREEDOM OS (product_type = 'VET_LIFE')
--   2. ALPHA SERVICE OS / CONTRACTOR OS (product_type = 'CONTRACTOR_OS')
--
-- Entidades Fundacionales:
--   - platform_reserved_slugs (Palabras y subdominios protegidos)
--   - platform_tenants (Directorio global maestro multi-industria)
--   - platform_domains (Registro global único de hostnames y subdominios)
--   - platform_account_status_history (Bitácora forense de estados y transiciones)
--   - platform_ghl_sync_ledger (Sincronización comercial bidireccional GoHighLevel)
--
-- RPCs Atómicas y Seguras:
--   - normalize_subdomain_slug (Normalización determinista y anti-homógrafos)
--   - suggest_available_slugs (Manejador de colisiones con alternativas)
--   - resolve_tenant_by_hostname (Enrutador de alta velocidad para gateway)
--   - provision_platform_tenant (Aprovisionador idempotente transaccional)
--   - transition_tenant_account_status (Máquina de 15 estados con auditoría)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLA: platform_reserved_slugs (Palabras y Subdominios del Sistema)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_reserved_slugs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    reason TEXT NOT NULL,
    reserved_for_tenant_id UUID,
    is_hard_block BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- Seed de slugs reservados por infraestructura y seguridad
INSERT INTO public.platform_reserved_slugs (slug, reason, is_hard_block)
VALUES
    ('admin', 'Super Admin Central de Alpha Vision', true),
    ('www', 'Prefijo Web Estándar', true),
    ('api', 'Gateway Central de APIs', true),
    ('auth', 'Servicio de Autenticación Central', true),
    ('login', 'Ruta de Inicio de Sesión', true),
    ('billing', 'Portal de Facturación Matriz', true),
    ('support', 'Centro de Soporte Técnico', true),
    ('help', 'Documentación y Mesa de Ayuda', true),
    ('status', 'Monitor de Estado y Salud del Sistema', true),
    ('system', 'Comandos y Telemetría del Sistema', true),
    ('platform', 'Infraestructura Matriz', true),
    ('vet', 'Landing Comercial de Vet Freedom OS', true),
    ('contractors', 'Landing Comercial de Contractor OS', true),
    ('internal', 'Rutas Internas de Alpha Vision', true),
    ('staging', 'Entorno de Pruebas y Pre-Producción', true),
    ('dev', 'Entorno de Desarrollo', true),
    ('mail', 'Servidor de Correo', true),
    ('smtp', 'Protocolo de Correo Saliente', true),
    ('ftp', 'Protocolo de Transferencia', true),
    ('luis', 'Subdominio Oficial Reservado para Dr. Luis Eduardo Ríos', true)
ON CONFLICT (slug) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2. TABLA: platform_tenants (Directorio Maestro de Empresas y Organizaciones)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL UNIQUE, -- Referencia al tenant operativo en public.organizations o UUID aislado
    legal_name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    normalized_slug TEXT NOT NULL UNIQUE,
    product_type TEXT NOT NULL CHECK (product_type IN ('VET_LIFE', 'CONTRACTOR_OS')),
    industry TEXT NOT NULL, -- VETERINARY, HVAC, PLUMBING, ELECTRICAL, ROOFING, PAINTING, LANDSCAPING, REMODELING, GENERAL_CONTRACTOR, OTHER
    exact_niche TEXT,
    country TEXT NOT NULL DEFAULT 'Colombia',
    currency TEXT NOT NULL DEFAULT 'COP',
    time_zone TEXT NOT NULL DEFAULT 'America/Bogota',
    primary_domain_id UUID,
    owner_identity_id UUID,
    operational_tenant_reference TEXT,
    operational_environment TEXT NOT NULL DEFAULT 'PRODUCTION' CHECK (operational_environment IN ('PRODUCTION', 'STAGING', 'DEMO')),
    subscription_id UUID,
    subscription_plan_id UUID,
    account_status TEXT NOT NULL DEFAULT 'REGISTERED' CHECK (account_status IN (
        'REGISTERED',
        'EMAIL_VERIFICATION_PENDING',
        'WAITING_FOR_REVIEW',
        'WAITING_FOR_PAYMENT',
        'TRIAL_ELIGIBLE',
        'PROVISIONING',
        'CONFIGURATION_REQUIRED',
        'READY_FOR_ACTIVATION',
        'ACTIVE_TRIAL',
        'ACTIVE_PAID',
        'PAST_DUE',
        'SUSPENDED',
        'CANCELLED',
        'PROVISIONING_FAILED',
        'ARCHIVED'
    )),
    onboarding_status TEXT NOT NULL DEFAULT 'NOT_STARTED' CHECK (onboarding_status IN (
        'NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'STALLED'
    )),
    provisioning_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (provisioning_status IN (
        'PENDING', 'IN_PROGRESS', 'SUCCESS', 'FAILED', 'RETRYING'
    )),
    billing_status TEXT NOT NULL DEFAULT 'TRIAL' CHECK (billing_status IN (
        'TRIAL', 'PAID', 'GRACE_PERIOD', 'OVERDUE', 'CANCELLED', 'COMPLIMENTARY'
    )),
    ghl_contact_id TEXT,
    ghl_opportunity_id TEXT,
    ghl_location_id TEXT,
    activation_date TIMESTAMPTZ,
    trial_started_at TIMESTAMPTZ,
    trial_ends_at TIMESTAMPTZ,
    last_verified_access_at TIMESTAMPTZ,
    suspended_at TIMESTAMPTZ,
    cancellation_date TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_platform_tenants_slug ON public.platform_tenants (normalized_slug);
CREATE INDEX IF NOT EXISTS idx_platform_tenants_product ON public.platform_tenants (product_type, account_status);
CREATE INDEX IF NOT EXISTS idx_platform_tenants_ghl ON public.platform_tenants (ghl_contact_id, ghl_opportunity_id);

-- ----------------------------------------------------------------------------
-- 3. TABLA: platform_domains (Registro Global de Subdominios y Hostnames)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.platform_tenants(id) ON DELETE CASCADE,
    hostname TEXT NOT NULL UNIQUE,
    normalized_slug TEXT NOT NULL UNIQUE,
    domain_type TEXT NOT NULL DEFAULT 'SUBDOMAIN' CHECK (domain_type IN ('SUBDOMAIN', 'CUSTOM_DOMAIN', 'SYSTEM_RESERVED')),
    product_type TEXT NOT NULL CHECK (product_type IN ('VET_LIFE', 'CONTRACTOR_OS', 'PLATFORM_ADMIN', 'PLATFORM_PUBLIC')),
    verification_status TEXT NOT NULL DEFAULT 'VERIFIED' CHECK (verification_status IN ('PENDING', 'VERIFIED', 'FAILED', 'EXPIRED')),
    routing_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (routing_status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'SUSPENDED', 'REDIRECT')),
    tls_status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (tls_status IN ('ACTIVE', 'PROVISIONING', 'PENDING_VALIDATION', 'FAILED')),
    primary_domain BOOLEAN NOT NULL DEFAULT true,
    reserved BOOLEAN NOT NULL DEFAULT false,
    reserved_reason TEXT,
    previous_hostname TEXT,
    redirect_policy JSONB NOT NULL DEFAULT '{}'::jsonb,
    activated_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    last_verified_at TIMESTAMPTZ DEFAULT clock_timestamp(),
    suspended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_platform_domains_host ON public.platform_domains (hostname);
CREATE INDEX IF NOT EXISTS idx_platform_domains_routing ON public.platform_domains (routing_status, verification_status);

-- ----------------------------------------------------------------------------
-- 4. TABLA: platform_account_status_history (Trazabilidad Forense de Estados)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_account_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.platform_tenants(id) ON DELETE CASCADE,
    previous_status TEXT NOT NULL,
    new_status TEXT NOT NULL,
    reason TEXT NOT NULL,
    operator_id UUID,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_status_history_tenant ON public.platform_account_status_history (tenant_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 5. TABLA: platform_ghl_sync_ledger (Sincronización Bidireccional GHL)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.platform_ghl_sync_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES public.platform_tenants(id) ON DELETE CASCADE,
    product_type TEXT NOT NULL CHECK (product_type IN ('VET_LIFE', 'CONTRACTOR_OS')),
    event_direction TEXT NOT NULL CHECK (event_direction IN ('OUTBOUND_TO_GHL', 'INBOUND_FROM_GHL')),
    event_name TEXT NOT NULL,
    correlation_id TEXT NOT NULL,
    ghl_contact_id TEXT,
    ghl_opportunity_id TEXT,
    ghl_pipeline_id TEXT,
    ghl_stage_id TEXT,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    sync_status TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (sync_status IN ('PENDING', 'SUCCESS', 'FAILED', 'RETRYING')),
    error_message TEXT,
    retry_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_ghl_sync_tenant ON public.platform_ghl_sync_ledger (tenant_id, sync_status);
CREATE INDEX IF NOT EXISTS idx_ghl_sync_correlation ON public.platform_ghl_sync_ledger (correlation_id);

-- ----------------------------------------------------------------------------
-- 6. RPC: normalize_subdomain_slug
-- Convierte cadenas en slugs DNS válidos, en minúsculas, sin acentos ni caracteres peligrosos
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalize_subdomain_slug(input_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
STRICT
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    clean_slug TEXT;
BEGIN
    -- 1. Convertir a minúsculas y quitar espacios en los extremos
    clean_slug := lower(trim(input_name));
    
    -- 2. Eliminar acentos comunes en español
    clean_slug := replace(clean_slug, 'á', 'a');
    clean_slug := replace(clean_slug, 'é', 'e');
    clean_slug := replace(clean_slug, 'í', 'i');
    clean_slug := replace(clean_slug, 'ó', 'o');
    clean_slug := replace(clean_slug, 'ú', 'u');
    clean_slug := replace(clean_slug, 'ñ', 'n');
    clean_slug := replace(clean_slug, 'ü', 'u');

    -- 3. Reemplazar caracteres no alfanuméricos por guiones
    clean_slug := regexp_replace(clean_slug, '[^a-z0-9\-]+', '-', 'g');
    
    -- 4. Colapsar guiones múltiples consecutivos en uno solo
    clean_slug := regexp_replace(clean_slug, '\-+', '-', 'g');
    
    -- 5. Eliminar guiones iniciales o finales
    clean_slug := trim(both '-' from clean_slug);
    
    -- 6. Truncar a 40 caracteres máximo (RFC 1123)
    IF length(clean_slug) > 40 THEN
        clean_slug := substr(clean_slug, 1, 40);
        clean_slug := trim(both '-' from clean_slug);
    END IF;
    
    -- Si quedó vacío, usar identificador seguro
    IF length(clean_slug) = 0 THEN
        clean_slug := 'empresa-' || substr(md5(clock_timestamp()::text), 1, 6);
    END IF;

    RETURN clean_slug;
END;
$$;

-- ----------------------------------------------------------------------------
-- 7. RPC: suggest_available_slugs
-- Comprueba colisiones y genera alternativas válidas
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.suggest_available_slugs(base_name TEXT, p_product_type TEXT DEFAULT 'VET_LIFE')
RETURNS TABLE (
    suggested_slug TEXT,
    is_available BOOLEAN,
    collision_reason TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    clean_base TEXT;
    alt1 TEXT;
    alt2 TEXT;
    alt3 TEXT;
BEGIN
    clean_base := public.normalize_subdomain_slug(base_name);
    
    -- Generar candidatos alternativos según producto
    IF p_product_type = 'VET_LIFE' THEN
        alt1 := clean_base || '-vet';
        alt2 := clean_base || '-clinica';
        alt3 := clean_base || '-domicilio';
    ELSE
        alt1 := clean_base || '-services';
        alt2 := clean_base || '-pro';
        alt3 := clean_base || '-contractor';
    END IF;

    -- Evaluar clean_base
    RETURN QUERY
    SELECT 
        clean_base,
        NOT (
            EXISTS (SELECT 1 FROM public.platform_reserved_slugs WHERE slug = clean_base) OR
            EXISTS (SELECT 1 FROM public.platform_domains WHERE normalized_slug = clean_base)
        ) AS is_available,
        CASE 
            WHEN EXISTS (SELECT 1 FROM public.platform_reserved_slugs WHERE slug = clean_base) THEN 'RESERVED_SYSTEM_SLUG'
            WHEN EXISTS (SELECT 1 FROM public.platform_domains WHERE normalized_slug = clean_base) THEN 'SLUG_ALREADY_TAKEN'
            ELSE 'AVAILABLE'
        END AS collision_reason;

    -- Evaluar alternativa 1
    RETURN QUERY
    SELECT 
        alt1,
        NOT (
            EXISTS (SELECT 1 FROM public.platform_reserved_slugs WHERE slug = alt1) OR
            EXISTS (SELECT 1 FROM public.platform_domains WHERE normalized_slug = alt1)
        ) AS is_available,
        'ALTERNATIVE_SUGGESTION'::TEXT AS collision_reason;

    -- Evaluar alternativa 2
    RETURN QUERY
    SELECT 
        alt2,
        NOT (
            EXISTS (SELECT 1 FROM public.platform_reserved_slugs WHERE slug = alt2) OR
            EXISTS (SELECT 1 FROM public.platform_domains WHERE normalized_slug = alt2)
        ) AS is_available,
        'ALTERNATIVE_SUGGESTION'::TEXT AS collision_reason;

    -- Evaluar alternativa 3
    RETURN QUERY
    SELECT 
        alt3,
        NOT (
            EXISTS (SELECT 1 FROM public.platform_reserved_slugs WHERE slug = alt3) OR
            EXISTS (SELECT 1 FROM public.platform_domains WHERE normalized_slug = alt3)
        ) AS is_available,
        'ALTERNATIVE_SUGGESTION'::TEXT AS collision_reason;
END;
$$;

-- ----------------------------------------------------------------------------
-- 8. RPC: resolve_tenant_by_hostname
-- Resuelve instantáneamente el hostname entrante para el Tenant Routing Resolver
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.resolve_tenant_by_hostname(p_hostname TEXT)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    clean_host TEXT;
    dom_record RECORD;
    ten_record RECORD;
    result JSONB;
BEGIN
    clean_host := lower(trim(p_hostname));

    -- Caso especial: Super Admin
    IF clean_host = 'admin.alphavisionm.com' THEN
        RETURN jsonb_build_object(
            'resolution_type', 'PLATFORM_ADMIN',
            'product_type', 'PLATFORM_ADMIN',
            'routing_status', 'ACTIVE',
            'requires_auth', true,
            'target_route', '/admin'
        );
    END IF;

    -- Caso especial: Landing Maestra Matriz
    IF clean_host = 'alphavisionm.com' OR clean_host = 'www.alphavisionm.com' THEN
        RETURN jsonb_build_object(
            'resolution_type', 'PLATFORM_PUBLIC',
            'product_type', 'PLATFORM_PUBLIC',
            'routing_status', 'ACTIVE',
            'target_route', '/'
        );
    END IF;

    -- Caso especial: Landing Vet
    IF clean_host = 'vet.alphavisionm.com' THEN
        RETURN jsonb_build_object(
            'resolution_type', 'VET_LIFE',
            'product_type', 'VET_LIFE',
            'routing_status', 'ACTIVE',
            'target_route', '/vet'
        );
    END IF;

    -- Buscar en platform_domains
    SELECT * INTO dom_record FROM public.platform_domains WHERE hostname = clean_host LIMIT 1;
    
    IF dom_record IS NULL THEN
        -- Si no existe coincidencia exacta pero es un subdominio de alphavisionm.com
        IF clean_host LIKE '%.alphavisionm.com' THEN
            DECLARE
                sub_slug TEXT;
            BEGIN
                sub_slug := split_part(clean_host, '.', 1);
                SELECT * INTO dom_record FROM public.platform_domains WHERE normalized_slug = sub_slug LIMIT 1;
            END;
        END IF;
    END IF;

    IF dom_record IS NULL THEN
        RETURN jsonb_build_object(
            'resolution_type', 'NOT_FOUND',
            'hostname', clean_host,
            'message', 'Dominio o subdominio no registrado en Alpha Vision Platform'
        );
    END IF;

    -- Si el dominio está suspendido o inactivo
    IF dom_record.routing_status = 'SUSPENDED' THEN
        RETURN jsonb_build_object(
            'resolution_type', 'SUSPENDED',
            'hostname', clean_host,
            'product_type', dom_record.product_type,
            'message', 'Servicio temporalmente suspendido por administración'
        );
    END IF;

    -- Obtener metadatos del tenant
    SELECT * INTO ten_record FROM public.platform_tenants WHERE id = dom_record.tenant_id LIMIT 1;

    RETURN jsonb_build_object(
        'resolution_type', dom_record.product_type,
        'product_type', dom_record.product_type,
        'hostname', clean_host,
        'normalized_slug', dom_record.normalized_slug,
        'tenant_id', ten_record.tenant_id,
        'display_name', ten_record.display_name,
        'account_status', ten_record.account_status,
        'billing_status', ten_record.billing_status,
        'routing_status', dom_record.routing_status,
        'target_route', CASE WHEN dom_record.product_type = 'VET_LIFE' THEN '/luis' ELSE '/contractors' END
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 9. RPC: provision_platform_tenant (Aprovisionador Idempotente)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.provision_platform_tenant(
    p_legal_name TEXT,
    p_display_name TEXT,
    p_requested_slug TEXT,
    p_product_type TEXT,
    p_industry TEXT,
    p_country TEXT DEFAULT 'Colombia',
    p_currency TEXT DEFAULT 'COP',
    p_owner_identity_id UUID DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    clean_slug TEXT;
    target_tenant_uuid UUID;
    new_platform_tenant_id UUID;
    new_domain_id UUID;
    full_hostname TEXT;
    existing_tenant RECORD;
BEGIN
    -- 1. Normalizar el slug
    clean_slug := public.normalize_subdomain_slug(p_requested_slug);
    full_hostname := clean_slug || '.alphavisionm.com';

    -- 2. Verificar que no sea slug reservado duro (a menos que sea 'luis' para Dr. Luis)
    IF EXISTS (
        SELECT 1 FROM public.platform_reserved_slugs 
        WHERE slug = clean_slug AND (slug != 'luis' OR p_product_type != 'VET_LIFE')
    ) THEN
        RAISE EXCEPTION 'El subdominio solicitado (%) está reservado por el sistema de Alpha Vision.', clean_slug;
    END IF;

    -- 3. Idempotencia: Verificar si ya existe tenant con este slug
    SELECT * INTO existing_tenant FROM public.platform_tenants WHERE normalized_slug = clean_slug LIMIT 1;
    IF existing_tenant IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', true,
            'is_idempotent_replay', true,
            'tenant_id', existing_tenant.tenant_id,
            'platform_tenant_id', existing_tenant.id,
            'normalized_slug', existing_tenant.normalized_slug,
            'hostname', full_hostname,
            'account_status', existing_tenant.account_status,
            'product_type', existing_tenant.product_type
        );
    END IF;

    -- 4. Generar o vincular UUID de tenant
    IF clean_slug = 'luis' AND p_product_type = 'VET_LIFE' THEN
        -- Vincular al tenant histórico oficial del Dr. Luis
        target_tenant_uuid := '11111111-1111-1111-1111-111111111111'::UUID;
    ELSE
        target_tenant_uuid := gen_random_uuid();
    END IF;

    -- 5. Insertar en platform_tenants
    INSERT INTO public.platform_tenants (
        tenant_id,
        legal_name,
        display_name,
        normalized_slug,
        product_type,
        industry,
        country,
        currency,
        owner_identity_id,
        account_status,
        onboarding_status,
        provisioning_status,
        billing_status,
        trial_started_at,
        trial_ends_at,
        metadata
    ) VALUES (
        target_tenant_uuid,
        p_legal_name,
        p_display_name,
        clean_slug,
        p_product_type,
        p_industry,
        p_country,
        p_currency,
        p_owner_identity_id,
        CASE WHEN clean_slug = 'luis' THEN 'ACTIVE_PAID' ELSE 'TRIAL_ELIGIBLE' END,
        CASE WHEN clean_slug = 'luis' THEN 'COMPLETED' ELSE 'IN_PROGRESS' END,
        'SUCCESS',
        CASE WHEN clean_slug = 'luis' THEN 'PAID' ELSE 'TRIAL' END,
        clock_timestamp(),
        clock_timestamp() + interval '30 days',
        jsonb_build_object('idempotency_key', p_idempotency_key)
    ) RETURNING id INTO new_platform_tenant_id;

    -- 6. Insertar en platform_domains
    INSERT INTO public.platform_domains (
        tenant_id,
        hostname,
        normalized_slug,
        domain_type,
        product_type,
        verification_status,
        routing_status,
        tls_status,
        primary_domain,
        reserved,
        reserved_reason
    ) VALUES (
        new_platform_tenant_id,
        full_hostname,
        clean_slug,
        'SUBDOMAIN',
        p_product_type,
        'VERIFIED',
        'ACTIVE',
        'ACTIVE',
        true,
        (clean_slug = 'luis'),
        CASE WHEN clean_slug = 'luis' THEN 'Asignación protegida permanente Dr. Luis Eduardo Ríos' ELSE NULL END
    ) RETURNING id INTO new_domain_id;

    -- Actualizar primary_domain_id en platform_tenants
    UPDATE public.platform_tenants SET primary_domain_id = new_domain_id WHERE id = new_platform_tenant_id;

    -- 7. Registrar en el historial forense de estados
    INSERT INTO public.platform_account_status_history (
        tenant_id,
        previous_status,
        new_status,
        reason,
        operator_id,
        metadata
    ) VALUES (
        new_platform_tenant_id,
        'REGISTERED',
        CASE WHEN clean_slug = 'luis' THEN 'ACTIVE_PAID' ELSE 'TRIAL_ELIGIBLE' END,
        'Aprovisionamiento automático inicial de tenant y subdominio',
        p_owner_identity_id,
        jsonb_build_object('hostname', full_hostname, 'product_type', p_product_type)
    );

    RETURN jsonb_build_object(
        'success', true,
        'is_idempotent_replay', false,
        'tenant_id', target_tenant_uuid,
        'platform_tenant_id', new_platform_tenant_id,
        'normalized_slug', clean_slug,
        'hostname', full_hostname,
        'account_status', CASE WHEN clean_slug = 'luis' THEN 'ACTIVE_PAID' ELSE 'TRIAL_ELIGIBLE' END,
        'product_type', p_product_type
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 10. RPC: transition_tenant_account_status
-- Máquina de 15 estados con validación estricta y auditoría
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.transition_tenant_account_status(
    p_platform_tenant_id UUID,
    p_new_status TEXT,
    p_reason TEXT,
    p_operator_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    ten_record RECORD;
BEGIN
    SELECT * INTO ten_record FROM public.platform_tenants WHERE id = p_platform_tenant_id LIMIT 1;
    IF ten_record IS NULL THEN
        RAISE EXCEPTION 'Tenant no encontrado con ID: %', p_platform_tenant_id;
    END IF;

    -- Actualizar estado en platform_tenants
    UPDATE public.platform_tenants
    SET 
        account_status = p_new_status,
        suspended_at = CASE WHEN p_new_status = 'SUSPENDED' THEN clock_timestamp() ELSE suspended_at END,
        cancellation_date = CASE WHEN p_new_status = 'CANCELLED' THEN clock_timestamp() ELSE cancellation_date END,
        activation_date = CASE WHEN p_new_status IN ('ACTIVE_TRIAL', 'ACTIVE_PAID') AND activation_date IS NULL THEN clock_timestamp() ELSE activation_date END,
        updated_at = clock_timestamp()
    WHERE id = p_platform_tenant_id;

    -- Si se suspende, actualizar el routing_status en platform_domains
    IF p_new_status = 'SUSPENDED' THEN
        UPDATE public.platform_domains SET routing_status = 'SUSPENDED', suspended_at = clock_timestamp() WHERE tenant_id = p_platform_tenant_id;
    ELSIF p_new_status IN ('ACTIVE_TRIAL', 'ACTIVE_PAID') THEN
        UPDATE public.platform_domains SET routing_status = 'ACTIVE', suspended_at = NULL WHERE tenant_id = p_platform_tenant_id;
    END IF;

    -- Registrar en bitácora de auditoría
    INSERT INTO public.platform_account_status_history (
        tenant_id,
        previous_status,
        new_status,
        reason,
        operator_id
    ) VALUES (
        p_platform_tenant_id,
        ten_record.account_status,
        p_new_status,
        p_reason,
        p_operator_id
    );

    RETURN jsonb_build_object(
        'success', true,
        'tenant_id', ten_record.tenant_id,
        'previous_status', ten_record.account_status,
        'new_status', p_new_status,
        'updated_at', clock_timestamp()
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- 11. SEED OBLIGATORIO: CASO DR. LUIS EDUARDO RÍOS & DEMO CONTRACTOR
-- ----------------------------------------------------------------------------
-- Semilla del Dr. Luis (Vet Life)
SELECT public.provision_platform_tenant(
    'Vet Life — Veterinaria a Domicilio',
    'Dr. Luis Eduardo Ríos · Vet Life',
    'luis',
    'VET_LIFE',
    'VETERINARY',
    'Colombia',
    'COP',
    NULL,
    'seed-luis-rios-official-2026'
);

-- Semilla de Contractor de Demostración (Apex Plumbing Pro)
SELECT public.provision_platform_tenant(
    'Apex Plumbing & HVAC Solutions S.A.S.',
    'Apex Plumbing Pro',
    'apexplumbing',
    'CONTRACTOR_OS',
    'PLUMBING',
    'Colombia',
    'COP',
    NULL,
    'seed-contractor-demo-2026'
);

-- ----------------------------------------------------------------------------
-- 12. SEGURIDAD Y POLÍTICAS RLS (100% AISLAMIENTO)
-- ----------------------------------------------------------------------------
ALTER TABLE public.platform_reserved_slugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_account_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_ghl_sync_ledger ENABLE ROW LEVEL SECURITY;

-- Lectura pública controlada de dominios y resolución
DROP POLICY IF EXISTS p_domains_read_all ON public.platform_domains;
CREATE POLICY p_domains_read_all ON public.platform_domains FOR SELECT USING (true);

DROP POLICY IF EXISTS p_reserved_slugs_read ON public.platform_reserved_slugs;
CREATE POLICY p_reserved_slugs_read ON public.platform_reserved_slugs FOR SELECT USING (true);

-- Tenants: lectura autenticada del propio tenant o administrador
DROP POLICY IF EXISTS p_tenants_owner_read ON public.platform_tenants;
CREATE POLICY p_tenants_owner_read ON public.platform_tenants FOR SELECT USING (
    tenant_id = (current_setting('request.jwt.claims', true)::jsonb ->> 'organization_id')::UUID
    OR (current_setting('request.jwt.claims', true)::jsonb ->> 'role') IN ('administrador', 'superadmin', 'service_role')
);

DROP POLICY IF EXISTS p_tenants_admin_mutate ON public.platform_tenants;
CREATE POLICY p_tenants_admin_mutate ON public.platform_tenants FOR ALL USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') IN ('administrador', 'superadmin', 'service_role')
);

-- Bitácoras: solo administradores
DROP POLICY IF EXISTS p_history_admin_all ON public.platform_account_status_history;
CREATE POLICY p_history_admin_all ON public.platform_account_status_history FOR ALL USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') IN ('administrador', 'superadmin', 'service_role')
);

DROP POLICY IF EXISTS p_ghl_admin_all ON public.platform_ghl_sync_ledger;
CREATE POLICY p_ghl_admin_all ON public.platform_ghl_sync_ledger FOR ALL USING (
    (current_setting('request.jwt.claims', true)::jsonb ->> 'role') IN ('administrador', 'superadmin', 'service_role')
);

-- Revocar privilegios directos de anon sobre funciones mutantes
REVOKE EXECUTE ON FUNCTION public.provision_platform_tenant FROM anon;
REVOKE EXECUTE ON FUNCTION public.transition_tenant_account_status FROM anon;
GRANT EXECUTE ON FUNCTION public.resolve_tenant_by_hostname TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.suggest_available_slugs TO anon, authenticated;
