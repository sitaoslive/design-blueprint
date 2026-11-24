# VET FREEDOM OS — SECURITY MODEL (MODELO INTEGRAL DE SEGURIDAD Y PRIVACIDAD)
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Marco Legal y Regulatorio:** Ley 1581 de 2012 (Habeas Data Colombia), Ley 576 de 2000 (Código de Ética Médica Veterinaria de Colombia)  
**Fecha:** 2026-11-20  

---

## 1. PRINCIPIOS DE SEGURIDAD INQUEBRANTABLES

1. **NO DIAGNÓSTICO NI PRESCRIPCIÓN POR IA:** Ningún modelo de inteligencia artificial o automatización está autorizado a prescribir medicamentos, dosificar fármacos o emitir diagnósticos médicos. La prescripción es acto privativo de médicos veterinarios matriculados ante COMVEZCOL.
2. **AUTORIDAD OFICIAL DE OKVET:** El expediente clínico legal ante las autoridades sanitarias y gremiales de Colombia radica exclusivamente en OKVET. Vet Freedom OS gestiona la orquestación operativa, agenda y experiencia del cliente, manteniendo conciliación asistida sin mutaciones clínicas arbitrarias.
3. **MÍNIMO PRIVILEGIO Y SEPARACIÓN DE ROLES:** El acceso a los datos está compartimentado a nivel de base de datos (PostgreSQL RLS). Los propietarios solo ven sus mascotas, los veterinarios ven sus visitas asignadas y la información financiera/ejecutiva queda reservada para Administración y Dirección.
4. **NO EJECUCIÓN AUTÓNOMA DE OPERACIONES CRÍTICAS:** Toda alteración de agenda confirmada, modificación de turnos o descuento comercial exige propuesta y aprobación previa (`APPROVAL_REQUIRED`) por parte del Dr. Luis o del Coordinador.

---

## 2. MATRIZ DE ROLES OPERATIVOS (11 ROLES DEL SISTEMA)

| Rol (`app_role_type`) | Alcance Operativo | Políticas RLS Clave |
|---|---|---|
| `OWNER_CLIENT` | Propietario de mascotas | Solo lectura y gestión de sus propias mascotas, citas, direcciones y consentimientos. |
| `CAREGIVER` | Cuidador temporal autorizado | Acceso delegado para recibir visitas y autorizar procedimientos rutinarios según delegación. |
| `VETERINARIAN` | Médico Veterinario Domiciliario | Acceso a sus citas asignadas, rutas, registros de visitas y notas clínicas preliminares. |
| `VET_ASSISTANT` | Auxiliar Veterinario | Consulta de rutas asignadas, apoyo en check-in e inventario de insumos en vehículo. |
| `COORDINATOR` | Coordinador de Operaciones | Programación de citas, asignación de personal, optimización de rutas y gestión de alertas. |
| `RECEPTION` | Recepcionista / Canales | Atención de WhatsApp, recepción de solicitudes iniciales y triaje operativo. |
| `FINANCE` | Finanzas y Contabilidad | Facturación, recaudos, verificación de comprobantes y tarifas en COP. |
| `ADMINISTRATOR` | Administrador del Negocio | Gestión completa de personal, sedes, configuración general y aprobación de propuestas. |
| `DIRECTOR` | Dr. Luis Eduardo Ríos | Acceso pleno, aprobación de acciones de alto impacto, informes ejecutivos y control total. |
| `TECH_SUPPORT` | Soporte Técnico y DevOps | Diagnóstico de integraciones, monitoreo de colas y mantenimiento de infraestructura. |
| `ALPHA_CONSULTANT` | Consultoría Estratégica Alpha | Consulta analítica de KPIs, optimización de procesos y auditoría de continuidad. |

---

## 3. MOTOR DE CLASIFICACIÓN DE RIESGO DE ACCIONES (POLICY ENGINE)

Implementado en PostgreSQL 17 mediante la función inmutable `public.evaluate_action_risk`:

```
           +---------------------------------------+
           |       Acción Solicitada (IA/API)      |
           +---------------------------------------+
                              |
            [ ¿Es comando peligroso o SQL? ]
               /                      \
            SÍ                         NO
           /                             \
+----------------------+         [ ¿Es de solo lectura? ]
|     PROHIBITED       |            /                 \
| (Bloqueo Inmediato)  |          SÍ                   NO
+----------------------+         /                       \
                      +-------------------+     [ ¿Toca registro clínico? ]
                      |     READ_ONLY     |        /                   \
                      | (Ejecución Libre) |      SÍ                     NO
                      +-------------------+     /                         \
                                   +----------------------------+     [ ¿Afecta clientes o agenda? ]
                                   | CLINICAL_APPROVAL_REQUIRED |        /                      \
                                   |   (Firma Médico OKVET)     |      SÍ                        NO
                                   +----------------------------+     /                            \
                                                        +-------------------+           +-------------------+
                                                        | APPROVAL_REQUIRED |           |  LOW_RISK_WRITE   |
                                                        | (Aprobación Luis) |           | (Ejecución Direct)|
                                                        +-------------------+           +-------------------+
```

- **`PROHIBITED`:** `execute_sql`, `run_arbitrary_code`, `update_any_table`, `modify_any_clinical_record`, `prescribe_medication`. Bloqueo irrenunciable.
- **`READ_ONLY`:** Consultas de estado (`get_business_snapshot`, `get_daily_operations`, etc.).
- **`LOW_RISK_WRITE`:** Creación de compromisos internos o tareas de seguimiento.
- **`APPROVAL_REQUIRED`:** Cancelaciones de citas, reasignación de turnos del día, activación del modo ausencia, descuentos.
- **`CLINICAL_APPROVAL_REQUIRED`:** Emisión de historia clínica formal o cambio de régimen terapéutico.
- **`EXTERNAL_CONFIRMATION_REQUIRED`:** Confirmación obligatoria con cliente o especialista externo.

---

## 4. ENDURECIMIENTO DE BASE DE DATOS (SECURITY HARDENING)

1. **Row Level Security (RLS):**
   - 100% de tablas públicas con RLS habilitado (`86 de 86 tablas`).
   - Políticas RLS explícitas para cada rol; el linter de Supabase confirma 0 advertencias (`rls_enabled_no_policy: 0`).
2. **Funciones `SECURITY DEFINER`:**
   - Todas las funciones con `SECURITY DEFINER` declaran explícitamente `SET search_path = public` para neutralizar ataques de suplantación de esquema.
   - Permisos de ejecución revocados para el rol `anon`. Solo usuarios autenticados con membresía activa pueden invocar las funciones.
3. **Vistas Invoker:**
   - Las vistas de agregación (`v_daily_schedule`, `v_patient_360`, `v_n8n_outbox_queue`) operan con `security_invoker = true`, asegurando que las políticas RLS del usuario que consulta se apliquen a nivel de fila.
4. **Extensiones Aisladas:**
   - La extensión `pgcrypto` reside en el esquema protegido `extensions`, eliminando riesgos de inyección en el esquema `public`.

---

## 5. PROTECCIÓN DE DATOS PERSONALES (HABEAS DATA COLOMBIA)

- **Consentimientos Registrados:** Tabla `consents` con tipo de tratamiento, timestamp, IP y versión del aviso de privacidad.
- **Manejo Estricto de Opt-Out:** Si un cliente responde "CANCELAR", "NO MAS" o "STOP" en WhatsApp, el sistema actualiza de inmediato `contact_restrictions` y bloquea cualquier mensaje promocional saliente.
- **Privacidad en CEM:** La memoria de experiencia del cliente clasifica notas sensibles (ej. fallecimiento previo de mascota, conflictos familiares) con niveles de acceso restringidos que no se exponen al personal sin autorización.
