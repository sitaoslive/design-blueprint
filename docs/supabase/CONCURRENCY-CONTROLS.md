# VET FREEDOM OS — CONCURRENCY CONTROLS SPECIFICATION
## Controles de Concurrencia, Bloqueos y Prevención de Solapamientos
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Base de Datos:** PostgreSQL 17.12.0  
**Fecha:** 2026-11-21  

---

## 1. DESAFÍOS DE CONCURRENCIA EN SERVICIOS VETERINARIOS DOMICILIARIOS

El agendamiento veterinario a domicilio presenta restricciones complejas de concurrencia:
1. **Solapamiento Temporal:** Dos clientes intentando reservar la misma franja horaria del mismo veterinario.
2. **Tiempos de Desplazamiento Geográfico:** Un profesional no puede terminar una cita en Usaquén y comenzar otra 10 minutos después en Suba o Cedritos.
3. **Múltiples Canales de Reserva:** Peticiones simultáneas desde Lovable SPA, WhatsApp Bot y personal de Soporte telefónico.

---

## 2. ESTRATEGIAS DE CONTROL DE CONCURRENCIA IMPLEMENTADAS

### 2.1 Bloqueo Pesimista en RPCs Transaccionales (`SELECT FOR UPDATE`)
En operaciones donde se modifica el estado de una cita o se aprueba una confirmación manual, la base de datos bloquea la fila involucrada a nivel de motor:

```sql
SELECT status, assigned_veterinarian_id
INTO v_appointment
FROM public.appointments
WHERE id = p_appointment_id
FOR UPDATE;
```
Esto garantiza que si dos operadores intentan confirmar o modificar la misma cita simultáneamente, la segunda transacción esperará a que la primera concluya, evaluando el nuevo estado de forma segura.

### 2.2 Reservas Temporales Atómicas (`appointment_holds`)
Para evitar condiciones de carrera antes de que una cita sea confirmada en OKVET Cloud:
1. Al seleccionar una franja horaria en la interfaz, se invoca `create_appointment_hold()`.
2. La función evalúa atómicamente si existen holds activos o citas confirmadas que colisionen en el intervalo `[start_time, end_time)`.
3. Si el slot está libre, se genera un hold con vigencia estricta de 15 minutos (`expires_at = now() + interval '15 minutes'`).
4. Si un segundo usuario solicita el mismo intervalo durante esos 15 minutos, la función rechaza la solicitud con el código `SLOT_UNAVAILABLE`.
5. Si el usuario completa el proceso, el hold pasa a estado `CONSUMED`; si abandona la pantalla o pasan los 15 minutos, el hold expira y el slot vuelve a quedar libre.

### 2.3 Restricción de Exclusión con `btree_gist`
Para citas formalmente confirmadas, se aplica una restricción de exclusión a nivel de tabla PostgreSQL:

```sql
ALTER TABLE public.appointments
ADD CONSTRAINT prevent_veterinarian_schedule_overlap
EXCLUDE USING gist (
    assigned_veterinarian_id WITH =,
    tstzrange(start_time, end_time, '[)') WITH &&
)
WHERE (status IN ('CONFIRMED', 'SCHEDULED', 'EN_ROUTE', 'IN_PROGRESS'));
```
Esta restricción matemática a nivel de kernel de PostgreSQL hace física e intrínsecamente imposible que el motor de base de datos permita dos citas confirmadas simultáneas para el mismo profesional, independientemente de la aplicación o cliente que ejecute el query.

---

## 3. CONTROL OPTIMISTA MEDIANTE VERSIONES (`version_id`)

En entidades altamente concurrentes de inventario y configuración (`public.mobile_inventories`, `public.vehicle_stock_ledgers`):
1. Cada registro incluye una columna `version INT NOT NULL DEFAULT 1`.
2. Toda actualización debe incluir en la cláusula `WHERE` la versión leída originalmente:
   ```sql
   UPDATE public.mobile_inventories
   SET quantity = quantity - 1, version = version + 1, updated_at = now()
   WHERE id = $id AND version = $expected_version;
   ```
3. Si `ROW_COUNT = 0`, el backend detecta una colisión de escritura concurrente y solicita al cliente refrescar los datos.
