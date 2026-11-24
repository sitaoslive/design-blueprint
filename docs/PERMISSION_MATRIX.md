# VET FREEDOM OS — MATRIZ DE PERMISOS Y CONTROL DE ACCESO (PERMISSION MATRIX)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Secciones Normativas:** 05 y 18 del Prompt Maestro de Implementación  

---

## 1. Definición de Roles del Ecosistema

El sistema implementa 11 roles estrictamente jerárquicos basados en el principio de mínimo privilegio:

1. **`OWNER_CLIENT`:** Propietario o tutor principal de mascotas.
2. **`CAREGIVER`:** Cuidador autorizado por el propietario con facultades delegadas de recepción domiciliaria.
3. **`VETERINARIAN`:** Médico veterinario en ruta con matrícula profesional colombiana activa.
4. **`VET_ASSISTANT`:** Auxiliar veterinario de apoyo en procedimientos y preparación de material.
5. **`COORDINATOR`:** Coordinador operativo de turnos, rutas, triage y asignaciones.
6. **`RECEPTION`:** Personal de atención inicial y soporte de canales.
7. **`FINANCE`:** Responsable de validación de pagos, facturación y conciliación bancaria.
8. **`ADMINISTRATOR`:** Administrador operativo de servicios, tarifas y catálogo.
9. **`DIRECTOR`:** Dr. Luis Eduardo Ríos. Máxima autoridad médica, operativa y comercial.
10. **`TECH_SUPPORT`:** Soporte técnico y observabilidad de infraestructura.
11. **`ALPHA_CONSULTANT`:** Consultoría de dirección estratégica y auditoría de sistemas.

---

## 2. Matriz de Autorización RBAC

| Dominio / Acción | OWNER | CAREGIVER | VET | ASST | COORD | RECEP | FINANCE | ADMIN | DIRECTOR | TECH | ALPHA |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Ver Agenda General de la Empresa** | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Ver su Propia Ruta y Visitas** | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Solicitar Nueva Cita** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Confirmar Cita Oficialmente (OKVET)**| ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Reasignar Turnos o Visitas** | ❌ | ❌ | ❌ | ❌ | Propone| ❌ | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Aprobar Simulación de Contingencia** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Bloquear Agenda del Director** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Ver Customer Experience Memory (CEM)**| ❌ | ❌ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ | ✅ |
| **Ver Memoria Ejecutiva del Director**| ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| **Registrar Cobro en Efectivo/Nequi** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Validar y Conciliar Recaudos COP** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Crear Remisión a Especialista** | ❌ | ❌ | Propone| ❌ | Coord. | ❌ | ❌ | ❌ | ✅ (Aprueba)|❌ | ❌ |
| **Cerrar Compromisos con Evidencia** | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Consultar Salud Técnica del Sistema** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Publicar Workflows en Producción** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## 3. Políticas de Separación de Datos

Conforme a la Sección 18, los datos se encuentran físicamente y lógicamente compartimentados en Supabase:

1. **Datos Administrativos:** Citas, turnos, rutas, inventario de insumos (acceso por rol operativo).
2. **Datos Clínicos:** Resguardados bajo autoridad de OKVET y restringidos a médicos veterinarios autorizados.
3. **Datos Financieros:** Tarifas, comprobantes bancarios y balances en COP (restringidos a Finanzas, Administración y Dirección).
4. **Customer Experience Memory (CEM):** Separada de notas clínicas. Contiene únicamente preferencias logísticas y de servicio.
5. **Memoria Ejecutiva:** Restringida exclusivamente al Dr. Luis Eduardo Ríos y consultoría estratégica de Alpha Vision Method.

---

## 4. Comandos Prohibidos
Ningún usuario, rol o asistente de IA tiene autorización para:
- Ejecutar sentencias SQL dinámicas (`DROP`, `ALTER`, `TRUNCATE`, `GRANT`).
- Diagnosticar o recetar tratamientos mediante automatizaciones o modelos de lenguaje.
- Modificar citas o turnos sin generar la orden persistente y el registro de auditoría correspondiente.
- Exportar tokens, credenciales o secretos en texto plano.
