# MANUAL OPERATIVO: GOBERNANZA DE FEATURES & PLANES
**GUÍA PARA LA SUPER ADMIN / DUEÑA DE ALPHA VISION METHOD**

---

## 1. INTRODUCCIÓN

Este manual describe el funcionamiento del **Centro de Gobernanza de Features y Planes** dentro de `admin.alphavisionm.com` (División 06 y 07).

Desde este módulo, la Dueña de la plataforma tiene control absoluto sobre:
1. Qué funcionalidades exactas puede usar cada veterinaria o contratista.
2. Cómo se empaquetan los planes comerciales de Vet Life y Contractor OS.
3. Otorgar excepciones comerciales temporales (trials, compensaciones, addons).
4. Revocar características específicas en caso de disputas de pago o infracciones.
5. Simular la evaluación de los 14 pasos de autorización para resolver dudas de soporte en menos de 10 segundos.

---

## 2. PLANES COMERCIALES DISPONIBLES

### A. Vet Life (Veterinarias y Médicos Domiciliarios):
1. **Veterinario Solitario**:
   - Tarifa: **$189.000 COP/mes**.
   - Incluye: Registro de Pacientes, Consultas SOAP, Prescripciones Médicas, Triaje WhatsApp básico.
   - Diseñado para profesionales independientes que inician su práctica domiciliaria.
2. **Clínica Domiciliaria Pro** (Plan de Referencia del Dr. Luis Eduardo Ríos):
   - Tarifa: **$389.000 COP/mes**.
   - Incluye: Todo lo de Solitario + Asistente Clínico IA Claude, Optimización de Rutas Geográficas, Pasarela de Pagos Wompi integrada, Puente Clínico Oficial OKVET.
3. **Red / Marca Blanca**:
   - Tarifa: **$1.190.000 COP/mes**.
   - Incluye: Todo lo de Pro + Despacho Multi-Médico, Subdominio Personalizado (`*.alphavisionm.com`), Facturación Electrónica DIAN y Soporte Prioritario 24/7.

### B. Contractor OS (Empresas de Servicios Técnicos):
1. **Essential**:
   - Tarifa: **$97 USD/mes**.
   - Incluye: Presupuestos Good-Better-Best, Pagos Online, Ficha de Clientes.
2. **Growth Pro**:
   - Tarifa: **$197 USD/mes**.
   - Incluye: Todo lo de Essential + Despacho Inteligente de Cuadrillas, Portal de Clientes Autoservicio, Asistente de Voz para Alcance de Obra con IA.
3. **Scale / Premium**:
   - Tarifa: **$397 USD/mes** *(Actualmente en estado `PENDING_COMMERCIAL_APPROVAL`)*.
   - Incluye: Todo lo de Growth + Colector Automatizado de Reseñas de 5 Estrellas, Multi-Sucursal y API Abierta.

---

## 3. CÓMO OTORGAR UNA EXCEPCIÓN TEMPORAL (OVERRIDE)

1. En el Super Admin, ingresa a la pestaña **04. Directorio Empresas** o **06. Features & Módulos**.
2. Selecciona la empresa (ej. `Dr. Luis Eduardo Ríos` o nueva veterinaria en onboarding).
3. Selecciona la pestaña **FEATURES & ENTITLEMENTS**.
4. Ubica la funcionalidad deseada (ej. `VET.CORE.MULTI_DOCTOR_DISPATCH`).
5. Haz clic en **Otorgar Excepción / Trial**.
6. Selecciona el número de días de cortesía (7, 14, 30 o 60 días) y escribe la justificación comercial o de soporte.
7. Haz clic en **Aprobar Excepción**:
   - Se crea un registro auditable en la base de datos (`platform_tenant_feature_overrides`).
   - El motor de 14 pasos concederá acceso inmediato en el Paso 7.
   - n8n disparará el workflow `FG-005` actualizando el campo personalizado en GoHighLevel.

---

## 4. REVOCACIÓN EXPLICITA DE UNA FUNCIONALIDAD

Si un cliente incurre en mora parcial, genera cargos no reconocidos o solicita pausar un módulo:
1. Selecciona el feature correspondiente dentro de la ficha de la empresa.
2. Selecciona **Revocar Acceso Explícito (REVOKE)**.
3. El motor de 14 pasos bloqueará la funcionalidad inmediatamente en el Paso 8, incluso si el plan base la contemplaba.
4. Se registra en el libro de auditoría y se emite el evento n8n `FG-006`.
