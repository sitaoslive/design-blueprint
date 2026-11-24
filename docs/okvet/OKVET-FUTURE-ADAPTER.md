# VET FREEDOM OS — OKVET FUTURE ADAPTER SPECIFICATION
## Preparación Arquitectónica para una Futura API Oficial de OKVET
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Patrón de Diseño:** Adapter & Strategy Pattern  
**Fecha:** 2026-11-21  

---

## 1. PRINCIPIO DE AISLAMIENTO ARQUITECTÓNICO

El sistema Vet Freedom OS ha sido concebido de forma que **ninguna tabla transaccional de negocio ni interfaz de usuario dependa de cómo se comunica el backend con OKVET**. Toda la interacción clínica y de agenda está desacoplada mediante el Registro de Capacidades (`okvet_capability_registry`) y la configuración del conector (`okvet_connector_configuration`).

Si en el futuro la empresa proveedora de OKVET Cloud habilita una API REST oficial, GraphQL o webhooks seguros con autenticación OAuth 2.0, la transición no requerirá reescribir la base de datos ni los flujos de n8n.

---

## 2. INTERFAZ CANÓNICA DEL CONECTOR (`IOkvetConnector`)

```typescript
export interface IOkvetConnector {
  getMode(): 'MANUAL_ASSISTED' | 'DIRECT_API' | 'HYBRID';
  
  // Verificación de disponibilidad
  checkAvailability(
    veterinarianId: string,
    timeRange: { start: string; end: string }
  ): Promise<{ available: boolean; conflicts?: any[] }>;

  // Creación o Confirmación de Cita
  confirmAppointment(
    appointmentId: string,
    payload: {
      patientExternalId?: string;
      clientExternalId?: string;
      startTime: string;
      endTime: string;
      serviceCode: string;
      evidenceNotes: string;
    }
  ): Promise<{
    success: boolean;
    okvetAppointmentId: string;
    requiresHumanReview: boolean;
  }>;

  // Sincronización de Pacientes
  syncPatient(patientId: string): Promise<{ okvetPatientId: string }>;
}
```

---

## 3. COMPARATIVA DE IMPLEMENTACIONES

```
                  +-----------------------------------+
                  |         IOkvetConnector           |
                  +-----------------+-----------------+
                                    |
          +-------------------------+-------------------------+
          |                                                   |
          v                                                   v
+-------------------------------+           +-------------------------------+
| ManualAssistedOkvetConnector  |           |     DirectApiOkvetConnector   |
| (ACTUAL - En Producción/QA)   |           |    (FUTURO - Plug-and-Play)   |
|                               |           |                               |
| - Depende de operador humano  |           | - Llamadas REST / OAuth 2.0   |
| - Formulario Lovable          |           | - Webhooks en tiempo real     |
| - submit_okvet_confirmation() |           | - Confirmación atómica < 1s   |
| - Pipeline staging CSV/XLSX   |           | - Fallback a Manual si hay 5xx|
+-------------------------------+           +-------------------------------+
```

---

## 4. RUTA DE MIGRACIÓN SIN TIEMPO DE INACTIVIDAD

Cuando se obtenga acceso a la API oficial de OKVET:
1. **Configuración del Conector:** Actualizar `public.okvet_connector_configuration`:
   ```sql
   UPDATE public.okvet_connector_configuration
   SET connector_mode = 'DIRECT_API',
       api_base_url = 'https://api.okvet.com/v1',
       updated_at = now()
   WHERE organization_id = '11111111-1111-1111-1111-111111111111';
   ```
2. **Actualización de Capacidades:** Modificar `okvet_capability_registry` para cambiar `APPOINTMENT_WRITE` de `PROHIBITED_DIRECT_API` a `AUTOMATED_SUPPORTED`.
3. **Despliegue del Adapter en Edge Functions / n8n:** Activar el worker directo sin alterar el frontend de Lovable, el cual continuará leyendo `okvet_sync_status = 'CONFIRMED'`.
4. **Mantenimiento del Puente Asistido como Fallback:** Si la API oficial de OKVET experimenta caídas o mantenimiento, el conector conmuta automáticamente al modo `MANUAL_ASSISTED` sin interrumpir las operaciones de Vet Life.
