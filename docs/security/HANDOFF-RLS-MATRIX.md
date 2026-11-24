# HANDOFF ROW LEVEL SECURITY (RLS) MATRIX
## VET FREEDOM OS — Políticas de Acceso y Segregación
**Fecha:** 2026-11-21  
**Cobertura:** 100% de tablas protegidas (`rowsecurity = true`)  

---

## 1. Matriz de Autorización por Rol

| Tabla | `OWNER_CLIENT` | `VETERINARIAN` | `COORDINATOR` | `RECEPTION` | `FINANCE` | `DIRECTOR` | `SYSTEM` (RPCs) |
|---|---|---|---|---|---|---|---|
| `public.conversations` | SELECT (Propias) | SELECT / UPDATE | SELECT / UPDATE | SELECT / UPDATE | SELECT / UPDATE | FULL ACCESS | SECURITY DEFINER |
| `public.conversation_handoffs`| NO ACCESS | SELECT / UPDATE (Asignadas/Cola) | SELECT / UPDATE | SELECT / UPDATE | SELECT / UPDATE | FULL ACCESS | SECURITY DEFINER |
| `public.conversation_state_transitions`| NO ACCESS | SELECT (Auditoría) | SELECT (Auditoría) | SELECT (Auditoría) | SELECT (Auditoría) | FULL ACCESS | INSERT ONLY (Inmutable)|
| `public.conversation_internal_notes`| **NO ACCESS** | SELECT / INSERT | SELECT / INSERT | SELECT / INSERT | SELECT / INSERT | FULL ACCESS | SECURITY DEFINER |
| `public.messages` | SELECT / INSERT (Inbound) | SELECT / INSERT | SELECT / INSERT | SELECT / INSERT | SELECT / INSERT | FULL ACCESS | SECURITY DEFINER |

---

## 2. Aislamiento Multi-Inquilino (Tenant Isolation)
- Toda consulta y mutación valida `organization_id = auth.current_organization_id()`.
- Ningún miembro de otra organización puede listar, reclamar ni visualizar conversaciones o handoffs pertenecientes a `Vet Life — Veterinaria a Domicilio` (`11111111-1111-1111-1111-111111111111`).

---

## 3. Políticas RLS Específicas en Migración 026

```sql
-- Isolation Policy en conversation_handoffs
CREATE POLICY handoffs_org_isolation ON public.conversation_handoffs
  FOR ALL TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() LIMIT 1));

-- Proteccion Absoluta de Notas Internas (Clientes NUNCA pueden leer notas)
CREATE POLICY notes_staff_only ON public.conversation_internal_notes
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_memberships 
      WHERE user_id = auth.uid() 
        AND organization_id = conversation_internal_notes.organization_id 
        AND role IN ('VETERINARIAN', 'COORDINATOR', 'RECEPTION', 'FINANCE', 'DIRECTOR', 'ADMINISTRATOR', 'TECH_SUPPORT')
    )
  );

-- Inmutabilidad de Auditoria (Transiciones nunca pueden ser borradas ni editadas)
CREATE POLICY transitions_read_only ON public.conversation_state_transitions
  FOR SELECT TO authenticated
  USING (organization_id = (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid() LIMIT 1));
```
