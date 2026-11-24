# Barreras de seguridad antes de producción

## Puerta A — Infraestructura
HTTPS, administración segura, acceso mínimo, TLS, backups recuperables, logs minimizados, monitoreo y versionado.

## Puerta B — Autenticidad
Eventos firmados/autenticados con protección replay, validación de versión/esquema e identificación de organización; los proveedores verifican firmas sobre cuerpo original cuando lo exijan.

## Puerta C — Integridad
Dedupe atómico, cola persistente, reintentos limitados, manejo de fallo parcial, idempotencia de efectos externos y conciliación.

## Puerta D — Reglas clínicas
Sin prescripción ni diagnóstico por IA, autorizaciones humanas, no modificar clínicas sin permiso y sin estado confirmado de OKVET/especialistas sin evidencia.

## Puerta E — Comunicaciones
Modo BORRADOR por defecto, modo TEST restringido, consentimiento, ventana de servicio/plantillas, opt-out, supresión por duelo y aprobación explícita para envíos reales.

## Puerta F — Aceptación
Evidencia de ejecución y requisitos mapeados; tests negativos, concurrencia y pruebas reales de autenticación y reversibilidad. Estados actualizados por módulo.

**Si una puerta falla, no publicar o activar el workflow afectado.**
