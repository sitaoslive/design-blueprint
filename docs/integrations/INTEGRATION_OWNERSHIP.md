# VET FREEDOM OS — MATRIZ DE PROPIEDAD Y RESPONSABILIDAD DE INTEGRACIÓN
## Delimitación de Dominios entre Lovable, Google Antigravity, n8n, GitHub y Supabase
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Especificación:** Master Prompt 17 — Secciones 35 y 53  
**Fecha:** 2026-11-22  

---

## 1. PRINCIPIO GENERAL DE COEXISTENCIA Y NO DUPLICACIÓN

Vet Freedom OS es **UNA SOLA APLICACIÓN** con **UN SOLO HISTORIAL DE CÓDIGO** y **UNA SOLA FUENTE AUTORITATIVA DE DATOS**.
Bajo ninguna circunstancia se creará un segundo CRM, un backend paralelo competidor o una segunda aplicación de administración.

---

## 2. MATRIZ FORMAL DE PROPIEDAD POR SUBSISTEMA

| Subsistema / Entorno | Responsabilidades Exclusivas | Límites Estrictos y Prohibiciones |
|---|---|---|
| **Lovable Frontend** | • Pantallas de usuario, navegación y diseño UI (Tailwind CSS, Radix UI).<br>• Formularios reactivos, captura de inputs y validación en cliente.<br>• Módulos de demostración (`/demo`) y estado efímero del navegador (`src/lib/vf/store.ts`).<br>• Archivos generados automáticamente (`routeTree.gen.ts`, etc.).<br>• Despliegue de la aplicación web en Lovable Cloud. | • **No** ejecuta operaciones financieras o clínicas directas sin validación de servidor.<br>• **No** almacena secretos (`service_role`, tokens bancarios, API keys de WhatsApp).<br>• **No** sobrescribe directamente esquemas de base de datos sin revisión. |
| **Google Antigravity** | • Arquitectura de backend, RPCs atómicas y lógica de negocio PostgreSQL 17.<br>• Contratos tipados de API (TypeScript/Zod) y adaptadores de integración.<br>• Pruebas automatizadas (unitarias, integración, resiliencia, E2E y seguridad).<br>• Supervisión de CI/CD en GitHub y gestión de ramas seguras (`antigravity/*`).<br>• Preparación y auditoría de integraciones externas (OKVET, GPS, Google Calendar). | • **No** edita directamente la rama `main` sin Pull Request.<br>• **No** altera archivos con encabezados de generación automática de Lovable.<br>• **No** realiza `git push --force` ni rebase sobre commits de Lovable.<br>• **No** destruye esquemas ni ejecuta migraciones destructivas en producción. |
| **Supabase Backend** | • Fuente única de verdad relacional (PostgreSQL 17.12.0).<br>• Autenticación (Supabase Auth) y control de acceso RBAC (11 roles).<br>• Seguridad a nivel de fila (Row Level Security - RLS forzado al 100%).<br>• Almacenamiento privado de expedientes (`medical-records`, `referral-documents`).<br>• Transmisión reactiva vía WebSockets (`supabase_realtime`).<br>• Bus de eventos desacoplado (`transactional_outbox`). | • **No** expone privilegios de ejecución a usuarios anónimos (salvo tracking público tokenizado).<br>• **No** permite prescripciones o diagnósticos clínicos generados por IA. |
| **n8n Automation Cloud** | • Orquestación de procesos asíncronos y cron jobs programados.<br>• Consumo atómico del Transactional Outbox y despacho de eventos.<br>• Conexión con proveedores externos (WhatsApp Business Cloud API, Google Calendar API).<br>• Reconciliación de recibos de entrega, reintentos con backoff y Dead Letter Queue.<br>• Generación de snapshots inmutables para reportes ejecutivos diarios/semanales. | • **No** actúa como CRM ni como base de datos primaria de citas o pacientes.<br>• **No** envía mensajes reales a clientes en modo desarrollo (`send_enabled: false`).<br>• **No** altera de forma unilateral la agenda médica oficial. |
| **GitHub Repository** | • Frontera única y compartida de control de versiones (`sitaoslive/design-blueprint`).<br>• Rama `main` como rama de integración conectada a Lovable.<br>• Trazabilidad inmutable de cambios mediante Pull Requests y revisiones de código.<br>• Ejecución automatizada de pruebas continuas mediante GitHub Actions (`ci.yml`). | • **No** almacena archivos `.env` con credenciales privadas.<br>• **No** permite auto-merge irrestricto sin validación de pruebas. |

---

## 3. REGLAS DE RESOLUCIÓN DE CONFLICTOS

1. **Prevalencia de Intención de Lovable:** Si Lovable modifica una pantalla de interfaz mientras Antigravity desarrolla una integración, Antigravity adaptará los contratos sin revertir los cambios visuales o funcionales introducidos por Lovable.
2. **Prevalencia de Autoridad de Seguridad de Antigravity:** En materia de RLS, permisos RPC, validación de sesiones y prevención de fugas de datos, las reglas estrictas de PostgreSQL y la Ley 576 de 2000 prevalecen sobre cualquier conveniencia en cliente.
3. **Mapeo de Rutas y Navegación:** Lovable gobierna las rutas en `src/routes/` y el registro de pantallas en `src/lib/vf/screens.ts`. Antigravity conecta los adaptadores de servicio sin alterar la estructura de layouts.
