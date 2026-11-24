# VET FREEDOM OS — AUTH AND ROLES SPECIFICATION
## Especificación de Autenticación, JWT, Identidades y RBAC
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Plataforma de Auth:** Supabase GoTrue / Supabase Auth  
**Fecha:** 2026-11-21  

---

## 1. MECANISMOS DE AUTENTICACIÓN

1. **Email y Contraseña Segura:** Políticas de complejidad para personal médico y administrativo (mínimo 12 caracteres, mayúsculas, números y caracteres especiales).
2. **Magic Links / OTP por Correo o WhatsApp:** Utilizado para tutores de mascotas y cuidadores delegados, minimizando fricción de acceso en la aplicación Lovable.
3. **MFA Obligatorio (TOTP):** Exigido para el Director General (`director`) y Administradores de Sistema (`admin`).
4. **JWT Claims Personalizados:** El token emitido por GoTrue contiene claims extendidos validados en funciones de Postgres:
   - `organization_id`: UUID de la clínica/entidad.
   - `user_role`: Rol principal del usuario.
   - `app_metadata.roles`: Arreglo de roles asignados.

---

## 2. MAPEO DE ROLES Y ASIGNACIÓN (RBAC)

El control de acceso basado en roles se gestiona a través de la tabla `public.user_roles`:

```sql
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role_name TEXT NOT NULL CHECK (role_name IN (
        'director',
        'assigned_veterinarian',
        'replacement_veterinarian',
        'support',
        'logistics_routes',
        'quality_cx',
        'finance_reconciliation',
        'system_admin',
        'external_specialist',
        'client',
        'delegated_caretaker'
    )),
    organization_id UUID NOT NULL REFERENCES public.organizations(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (profile_id, role_name, organization_id)
);
```

---

## 3. FUNCIONES DE CONTEXTO DE SEGURIDAD EN POSTGRESQL

Para que las políticas RLS y los RPCs determinen el contexto del llamante sin incurrir en lecturas lentas recurrentes, se utilizan las siguientes funciones de soporte:

```sql
-- Obtiene la organización activa del usuario autenticado
CREATE OR REPLACE FUNCTION public.get_current_user_organization_id()
RETURNS UUID AS $$
    SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Valida si el usuario tiene un rol específico
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE profile_id = auth.uid()
          AND role_name = required_role
    );
$$ LANGUAGE sql STABLE SECURITY DEFINER;
```

---

## 4. CICLO DE VIDA DE SESIÓN Y REVOCACIÓN DE ACCESO

- **Expiración de Tokens de Acceso:** 3600 segundos (1 hora).
- **Refresh Tokens:** Rotación automática en cada refresco con detección de reutilización.
- **Revocación Inmediata de Acceso:** Cuando un usuario es desactivado en `public.profiles` (`is_active = false`), un hook de seguridad invalida las sesiones en GoTrue y las funciones RLS rechazan de inmediato cualquier consulta subsiguiente.
- **Revocación de Cuidador Delegado:** Al marcar `is_revoked = true` o sobrepasar `valid_until` en `public.delegated_caretakers`, la función evaluadora bloquea el acceso en la siguiente transacción.
