# Auxiliares avanzados: implementación y pruebas

## Implementado
- Coordinación vincula auxiliares a una visita sin reemplazar al veterinario. Cada participación registra su propia preparación, desplazamiento, llegada y finalización. Las participaciones transferidas se conservan y pueden crearse nuevas sin sobrescribir las anteriores.
- Acceso por visita compartida a mascota, insumos, mensajes y notas. Lectura de la ejecución veterinaria sin escritura clínica desde el apoyo.
- Tareas: asignada → aceptada → en curso → completada; bloqueo con motivo y recuperación, cancelación por Coordinación, fecha límite, indicador de vencimiento e historial. El bloqueo genera un aviso interno; pedir ayuda crea una solicitud persistente.
- Requerimientos por visita y cantidad, reservas atómicas, kit físico asignado, recepción y devolución. La preparación no se da por lista únicamente por marcar casillas.
- Entregas: servidor valida pendientes al enviar y al aceptar; aceptación transfiere las tareas, participaciones auxiliares e incidencias. Las visitas clínicas continúan bajo su responsable y solo Coordinación las reasigna.
- Cierre: pendientes de fecha operativa de Colombia calculados en servidor, incluyendo apoyo, tareas críticas, kits no devueltos e incidencias. Solicitud no significa verificación y no permite autosupervisión.
- Formación individual por lección; no se reutiliza el porcentaje compartido del curso como progreso personal.
- Mensajes con visita/tarea y adjuntos privados. Comprobantes privados de cobro; autorización de tarifa, extras y descuento; límites contra cobros que superan lo autorizado. Un importe informado sigue sin verificarse y no reduce el saldo verificado.
- Cola offline aislada por cuenta, deduplicación confirmada, recuperación al reconectar desde el área y conservación de notas agregadas durante un envío.

## Pruebas con cuenta real temporal, móvil 384 × 681
1. Visita compartida aparece; visita ajena no aparece en interfaz ni consulta autenticada. Responsable clínico permanece igual.
2. Inicio de preparación y lista persistidos. Cantidad requerida faltante bloquea «Preparación lista» en pantalla y mediante escritura directa.
3. Reserva de dos unidades para la visita compartida, recepción y devolución del kit confirmadas.
4. Preparación, desplazamiento, llegada y fin de apoyo guardados. La cita original permanece confirmada, con su profesional y paso clínico originales; intento de iniciar atención rechazado.
5. Nota sin conexión repetida dos veces: exactamente un registro después de reconectar.
6. Tarea aceptada, iniciada, bloqueada con motivo, recuperada y completada. Finalización leída tras recargar.
7. Lección completada para la cuenta temporal; porcentaje del curso compartido permanece intacto.
8. Cobro parcial por transferencia con comprobante real sintético: archivo subido y abierto, registro informado persistido. Auxiliar no puede verificar. Saldo verificado permanece intacto.
9. Mensaje asociado a la visita y archivo adjunto persistidos. Se esperó confirmación antes de considerar enviado el mensaje.
10. Aceptación de entrega hace aparecer el apoyo y la tarea transferidos en las listas reales del receptor.
11. Cierre bloqueado con apoyo pendiente y kit no devuelto, tanto en pantalla como en escritura directa. Después de finalizar ambos apoyos, tareas y devolver kit, solicitud guardada y releída. Verificación propia rechazada.

Se corrigió en la prueba que el bloqueo de tarifa necesitaba ejecutarse con autoridad del servidor para consultar/bloquear una tarifa que el auxiliar puede leer, pero no editar. No se concedió al auxiliar permiso de edición de tarifas.

## Límites y preservación
- 136 pruebas automatizadas aprobadas; no equivale a completar todos los criterios originales de todos los prompts.
- No se activaron WhatsApp, OKVET, IA conversacional, pasarelas de pago ni contabilidad/conciliación externa.
- Fechas antiguas no interpretables no se inventan: requieren fecha operativa de Coordinación. Las filas históricas resueltas no se normalizaron ni reabrieron.
- No se certificó concurrencia multidispositivo completa, evaluación formal de conocimientos, ni plantillas universales de insumos por servicio: los requerimientos reales se configuran por visita.
- No se probó nuevamente el inicio de sesión de Luis; el bloqueo anterior de confirmación de correo queda fuera de esta prueba.
- Se conservan cuentas demo, cuenta de Luis y datos reales existentes; la limpieza se limita a los identificadores sintéticos creados para esta prueba.