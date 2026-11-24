# VET FREEDOM OS — CONTRATOS DE INTEGRACIÓN CON PROVEEDORES DE MAPAS
**Módulo:** VET-CORE-08 | Maps Provider Contract & Deep Links  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Proveedores Integrados y Casos de Uso

| Proveedor | Servicio | Caso de Uso en Vet Freedom OS | Modo de Consumo |
| :--- | :--- | :--- | :--- |
| **Google Maps Platform** | Geocoding API | Validación y normalización de direcciones colombianas. | Backend Supabase (caché persistente). |
| **Google Maps Platform** | Routes API | Cálculo de distancias y tiempos con tráfico histórico de Bogotá. | Backend / Optimizador. |
| **Google Maps App** | Deep Link URI | Navegación paso a paso en el móvil del veterinario. | `https://www.google.com/maps/dir/?api=1&destination=...` |
| **Waze App** | Deep Link URI | Navegación paso a paso con alertas de tráfico y desvíos en vivo. | `https://waze.com/ul?q=...&navigate=yes` |

---

## 2. Deep Links Sanitizados para la Experiencia Móvil

Para garantizar que el veterinario abra su navegación con un solo toque y sin riesgo de inyecciones URL:
- Las direcciones son codificadas estrictamente con `encodeURIComponent`.
- No se transmiten historiales médicos, diagnósticos ni datos sensibles en las URLs de navegación.
- Solo se transmiten las coordenadas o la dirección normalizada de la parada autorizada.

### 2.1 Especificación de Enlaces
- **Google Maps:** `https://www.google.com/maps/dir/?api=1&destination=Calle%20127%20%23%2015-40%2C%20Bogot%C3%A1`
- **Waze:** `https://waze.com/ul?q=Calle%20127%20%23%2015-40%2C%20Bogot%C3%A1&navigate=yes`
