# Prompt 12 — trazabilidad y límites

## Estado actual
Interfaz y dominio inicial ampliados, contratos preparados y fuentes existentes conectadas en lectura. No es una certificación de todos los 60 lotes ni de ejecución autónoma. 60 pruebas P12 (44 políticas/contratos + 16 consultas) y 359 pruebas totales. QA autenticada y visual: P12_2026-11-21.md.

## Assistant IDs
| ID | Estado / evidencia |
|---|---|
| AI-01 | PARCIAL — Identidad privada |
| AI-02 | PARCIAL — Chat y voz preparada; historial de sesión |
| AI-03 | PARCIAL — Consultas de fuentes autorizadas |
| AI-04 | PARCIAL — Propuestas/borradores |
| AI-05 | PARCIAL — Coordinador de ejecución fail-closed |
| AI-06 | PARCIAL — Revisión de aprobaciones; autoridad pendiente |
| AI-07 | PARCIAL — Reportes deterministas |
| AI-08 | PARCIAL — Observaciones vs hipótesis |
| AI-09 | PARCIAL — Mejoras como propuestas |
| AI-10 | PARCIAL — Memoria empresarial como borrador |
| AI-11 | PARCIAL — Actividad de sesión; auditoría protegida pendiente |
| AI-12 | PARCIAL — Recibos con esquema; sin confirmación inventada |

## Dirección
| ID | Estado |
|---|---|
| AD-01 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-02 | PARCIAL — excepciones de fuentes existentes |
| AD-03 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-04 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-05 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-06 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-07 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-08 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-09 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-10 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-11 | PARCIAL — score insuficiente sin política/datos |
| AD-12 | PARCIAL — cobertura/activación protegida pendiente |
| AD-13 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |
| AD-14 | NO CERTIFICADO — identificación detallada requiere reconciliación con especificación maestra |

## Workflows (no n8n activado)
| ID | Requisito | Aplicación / contrato | Estado / bloqueo |
|---|---|
| WF-087 | Apertura | executive-assistant / getExecutiveBriefing | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |
| WF-088 | Consulta autorizada | executive-assistant / queryExecutiveData | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |
| WF-089 | Propuesta tarea | executive-assistant / createExecutiveProposal | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |
| WF-090 | Propuesta rutas | executive-assistant / createExecutiveProposal | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |
| WF-091 | Aprobación | executive-assistant / submitExecutiveApproval | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |
| WF-092 | Ejecución | executive-assistant / requestExecutiveExecution | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |
| WF-093 | Cierre | executive-assistant / getExecutiveReport | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |
| WF-094 | Semanal | executive-assistant / getExecutiveReport | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |
| WF-095 | Autonomía | executive-assistant / getAutonomyMetrics | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |
| WF-096 | Ausencia | executive-assistant / requestAbsenceModeActivation | PARCIAL: dominio/interfaz; eventos, programación y autoridad protegida pendientes |

## Casos originales — cobertura conservadora
Las pruebas implementadas no equivalen a ejecutar los 142 casos originales. Cada fila conserva el requisito; consultar nombres de pruebas y evidencia del lote. Casos multiusuario, proveedor, transcripción y servidor siguen pendientes cuando requieren contratos.
| ID | Requisito original | Estado |
|---|---|
| AI12-T01 | Iniciar conversación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T02 | Enviar mensaje. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T03 | Consultar historial. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T04 | Referencia contextual. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T05 | Nueva conversación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T06 | Mensaje ambiguo. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T07 | Varias intenciones. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T08 | Datos faltantes. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T09 | Fuente desactualizada. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T10 | Servicio no disponible. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T11 | Respuesta con fuente real. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T12 | Respuesta sin fuente suficiente. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T13 | No inventar estado. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T14 | Datos de otra organización bloqueados por servidor al integrarse. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| AI12-T15 | Usuario sin permiso. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T01 | Solicitar micrófono. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T02 | Denegación de permisos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T03 | Iniciar grabación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T04 | Detener grabación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T05 | Cancelar. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T06 | Mostrar transcripción. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T07 | Corregir transcripción. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T08 | Audio no disponible. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T09 | Error de transcripción. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T10 | No grabación oculta. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T11 | No escucha permanente. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| VOICE12-T12 | Acción sensible requiere confirmación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T01 | Consultar agenda. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T02 | Consultar equipo. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T03 | Consultar rutas. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T04 | Consultar finanzas. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T05 | Consultar remisiones. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T06 | Consultar calidad. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T07 | Consultar Academy. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T08 | Herramienta sin permisos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T09 | Herramienta no disponible. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T10 | Resultado parcial. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T11 | Resultado desactualizado. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T12 | Error tipado. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T13 | Contexto sensible restringido. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T14 | Fuente verificable. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| TOOL12-T15 | No invocar herramientas no registradas. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T01 | Consulta solo lectura. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T02 | Crear borrador. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T03 | Crear propuesta. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T04 | Clasificar riesgo. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T05 | Rechazar acción prohibida. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T06 | Solicitar aprobación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T07 | Aprobar propuesta válida. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T08 | Rechazar propuesta. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T09 | Aprobación vencida. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T10 | Propuesta modificada. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T11 | Aprobación ambigua. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T12 | Acción clínica restringida. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T13 | Confirmación OKVET pendiente. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T14 | Acción financiera sensible. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T15 | Doble solicitud de ejecución. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T16 | Idempotencia. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T17 | Ejecución parcial. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T18 | Error externo. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T19 | No afirmar éxito ficticio. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ACT12-T20 | Mostrar recibos reales. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T01 | Crear delegación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T02 | Identificar responsable. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T03 | Verificar rol. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T04 | Rechazar responsable no habilitado. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T05 | Asignar fecha. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T06 | Solicitar aceptación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T07 | Registrar aceptación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T08 | Registrar avance. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T09 | Bloqueo. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T10 | Vencimiento. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T11 | Escalamiento. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T12 | Cierre con evidencia. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T13 | No cerrar por notificación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T14 | No duplicar tarea. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| DEL12-T15 | Transferencia de contexto autorizado. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T01 | Preparar fechas. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T02 | Identificar responsabilidades. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T03 | Identificar visitas. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T04 | Identificar compromisos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T05 | Proponer reemplazos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T06 | Detectar falta de cobertura. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T07 | No conceder permisos automáticamente. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T08 | Solicitar aprobación. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T09 | Activar mediante backend autorizado. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T10 | Diferenciar alertas rutinarias. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T11 | Mantener protocolos críticos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T12 | Finalizar ausencia. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T13 | Generar resumen. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T14 | Registrar pendientes. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| ABS12-T15 | No inventar horas ahorradas. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T01 | Intento de prompt injection en mensaje. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T02 | Intento de prompt injection en documento. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T03 | Consulta de otra organización. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T04 | Consulta clínica restringida. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T05 | Solicitud de exportación no autorizada. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T06 | Intento de modificar permisos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T07 | Aprobación sin identidad válida. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T08 | Token vencido. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T09 | Acción duplicada. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T10 | Información financiera restringida. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T11 | Información clínica privada. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T12 | Herramienta fuera de política. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T13 | No exponer credenciales. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T14 | Registro de auditoría apropiado. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| SEC12-T15 | Interfaz muestra denegación real. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T01 | Informe de apertura. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T02 | Informe de cierre. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T03 | Informe semanal. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T04 | Cifras con periodo. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T05 | Métrica sin fuente. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T06 | Datos incompletos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T07 | Dinero reportado distinto de verificado. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T08 | Visita programada distinta de realizada. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T09 | Cuello de botella. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T10 | Autonomía operativa. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T11 | Ausencia de datos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T12 | Score explicable. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T13 | Comparación de periodos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T14 | No causalidad inventada. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| REP12-T15 | Exportación autorizada. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T01 | Pantalla principal. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T02 | Chat móvil. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T03 | Composer. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T04 | Micrófono. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T05 | Tarjetas de respuesta. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T06 | Acciones contextuales. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T07 | Centro de propuestas. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T08 | Aprobaciones. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T09 | Delegaciones. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T10 | Modo ausencia. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T11 | Reportes. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T12 | Autonomía. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T13 | Estados de carga. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T14 | Estados vacíos. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T15 | Errores. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T16 | Accesibilidad. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T17 | Navegación por teclado. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T18 | Tablet. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T19 | Android. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |
| UI12-T20 | Desktop. | PARCIAL / NO CERTIFICADO íntegro — pruebas de dominio o QA del lote no sustituyen aceptación original |

## Bloqueos restantes
- Historial conversacional y auditoría oficiales, versionado/aprobación de memoria, aceptación/progreso/transferencia de delegaciones, ejecuciones idempotentes y activación/cierre de ausencia: contratos autoritativos de Antigravity.
- IA ejecutiva, procesamiento/transcripción y voz de proveedor: configuración/autorización pendientes. Captura local segura y lectura opcional del dispositivo no son proveedor integrado.
- Contexto completo por entidad, consultas avanzadas de disponibilidad/ruta/clientes, planner conectado al simulador, configuración persistida del reporte, series históricas/cohortes y comparaciones: todavía parciales. Módulos de origen siguen disponibles; no inventar resultados.
- Aceptación de todos los 71 criterios/60 lotes y 142 casos, concurrencia multiusuario, dispositivos físicos y servidor por organización: no certificada.
- No migraciones ni integraciones externas; demo y cuenta de Luis conservados.
