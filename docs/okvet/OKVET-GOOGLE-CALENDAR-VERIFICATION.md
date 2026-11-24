# VET FREEDOM OS — OKVET & GOOGLE CALENDAR VERIFICATION RULES
## Reglas de Interacción entre OKVET, Supabase y Google Calendar (VET-CORE-06)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Integración:** Google Calendar API oficial  
**Fecha:** 2026-11-21  

---

## 1. PRINCIPIO DE JERARQUÍA DE FUENTES DE VERDAD

1. **OKVET Cloud:** Única autoridad legal y clínica oficial en Colombia.
2. **Supabase:** Fuente de verdad operativa, transaccional, financiera y de autorización en Vet Freedom OS.
3. **Google Calendar:** Herramienta de visualización operativa y bloqueo de disponibilidad personal para los veterinarios en campo. **No es fuente de verdad clínica ni comercial.**

```
+------------------+ (Confirmación Humana)  +-------------------+
|   OKVET Cloud    | ---------------------> |    Supabase DB    |
| (Autoridad Legal)|                        | (Fuente Operativa)|
+------------------+                        +---------+---------+
                                                      |
                                                      | (Sincronización segura VET-CORE-06)
                                                      v
                                            +-------------------+
                                            |  Google Calendar  |
                                            | (Agenda de Campo) |
                                            +-------------------+
```

---

## 2. REGLAS IRRENUNCIABLES DE SINCRONIZACIÓN

### Regla 1: Prohibida la Exportación a Google Calendar sin Confirmación en OKVET
- El flujo VET-CORE-06 tiene prohibido crear eventos en Google Calendar para citas en estado `REQUESTED` o `PENDING_OKVET_CONFIRMATION`.
- Solo las citas con `status = 'CONFIRMED'` y `okvet_sync_status = 'CONFIRMED_HUMAN'` pueden ser sincronizadas con el calendario del profesional asignado.

### Regla 2: Un Evento en Google Calendar No Confirma Citas Clínicas
- Si un veterinario crea manualmente un evento en su Google Calendar (ej. "Cita con Max"), la sincronización inversa **NUNCA** crea ni confirma automáticamente una cita en Supabase ni en OKVET.
- El sistema únicamente marca ese intervalo horario como "Bloqueo Personal / Ocupado" en `staff_availability` para evitar que el motor de agendamiento ofrezca esa franja a otros clientes.

### Regla 3: Protección de Privacidad Médica en Calendarios Externos
- De acuerdo con la Ley 1581 de 2012, los títulos de eventos en Google Calendar no deben contener datos clínicos privados ni diagnósticos (ej. no colocar "Quimioterapia de Pelusa").
- Formato estandarizado de título en Google Calendar:
  `[Vet Life] Cita Domiciliaria - Sector {Cluster} - {PetName}`
- La descripción del evento contiene un enlace seguro y autenticado a la vista de cita en Lovable SPA, requiriendo inicio de sesión para acceder a las notas médicas.

### Regla 4: Modo Desarrollo / QA
- En el entorno actual, la sincronización con Google Calendar se mantiene en **modo de solo lectura simulada / sandbox**. Ningún evento productivo es modificado o eliminado sin autorización explícita del Dr. Luis Eduardo Ríos.
