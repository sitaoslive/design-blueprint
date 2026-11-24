-- ==============================================================================
-- MIGRATION 020: SEED VET LIFE CORE ORGANIZATION
-- Proyecto: VET FREEDOM OS
-- Empresa: Vet Life — Veterinaria a Domicilio (Dr. Luis Eduardo Ríos)
-- Dirección Estratégica: Alpha Vision Method
-- ==============================================================================

-- Insertar Organización Principal
INSERT INTO public.organizations (
    id,
    name,
    legal_name,
    tax_id,
    slug,
    is_active,
    timezone,
    default_currency,
    contact_phone,
    contact_email,
    settings
) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'Vet Life — Veterinaria a Domicilio',
    'Vet Life Veterinaria a Domicilio S.A.S.',
    '901.789.456-1',
    'vet-life',
    true,
    'America/Bogota',
    'COP',
    '+573001234567',
    'contacto@vetlifedomicilio.com',
    jsonb_build_object(
        'business_hours', jsonb_build_object('start', '07:00', 'end', '19:00'),
        'coverage_zones', jsonb_build_array('Norte', 'Chapinero', 'Usaquén', 'Suba', 'Occidente', 'Teusaquillo')
    )
)
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    updated_at = NOW();
