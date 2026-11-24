# VET FREEDOM OS — OKVET ASSISTED BRIDGE ARCHITECTURE
## Arquitectura del Puente Asistido de Integración con OKVET Cloud
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Director Médico:** Dr. Luis Eduardo Ríos  
**Marco Regulatorio:** Ley 576 de 2000 de la República de Colombia  
**Fecha:** 2026-11-21  

---

## 1. FUNDAMENTO JURÍDICO Y TÉCNICO

En el ejercicio de la medicina veterinaria domiciliaria en Colombia, la historia clínica y los actos médicos oficiales están sujetos a estricta supervisión deontológica por parte de COMVEZCOL y los Tribunales de Ética. OKVET Cloud es el software oficial y acreditado de historia clínica utilizado por Vet Life.

### La Realidad Tecnológica de OKVET
- **Ausencia de API Pública:** OKVET no expone endpoints REST, GraphQL ni webhooks oficiales para desarrolladores externos.
- **Prohibición de Credenciales Compartidas o Scrapers Frágiles:** Las credenciales de acceso a OKVET están vinculadas a la tarjeta profesional del Dr. Luis Eduardo Ríos. La inyección de scrapers automatizados o bots no oficiales viola los términos de servicio, es frágil ante cambios de DOM y representa un riesgo inaceptable de seguridad y cumplimiento legal.
- **Soberanía Clínica de OKVET:** Ningún componente de IA, frontend de Lovable ni flujo n8n tiene potestad para diagnosticar, prescribir ni alterar historiales médicos.

### La Solución: El Puente Asistido Humano (Assisted Bridge)
Vet Freedom OS implementa un **Puente Asistido por Operador Humano (Assisted Bridge)** con respaldo de base de datos relacional en Supabase:
1. Las solicitudes de citas y operaciones logísticas se gestionan en Lovable SPA y n8n.
2. Toda cita requiere una verificación y confirmación humana en OKVET Cloud antes de transicionar a estado `CONFIRMED`.
3. Un operador humano o el profesional médico ingresa el identificador oficial de OKVET y la evidencia de confirmación a través de la función protegida `submit_okvet_human_confirmation()`.
4. El pipeline de importación estructurada (CSV / XLSX) permite la sincronización periódica de pacientes y citas históricas a través de una zona de staging con detección automática de conflictos.

```
+------------------+         +----------------------------+         +-------------------+
|   Lovable SPA    | ------> |    Supabase (PostgreSQL)   | <------ | Operador Humano   |
| (Solicitud Cita) |         | - appointment_holds        |         | (Verifica OKVET)  |
+------------------+         | - okvet_manual_confirmations         +---------+---------+
                             | - transactional_outbox     |                   |
                             +-------------+--------------+                   v
                                           |                        +-------------------+
                                           v                        |    OKVET Cloud    |
                             +----------------------------+         | (Registro Clínico |
                             |      n8n Orchestrator      |         |     Oficial)      |
                             | (Notificaciones Preparadas)|         +-------------------+
                             +----------------------------+
```

---

## 2. COMPONENTES PRINCIPALES DEL PUENTE

1. **Registro de Capacidades (`okvet_capability_registry`):** Define explícitamente cuáles acciones son automáticas, asistidas o prohibidas.
2. **Confirmaciones Humanas (`okvet_manual_confirmations`):** Tabla inmutable donde se asocia cada cita con su ID clínico de OKVET y la firma/evidencia del operador.
3. **Pipeline de Staging e Importación:** Tablas dedicadas (`okvet_import_batches`, `okvet_import_row_staging`, `okvet_import_conflicts`, `okvet_import_application_results`) para procesar datos tabulares exportados de OKVET.
4. **Verificación de Google Calendar:** Validación cruzada para garantizar que ningún evento de Google Calendar se exporte o altere la agenda sin la previa confirmación humana en OKVET.
5. **Generador de Eventos en Outbox:** La confirmación humana emite el evento `APPOINTMENT_CONFIRMED_OKVET_HUMAN` para que n8n continúe la automatización logística sin violar la soberanía médica.
