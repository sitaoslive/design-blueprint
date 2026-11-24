# VET FREEDOM OS — SMART ETA ENGINE
## Especificación Técnica del Motor de Estimación de Llegada en Tiempo Real
### Versión 15B.0 — Antigravity + Supabase + Google Routes / OSRM

---

## 1. Fundamentos Matemáticos y Fórmulas

El motor de ETA (`VetEtaEngine`) combina datos geoespaciales, telemetría de campo y modelos predictivos para proyectar la hora exacta de arribo al domicilio del paciente.

### 1.1 Fórmula General de Arribo
$$\text{predictedArrivalAt} = t_{\text{origin}} + \Delta t_{\text{travel}} + \Delta t_{\text{buffer}}$$

Donde:
- $t_{\text{origin}}$: Momento efectivo de partida. Si el profesional ya se encuentra en tránsito (`visitStatus === 'EN_ROUTE'`), $t_{\text{origin}} = \text{now()}$. Si se encuentra en una atención previa, $t_{\text{origin}} = \text{predictedFinishAt} + \Delta t_{\text{admin}}$.
- $\Delta t_{\text{travel}}$: Tiempo estimado de viaje obtenido del proveedor de rutas.
- $\Delta t_{\text{buffer}}$: Margen de maniobra y estacionamiento domiciliario en Bogotá (típicamente 3 a 5 minutos).

### 1.2 Estimación de Distancia y Fallback Geodésico
Cuando el proveedor primario (Google Routes API) no responde o se encuentra degradado, el sistema calcula la distancia ortodrómica utilizando la fórmula del semiverseno (**Haversine**):

$$a = \sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1) \cdot \cos(\phi_2) \cdot \sin^2\left(\frac{\Delta \lambda}{2}\right)$$
$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1-a}\right)$$
$$d = R \cdot c \quad (\text{donde } R = 6371 \text{ km})$$

### 1.3 Factor de Corrección por Malla Vial y Tráfico de Bogotá
En Bogotá, el factor de desvío vial sobre la distancia geodésica lineal es típicamente $1.35$ a $1.40$. La velocidad media urbana se parametriza según la franja horaria:

| Franja Horaria (Hora Colombia) | Tipo de Flujo | Velocidad Promedio | Multiplicador de Congestión |
| :--- | :--- | :--- | :--- |
| **06:30 – 08:30** | Pico Matutino | 15 km/h | $1.40 \times$ |
| **08:30 – 17:00** | Valle Diurno | 22 km/h | $1.00 \times$ |
| **17:00 – 19:30** | Pico Vespertino | 13 km/h | $1.50 \times$ |
| **19:30 – 06:30** | Valle Nocturno | 30 km/h | $0.85 \times$ |

---

## 2. Niveles de Confianza del ETA (`EtaConfidence`)

El evaluador de confianza (`EtaConfidenceEvaluator`) clasifica cada proyección en cuatro niveles según la integridad y frescura de los datos:

```mermaid
graph TD
    GPS[Recepción de Ubicación GPS] --> FRESCA{¿Obsolescencia <= 5 min?}
    FRESCA -- No --> C_STALE[Confianza: LOW / Estado: STALE]
    FRESCA -- Sí --> ACC{¿Precisión <= 50m?}
    ACC -- No --> C_MED[Confianza: MEDIUM / GPS Impreciso]
    ACC -- Sí --> PROV{¿Proveedor con Tráfico en Vivo?}
    PROV -- Google Routes --> C_HIGH[Confianza: HIGH]
    PROV -- OSRM / Haversine --> C_MED2[Confianza: MEDIUM]
    GPS -. Ausente .- -> C_UNAV[Confianza: UNAVAILABLE / Estado: DEGRADED]
```

1. **`HIGH`**: Telemetría GPS recibida hace menos de 5 minutos, precisión satelital menor a 50 metros y proveedor con tráfico en tiempo real activo (`hasLiveTraffic: true`).
2. **`MEDIUM`**: Datos de tráfico no disponibles (OSRM o fallback Haversine) O precisión GPS entre 50 y 100 metros.
3. **`LOW`**: Telemetría GPS obsoleta (> 5 minutos) o degradación severa de conectividad.
4. **`UNAVAILABLE`**: Sin coordenadas del profesional o servicio no asignado. Se prohíbe notificar al cliente en este estado.

---

## 3. Caché Geográfico de Rutas
Para optimizar costos de API y asegurar alta disponibilidad:
- Se redondean las coordenadas de origen y destino a 3 decimales (~110 metros de cuadrícula).
- Las respuestas se almacenan en memoria con un TTL de 5 minutos.
- Si dos consultas sucesivas ocurren dentro de la misma cuadrícula urbana en el lapso de 5 minutos, se sirve la estimación en caché sin consumir cuotas externas.

---

## 4. Abstracción del Proveedor de Rutas (`RoutingProvider`)

```typescript
export interface RoutingProvider {
  readonly name: string;
  readonly hasLiveTraffic: boolean;
  getTravelEstimate(origin: Coordinates, destination: Coordinates): Promise<TravelEstimate>;
  checkHealth(): Promise<RoutingProviderHealth>;
}
```

- **`GoogleRoutesProvider`**: Implementación principal. Utiliza la API v2 de Google Routes (`computeRoutes`) con preferencias de tráfico dinámico (`TRAFFIC_AWARE_OPTIMAL`).
- **`OsrmRoutingProvider`**: Alternativa basada en servidores OpenStreetMap / OSRM locales o autoalojados, ideal para contingencias de red sin costos por llamada.
