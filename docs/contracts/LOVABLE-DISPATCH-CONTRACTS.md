# VET FREEDOM OS — LOVABLE FRONTEND CONTRACTS (DISPATCH & ETA)
## Especificación de Interfaces, RPCs y Canales Realtime para la UI de Lovable
### Versión 15B.0 — Frontend React / TypeScript + Supabase Client

---

## 1. Visión General
Este documento define los contratos formales que la aplicación frontend construida en **Lovable** utiliza para interactuar con el backend de **Live Dispatch & Smart ETA** en Supabase.

Existen tres interfaces principales en Lovable:
1. **Panel de Coordinación y Despacho en Vivo** (Uso por el Director Dr. Luis Eduardo Ríos y equipo de operaciones).
2. **Aplicación Móvil / PWA de Campo** (Uso por los Médicos Veterinarios y Auxiliares).
3. **Portal Web de Seguimiento para Propietarios** (Visualización pública autenticada por token efímero).

---

## 2. Contratos RPC en Supabase

### 2.1 Registro de Eventos de Temporización de Visita
Utilizado por la app del veterinario al cambiar el estado de la atención.

```typescript
// Firma RPC: public.record_visit_timing_event
const { data, error } = await supabase.rpc('record_visit_timing_event', {
  p_organization_id: '11111111-1111-1111-1111-111111111111',
  p_visit_id: 'visit-uuid',
  p_event_type: 'SERVICE_STARTED', // 'TRAVEL_STARTED' | 'ARRIVED' | 'SERVICE_STARTED' | 'ESTIMATED_FINISH_UPDATED' | 'SERVICE_FINISHED'
  p_staff_id: 'user-uuid',
  p_latitude: 4.7020,               // Opcional
  p_longitude: -74.0410,            // Opcional
  p_accuracy_meters: 12.5,          // Opcional
  p_notes: 'Paciente cooperador, inicio de examen físico' // Opcional
});
```

### 2.2 Ingesta de Telemetría GPS
Invocado de forma periódica (cada 15 a 30 segundos) mientras el profesional tiene una sesión de tracking activa.

```typescript
// Firma RPC: public.ingest_location_observation
const { data, error } = await supabase.rpc('ingest_location_observation', {
  p_organization_id: '11111111-1111-1111-1111-111111111111',
  p_tracking_session_id: 'session-uuid',
  p_device_id: 'device-uuid',
  p_staff_id: 'user-uuid',
  p_latitude: 4.7085,
  p_longitude: -74.0392,
  p_accuracy_meters: 8.0,
  p_altitude: 2600.0,              // Opcional
  p_heading: 45.0,                  // Opcional (grados 0-360)
  p_speed_meters_per_second: 8.5,   // Opcional (~30 km/h)
  p_source: 'GPS'                   // 'GPS' | 'NETWORK' | 'PASSIVE'
});
```

### 2.3 Generación de Enlace de Seguimiento para el Cliente
Invocado al confirmar la cita o al despachar el aviso preventivo de trayecto.

```typescript
// Firma RPC: public.issue_customer_tracking_token
const { data: tokenResult, error } = await supabase.rpc('issue_customer_tracking_token', {
  p_organization_id: '11111111-1111-1111-1111-111111111111',
  p_appointment_id: 'appointment-uuid',
  p_ttl_hours: 6
});

// Retorna:
// {
//   token: "4f7a8b...64_caracteres_hex",
//   url: "https://vetlife.app/t/4f7a8b...",
//   expires_at: "2026-11-21T23:00:00Z"
// }
```

### 2.4 Validación y Carga de Vista de Seguimiento del Cliente
Invocado de forma anónima desde el frontend cuando la familia abre el enlace `https://vetlife.app/t/:token`.

```typescript
// Firma RPC: public.validate_customer_tracking_view (Seguridad del Definidor / anon autorizada)
const { data: trackingView, error } = await supabase.rpc('validate_customer_tracking_view', {
  p_token: rawTokenFromUrl
});

// Estructura de Respuesta (TypeScript):
interface CustomerTrackingViewResponse {
  authorized: boolean;
  reason?: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'REVOKED_TOKEN';
  appointment_id?: string;
  status?: string;                  // 'CONFIRMED' | 'EN_ROUTE' | 'ARRIVED' | 'IN_SERVICE' | 'COMPLETED'
  scheduled_start?: string;
  predicted_arrival?: string;
  predicted_travel_minutes?: number;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNAVAILABLE';
  // REGLA DE PRIVACIDAD: Solo presente si status === 'EN_ROUTE'
  current_location?: {
    latitude: number;
    longitude: number;
    observed_at: string;
  } | null;
}
```

---

## 3. Canales Supabase Realtime para Lovable

El panel de coordinación en Lovable se suscribe a los cambios en tiempo real para reflejar de inmediato cualquier cambio de estado en la ruta:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Suscripción a Incidencias de Retraso Activas
const incidentChannel = supabase
  .channel('live-dispatch-incidents')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'delay_incidents'
    },
    (payload) => {
      console.log('Cambio en incidencias de retraso:', payload);
      // Actualizar tarjeta de alerta en panel de despacho
    }
  )
  .subscribe();

// Suscripción a Nuevas Predicciones de ETA
const etaChannel = supabase
  .channel('live-eta-updates')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'eta_predictions'
    },
    (payload) => {
      console.log('Nuevo cálculo de ETA:', payload.new);
      // Refrescar mapa de ruta y tiempos de llegada proyectados
    }
  )
  .subscribe();
```

---

## 4. Manejo de Errores y Estados de Degradación en UI

| Código de Error / Estado | Causa | Comportamiento Requerido en Lovable |
| :--- | :--- | :--- |
| `STALE_GPS_LOCATION` | Teléfono sin señal > 5 min | Mostrar badge naranja "GPS desactualizado" junto al médico. No bloquear interfaz. |
| `INVALID_TOKEN` | Token no existe o corrupto | Mostrar pantalla amigable: "El enlace de seguimiento no es válido. Comunícate con Vet Life." |
| `EXPIRED_TOKEN` | Consulta concluida hace > 6h | Mostrar: "Esta atención ya ha finalizado con éxito. Gracias por confiar en Vet Life." |
| `COOLDOWN_ACTIVE` | Intento de reenvío < 30 min | Deshabilitar botón de reenvío manual mostrando temporizador regresivo. |
