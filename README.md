# Alpha Vision Method — Suite Maestra Monorepo
**Sistemas Operativos Verticales para Negocios Reales**  
*Plataforma Unificada: Contractor Field Service OS + Vet Freedom OS + Clínica Dr. Luis Ríos + Super Admin 2.0*

[![PostgreSQL 17](https://img.shields.io/badge/PostgreSQL-17.12-blue?logo=postgresql)](https://supabase.com)
[![Lovable](https://img.shields.io/badge/Frontend-Lovable%20PWA-emerald)](https://lovable.dev)
[![n8n Cloud](https://img.shields.io/badge/Orchestration-n8n-orange?logo=n8n)](https://n8n.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)

Este repositorio unificado contiene la plataforma completa de **Alpha Vision Method (`alphavisionm.com`)**, integrando en una sola fuente canónica de la verdad el frontend, backend, base de datos relacional, flujos de automatización e infraestructura multi-inquilino.

---

## 🏛️ Arquitectura del Monorepo

```
.
├── src/                               # Frontend SPA React + TanStack Router (PWA)
│   ├── features/
│   │   ├── contractors/               # 🔧 CONSTRUCTOR: Contractor Field Service OS
│   │   ├── luis/                      # 🩺 LUIS: Centro Clínico y Agenda Dr. Luis Ríos
│   │   ├── clients/                   # 🐾 VETS: Portal del Tutor y Pasaporte de Mascotas
│   │   ├── live-dispatch/             # 🚗 VETS: Despacho GPS en vivo estilo Uber
│   │   ├── prescriptions/             # 💊 VETS: Recetas Oficiales Ley 576 / COMVEZCOL
│   │   ├── fintech/                   # 💳 FINTECH: Anticipos Anti-No-Show y Comisiones
│   │   ├── system-administration/     # 👑 ADMIN: Super Admin 2.0 y Control Plane
│   │   ├── tenant-routing/            # 🌐 ROUTING: Aislamiento estricto de Subdominios
│   │   └── demos/                     # ⚖️ DEMO DUAL: Sala interactiva lado a lado
│   └── routes/                        # Enrutamiento TanStack Router
├── supabase/                          # Backend PostgreSQL 17
│   ├── migrations/                    # 55 migraciones DDL con 100% RLS forzado
│   └── functions/                     # Edge Functions
├── automation/                        # 61 flujos y configuraciones n8n
│   ├── platform-control-plane/        # Orquestación de subdominios y CRM GHL
│   ├── feature-governance/            # Medición de tokens y presupuestos IA
│   └── workflows/                     # Triaje WhatsApp, citas y outbox
├── tests/                             # 78 suites de pruebas automatizadas (AVAT/FGAT)
├── scripts/                           # 34 herramientas de auditoría y sincronización
├── docs/                              # Documentación canónica y manifiesto de features
└── types/                             # Definiciones TypeScript de Supabase y esquemas
```

---

## 🚀 Las 5 Soluciones en este Repositorio

### 1. 🔧 El Constructor — Contractor Field Service OS
* **Ruta:** `/contractors` | **Demo:** `/contractors/demo`
* Diseñado para oficios de campo (HVAC, fontanería, electricidad, remodelación y pintura).
* **Capacidades:**
  - Cotizador digital en campo con margen markup automático (**Bueno / Mejor / Excelente**).
  - Bóveda fotográfica antes/después con geolocalización y sellado de tiempo.
  - Tablero Kanban de prospectos y despacho de cuadrillas en calle.
  - Portal de cliente final de marca blanca con liquidación en línea (USD / COP).

### 2. 🐾 Las Vets — Vet Freedom OS
* **Ruta:** `/vet` | **Onboarding 5 Pasos:** `/onboarding`
* Sistema operativo integral para clínicas veterinarias y médicos a domicilio.
* **Capacidades:**
  - Despacho y seguimiento vehicular en vivo estilo Uber (`/t/:token`).
  - Triaje clínico inteligente y canalización por WhatsApp Business Cloud API.
  - Portal del Tutor (`/cliente`) con carnet de salud y pasaporte digital QR.
  - Módulo de anticipos anti-no-show y tele-triaje nocturno.
  - Asistente de onboarding para dar de alta nuevas clínicas en 5 pasos.

### 3. 🩺 Luis — Clínica Veterinaria Dr. Luis Eduardo Ríos
* **Subdominio Exclusivo:** `https://luis.alphavisionm.com`
* **Ruta Médica:** `/luis` | **Reserva de Citas:** `/cliente/reservar`
* Experiencia 100% aislada para la práctica domiciliaria del Dr. Luis en Medellín y Oriente Antioqueño.
* **Capacidades:**
  - Fórmulas médicas con firma digital y tarjeta profesional COMVEZCOL habilitada (**Ley 576 de 2000**).
  - Puente e interoperabilidad con historia clínica oficial de **OKVET**.
  - Zonas de atención: El Poblado, Laureles, Belén, Envigado, Sabaneta, Rionegro y Llanogrande.
  - Cero distracciones: no muestra contenido de contratistas ni super admin.

### 4. 👑 Super Admin 2.0 — Sala de Comando de la Dueña
* **Subdominio Exclusivo:** `https://admin.alphavisionm.com` | **Ruta:** `/admin`
* Centro de gobierno y control total para la propietaria de Alpha Vision Method.
* **Capacidades:**
  - Centro de activaciones de 15 estados y generador de licencias.
  - Gobernanza de funcionalidades (Feature Governance) y Plan Builder.
  - Gateway de IA con control de costos de Claude 3.5, reservas atómicas y Prompt Caching al 90%.
  - Gestor de dominios y subdominios con resolución automática.
  - Sincronización bidireccional con GoHighLevel (GHL CRM).
  - Academia de la Dueña con guías interactivas paso a paso.

### 5. ⚖️ Sala de Demostración Dual Interactiva
* **Ruta:** `/demo`
* Demostrador comparativo para preventa y presentaciones comerciales.
* **Modos de visualización:**
  - `[ 🩺 Vet Freedom OS ]`: Carga la experiencia clínica completa.
  - `[ 🔧 Contractor Field Service OS ]`: Carga el flujo de 8 pasos para oficios.
  - `[ ⚖️ Lado a Lado ]`: Vista dividida para comparar ambas industrias simultáneamente.

---

## 🌐 Enrutamiento Dinámico por Subdominio

La aplicación detecta el hostname en el navegador en tiempo de ejecución:

| Dominio / Subdominio | Vista Renderizada |
| :--- | :--- |
| `https://alphavisionm.com` | **Plataforma Matriz Central** (`AlphaVisionMasterLanding`) |
| `https://luis.alphavisionm.com` | **Clínica Dr. Luis Ríos** (`DrLuisClinicLanding`) |
| `https://admin.alphavisionm.com` | **Super Admin Command Center** (`/admin/login`) |
| `<clinica>.alphavisionm.com` | **Portal de Marca Blanca Clínica** (`WhiteLabelVetClinicLanding`) |
| `<contratista>.alphavisionm.com` | **Portal de Marca Blanca Contratista** (`WhiteLabelContractorLanding`) |

---

## 📦 Desarrollo Local y Verificación

### Prerrequisitos
- Node.js 20+ y pnpm / npm
- Conexión a Supabase CLI (opcional para migraciones locales)

### Instalación y Ejecución
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev

# 3. Validar tipado TypeScript (0 errores tolerados)
.\node_modules\.bin\tsc.cmd --noEmit

# 4. Compilar bundle de producción
npm run build
```

---

## 🔒 Seguridad, Cumplimiento y Legalidad
- **Aislamiento Multi-Tenant Estricto:** Toda consulta está aislada por `organization_id` con políticas Row Level Security (RLS) en PostgreSQL 17.
- **Normativa Médica Veterinaria:** Cumplimiento riguroso de la Ley 576 de 2000 (COMVEZCOL) en prescripciones y consentimiento informado.
- **Soberanía de Datos:** OKVET se mantiene como la autoridad legal de historia clínica; Supabase opera como motor transaccional y de experiencia del tutor.

---

© 2026 Alpha Vision Method · Todos los derechos reservados.
