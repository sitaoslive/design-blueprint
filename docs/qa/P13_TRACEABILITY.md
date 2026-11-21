# Prompt 13 — trazabilidad conservadora

Especificación íntegra: docs/prompts/PROMPT_13.md. Lote inicial: centro de control, lectura de integraciones/incidencias, dependencias ejecutivas, estado desconocido sin evidencia y gates de lanzamiento bloqueados. QA: P12_CONTINUATION_2026-11-21.md. No certificar el prompt entero.

Lote B: 415 pruebas totales / 26 archivos, 30 nuevas de importación; QA autenticada y límites en P13_IMPORT_2026-11-21.md. Preview/mapeo/comparación/calidad de visitas implementados; persistencia oficial no conectada.

Lote C solicitado: seguridad corregida en permisos existentes (sin tablas nuevas), preparaciones de metadatos guardadas y releídas con sesión/rol de servidor; no archivo, aplicación ni revisión oficial. QA: PERMISSIONS_IMPORT_DISPATCH_2026-11-21.md. No nueva infraestructura ni acciones externas. Colores heredados de Luis conservados.

## Secciones originales
| Sección | Requisito | Estado / límite |
|---|---|---|
| 0 | MISIÓN PRINCIPAL | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 1 | ARQUITECTURA DEFINITIVA | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 2 | INSPECCIÓN DEL PROYECTO | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 3 | COBERTURA OBLIGATORIA | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 4 | ARQUITECTURA DEL MÓDULO | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 5 | EXPERIENCIA VISUAL DEL CONTROL CENTER | PARCIAL — ControlCenter; solo superficies/lectura del lote, no autoridad ni comprobación externa |
| 6 | HOME ADMINISTRATIVO | PARCIAL — ControlCenter; solo superficies/lectura del lote, no autoridad ni comprobación externa |
| 7 | CONFIGURACIÓN GENERAL DE VET LIFE | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 8 | CATÁLOGO DE SERVICIOS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 9 | ZONAS Y COBERTURA | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 10 | SIMULACIÓN DE CAMBIO DE COBERTURA | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 11 | HORARIOS DE OPERACIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 12 | CONFIGURACIÓN DE AGENDA | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 13 | CONFIGURACIÓN DE RUTAS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 14 | CENTRO DE REGLAS OPERATIVAS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 15 | MOTOR DE VALIDACIÓN DE CONFIGURACIONES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 16 | VERSIONADO DE CONFIGURACIONES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 17 | USUARIOS Y PERSONAL | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 18 | MATRIZ DE ROLES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 19 | MOTOR DE EVALUACIÓN DE PERMISOS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 20 | CENTRO DE APROBACIONES ADMINISTRATIVAS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 21 | CENTRO DE INTEGRACIONES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 22 | DETALLE DE CADA INTEGRACIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 23 | PANEL DE WHATSAPP | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 24 | PANEL DE GOOGLE CALENDAR | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 25 | CENTRO DE OKVET | PARCIAL — ImportCenter/import domain probados en P13_IMPORT_2026-11-21.md; revisión local de citas, no aplicación/vinculación/verificación oficial |
| 26 | IMPORTACIÓN DE DATOS OKVET | PARCIAL — ImportCenter/import domain probados en P13_IMPORT_2026-11-21.md; revisión local de citas, no aplicación/vinculación/verificación oficial |
| 27 | MOTOR DE MAPEO | PARCIAL — ImportCenter/import domain probados en P13_IMPORT_2026-11-21.md; revisión local de citas, no aplicación/vinculación/verificación oficial |
| 28 | CONCILIACIÓN DE IDENTIFICADORES | PARCIAL — ImportCenter/import domain probados en P13_IMPORT_2026-11-21.md; revisión local de citas, no aplicación/vinculación/verificación oficial |
| 29 | CENTRO DE CONFLICTOS OKVET | PARCIAL — ImportCenter/import domain probados en P13_IMPORT_2026-11-21.md; revisión local de citas, no aplicación/vinculación/verificación oficial |
| 30 | CALIDAD DE DATOS | PARCIAL — ImportCenter/import domain probados en P13_IMPORT_2026-11-21.md; revisión local de citas, no aplicación/vinculación/verificación oficial |
| 31 | CENTRO DE AUTOMATIZACIONES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 32 | DETALLE DE AUTOMATIZACIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 33 | MONITOR DE EVENTOS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 34 | ERRORES Y RECUPERACIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 35 | DEAD LETTER & RETRY MONITOR | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 36 | SALUD DEL SISTEMA — WF-110 | PARCIAL — ControlCenter; solo superficies/lectura del lote, no autoridad ni comprobación externa |
| 37 | OBSERVABILIDAD Y DIAGNÓSTICO | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 38 | CENTRO DE INCIDENTES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 39 | CENTRO DE CONTINGENCIAS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 40 | SEGURIDAD OPERACIONAL | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 41 | ACCESO TEMPORAL DE SOPORTE | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 42 | AUDITORÍA GENERAL — WF-106 | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 43 | CENTRO DE PRIVACIDAD Y RETENCIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 44 | COSTOS DE INFRAESTRUCTURA — WF-105 | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 45 | ESTADO DE CREDENCIALES — WF-109 | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 46 | BACKUPS Y RESTAURACIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 47 | ADMINISTRACIÓN DE FEATURE FLAGS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 48 | CONFIGURACIÓN POR ENTORNO | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 49 | DEPLOYMENT READINESS CENTER | PARCIAL — ControlCenter; solo superficies/lectura del lote, no autoridad ni comprobación externa |
| 50 | GATES DE DESPLIEGUE | PARCIAL — ControlCenter; solo superficies/lectura del lote, no autoridad ni comprobación externa |
| 51 | PANEL DE ESTADO DE LOS 224 COMPORTAMIENTOS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 52 | PANEL DE LAS 170 PRUEBAS ORIGINALES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 53 | REGISTRO DE DEPENDENCIAS CON ANTIGRAVITY | PARCIAL — ControlCenter; solo superficies/lectura del lote, no autoridad ni comprobación externa |
| 54 | CENTRO DE SOPORTE INTERNO | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 55 | SISTEMA DE NOTIFICACIONES ADMINISTRATIVAS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 56 | CENTRO DE CAMBIOS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 57 | MODELOS TYPESCRIPT | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 58 | SERVICIOS DE DOMINIO | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 59 | SERVICIOS DE APLICACIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 60 | CONTRATOS CON ANTIGRAVITY | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 61 | ADAPTADORES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 62 | PRUEBAS DE CONFIGURACIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 63 | PRUEBAS DE PERMISOS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 64 | PRUEBAS DE INTEGRACIONES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 65 | PRUEBAS OKVET Y DATOS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 66 | PRUEBAS DE AUTOMATIZACIONES Y ERRORES | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 67 | PRUEBAS DE SEGURIDAD Y SALUD | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 68 | PRUEBAS DE DESPLIEGUE | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 69 | PRUEBAS FRONTEND | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 70 | MAPEO DE WORKFLOWS | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 71 | PROJECT MEMORY OS | PARCIAL — matrices/especificación/QA actualizadas; cobertura maestra no certificada |
| 72 | CRITERIOS DE ACEPTACIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 73 | ORDEN DE IMPLEMENTACIÓN | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |
| 74 | RESULTADO FINAL ESPERADO | PENDIENTE — desarrollar/reconciliar reutilizando módulos; autoridad externa cuando corresponde |

## WF-097..112 originales (no workflows activados)
| ID | Requisito | Estado / dependencia |
|---|---|---|
| WF-097 | Importar datos. | PARCIAL — CSV/mapeo/errores/comparación local probados; ejecución y casos persistentes requieren contrato externo |
| WF-098 | Mapear campos. | PARCIAL — CSV/mapeo/errores/comparación local probados; ejecución y casos persistentes requieren contrato externo |
| WF-099 | Conciliar IDs. | PARCIAL — CSV/mapeo/errores/comparación local probados; ejecución y casos persistentes requieren contrato externo |
| WF-100 | Gestionar conflictos. | PARCIAL — CSV/mapeo/errores/comparación local probados; ejecución y casos persistentes requieren contrato externo |
| WF-101 | Importación fallida. | PARCIAL — CSV/mapeo/errores/comparación local probados; ejecución y casos persistentes requieren contrato externo |
| WF-102 | Webhook fallido. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |
| WF-103 | Mensajería fallida. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |
| WF-104 | IA indisponible. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |
| WF-105 | Control de costos. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |
| WF-106 | Auditoría de permisos. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |
| WF-107 | Copias de seguridad. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |
| WF-108 | Restauración de prueba. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |
| WF-109 | Credenciales. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |
| WF-110 | Salud del sistema. | PARCIAL — presentación de salud desconocida; comprobación técnica externa pendiente |
| WF-111 | Retención. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |
| WF-112 | Incidente crítico. | PENDIENTE — contrato/fuente/autoridad externa y aplicación especializada |

## Casos originales del adjunto (112 IDs encontrados)
No confundir estos casos P13 con las 170 pruebas AT/AT2/AT3 maestras requeridas en §52; esas 170 descripciones originales no se copian ni se inventan aquí. Los 224 comportamientos WF/WF2/WF3 requieren conciliación maestra, no se declaran completos.

| ID | Descripción original | Resultado / evidencia |
|---|---|---|
| ADMIN13-T01 | Abrir panel. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T02 | Consultar configuración general. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T03 | Editar borrador. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T04 | Validar campos. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T05 | Detectar configuración incompatible. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T06 | Comparar versiones. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T07 | Solicitar aprobación. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T08 | Rechazar cambio sin permiso. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T09 | No cambiar datos oficiales solo con estado local. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T10 | Historial preservado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T11 | Zona sin capacidad. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T12 | Servicio sin profesional habilitado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T13 | Horario incompatible. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T14 | Cambio de tarifa con versión. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| ADMIN13-T15 | No alterar registros históricos. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T01 | Administrador autorizado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T02 | Empleado no autorizado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T03 | Cliente intenta acceder a administración. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T04 | Especialista externo intenta abrir datos ajenos. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T05 | Cambio de rol en borrador. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T06 | Vista previa de permisos. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T07 | Intento de autoelevación. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T08 | Aprobación independiente. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T09 | Acceso temporal. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T10 | Expiración. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T11 | Revocación. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T12 | Privacidad financiera. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T13 | Privacidad clínica. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T14 | Separación de organizaciones. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| PERM13-T15 | Backend rechaza acción no autorizada, cuando esté conectado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T01 | Proveedor conectado con evidencia. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T02 | Credenciales configuradas pero no verificadas. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T03 | Proveedor desconectado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T04 | Última sincronización. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T05 | Error de calendario. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T06 | Error de WhatsApp. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T07 | Error de IA. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T08 | Estado de OKVET. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T09 | Token vencido. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T10 | No exponer secreto. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T11 | Diagnóstico solicitado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T12 | Servicio no responde. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T13 | Estado desconocido. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T14 | Error no ocultado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| INT13-T15 | No marcar CONNECTED por simple configuración visual. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| OKV13-T01 | Importación autorizada. | PARCIAL — controles locales y/o dominio probados; autorización, identidad clínica, validación/auditoría oficial o recuperación externa pendientes |
| OKV13-T02 | Archivo válido. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T03 | Archivo no permitido. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T04 | Mapeo de campos. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T05 | Campo obligatorio faltante. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T06 | Mascotas con mismo nombre. | PARCIAL — controles locales y/o dominio probados; autorización, identidad clínica, validación/auditoría oficial o recuperación externa pendientes |
| OKV13-T07 | Propietarios similares. | PARCIAL — controles locales y/o dominio probados; autorización, identidad clínica, validación/auditoría oficial o recuperación externa pendientes |
| OKV13-T08 | Referencia duplicada. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T09 | Conflicto de fecha. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T10 | Conflicto de profesional. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T11 | Cita pendiente de verificación. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T12 | Coincidencia validada. | PARCIAL — controles locales y/o dominio probados; autorización, identidad clínica, validación/auditoría oficial o recuperación externa pendientes |
| OKV13-T13 | No sobrescritura automática. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T14 | Importación fallida. | PARCIAL — controles locales y/o dominio probados; autorización, identidad clínica, validación/auditoría oficial o recuperación externa pendientes |
| OKV13-T15 | Revisión humana. | PARCIAL — controles locales y/o dominio probados; autorización, identidad clínica, validación/auditoría oficial o recuperación externa pendientes |
| OKV13-T16 | No inventar API. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T17 | No confirmar citas sin evidencia. | PASSED alcance local de parser/preview/seguridad: system-import-p13.test.ts + QA lote B; proveedor externo no probado |
| OKV13-T18 | Auditoría de conciliación. | PARCIAL — controles locales y/o dominio probados; autorización, identidad clínica, validación/auditoría oficial o recuperación externa pendientes |
| AUTO13-T01 | Listar workflows reales. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T02 | Estado de ejecución. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T03 | Evento recibido. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T04 | Evento procesado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T05 | Evento fallido. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T06 | Reintento pendiente. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T07 | Dead letter. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T08 | Solicitud de reintento seguro. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T09 | Evento duplicado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T10 | No doble envío. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T11 | No doble cobro. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T12 | No doble reserva. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T13 | Error de proveedor. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T14 | Recuperación. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| AUTO13-T15 | Historial completo. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T01 | Estado real de plataforma. | PARCIAL: dominio con evidencia fechada; plataforma externa no verificada |
| SYS13-T02 | Estado desconocido. | PASSED dominio: integración sin evidencia → UNKNOWN; navegador /admin verificado |
| SYS13-T03 | Integración degradada. | PASSED dominio: comprobación con ERROR → DEGRADED; proveedor externo no probado |
| SYS13-T04 | Incidente abierto. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T05 | Escalamiento. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T06 | Incidente resuelto con evidencia. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T07 | Contingencia de WhatsApp. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T08 | Contingencia de IA. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T09 | Contingencia de calendario. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T10 | Estado de backup reportado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T11 | Restauración no inventada. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T12 | Política de retención. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T13 | Acceso temporal. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T14 | Credenciales no visibles. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T15 | Auditoría no editable. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T16 | Error técnico sanitizado. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T17 | No información clínica en logs. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| SYS13-T18 | Acceso no autorizado bloqueado por backend. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T01 | Checklist frontend. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T02 | Checklist de seguridad. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T03 | Checklist de agenda. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T04 | Checklist WhatsApp. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T05 | Checklist OKVET. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T06 | Checklist de finanzas. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T07 | Checklist de integraciones. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T08 | Checklist de recuperación. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T09 | Prueba bloqueada. | PASSED dominio y UI: gate sin evidencia y aprobación bloqueada |
| DEP13-T10 | Prueba fallida. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T11 | Evidencia faltante. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T12 | Gate no aprobable. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T13 | Dependencia de Antigravity. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T14 | Aprobación autorizada. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T15 | Versión de lanzamiento. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |
| DEP13-T16 | No declarar producción lista con datos DEMO. | NOT_RUN / REQUIRES_BACKEND cuando exige autoridad externa |

## Dependencias pendientes
- Aplicación oficial de configuraciones/permisos, contratos de imports/reconciliación y accesos temporales: autoridad Antigravity; no migraciones en este prompt.
- Salud/eventos/traces/costos/credenciales/backup/restauración: fuentes técnicas firmadas y prueba reciente de responsable externo. Etiquetas manuales no equivalen a monitoreo.
- Wizard local de mapeo para citas ya probado; otros tipos, casos persistentes y simulaciones/versiones de configuración aún pendientes. No confundir coincidencia administrativa con verificación clínica.
- Gate de lanzamiento por versión y evidencia por responsable; no publicar automáticamente.
