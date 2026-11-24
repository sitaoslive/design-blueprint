# ALPHA VISION METHOD — AUDITORÍA DE LA JORNADA D: CLIENTE DEL CONTRATISTA
**DOCUMENTO AUDIT-06 — CONTRACTOR CLIENT EXPERIENCE & PROPERTY PASSPORT**

---

## 1. PUNTOS DE ENTRADA Y ACCESO AL PORTAL

El cliente final del contratista accede mediante enlaces inteligentes entregados por SMS, WhatsApp, correo o código QR:
- **Ruta Oficial:** `/contractors/portal/:token`
- **Branding Total de la Empresa Contratista:** La interfaz no muestra marcas de software de terceros; se adapta a la paleta, logotipo y datos de contacto de la empresa (ej. *Apex Mechanical Solutions*).
- **Soporte Bilingüe & Multidivisa:** Selector inmediato [ 🇺🇸 EN | 🇪🇸 ES ] y formato de moneda adaptativo [ USD | CAD | COP ].

---

## 2. AUDITORÍA DEL ONBOARDING DEL CLIENTE (D01 - D22)

| Paso | Requisito de la Especificación | Implementación Observada en Código | Estado de Verificación | Observación / Fricción |
|---|---|---|---|---|
| **D01** | Carga de página con marca propia | `ContractorCustomerPortal.tsx` | `PRODUCTION VERIFIED` | Paleta y nombre de la empresa impecables. |
| **D02** | Selección de categoría de servicio | HVAC Comercial, Residencial, Emergencia | `PRODUCTION VERIFIED` | Adaptativo al nicho configurado. |
| **D03** | Descripción del problema y fotos | Bóveda de carga fotográfica | `PRODUCTION VERIFIED` | Carga de fotos de síntomas de falla. |
| **D04** | Registro de propiedad | Dirección y tipo de inmueble | `PRODUCTION VERIFIED` | Mapeado en `contractor_client_properties`. |
| **D05** | Datos de contacto del cliente | Nombre, teléfono, correo | `PRODUCTION VERIFIED` | Sin campos superfluos. |
| **D06** | Validación de territorio atendido | Verificación de zona de cobertura | `STAGING VERIFIED` | Filtro por ciudad y código postal. |
| **D07** | Tipo de solicitud diferenciada | Cotización, Emergencia, Mantenimiento | `PRODUCTION VERIFIED` | Clasifica la urgencia en el Kanban de despacho. |
| **D08** | Selección de ventana de llegada | Slots horarios matutinos/vespertinos | `PRODUCTION VERIFIED` | Horarios realistas con buffers de traslado. |
| **D09** | Tarifas y políticas de visita | Transparencia de costos de inspección | `PRODUCTION VERIFIED` | Evita sorpresas o disputas posteriores. |
| **D10** | Confirmación de solicitud | Pantalla de confirmación con número de orden | `PRODUCTION VERIFIED` | `JOB-2611-9921` generado de inmediato. |
| **D11** | Activación opcional de cuenta | Acceso seguro sin contraseñas difíciles | `PRODUCTION VERIFIED` | Acceso mediante token seguro de un solo toque. |
| **D12** | Instalación PWA opcional | Banner guiado iOS / Android | `PRODUCTION VERIFIED` | Funciona como app nativa en el celular. |
| **D13** | Dashboard interactivo del cliente | Pestañas Inicio, Actividad, Equipos, Planes | `PRODUCTION VERIFIED` | Navegación clara con badges de estado. |
| **D14** | Instrucciones de acceso al sitio | Código de portería o notas de entrada | `PRODUCTION VERIFIED` | Campo para facilitar llegada del técnico. |
| **D15** | Estado del técnico en camino | Ventana estimada (15-25 min) y teléfono | `PRODUCTION VERIFIED` | Privacidad GPS del trabajador protegida. |
| **D16** | Entrega de cotización escalonada | Comparador Bueno / Mejor / Excelente | `PRODUCTION VERIFIED` | `ClientProposalViewer.tsx` interactivo. |
| **D17** | Aprobación y firma digital | Firma táctil en pantalla y confirmación | `PRODUCTION VERIFIED` | Aprobación auditable registrada en BD. |
| **D18** | Seguimiento de avance de obra | Estados: Programado, En Camino, En Progreso | `PRODUCTION VERIFIED` | Actualizado en vivo por el técnico. |
| **D19** | Reporte de finalización & Fotos | Bóveda de fotos Antes y Después | `PRODUCTION VERIFIED` | Prueba tangible del trabajo ejecutado. |
| **D20** | Liquidación y pago en línea | Pasarela Stripe / Apple Pay / Nequi | `PRODUCTION VERIFIED` | Pago de saldo con recibo digital inmediato. |
| **D21** | Servicio post-venta & Calificación | Calificación 5 estrellas y reseña Google | `PRODUCTION VERIFIED` | Colector automatizado de reputación. |
| **D22** | Reagendamiento en 1-clic | Re-solicitud de servicio futuro | `PRODUCTION VERIFIED` | `ClientRebookModal.tsx` con datos precargados. |

---

## 3. ADAPTABILIDAD MULTI-INDUSTRIA VERIFICADA

La arquitectura en `src/features/contractors/client-portal/` se adapta dinámicamente según el nicho sin bifurcar el código base:
- **HVAC:** Destaca la pestaña **Equipos** (`ClientPropertyEquipmentHub.tsx`) con bitácora de chillers, filtros y fecha de próxima recarga de refrigerante.
- **Paisajismo & Limpieza:** Destaca la pestaña **Planes** (`ClientMaintenanceWarrantyHub.tsx`) con suscripciones mensuales y visitas recurrentes programadas.
- **Remodelación:** Destaca la pestaña **Actividad / Project Room** (`ClientProjectRoom.tsx`) con hitos de obra, compras de acabados y órdenes de cambio firmadas.
