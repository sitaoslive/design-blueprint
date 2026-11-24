-- ==============================================================================
-- Migration: 008_routes_and_operations.sql
-- Description: Domiciliary route planning, stops, reoptimization requests, alerts,
--              supplies catalog, cold-chain kardex movements, and vehicle inventories.
-- Module: Module L (Rutas y Continuidad) y Módulo R (Equipo, Insumos y Operaciones)
-- Requirements: WF2-043..WF2-056, AT2-039..AT2-050
-- ==============================================================================

-- 1. ROUTES (Ruta diaria por veterinario en Bogotá)
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    veterinarian_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE RESTRICT,
    route_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'PLANNED' CHECK (status IN (
        'PLANNED', 'OPTIMIZED', 'IN_PROGRESS', 'COMPLETED', 'DISRUPTED'
    )),
    total_distance_km NUMERIC(6,2) DEFAULT 0 CHECK (total_distance_km >= 0),
    estimated_duration_minutes INTEGER DEFAULT 0 CHECK (estimated_duration_minutes >= 0),
    start_hub_address TEXT NOT NULL DEFAULT 'Sede Central Vet Life Bogotá',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_vet_route_date UNIQUE (veterinarian_id, route_date)
);

CREATE TRIGGER trg_routes_updated_at
BEFORE UPDATE ON public.routes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 2. ROUTE STOPS (Paradas ordenadas y tiempos de desplazamiento)
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE RESTRICT,
    stop_order INTEGER NOT NULL CHECK (stop_order > 0),
    estimated_arrival TIMESTAMPTZ NOT NULL,
    estimated_departure TIMESTAMPTZ NOT NULL,
    actual_arrival TIMESTAMPTZ,
    actual_departure TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'RESCHEDULED_EMERGENCY'
    )),
    travel_time_from_prev_minutes INTEGER DEFAULT 0 CHECK (travel_time_from_prev_minutes >= 0),
    distance_from_prev_km NUMERIC(6,2) DEFAULT 0 CHECK (distance_from_prev_km >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_route_stop_order UNIQUE (route_id, stop_order),
    CONSTRAINT chk_stop_times CHECK (estimated_arrival < estimated_departure)
);

-- 3. ROUTE REOPTIMIZATION REQUESTS (Recálculo dinámico por tráfico o urgencias)
CREATE TABLE IF NOT EXISTS public.route_reoptimization_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    trigger_reason TEXT NOT NULL CHECK (trigger_reason IN (
        'TRAFFIC_DELAY', 'EMERGENCY_INSERTION', 'CANCELLATION', 'MANUAL_DISPATCH'
    )),
    requested_by UUID REFERENCES auth.users(id),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CALCULATED', 'APPLIED', 'REJECTED')),
    changes_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. ROUTE ALERTS
CREATE TABLE IF NOT EXISTS public.route_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id UUID NOT NULL REFERENCES public.routes(id) ON DELETE CASCADE,
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'DELAY_RISK', 'TRAFFIC_INCIDENT', 'WEATHER_ALERT', 'MEDICATION_EXPIRING_IN_TRANSIT'
    )),
    message TEXT NOT NULL,
    is_acknowledged BOOLEAN NOT NULL DEFAULT false,
    acknowledged_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. SUPPLIES CATALOG (Insumos, vacunas y biológicos)
CREATE TABLE IF NOT EXISTS public.supplies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'VACCINE', 'ANTIBIOTIC', 'ANALGESIC', 'SEDATIVE', 
        'SURGICAL_MATERIAL', 'DIAGNOSTIC_KIT', 'CONSUMABLE'
    )),
    unit_of_measure TEXT NOT NULL DEFAULT 'UNIDAD',
    cold_chain_required BOOLEAN NOT NULL DEFAULT false,
    controlled_substance BOOLEAN NOT NULL DEFAULT false,
    min_stock_alert_threshold INTEGER NOT NULL DEFAULT 5 CHECK (min_stock_alert_threshold >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_org_supply_sku UNIQUE (organization_id, sku)
);

CREATE TRIGGER trg_supplies_updated_at
BEFORE UPDATE ON public.supplies
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. SUPPLY MOVEMENTS (Kardex)
CREATE TABLE IF NOT EXISTS public.supply_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT,
    supply_id UUID NOT NULL REFERENCES public.supplies(id) ON DELETE RESTRICT,
    movement_type TEXT NOT NULL CHECK (movement_type IN (
        'PURCHASE_RECEIPT', 'DISPATCH_TO_VEHICLE', 'USED_IN_VISIT', 
        'RETURN_TO_WAREHOUSE', 'EXPIRED_DISCARD', 'ADJUSTMENT'
    )),
    quantity INTEGER NOT NULL CHECK (quantity != 0),
    batch_number TEXT,
    expiration_date DATE,
    source_location TEXT NOT NULL DEFAULT 'BODEGA_CENTRAL',
    destination_location TEXT,
    staff_profile_id UUID REFERENCES public.staff_profiles(id) ON DELETE SET NULL,
    visit_id UUID REFERENCES public.visits(id) ON DELETE SET NULL,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. VEHICLE INVENTORY ALLOCATIONS (Stock en botiquines móviles)
CREATE TABLE IF NOT EXISTS public.vehicle_inventory_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_profile_id UUID NOT NULL REFERENCES public.staff_profiles(id) ON DELETE CASCADE,
    supply_id UUID NOT NULL REFERENCES public.supplies(id) ON DELETE RESTRICT,
    current_quantity INTEGER NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
    batch_number TEXT,
    expiration_date DATE,
    last_reconciled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_staff_supply_batch UNIQUE (staff_profile_id, supply_id, batch_number)
);
