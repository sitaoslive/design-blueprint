# VET FREEDOM OS — CONTRATO DEL MOTOR DE OPTIMIZACIÓN DE RUTAS
**Módulo:** VET-CORE-08 | Route Optimization Contract  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Separación de Responsabilidades

El motor de optimización (ej. Google Route Optimization API, Google Routes Matrix, OR-Tools) opera como un **servicio desacoplado de solo lectura**.

- **El Optimizador:** Recibe una matriz de distancias, citas confirmadas y restricciones, y devuelve propuestas heurísticas con métricas de tiempo y kilómetros.
- **Supabase:** Es la única fuente de verdad y custodia de la agenda y las rutas.
- **La Coordinación:** Es la única entidad que puede aprobar o rechazar propuestas.

---

## 2. Restricciones Duras vs. Objetivos Secundarios

### 2.1 Restricciones Duras (Inviolables)
El optimizador **nunca** puede violar estas restricciones para reducir kilómetros o tiempo:
1. **Citas Confirmadas en OKVET:** Cero inclusión de citas tentativas o solicitudes sin confirmar.
2. **Paradas Clínicamente Protegidas:** Visitas marcadas con `is_clinically_protected = true` (ej. cirugías programadas, pacientes que requieren ayuno riguroso, administración horaria de insulina o quimioterápicos) no pueden ser desplazadas de su franja horaria.
3. **Capacidad Máxima y Descansos:** Máximo 6 visitas por jornada de 8 horas; buffer mínimo obligatorio de 15 minutos entre domicilios para descanso y desinfección de material.
4. **Competencias del Profesional:** Sólo se asignan pacientes que requieran procedimientos para los cuales el profesional esté certificado (`skills`).

### 2.2 Objetivos Secundarios
Una vez satisfechas las restricciones duras, el algoritmo optimiza:
- Minimización de la distancia total recorrida (km).
- Minimización del tiempo muerto en congestión vehicular.
- Equidad de carga entre los vehículos móviles en servicio.

---

## 3. Esquema del Contrato de Propuesta (JSON)

```json
{
  "request_id": "opt-req-20261121-0042",
  "route_date": "2026-11-21",
  "veterinarian_id": "vet-luis",
  "start_hub": { "lat": 4.6985, "lng": -74.0321, "address": "Sede Principal Vet Life" },
  "stops": [
    {
      "stop_id": "stp-001",
      "appointment_id": "apt-001",
      "lat": 4.7082,
      "lng": -74.0415,
      "is_clinically_protected": true,
      "earliest_arrival": "2026-11-21T08:30:00-05:00",
      "latest_arrival": "2026-11-21T09:30:00-05:00",
      "duration_minutes": 45
    }
  ],
  "constraints": {
    "max_daily_stops": 6,
    "min_buffer_minutes": 15,
    "traffic_model": "PESSIMISTIC"
  }
}
```
