# VET FREEDOM OS — ARQUITECTURA DE RUTAS Y LOGÍSTICA DE DESPACHO
**Módulo:** VET-CORE-08 | Route Notifications & Operational Logistics Dispatch  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Visión y Principios Operacionales

El servicio veterinario a domicilio de Vet Life opera en un entorno geográfico de alta complejidad (Bogotá D.C. y municipios de la Sabana Norte como Chía, Cajicá, Cota, Sopó y La Calera). Para brindar puntualidad, tranquilidad al tutor y eficiencia al equipo clínico, el sistema de rutas se rige por axiomas inviolables:

1. **"Una ruta propuesta no es una ruta publicada."**  
   Cualquier corrida del optimizador es una sugerencia en modo borrador (`PENDING_APPROVAL`). Requiere aprobación formal del Coordinador o Director.
2. **"Una ruta publicada no significa que el profesional comenzó desplazamiento."**  
   El desplazamiento solo existe cuando el veterinario pulsa explícitamente "En camino" en la aplicación móvil Lovable.
3. **"Un tiempo estimado (ETA) es una estimación técnica, no una hora garantizada ni ubicación en vivo."**  
   Los cálculos incorporan buffers de tráfico de Bogotá y jamás se prometen horas exactas cuando existe incertidumbre climática o vial.
4. **"CERO seguimiento GPS permanente ni telemetría oculta."**  
   Se respeta rigurosamente el derecho a la intimidad del personal médico y la privacidad de los domicilios de los clientes. El sistema opera mediante hitos operacionales puntuales (`En camino`, `He llegado`, `Inicio`, `Fin`).
5. **"La finalización de la visita en ruta no sustituye el cierre clínico en OKVET."**  
   El registro médico oficial, fórmulas, remisiones y evolución patológica pertenecen al sistema clínico OKVET.

---

## 2. Diagrama de Arquitectura de los 5 Componentes

```mermaid
flowchart TD
    subgraph A. Supabase PostgreSQL 17
        Appts[(Citas Confirmadas OKVET)] --> Prep[prepare_daily_route_proposal]
        Prep --> Routes[(public.routes v1)]
        Routes --> Stops[(public.route_stops)]
        Stops --> Events[(public.route_stop_events)]
        Routes --> Versions[(public.route_plan_versions)]
        Routes --> Outbox[(public.outbox_events)]
    end

    subgraph B. Motor de Mapas y Geocodificación
        Geo[Google Geocoding / Address Verification]
        RoutesAPI[Google Routes API / Traffic Buffers]
        DeepLinks[Waze & Google Maps Deep Links]
    end

    subgraph C. Motor de Optimización
        OR_Tools[Motor Heurístico / OR-Tools]
        Prep -.-> OR_Tools
        OR_Tools -.-> Reopt[Propuestas de Reordenamiento]
    end

    subgraph D. Orquestador n8n VET-CORE-08
        TriggerWeb[Webhook /routes/notify] --> Router[Process Route Event]
        TriggerCron[Schedule Trigger: 5m] --> Router
        Router --> CheckEligible{¿Elegible Notificación?}
        CheckEligible -->|Sí| EnqueueCORE03[Prepare Outbound Dispatch Request]
        CheckEligible -->|No| SignalCORE20[Log Operational Milestone Signal]
    end

    subgraph E. Aplicación Móvil Lovable (UI Veterinario y Coordinador)
        VetUI[Panel Mi Jornada: Próxima Parada] --> Actions[Botones: En camino / He llegado / Inicio / Fin]
        Actions --> SupaRPCs[Supabase RPCs Atómicas]
        CoordUI[Consola Coordinación: Mapa y Retrasos] --> Approvals[Aprobar / Reoptimizar]
    end

    SupaRPCs --> Stops
    Outbox --> TriggerWeb
    EnqueueCORE03 -.-> CORE03[VET-CORE-03: WhatsApp Safe Sender]
    SignalCORE20 -.-> CORE20[VET-CORE-20: Health Monitor]
```

---

## 3. Flujo End-to-End de una Visita Domiciliaria

1. **Ingesta de Citas:** El sistema filtra exclusivamente citas en estado `CONFIRMED` que posean un radicado clínico emitido por OKVET.
2. **Validación de Domicilios:** Las direcciones colombianas se normalizan, validan contra las zonas de cobertura autorizadas (Bogotá Urbana / Sabana) y se geocodifican.
3. **Cálculo de Tiempos y Buffers:** Se calcula la matriz de distancia con un tiempo de servicio estándar (45 min) y un buffer preventivo entre traslados (15 min).
4. **Propuesta y Aprobación:** La coordinación revisa la propuesta en el panel de Lovable y ejecuta `approve_route_proposal`.
5. **Publicación y Navegación:** Al publicarse la ruta (`publish_authorized_route`), se generan deep links a Google Maps y Waze para cada parada.
6. **Hitos Operativos:** El veterinario marca "En camino" -> "He llegado" -> "Iniciar atención" -> "Finalizar atención".
7. **Control de Retrasos:** Si el traslado supera los 15 minutos de retraso, n8n CORE-08 activa la solicitud de aviso prudente a través de CORE-03 (en Safe Mode).
