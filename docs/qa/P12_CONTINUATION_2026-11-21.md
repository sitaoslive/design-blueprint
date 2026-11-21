# P12 continuación + revisión financiera + P13 lote inicial

## Resultado verificado
- 385 pruebas aprobadas en 25 archivos: 80 P12 (44 políticas, 22 consultas, 14 continuación), 6 de salud/gates P13 y 49 financieras. Build OK; diff sin errores.
- Navegador Chromium con cuenta temporal autenticada, primero Dirección/Administración y luego Finanzas. No se usó la identidad real de Luis ni se certificó su correo/inicio de sesión.
- Fuentes reales de Cloud con datos de prueba expresamente sintéticos; no se marcó recepción de dinero, conciliación, facturación, aprobación o envío externos.

## Flujos ejecutados
| Comprobación | Resultado / evidencia |
|---|---|
| Agenda de mañana → seguimiento de tareas/visitas → recarga | Fecha 2026-11-22 y profesional Luis conservados en la misma conversación |
| Nueva conversación | Filtros explícitos reiniciados; no hereda profesional ni mañana |
| Facturación / cobros verificados | Facturación no disponible; verificados usa fuente separada, nunca cobros reportados |
| Chat → propuesta | Objetivo, responsable, fecha y referencias trasladados; borrador guardado y releído después de recarga |
| Acción clínica prohibida | Sin consultas ni ejecución; respuesta bloqueada |
| Archivar/restaurar | Conversación archivada no permite enviar; recuperada desde lista de archivadas |
| Finanzas: familia/periodo/detalle | Cargo QA 120000 COP del 21 incluido; cargo 90000 COP del 1 de octubre excluido |
| Reportar pago | Solicitud QA 60000 COP guardada y releída; aparece en Reportados, no en Verificados; Conciliados indica no disponible |
| CSV financiero | Archivo leído: contiene cargo actual y excluye el ajeno al periodo; periodo invertido bloqueado |
| CSV ejecutivo | Descarga local leída con fuentes, fecha, periodo, estado y limitaciones; no informe oficial |
| Finanzas sin rol director | Cargo permitido; /luis/asistente redirige a /sin-acceso; no compositor privado |
| Demos Administración/Luis | Entrada sin login, datos etiquetados sintéticos, doce perfiles presentes |
| Centro de control | /admin, /admin/despliegue, /admin/desarrollo/dependencias operativos; lanzamiento deshabilitado y salud externa desconocida |
| Layouts | Siete rutas en 360/390/768/1366 px sin desbordamiento; cero errores de ejecución |

## Evidencia repetible
- Scripts de navegador: `docs/qa/scripts/p12-continuation-flows.py` y `p12-permissions-demo.py`. Requieren sesión de prueba mintada en sandbox y fixtures sintéticos; no incluyen credenciales. No pueden ejecutarse después de limpiar fixtures sin recrearlos.
- Pruebas: `src/test/executive-continuation-p12.test.ts`, `executive-queries-p12.test.ts`, `executive-assistant-p12.test.ts`, `finance-lot-a.test.ts`, `finance-p09.test.ts`.
- Capturas inspeccionadas en sandbox: `/tmp/browser/p12-continuation/` (asistente y compositor móvil, administración, cargo Finanzas, borrador releído). Estos temporales no son archivos durables del proyecto.
- Dos fallos iniciales del script de permisos (selector repetido y espera del selector demo) se corrigieron en el script; no eran fallos de la app. El último intento pasó.
- Limpieza limitada a dos cargos QA por ID/propietario y dos borradores QA por creador/título. Perfiles demo e históricos no eliminados; auditoría de la prueba preservada.

## Correcciones implementadas
- Contexto vive por conversación, se recupera tras recarga y no cruza conversaciones. Las selecciones son explícitas; no adivina pacientes/citas homónimos.
- Planificador financiero distingue reportado/verificado/facturación/conciliación/margen. Adaptadores especializados incompletos no devuelven una lista genérica como si resolviera la pregunta.
- Validación de periodos, cita específica, cálculo de carga desde agenda, tareas por profesional, exclusión de calidad cerrada y filtro temporal de visitas del plan de ausencia.
- Borrador conserva referencias de la respuesta; exportación falla si alguna fuente está restringida/desactualizada/no disponible.
- P13 control inicial reutiliza administración, finanzas, asistente e incidencias; no crea fuentes ni permisos alternos. Una etiqueta administrativa nunca certifica salud externa.

## Pendiente (no certificar Prompt 12/13 completos)
1. P12 autoridad oficial: contratos versionados de aprobaciones, ejecución, auditoría/historial, memoria aprobada, aceptación/transferencia de delegaciones y activar/cerrar ausencia, con recibos reales por organización.
2. IA/transcripción de proveedor autorizadas; consultas avanzadas de disponibilidad, rutas/tráfico, contexto completo de clientes/pacientes y planner de alternativas del simulador.
3. Reportes configurables persistidos, series históricas/comparación, políticas del score y evidencias reales de cobertura. Exportación local no sustituye ninguno.
4. P09 contratos B/C financieros y proveedor/políticas de facturación/conciliación/recepción protegida.
5. P13 otros lotes: importación/mapeo/conflictos, simulación/versionado de configuración, permisos de servidor, observabilidad externa, recuperación/backup, costos/retención/credenciales y matrices originales completas.
6. Aceptación exhaustiva multiusuario/organización, producción y dispositivos físicos. Luis real no probado; esta cuenta temporal no equivale a su acceso.

Sin migraciones, nuevas credenciales ni integraciones; WhatsApp, OKVET, n8n y pagos externos permanecen apagados.