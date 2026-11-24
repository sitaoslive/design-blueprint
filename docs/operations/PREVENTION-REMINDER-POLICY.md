# Política de Notificaciones y Recordatorios Preventivos (VET-CORE-10)

## 1. Cadencia y Ventanas de Recordatorio
Los recordatorios preventivos siguen una cadencia prudente orientada a la planificación del tutor, no a la saturación comercial:
- **D-15:** Aviso preliminar para agendamiento de visita preventiva a domicilio.
- **D-7:** Recordatorio de planificación semanal.
- **D-3:** Notificación de confirmación de disponibilidad médica.
- **D-1:** Recordatorio operativo con recomendaciones pre-visita (ej. ayuno si aplica toma de muestra concomitante).
- **D-0:** Confirmación del bloque de ruta matutino / vespertino.

## 2. Protocolos de Supresión Inmediata e Incondicional
Cualquier evento de recordatorio es cancelado en el acto ante cualquiera de las siguientes condiciones:
1. **Duelo / Fallecimiento del Paciente (`BEREAVEMENT_PROTOCOL`):** Si el paciente está marcado como fallecido o la familia se encuentra en duelo (`is_bereaved = true`), todos los recordatorios futuros son anulados inmediatamente (`CANCELLED_BEREAVEMENT`).
2. **Planes no aprobados o en borrador (`DRAFT`):** Ningún evento vinculado a un plan no ratificado por veterinario colegiado emitirá comunicaciones.
3. **Datos desactualizados (> 365 días) o en conflicto:** Se suspende la emisión hasta auditoría médica (`AUDIT_PENDING`).
4. **Revocación de Cuidador:** Si el tutor retira la autorización a un cuidador secundario, este deja de recibir alertas al instante.
5. **Opt-Out / Retiro de Consentimiento:** Respeto estricto a las políticas de Meta y Ley Habeas Data de Colombia (1581 de 2012).
6. **Límite de Frecuencia (Anti-Spam):** Máximo un recordatorio preventivo cada 48 horas por paciente para evitar fatiga comunicativa.

## 3. Integración Segura con VET-CORE-03
- Las notificaciones son preparadas y enviadas como peticiones de despacho hacia el despachador de WhatsApp `VET-CORE-03`.
- En entorno de desarrollo y pruebas, `send_enabled` se mantiene forzosamente en `false`.
- Los mensajes emplean plantillas HSM oficiales aprobadas en Meta Business Manager.

## 4. Tono y Redacción
- Lenguaje profesional, empático y respetuoso (Español de Colombia).
- Prohibido el uso de términos alarmistas, amenazas de enfermedad inminente o lenguaje de culpabilización hacia el tutor.
