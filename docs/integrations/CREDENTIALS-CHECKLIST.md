# Checklist de integraciones y secretos (nunca anotar valores reales aquí)

| Proveedor | Qué verificar | Estado inicial |
|---|---|---|
| Antigravity ↔ n8n | MCP/API, permisos, identidad del proyecto, ejecución | Reportada por usuario / SIN_VERIFICAR |
| n8n | URL HTTPS, versión, credenciales, backups, zona America/Bogota | SIN_VERIFICAR |
| Supabase | Proyecto correcto, endpoints autorizados, outbox/colas, auditoría | SIN_VERIFICAR |
| Meta WhatsApp | App, WABA, número empresarial, webhook firmado, plantillas, consentimiento | SIN_VERIFICAR |
| Google Calendar | OAuth por profesional, scopes mínimos, libre/ocupado, renovación | SIN_VERIFICAR |
| OKVET | Permiso de API oficial o reconciliación manual autorizada | SIN_VERIFICAR |
| GitHub | Repo correcto, rama, protección, secretos omitidos | SIN_VERIFICAR |
| IA | Proveedor/modelo, condiciones de datos, cuotas, seguridad clínica | SIN_VERIFICAR |

## Dónde colocar valores
- En **Credentials** de n8n y gestores de secretos del backend/plataforma.
- Nunca en prompts, capturas, archivos `.env` subidos, JSON exportado, resultados de pruebas o GitHub.
- Documentar únicamente **nombre de credencial**, **propietario**, **permisos**, **vencimiento** y **última prueba**.
