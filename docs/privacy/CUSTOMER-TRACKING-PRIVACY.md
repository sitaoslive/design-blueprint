# VET FREEDOM OS — CUSTOMER TRACKING PRIVACY & SECURITY
## Política de Privacidad por Diseño, Protección de Datos y Secreto Profesional Veterinario
### Versión 15B.0 — Cumplimiento Ley 1581 de 2012 y Ley 576 de 2000

---

## 1. Principio Fundamental
En el modelo de atención veterinaria domiciliaria, la geolocalización del personal médico involucra información altamente sensible:
1. Las direcciones y residencias privadas de las familias y pacientes atendidos a lo largo del día.
2. La seguridad física y personal del médico veterinario y sus auxiliares en las vías públicas de Bogotá.
3. El secreto profesional médico veterinario (Ley 576 de 2000 de Colombia), que prohíbe revelar qué familias o pacientes están recibiendo atención médica.

Por ende, **Vet Freedom OS implementa una arquitectura de privacidad estricta ("Zero Leakage")**:
> **Ningún cliente puede ver la ubicación del vehículo veterinario mientras este se encuentre atendiendo a otro paciente, en un domicilio ajeno o en una parada intermedia.**

---

## 2. Regla de Exposición de Coordenadas

La función de seguridad `validate_customer_tracking_view()` y el servicio `CustomerTrackingAccessService` aplican de forma determinista la siguiente regla:

```mermaid
flowchart TD
    REQ[Petición de Seguimiento con Token] --> AUTH{¿Token Válido y No Expirado?}
    AUTH -- No --> DENY[Acceso Denegado: 401 / 403]
    AUTH -- Sí --> STATE{¿Estado de la Cita?}
    
    STATE -- CONFIRMED / SCHEDULED --> MASK[Retorna: ETA, Horario, Estado\ncurrentLocation: NULL]
    STATE -- IN_SERVICE previo --> MASK
    STATE -- EN_ROUTE hacia este cliente --> EXPOSE[Retorna: ETA, Horario, Estado\ncurrentLocation: {lat, lng, observedAt}]
    STATE -- IN_SERVICE en este cliente --> MASK
    STATE -- COMPLETED / CANCELLED --> REVOKE[Token Revocado / Acceso Cerrado]
```

- **Estado `CONFIRMED` / `SCHEDULED`**: El cliente ve la hora pactada, el ETA proyectado y el tiempo de viaje aproximado. **Coordenadas GPS: `null`**.
- **Estado `EN_ROUTE`**: Único estado donde se transmiten las coordenadas en tiempo real del vehículo, ya que el profesional se desplaza por vías públicas exclusivamente en dirección hacia el domicilio de esa familia.
- **Estado `IN_SERVICE`**: Una vez que el profesional llega y marca llegada (`ARRIVED` / `SERVICE_STARTED`), la transmisión de coordenadas finaliza y vuelve a `null`.
- **Estado `COMPLETED` / `CANCELLED`**: El enlace expira automáticamente.

---

## 3. Arquitectura Criptográfica del Token de Acceso

Para evitar ataques de enumeración o acceso no autorizado:
1. **Generación con Entropía Criptográfica**: Cada enlace de seguimiento utiliza un token aleatorio de 32 bytes (`randomBytes(32)`), proporcionando 256 bits de entropía (imposible de adivinar por fuerza bruta).
2. **Almacenamiento por Hash Seguro**: En la base de datos (`customer_tracking_access`) **nunca se almacena el token en texto plano**. Se almacena únicamente su digest **SHA-256**.
3. **Tiempo de Vida Acotado (TTL)**: Cada token nace con una expiración máxima de 6 horas posteriores a la cita.
4. **Revocación Inmediata**: Si una cita es cancelada o reprogramada, el token asociado queda revocado inmediatamente en la base de datos (`revoked = true`).

---

## 4. Auditoría y Registro de Accesos
Cada intento de consulta al portal de seguimiento queda registrado en los registros de observabilidad de Supabase y Edge Functions:
- Dirección IP de origen (anonimizada conforme a Habeas Data).
- Agente de usuario (User-Agent).
- Momento exacto de consulta.
- Resultado de la autorización (`AUTHORIZED`, `EXPIRED`, `REVOKED`, `INVALID`).

---

## 5. Marco Legal Aplicable
- **Ley Estatutaria 1581 de 2012 (Protección de Datos Personales de Colombia)**: Principios de finalidad, libertad, veracidad, transparencia, acceso restringido y seguridad.
- **Ley 576 de 2000 (Código de Ética para el Ejercicio Profesional de la Medicina Veterinaria y Zootecnia)**: Artículos 32 a 36 relativos al sigilo profesional y la confidencialidad de la historia clínica y el domicilio del usuario.
- **Decreto 1377 de 2013**: Autorización previa y expresa del titular para la recepción de comunicaciones operativas mediante canales digitales (WhatsApp y SMS).
