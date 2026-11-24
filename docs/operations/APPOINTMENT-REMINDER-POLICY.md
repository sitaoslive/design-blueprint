# VET FREEDOM OS — POLÍTICA DE RECORDATORIOS Y DISPATCH DE CITAS
**Módulo:** VET-CORE-05 | Appointment Notification Service  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Zona Horaria:** America/Bogota

---

## 1. Cadencia y Ventanas Temporales de Notificación

Para visitas veterinarias domiciliarias en Bogotá y la Sabana, la política de recordatorios se rige por la siguiente cadencia:

```
[ Solicitud Recibida ] 
       │ 
       ▼ (Validación OKVET)
[ CONFIRMACIÓN OFICIAL ]  ──► Inmediato tras verify_and_confirm_appointment_okvet()
       │
       ▼ (Si faltan > 24 horas para la cita)
[ RECORDATORIO 24H ]      ──► 24 horas antes de start_time (T-24h)
       │                      Instrucciones de preparación del paciente y domicilio
       ▼
[ RECORDATORIO 2H ]       ──► 2 horas antes de start_time (T-2h)
                              Aviso de médico en ruta y coordinación de portería
```

---

## 2. Reglas de Exclusión y Omisión Inteligente

1. **Citas de Urgencia / Mismo Día (< 24 horas de antelación):**
   Si una cita es confirmada con menos de 24 horas antes de `start_time`, el sistema **omite automáticamente** el recordatorio de 24h (`REMINDER_24H`), programando únicamente la confirmación inmediata y el recordatorio de 2 horas (`REMINDER_2H`).
2. **Citas Inmediatas (< 2 horas de antelación):**
   Si la cita se agenda con menos de 2 horas de antelación, se despacha exclusivamente la confirmación oficial inmediata que incluye la indicación de que el médico va en camino.
3. **Protocolo de Duelo Ético (`BEREAVEMENT_ACTIVE`):**
   Antes de despachar cualquier recordatorio, el procesador verifica la tabla `public.whatsapp_contact_suppressions`. Si el tutor tiene activa una supresión por duelo (fallecimiento reciente de mascota), **el trabajo se suprime inmediatamente** con `status = 'SUPPRESSED'`, evitando causar dolor o incomodidad a la familia.
4. **Horarios de No-Molestia Nocturna:**
   Los recordatorios de 24 horas para citas que ocurren temprano en la mañana (ej. 7:00 AM o 8:00 AM) no se envían a las 7:00 AM o 8:00 AM de la noche previa si violan el horario hábil, ajustándose a la ventana recomendada (entre 8:00 AM y 7:00 PM).

---

## 3. Manejo de Retrasos y Contingencias Viales (Bogotá)

Si el veterinario se retrasa por congestión vehicular severa en corredores como Autopista Norte, Calle 80, Carrera Séptima o Avenida Boyacá:
1. El médico o la app móvil notifica un retraso estimado (`DELAY_NOTICE`).
2. Se genera un mensaje explicativo y empático al tutor con el nuevo tiempo estimado de llegada (ETA).
3. Si el retraso supera los 45 minutos, se ofrece al tutor la opción de mantener la visita o reprogramar sin penalización.
