-- ============================================================================
-- VET FREEDOM OS & ALPHA VISION — MIGRACIÓN 047
-- B2B SAAS PRODUCTS, PLANS, LICENSES & 5-CONDITION ENTITLEMENT ENGINE
-- Formalización DDL de Catálogo Comercial y Control de Acceso en Servidor
-- 
-- Entidades:
-- 1. saas_products (Vet Life, Contractor OS, etc.)
-- 2. saas_plans & saas_plan_versions (Tier 1 Solitario, Tier 2 Clínica, Tier 3 Red)
-- 3. saas_licenses (Trial 30 Días, Mensual, Anual, Promocional, Enterprise)
-- 4. saas_plan_entitlements (Mapeo estricto de los 33 Feature IDs a cada plan)
-- 5. saas_tenant_addon_subscriptions (Add-ons adquiridos por tenant)
-- 6. saas_audit_log (Bitácora forense de cambios de licencia)
-- 7. RPC evaluate_tenant_feature_access (Evaluación estricta de 5 condiciones)
-- 8. RPC get_tenant_entitlements_overview (Diagnóstico completo para UI)
-- 9. RPC provision_tenant_trial (Aprovisionamiento instantáneo 30 días)
-- 10. RPC upgrade_tenant_plan (Upgrades/downgrades atómicos con auditoría)
-- ============================================================================

-- 1. TABLA: PRODUCTOS SAAS DE ALPHA VISION
CREATE TABLE IF NOT EXISTS public.saas_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BETA', 'PLANNED', 'DEPRECATED')),
    default_subdomain_suffix TEXT NOT NULL DEFAULT 'alphavisionm.com',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 2. TABLA: PLANES COMERCIALES
CREATE TABLE IF NOT EXISTS public.saas_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.saas_products(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    tier_level INT NOT NULL DEFAULT 1 CHECK (tier_level BETWEEN 1 AND 5),
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_public BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 3. TABLA: VERSIONES DE PLANES Y PRECIOS
CREATE TABLE IF NOT EXISTS public.saas_plan_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.saas_plans(id) ON DELETE CASCADE,
    version_number INT NOT NULL DEFAULT 1,
    monthly_price_cop NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    annual_price_cop NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    monthly_price_usd NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    annual_price_usd NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'COP',
    included_seats INT NOT NULL DEFAULT 1,
    seat_price_extra_cop NUMERIC(15,2) DEFAULT 0.00,
    monthly_whatsapp_limit INT NOT NULL DEFAULT 300,
    monthly_voice_minutes INT NOT NULL DEFAULT 0,
    monthly_ai_copilot_credits INT NOT NULL DEFAULT 0,
    effective_from TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    effective_to TIMESTAMPTZ,
    is_current BOOLEAN NOT NULL DEFAULT true,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_saas_plan_version UNIQUE (plan_id, version_number)
);

-- 4. TABLA: LICENCIAS ACTIVAS POR ORGANIZACIÓN (TENANT)
CREATE TABLE IF NOT EXISTS public.saas_licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.saas_products(id) ON DELETE RESTRICT,
    plan_id UUID NOT NULL REFERENCES public.saas_plans(id) ON DELETE RESTRICT,
    plan_version_id UUID REFERENCES public.saas_plan_versions(id) ON DELETE RESTRICT,
    license_type TEXT NOT NULL CHECK (license_type IN ('TRIAL_30_DAYS', 'MONTHLY_PAID', 'ANNUAL_PAID', 'PROMOTIONAL', 'ENTERPRISE')),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('PENDING_ACTIVATION', 'ACTIVE', 'PAST_DUE', 'SUSPENDED', 'CANCELLED', 'EXPIRED')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    expires_at TIMESTAMPTZ NOT NULL,
    trial_ends_at TIMESTAMPTZ,
    billing_cycle TEXT NOT NULL DEFAULT 'MONTHLY' CHECK (billing_cycle IN ('TRIAL', 'MONTHLY', 'ANNUAL', 'CUSTOM')),
    assigned_seats INT NOT NULL DEFAULT 1,
    max_seats INT NOT NULL DEFAULT 1,
    whatsapp_messages_used INT NOT NULL DEFAULT 0,
    whatsapp_messages_limit INT NOT NULL DEFAULT 300,
    voice_minutes_used INT NOT NULL DEFAULT 0,
    voice_minutes_limit INT NOT NULL DEFAULT 0,
    ai_copilot_queries_used INT NOT NULL DEFAULT 0,
    ai_copilot_queries_limit INT NOT NULL DEFAULT 0,
    auto_renew BOOLEAN NOT NULL DEFAULT true,
    activation_token TEXT,
    payment_reference TEXT,
    last_payment_at TIMESTAMPTZ,
    next_billing_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- 5. TABLA: ENTITLEMENTS MAPEADOS A PLANES (LOS 33 FEATURE IDS + EXTENSIONES)
CREATE TABLE IF NOT EXISTS public.saas_plan_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.saas_plans(id) ON DELETE CASCADE,
    feature_id TEXT NOT NULL,
    feature_name TEXT NOT NULL,
    is_included BOOLEAN NOT NULL DEFAULT true,
    quota_limit INT,
    quota_unit TEXT NOT NULL DEFAULT 'UNLIMITED',
    is_addon_available BOOLEAN NOT NULL DEFAULT false,
    addon_price_cop NUMERIC(15,2) DEFAULT 0.00,
    required_role TEXT NOT NULL DEFAULT 'ANY',
    required_integration TEXT,
    implementation_status TEXT NOT NULL DEFAULT 'VERIFIED_PRODUCTION' CHECK (implementation_status IN ('VERIFIED_PRODUCTION', 'VERIFIED', 'SPECIFIED', 'PLANNED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_plan_entitlement UNIQUE (plan_id, feature_id)
);

-- 6. TABLA: ADD-ONS ACTIVOS POR ORGANIZACIÓN
CREATE TABLE IF NOT EXISTS public.saas_tenant_addon_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    feature_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED')),
    monthly_price_cop NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_tenant_addon UNIQUE (organization_id, feature_id)
);

-- 7. TABLA: BITÁCORA FORENSE DE LICENCIAMIENTO
CREATE TABLE IF NOT EXISTS public.saas_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ÍNDICES DE RENDIMIENTO
CREATE INDEX IF NOT EXISTS idx_saas_licenses_org ON public.saas_licenses(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_saas_licenses_expires ON public.saas_licenses(expires_at);
CREATE INDEX IF NOT EXISTS idx_saas_entitlements_lookup ON public.saas_plan_entitlements(plan_id, feature_id);
CREATE INDEX IF NOT EXISTS idx_saas_addons_lookup ON public.saas_tenant_addon_subscriptions(organization_id, feature_id, status);

-- HABILITAR Y FORZAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.saas_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_products FORCE ROW LEVEL SECURITY;

ALTER TABLE public.saas_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plans FORCE ROW LEVEL SECURITY;

ALTER TABLE public.saas_plan_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plan_versions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.saas_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_licenses FORCE ROW LEVEL SECURITY;

ALTER TABLE public.saas_plan_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_plan_entitlements FORCE ROW LEVEL SECURITY;

ALTER TABLE public.saas_tenant_addon_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_tenant_addon_subscriptions FORCE ROW LEVEL SECURITY;

ALTER TABLE public.saas_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saas_audit_log FORCE ROW LEVEL SECURITY;

-- POLÍTICAS RLS: LECTURA PÚBLICA DE CATÁLOGO COMERCIAL ACTIVO
DROP POLICY IF EXISTS "products_public_read" ON public.saas_products;
CREATE POLICY "products_public_read" ON public.saas_products
    FOR SELECT TO authenticated, anon
    USING (status = 'ACTIVE');

DROP POLICY IF EXISTS "plans_public_read" ON public.saas_plans;
CREATE POLICY "plans_public_read" ON public.saas_plans
    FOR SELECT TO authenticated, anon
    USING (is_active = true AND is_public = true);

DROP POLICY IF EXISTS "plan_versions_public_read" ON public.saas_plan_versions;
CREATE POLICY "plan_versions_public_read" ON public.saas_plan_versions
    FOR SELECT TO authenticated, anon
    USING (is_current = true);

DROP POLICY IF EXISTS "entitlements_public_read" ON public.saas_plan_entitlements;
CREATE POLICY "entitlements_public_read" ON public.saas_plan_entitlements
    FOR SELECT TO authenticated, anon
    USING (true);

-- POLÍTICAS RLS AISLADAS POR TENANT PARA LICENCIAS Y ADD-ONS
DROP POLICY IF EXISTS "tenant_licenses_policy" ON public.saas_licenses;
CREATE POLICY "tenant_licenses_policy" ON public.saas_licenses
    FOR ALL TO authenticated, anon
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid() AND om.is_active = true
        )
        OR auth.uid() IS NULL -- Permite llamadas de servicio interno PostgREST
    )
    WITH CHECK (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid() AND om.is_active = true
        )
        OR auth.uid() IS NULL
    );

DROP POLICY IF EXISTS "tenant_addons_policy" ON public.saas_tenant_addon_subscriptions;
CREATE POLICY "tenant_addons_policy" ON public.saas_tenant_addon_subscriptions
    FOR ALL TO authenticated, anon
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid() AND om.is_active = true
        )
        OR auth.uid() IS NULL
    )
    WITH CHECK (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid() AND om.is_active = true
        )
        OR auth.uid() IS NULL
    );

DROP POLICY IF EXISTS "saas_audit_policy" ON public.saas_audit_log;
CREATE POLICY "saas_audit_policy" ON public.saas_audit_log
    FOR SELECT TO authenticated, anon
    USING (
        organization_id IN (
            SELECT om.organization_id FROM public.organization_memberships om
            WHERE om.user_id = auth.uid() AND om.is_active = true
        )
        OR auth.uid() IS NULL
    );

-- ============================================================================
-- 8. RPC: MOTOR DE EVALUACIÓN DE ENTITLEMENTS EN 5 CONDICIONES
-- evaluate_tenant_feature_access(p_organization_id, p_feature_id)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.evaluate_tenant_feature_access(
    p_organization_id UUID,
    p_feature_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_license RECORD;
    v_plan RECORD;
    v_entitlement RECORD;
    v_addon RECORD;
    v_user_role TEXT;
    v_current_user_id UUID;
    v_integration_status TEXT;
    v_quota_limit INT;
    v_quota_used INT := 0;
    v_quota_available BOOLEAN := true;
    v_result JSONB;
BEGIN
    v_current_user_id := auth.uid();

    -- ========================================================================
    -- CONDICIÓN 1: ENTITLEMENT COMERCIAL COMPRADO
    -- ========================================================================
    SELECT * INTO v_license
    FROM public.saas_licenses
    WHERE organization_id = p_organization_id
      AND status = 'ACTIVE'
      AND expires_at > clock_timestamp()
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'blocked_by', 'COMMERCIAL_ENTITLEMENT',
            'reason', 'NO_ACTIVE_LICENSE',
            'message', 'La clínica no posee una licencia activa o su vigencia ha expirado.',
            'organization_id', p_organization_id,
            'feature_id', p_feature_id,
            'upgrade_required', true,
            'evaluated_at', clock_timestamp()
        );
    END IF;

    -- Obtener metadata del plan
    SELECT * INTO v_plan
    FROM public.saas_plans
    WHERE id = v_license.plan_id;

    -- Buscar si el feature está formalmente en el plan
    SELECT * INTO v_entitlement
    FROM public.saas_plan_entitlements
    WHERE plan_id = v_license.plan_id
      AND feature_id = p_feature_id;

    -- Si no está explícitamente en el plan o is_included = false, verificar Add-on activo
    IF NOT FOUND OR v_entitlement.is_included = false THEN
        SELECT * INTO v_addon
        FROM public.saas_tenant_addon_subscriptions
        WHERE organization_id = p_organization_id
          AND feature_id = p_feature_id
          AND status = 'ACTIVE'
          AND expires_at > clock_timestamp()
        LIMIT 1;

        IF NOT FOUND THEN
            RETURN jsonb_build_object(
                'allowed', false,
                'blocked_by', 'COMMERCIAL_ENTITLEMENT',
                'reason', 'FEATURE_NOT_IN_PLAN',
                'message', 'Esta funcionalidad no está incluida en su plan actual (' || COALESCE(v_plan.name, 'Desconocido') || ').',
                'organization_id', p_organization_id,
                'feature_id', p_feature_id,
                'plan_code', v_plan.code,
                'plan_name', v_plan.name,
                'upgrade_required', true,
                'is_addon_available', COALESCE(v_entitlement.is_addon_available, false),
                'addon_price_cop', COALESCE(v_entitlement.addon_price_cop, 0.00),
                'evaluated_at', clock_timestamp()
            );
        END IF;
    END IF;

    -- ========================================================================
    -- CONDICIÓN 2: AUTORIZACIÓN DEL ROL DEL USUARIO
    -- ========================================================================
    IF v_current_user_id IS NOT NULL THEN
        SELECT om.role::text INTO v_user_role
        FROM public.organization_memberships om
        WHERE om.organization_id = p_organization_id
          AND om.user_id = v_current_user_id
          AND om.is_active = true
        LIMIT 1;

        -- Roles directivos siempre pasan la validación de rol
        IF v_user_role NOT IN ('DIRECTOR', 'ADMINISTRATOR', 'ALPHA_CONSULTANT') THEN
            IF v_entitlement.required_role <> 'ANY' AND v_entitlement.required_role IS NOT NULL THEN
                IF v_user_role <> v_entitlement.required_role THEN
                    RETURN jsonb_build_object(
                        'allowed', false,
                        'blocked_by', 'USER_ROLE',
                        'reason', 'ROLE_NOT_AUTHORIZED',
                        'message', 'Su rol actual (' || COALESCE(v_user_role, 'SIN_ROL') || ') no tiene privilegios para esta acción. Requiere: ' || v_entitlement.required_role,
                        'organization_id', p_organization_id,
                        'feature_id', p_feature_id,
                        'user_role', v_user_role,
                        'required_role', v_entitlement.required_role,
                        'evaluated_at', clock_timestamp()
                    );
                END IF;
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- CONDICIÓN 3: ESTADO DE IMPLEMENTACIÓN LISTO EN PRODUCCIÓN
    -- ========================================================================
    IF v_entitlement.implementation_status IN ('SPECIFIED', 'PLANNED') THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'blocked_by', 'IMPLEMENTATION_READINESS',
            'reason', 'FEATURE_UNDER_DEVELOPMENT',
            'message', 'Esta funcionalidad se encuentra en fase de desarrollo o especificación técnica (' || v_entitlement.implementation_status || ').',
            'organization_id', p_organization_id,
            'feature_id', p_feature_id,
            'implementation_status', v_entitlement.implementation_status,
            'evaluated_at', clock_timestamp()
        );
    END IF;

    -- ========================================================================
    -- CONDICIÓN 4: INTEGRACIÓN EXTERNA OPERACIONAL
    -- ========================================================================
    IF v_entitlement.required_integration IS NOT NULL THEN
        IF v_entitlement.required_integration = 'OKVET' THEN
            SELECT status INTO v_integration_status
            FROM public.okvet_connector_configuration
            WHERE organization_id = p_organization_id
            LIMIT 1;

            IF v_integration_status IS NULL OR v_integration_status NOT IN ('ACTIVE', 'ACTIVE_STANDBY') THEN
                RETURN jsonb_build_object(
                    'allowed', false,
                    'blocked_by', 'INTEGRATION_READINESS',
                    'reason', 'INTEGRATION_NOT_CONNECTED',
                    'message', 'La funcionalidad requiere conexión activa con el software OKVET.',
                    'organization_id', p_organization_id,
                    'feature_id', p_feature_id,
                    'required_integration', 'OKVET',
                    'current_status', COALESCE(v_integration_status, 'DISCONNECTED'),
                    'evaluated_at', clock_timestamp()
                );
            END IF;
        END IF;
    END IF;

    -- ========================================================================
    -- CONDICIÓN 5: DISPONIBILIDAD DE CUOTA Y CONSUMO
    -- ========================================================================
    IF p_feature_id = 'FEAT-CORE-003' THEN
        -- WhatsApp Mensajería de Salida
        v_quota_limit := v_license.whatsapp_messages_limit;
        v_quota_used := v_license.whatsapp_messages_used;
        IF v_quota_limit > 0 AND v_quota_used >= v_quota_limit THEN
            v_quota_available := false;
        END IF;
    ELSIF p_feature_id = 'FEAT-VOICE-001' THEN
        -- Minutos de Voz
        v_quota_limit := v_license.voice_minutes_limit;
        v_quota_used := v_license.voice_minutes_used;
        IF v_quota_limit > 0 AND v_quota_used >= v_quota_limit THEN
            v_quota_available := false;
        END IF;
    ELSIF p_feature_id = 'FEAT-AI-COPILOT-001' OR p_feature_id = 'FEAT-AI-COPILOT' THEN
        -- Consultas de IA Copilot
        v_quota_limit := v_license.ai_copilot_queries_limit;
        v_quota_used := v_license.ai_copilot_queries_used;
        IF v_quota_limit > 0 AND v_quota_used >= v_quota_limit THEN
            v_quota_available := false;
        END IF;
    ELSIF v_entitlement.quota_limit IS NOT NULL AND v_entitlement.quota_limit > 0 THEN
        v_quota_limit := v_entitlement.quota_limit;
        -- Para cuotas específicas de citas (p. ej. Solitario 100/mes)
        IF p_feature_id = 'FEAT-CORE-005' THEN
            SELECT COUNT(*)::int INTO v_quota_used
            FROM public.appointments
            WHERE organization_id = p_organization_id
              AND created_at >= date_trunc('month', clock_timestamp());
            IF v_quota_used >= v_quota_limit THEN
                v_quota_available := false;
            END IF;
        END IF;
    END IF;

    IF NOT v_quota_available THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'blocked_by', 'USAGE_QUOTA',
            'reason', 'QUOTA_LIMIT_EXCEEDED',
            'message', 'Ha alcanzado el límite mensual asignado para esta funcionalidad (' || v_quota_used || '/' || v_quota_limit || ').',
            'organization_id', p_organization_id,
            'feature_id', p_feature_id,
            'quota_used', v_quota_used,
            'quota_limit', v_quota_limit,
            'quota_unit', v_entitlement.quota_unit,
            'evaluated_at', clock_timestamp()
        );
    END IF;

    -- ========================================================================
    -- TODAS LAS 5 CONDICIONES PASADAS SATISFACTORIAMENTE
    -- ========================================================================
    RETURN jsonb_build_object(
        'allowed', true,
        'organization_id', p_organization_id,
        'feature_id', p_feature_id,
        'feature_name', v_entitlement.feature_name,
        'plan_code', v_plan.code,
        'plan_name', v_plan.name,
        'license_type', v_license.license_type,
        'license_status', v_license.status,
        'license_expires_at', v_license.expires_at,
        'conditions', jsonb_build_object(
            'commercial_entitlement', jsonb_build_object('passed', true, 'details', 'Included in ' || v_plan.code),
            'role_authorization', jsonb_build_object('passed', true, 'role', COALESCE(v_user_role, 'SYSTEM_BYPASS')),
            'implementation_readiness', jsonb_build_object('passed', true, 'status', v_entitlement.implementation_status),
            'integration_readiness', jsonb_build_object('passed', true, 'required', v_entitlement.required_integration, 'connected', true),
            'quota_availability', jsonb_build_object('passed', true, 'used', v_quota_used, 'limit', v_quota_limit)
        ),
        'evaluated_at', clock_timestamp()
    );
END;
$$;

-- ============================================================================
-- 9. RPC: RESUMEN INTEGRAL DE ENTITLEMENTS PARA EL TENANT (DIAGNÓSTICO UI)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_tenant_entitlements_overview(
    p_organization_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_license RECORD;
    v_plan RECORD;
    v_item RECORD;
    v_features JSONB := '[]'::jsonb;
    v_eval JSONB;
BEGIN
    SELECT * INTO v_license
    FROM public.saas_licenses
    WHERE organization_id = p_organization_id
      AND status = 'ACTIVE'
      AND expires_at > clock_timestamp()
    ORDER BY created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'has_active_license', false,
            'organization_id', p_organization_id,
            'features', '[]'::jsonb
        );
    END IF;

    SELECT * INTO v_plan
    FROM public.saas_plans
    WHERE id = v_license.plan_id;

    FOR v_item IN (
        SELECT * FROM public.saas_plan_entitlements
        WHERE plan_id = v_license.plan_id
        ORDER BY feature_id ASC
    ) LOOP
        v_eval := public.evaluate_tenant_feature_access(p_organization_id, v_item.feature_id);
        v_features := v_features || jsonb_build_array(jsonb_build_object(
            'feature_id', v_item.feature_id,
            'feature_name', v_item.feature_name,
            'is_included', v_item.is_included,
            'quota_limit', v_item.quota_limit,
            'quota_unit', v_item.quota_unit,
            'is_addon_available', v_item.is_addon_available,
            'addon_price_cop', v_item.addon_price_cop,
            'implementation_status', v_item.implementation_status,
            'evaluation', v_eval
        ));
    END LOOP;

    RETURN jsonb_build_object(
        'has_active_license', true,
        'organization_id', p_organization_id,
        'plan_code', v_plan.code,
        'plan_name', v_plan.name,
        'license_type', v_license.license_type,
        'starts_at', v_license.starts_at,
        'expires_at', v_license.expires_at,
        'trial_ends_at', v_license.trial_ends_at,
        'quotas', jsonb_build_object(
            'whatsapp', jsonb_build_object('used', v_license.whatsapp_messages_used, 'limit', v_license.whatsapp_messages_limit),
            'voice', jsonb_build_object('used', v_license.voice_minutes_used, 'limit', v_license.voice_minutes_limit),
            'ai_copilot', jsonb_build_object('used', v_license.ai_copilot_queries_used, 'limit', v_license.ai_copilot_queries_limit)
        ),
        'features', v_features
    );
END;
$$;

-- ============================================================================
-- 10. RPC: APROVISIONAMIENTO INSTANTÁNEO DE PRUEBA DE 30 DÍAS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.provision_tenant_trial(
    p_organization_id UUID,
    p_product_code TEXT DEFAULT 'VET_LIFE',
    p_plan_code TEXT DEFAULT 'TIER2_CLINICA'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_prod_id UUID;
    v_plan_id UUID;
    v_version_id UUID;
    v_version RECORD;
    v_license_id UUID;
BEGIN
    SELECT id INTO v_prod_id FROM public.saas_products WHERE code = p_product_code;
    IF v_prod_id IS NULL THEN
        RAISE EXCEPTION 'Producto SaaS no encontrado: %', p_product_code;
    END IF;

    SELECT id INTO v_plan_id FROM public.saas_plans WHERE code = p_plan_code;
    IF v_plan_id IS NULL THEN
        RAISE EXCEPTION 'Plan SaaS no encontrado: %', p_plan_code;
    END IF;

    SELECT * INTO v_version FROM public.saas_plan_versions WHERE plan_id = v_plan_id AND is_current = true LIMIT 1;
    v_version_id := v_version.id;

    -- Insertar o renovar licencia de prueba
    INSERT INTO public.saas_licenses (
        organization_id,
        product_id,
        plan_id,
        plan_version_id,
        license_type,
        status,
        starts_at,
        expires_at,
        trial_ends_at,
        billing_cycle,
        assigned_seats,
        max_seats,
        whatsapp_messages_limit,
        voice_minutes_limit,
        ai_copilot_queries_limit,
        auto_renew
    ) VALUES (
        p_organization_id,
        v_prod_id,
        v_plan_id,
        v_version_id,
        'TRIAL_30_DAYS',
        'ACTIVE',
        clock_timestamp(),
        clock_timestamp() + INTERVAL '30 days',
        clock_timestamp() + INTERVAL '30 days',
        'TRIAL',
        1,
        COALESCE(v_version.included_seats, 5),
        COALESCE(v_version.monthly_whatsapp_limit, 1500),
        COALESCE(v_version.monthly_voice_minutes, 100),
        COALESCE(v_version.monthly_ai_copilot_credits, 200),
        false
    )
    RETURNING id INTO v_license_id;

    -- Registrar auditoría
    INSERT INTO public.saas_audit_log (organization_id, action, actor_id, payload)
    VALUES (
        p_organization_id,
        'PROVISION_TRIAL_30_DAYS',
        auth.uid(),
        jsonb_build_object(
            'license_id', v_license_id,
            'plan_code', p_plan_code,
            'duration_days', 30,
            'expires_at', clock_timestamp() + INTERVAL '30 days'
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'license_id', v_license_id,
        'plan_code', p_plan_code,
        'license_type', 'TRIAL_30_DAYS',
        'expires_at', clock_timestamp() + INTERVAL '30 days'
    );
END;
$$;

-- ============================================================================
-- 11. RPC: ACTUALIZACIÓN / UPGRADE DE PLAN CON AUDITORÍA FORENSE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.upgrade_tenant_plan(
    p_organization_id UUID,
    p_target_plan_code TEXT,
    p_billing_cycle TEXT DEFAULT 'MONTHLY',
    p_payment_reference TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_plan_id UUID;
    v_version RECORD;
    v_license_id UUID;
    v_duration INTERVAL;
    v_license_type TEXT;
BEGIN
    SELECT id INTO v_plan_id FROM public.saas_plans WHERE code = p_target_plan_code;
    IF v_plan_id IS NULL THEN
        RAISE EXCEPTION 'Plan objetivo no encontrado: %', p_target_plan_code;
    END IF;

    SELECT * INTO v_version FROM public.saas_plan_versions WHERE plan_id = v_plan_id AND is_current = true LIMIT 1;

    IF p_billing_cycle = 'ANNUAL' THEN
        v_duration := INTERVAL '365 days';
        v_license_type := 'ANNUAL_PAID';
    ELSE
        v_duration := INTERVAL '30 days';
        v_license_type := 'MONTHLY_PAID';
    END IF;

    -- Desactivar licencias activas anteriores
    UPDATE public.saas_licenses
    SET status = 'EXPIRED',
        updated_at = clock_timestamp()
    WHERE organization_id = p_organization_id
      AND status = 'ACTIVE';

    -- Crear nueva licencia
    INSERT INTO public.saas_licenses (
        organization_id,
        product_id,
        plan_id,
        plan_version_id,
        license_type,
        status,
        starts_at,
        expires_at,
        billing_cycle,
        assigned_seats,
        max_seats,
        whatsapp_messages_limit,
        voice_minutes_limit,
        ai_copilot_queries_limit,
        payment_reference,
        last_payment_at,
        next_billing_at,
        auto_renew
    ) VALUES (
        p_organization_id,
        v_version.plan_id, -- product lookup through plan
        v_plan_id,
        v_version.id,
        v_license_type,
        'ACTIVE',
        clock_timestamp(),
        clock_timestamp() + v_duration,
        p_billing_cycle,
        1,
        v_version.included_seats,
        v_version.monthly_whatsapp_limit,
        v_version.monthly_voice_minutes,
        v_version.monthly_ai_copilot_credits,
        p_payment_reference,
        clock_timestamp(),
        clock_timestamp() + v_duration,
        true
    )
    RETURNING id INTO v_license_id;

    -- Registrar auditoría
    INSERT INTO public.saas_audit_log (organization_id, action, actor_id, payload)
    VALUES (
        p_organization_id,
        'UPGRADE_PLAN',
        auth.uid(),
        jsonb_build_object(
            'new_license_id', v_license_id,
            'plan_code', p_target_plan_code,
            'billing_cycle', p_billing_cycle,
            'payment_reference', p_payment_reference
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'license_id', v_license_id,
        'plan_code', p_target_plan_code,
        'license_type', v_license_type,
        'expires_at', clock_timestamp() + v_duration
    );
END;
$$;

-- ============================================================================
-- 12. SEED CANÓNICO: PRODUCTOS, PLANES, VERSIONES, ENTITLEMENTS Y LICENCIAS
-- ============================================================================
DO $$
DECLARE
    v_prod_vet UUID;
    v_prod_cont UUID;
    v_plan_t1 UUID;
    v_plan_t2 UUID;
    v_plan_t3 UUID;
    v_org_luis UUID := '11111111-1111-1111-1111-111111111111';
    v_org_demo UUID := '22222222-2222-2222-2222-222222222222';
    v_ver_t2_id UUID;
BEGIN
    -- 12.1 PRODUCTOS
    INSERT INTO public.saas_products (code, name, description, status, default_subdomain_suffix)
    VALUES 
        ('VET_LIFE', 'Vet Life — Veterinaria a Domicilio', 'SaaS especializado en medicina veterinaria a domicilio y logística de rutas', 'ACTIVE', 'alphavisionm.com'),
        ('CONTRACTOR_OS', 'Contractor OS — Construcción & Reformas', 'SaaS para contratistas, reformas locativas y obras comerciales', 'BETA', 'alphavisionm.com')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    RETURNING id INTO v_prod_vet;

    SELECT id INTO v_prod_vet FROM public.saas_products WHERE code = 'VET_LIFE';
    SELECT id INTO v_prod_cont FROM public.saas_products WHERE code = 'CONTRACTOR_OS';

    -- 12.2 PLANES VET LIFE
    INSERT INTO public.saas_plans (product_id, code, name, tier_level, description)
    VALUES 
        (v_prod_vet, 'TIER1_SOLITARIO', 'Veterinario Solitario', 1, 'Para veterinarios independientes que trabajan a domicilio solos'),
        (v_prod_vet, 'TIER2_CLINICA', 'Clínica Domiciliaria', 2, 'Para clínicas con auxiliares en campo y equipo en crecimiento'),
        (v_prod_vet, 'TIER3_RED', 'Red / Marca Blanca', 3, 'Para hospitales, redes veterinarias y marcas consolidadas')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, tier_level = EXCLUDED.tier_level;

    SELECT id INTO v_plan_t1 FROM public.saas_plans WHERE code = 'TIER1_SOLITARIO';
    SELECT id INTO v_plan_t2 FROM public.saas_plans WHERE code = 'TIER2_CLINICA';
    SELECT id INTO v_plan_t3 FROM public.saas_plans WHERE code = 'TIER3_RED';

    -- 12.3 VERSIONES DE PRECIOS
    INSERT INTO public.saas_plan_versions (
        plan_id, version_number, monthly_price_cop, annual_price_cop, monthly_price_usd, annual_price_usd, 
        included_seats, seat_price_extra_cop, monthly_whatsapp_limit, monthly_voice_minutes, monthly_ai_copilot_credits
    ) VALUES
        (v_plan_t1, 1, 189000.00, 1890000.00, 49.00, 490.00, 1, 0.00, 300, 0, 0),
        (v_plan_t2, 1, 389000.00, 3890000.00, 99.00, 990.00, 5, 45000.00, 1500, 100, 200),
        (v_plan_t3, 1, 1190000.00, 11900000.00, 299.00, 2990.00, 20, 35000.00, 5000, 500, 1000)
    ON CONFLICT (plan_id, version_number) DO UPDATE SET 
        monthly_price_cop = EXCLUDED.monthly_price_cop,
        monthly_whatsapp_limit = EXCLUDED.monthly_whatsapp_limit;

    SELECT id INTO v_ver_t2_id FROM public.saas_plan_versions WHERE plan_id = v_plan_t2 AND version_number = 1;

    -- 12.4 MAPEO DE ENTITLEMENTS (LOS 33 FEATURE IDS CANÓNICOS)
    -- TIER 1: VETERINARIO SOLITARIO
    INSERT INTO public.saas_plan_entitlements (plan_id, feature_id, feature_name, is_included, quota_limit, quota_unit, is_addon_available, addon_price_cop, required_role, implementation_status)
    VALUES
        (v_plan_t1, 'FEAT-SUBDOMAIN-001', 'Subdominio Propio (*.alphavisionm.com)', true, 1, 'DOMINIO', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-001', 'Cerebro de Herramientas Tipadas y Bus Transaccional', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-002', 'Ingestión y Normalización de Mensajería WhatsApp', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-003', 'Salida WhatsApp, Ventana de 24h y Catálogo Meta', true, 300, 'MENSAJES_MES', true, 29000, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-004', 'Escalamiento a Humanos y Máquina de Estados Handoff', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-005', 'Ciclo de Vida de Citas y Puerta de Enlace OKVET', true, 100, 'CITAS_MES', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-006', 'Sincronización Bidireccional de Calendarios BUSY_ONLY', true, 1, 'CALENDARIO', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-007', 'Gestión de Tareas Operativas y Modo Ausencia', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-008', 'Logística de Rutas Domiciliarias y Botón Waze', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-009', 'Planes de Cuidados Recurrentes y Prevención Abandono', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-010', 'Planes Preventivos, Cadena de Frío y Control Lotes', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-011', 'Coordinación de Especialistas Externos', false, NULL, 'BLOQUEADO', true, 49000, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-012', 'Compromisos Post-Visita y Continuidad Clínica', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-013', 'Bóveda de Documentos Médicos y Firma COMVEZCOL', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-014', 'Operaciones Financieras y Supresión por Duelo', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-015', 'Seguimiento Posvisita y Reseñas Neutrales', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-016', 'Inteligencia Ejecutiva Diaria y Decisiones', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-017', 'Reportes Ejecutivos Semanales y Autonomía', false, NULL, 'BLOQUEADO', false, 0, 'DIRECTOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-018', 'Conciliación Transversal de Integraciones', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-019', 'Gestión de Incidentes y Reintentos Backoff', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-020', 'Monitoreo de Salud Técnica y Sonda 7 Servicios', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-CORE-021', 'Coordinación de Respaldos y Mantenimiento', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-OKVET-001', 'Puente Asistido OKVET de Pacientes y Fórmulas', false, NULL, 'BLOQUEADO', true, 59000, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-WL-001', 'Estudio Visual White-Label y Clinic DNA', false, NULL, 'BLOQUEADO', true, 129000, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-PWA-001', 'Instalación PWA Móvil y Pasaporte QR Tutor', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-SAAS-001', 'Portal de Onboarding B2B y Planes Alpha Vision', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-TRIAL-001', 'Activación de Prueba 30 Días por Token Seguro', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-PROSPECT-001', 'Panel Super Admin de Demos e Invitaciones', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-AUTONOMOUS-001', 'SRE Orchestrator & Autonomous Reliability', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'SPECIFIED'),
        (v_plan_t1, 'FEAT-READY-001', 'Operational Readiness & Zero-Confusion UX', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'SPECIFIED'),
        (v_plan_t1, 'FEAT-AI-COPILOT-001', 'Alpha Vision Universal Operational AI Engine', false, 0, 'BLOQUEADO', true, 69000, 'ANY', 'SPECIFIED'),
        (v_plan_t1, 'FEAT-COMMAND-001', 'Owner Command Center & Admin Assistant', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-ONBOARDING-001', '5-Step Guided Clinic Onboarding Wizard', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        -- Extensiones operacionales
        (v_plan_t1, 'FEAT-LIVE-001', 'Despacho en Vivo, Rastreo GPS y Smart ETA', false, NULL, 'BLOQUEADO', true, 79000, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-FINTECH-001', 'Anticipos Anti-No-Show en Agendamiento', false, NULL, 'BLOQUEADO', true, 39000, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t1, 'FEAT-VOICE-001', 'Asistente de Voz y Agendamiento 1-Clic', false, 0, 'BLOQUEADO', true, 49000, 'VETERINARIAN', 'VERIFIED_PRODUCTION')
    ON CONFLICT (plan_id, feature_id) DO UPDATE SET 
        is_included = EXCLUDED.is_included,
        quota_limit = EXCLUDED.quota_limit,
        is_addon_available = EXCLUDED.is_addon_available,
        addon_price_cop = EXCLUDED.addon_price_cop;

    -- TIER 2: CLÍNICA DOMICILIARIA (TODO TIER 1 + LIVE GPS + OKVET + FINTECH + VOICE 100 MIN + AI 200)
    INSERT INTO public.saas_plan_entitlements (plan_id, feature_id, feature_name, is_included, quota_limit, quota_unit, is_addon_available, addon_price_cop, required_role, implementation_status)
    VALUES
        (v_plan_t2, 'FEAT-SUBDOMAIN-001', 'Subdominio Propio (*.alphavisionm.com)', true, 1, 'DOMINIO', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-001', 'Cerebro de Herramientas Tipadas y Bus Transaccional', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-002', 'Ingestión y Normalización de Mensajería WhatsApp', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-003', 'Salida WhatsApp, Ventana de 24h y Catálogo Meta', true, 1500, 'MENSAJES_MES', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-004', 'Escalamiento a Humanos y Máquina de Estados Handoff', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-005', 'Ciclo de Vida de Citas y Puerta de Enlace OKVET', true, 500, 'CITAS_MES', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-006', 'Sincronización Bidireccional de Calendarios BUSY_ONLY', true, 5, 'CALENDARIOS', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-007', 'Gestión de Tareas Operativas y Modo Ausencia', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-008', 'Logística de Rutas Domiciliarias y Botón Waze', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-009', 'Planes de Cuidados Recurrentes y Prevención Abandono', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-010', 'Planes Preventivos, Cadena de Frío y Control Lotes', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-011', 'Coordinación de Especialistas Externos', false, NULL, 'BLOQUEADO', true, 49000, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-012', 'Compromisos Post-Visita y Continuidad Clínica', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-013', 'Bóveda de Documentos Médicos y Firma COMVEZCOL', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-014', 'Operaciones Financieras y Supresión por Duelo', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-015', 'Seguimiento Posvisita y Reseñas Neutrales', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-016', 'Inteligencia Ejecutiva Diaria y Decisiones', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-017', 'Reportes Ejecutivos Semanales y Autonomía', false, NULL, 'BLOQUEADO', false, 0, 'DIRECTOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-018', 'Conciliación Transversal de Integraciones', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-019', 'Gestión de Incidentes y Reintentos Backoff', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-020', 'Monitoreo de Salud Técnica y Sonda 7 Servicios', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-CORE-021', 'Coordinación de Respaldos y Mantenimiento', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-OKVET-001', 'Puente Asistido OKVET de Pacientes y Fórmulas', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-WL-001', 'Estudio Visual White-Label y Clinic DNA', false, NULL, 'BLOQUEADO', true, 129000, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-PWA-001', 'Instalación PWA Móvil y Pasaporte QR Tutor', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-SAAS-001', 'Portal de Onboarding B2B y Planes Alpha Vision', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-TRIAL-001', 'Activación de Prueba 30 Días por Token Seguro', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-PROSPECT-001', 'Panel Super Admin de Demos e Invitaciones', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-AUTONOMOUS-001', 'SRE Orchestrator & Autonomous Reliability', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'SPECIFIED'),
        (v_plan_t2, 'FEAT-READY-001', 'Operational Readiness & Zero-Confusion UX', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'SPECIFIED'),
        (v_plan_t2, 'FEAT-AI-COPILOT-001', 'Alpha Vision Universal Operational AI Engine', true, 200, 'CONSULTAS_MES', false, 0, 'ANY', 'SPECIFIED'),
        (v_plan_t2, 'FEAT-COMMAND-001', 'Owner Command Center & Admin Assistant', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-ONBOARDING-001', '5-Step Guided Clinic Onboarding Wizard', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-LIVE-001', 'Despacho en Vivo, Rastreo GPS y Smart ETA', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-FINTECH-001', 'Anticipos Anti-No-Show en Agendamiento', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t2, 'FEAT-VOICE-001', 'Asistente de Voz y Agendamiento 1-Clic', true, 100, 'MINUTOS_MES', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION')
    ON CONFLICT (plan_id, feature_id) DO UPDATE SET 
        is_included = EXCLUDED.is_included,
        quota_limit = EXCLUDED.quota_limit,
        is_addon_available = EXCLUDED.is_addon_available,
        addon_price_cop = EXCLUDED.addon_price_cop;

    -- TIER 3: RED / MARCA BLANCA (TODO INCLUIDO ILIMITADO + WHITE-LABEL + REPORTES SEMANALES + 1.000 AI)
    INSERT INTO public.saas_plan_entitlements (plan_id, feature_id, feature_name, is_included, quota_limit, quota_unit, is_addon_available, addon_price_cop, required_role, implementation_status)
    VALUES
        (v_plan_t3, 'FEAT-SUBDOMAIN-001', 'Subdominio Propio (*.alphavisionm.com)', true, 1, 'DOMINIO', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-001', 'Cerebro de Herramientas Tipadas y Bus Transaccional', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-002', 'Ingestión y Normalización de Mensajería WhatsApp', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-003', 'Salida WhatsApp, Ventana de 24h y Catálogo Meta', true, 5000, 'MENSAJES_MES', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-004', 'Escalamiento a Humanos y Máquina de Estados Handoff', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-005', 'Ciclo de Vida de Citas y Puerta de Enlace OKVET', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-006', 'Sincronización Bidireccional de Calendarios BUSY_ONLY', true, 20, 'CALENDARIOS', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-007', 'Gestión de Tareas Operativas y Modo Ausencia', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-008', 'Logística de Rutas Domiciliarias y Botón Waze', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-009', 'Planes de Cuidados Recurrentes y Prevención Abandono', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-010', 'Planes Preventivos, Cadena de Frío y Control Lotes', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-011', 'Coordinación de Especialistas Externos', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-012', 'Compromisos Post-Visita y Continuidad Clínica', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-013', 'Bóveda de Documentos Médicos y Firma COMVEZCOL', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-014', 'Operaciones Financieras y Supresión por Duelo', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-015', 'Seguimiento Posvisita y Reseñas Neutrales', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-016', 'Inteligencia Ejecutiva Diaria y Decisiones', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-017', 'Reportes Ejecutivos Semanales y Autonomía', true, NULL, 'UNLIMITED', false, 0, 'DIRECTOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-018', 'Conciliación Transversal de Integraciones', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-019', 'Gestión de Incidentes y Reintentos Backoff', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-020', 'Monitoreo de Salud Técnica y Sonda 7 Servicios', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-CORE-021', 'Coordinación de Respaldos y Mantenimiento', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-OKVET-001', 'Puente Asistido OKVET de Pacientes y Fórmulas', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-WL-001', 'Estudio Visual White-Label y Clinic DNA', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-PWA-001', 'Instalación PWA Móvil y Pasaporte QR Tutor', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-SAAS-001', 'Portal de Onboarding B2B y Planes Alpha Vision', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-TRIAL-001', 'Activación de Prueba 30 Días por Token Seguro', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-PROSPECT-001', 'Panel Super Admin de Demos e Invitaciones', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-AUTONOMOUS-001', 'SRE Orchestrator & Autonomous Reliability', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'SPECIFIED'),
        (v_plan_t3, 'FEAT-READY-001', 'Operational Readiness & Zero-Confusion UX', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'SPECIFIED'),
        (v_plan_t3, 'FEAT-AI-COPILOT-001', 'Alpha Vision Universal Operational AI Engine', true, 1000, 'CONSULTAS_MES', false, 0, 'ANY', 'SPECIFIED'),
        (v_plan_t3, 'FEAT-COMMAND-001', 'Owner Command Center & Admin Assistant', true, NULL, 'UNLIMITED', false, 0, 'ADMINISTRATOR', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-ONBOARDING-001', '5-Step Guided Clinic Onboarding Wizard', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-LIVE-001', 'Despacho en Vivo, Rastreo GPS y Smart ETA', true, NULL, 'UNLIMITED', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-FINTECH-001', 'Anticipos Anti-No-Show en Agendamiento', true, NULL, 'UNLIMITED', false, 0, 'ANY', 'VERIFIED_PRODUCTION'),
        (v_plan_t3, 'FEAT-VOICE-001', 'Asistente de Voz y Agendamiento 1-Clic', true, 500, 'MINUTOS_MES', false, 0, 'VETERINARIAN', 'VERIFIED_PRODUCTION')
    ON CONFLICT (plan_id, feature_id) DO UPDATE SET 
        is_included = EXCLUDED.is_included,
        quota_limit = EXCLUDED.quota_limit,
        is_addon_available = EXCLUDED.is_addon_available,
        addon_price_cop = EXCLUDED.addon_price_cop;

    -- 12.5 SEED DE LICENCIAS
    -- DR. LUIS VET LIFE (TIER 2 - CLÍNICA DOMICILIARIA ACTIVA - MENSUAL)
    IF EXISTS (SELECT 1 FROM public.organizations WHERE id = v_org_luis) THEN
        INSERT INTO public.saas_licenses (
            organization_id, product_id, plan_id, plan_version_id, license_type, status,
            starts_at, expires_at, billing_cycle, assigned_seats, max_seats,
            whatsapp_messages_used, whatsapp_messages_limit, voice_minutes_used, voice_minutes_limit,
            ai_copilot_queries_used, ai_copilot_queries_limit, auto_renew, payment_reference
        ) VALUES (
            v_org_luis, v_prod_vet, v_plan_t2, v_ver_t2_id, 'MONTHLY_PAID', 'ACTIVE',
            clock_timestamp() - INTERVAL '15 days', clock_timestamp() + INTERVAL '15 days', 'MONTHLY', 1, 5,
            45, 1500, 12, 100, 18, 200, true, 'WOMPI-SUB-LUIS-001'
        )
        ON CONFLICT DO NOTHING;
    END IF;

    -- CLÍNICA DEMO SAN ROQUE (TIER 2 - PRUEBA 30 DÍAS)
    IF EXISTS (SELECT 1 FROM public.organizations WHERE id = v_org_demo) THEN
        INSERT INTO public.saas_licenses (
            organization_id, product_id, plan_id, plan_version_id, license_type, status,
            starts_at, expires_at, trial_ends_at, billing_cycle, assigned_seats, max_seats,
            whatsapp_messages_used, whatsapp_messages_limit, voice_minutes_used, voice_minutes_limit,
            ai_copilot_queries_used, ai_copilot_queries_limit, auto_renew, activation_token
        ) VALUES (
            v_org_demo, v_prod_vet, v_plan_t2, v_ver_t2_id, 'TRIAL_30_DAYS', 'ACTIVE',
            clock_timestamp() - INTERVAL '3 days', clock_timestamp() + INTERVAL '27 days', clock_timestamp() + INTERVAL '27 days', 'TRIAL', 1, 5,
            10, 1500, 0, 100, 5, 200, false, 'TRY-SANROQUE-DEMO-2026'
        )
        ON CONFLICT DO NOTHING;
    END IF;

END $$;
