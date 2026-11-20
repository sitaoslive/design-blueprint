# Auditoría de auxiliares y acceso de Luis

## Alcance y evidencia
Revisión de los documentos originales disponibles (Maestro, 01B, 01C, 02, 05, 06, 07, 08, experiencia del auxiliar y componentes compartidos), requisitos de comunicación del Prompt 04 en la conversación, código y políticas desplegadas. La etiqueta «funcional» del registro no se tomó como prueba de cumplimiento completo.

Cuenta temporal autenticada, con rol exclusivamente auxiliar y ficha profesional propia. Visita, tarea, insumo, mensaje y entrega sintéticos; no se modificaron cuentas demo ni el vínculo de Luis. Las pantallas se recorrieron en móvil 384 × 681. La suite completa pasó 121 pruebas. La aprobación de una prueba unitaria no equivale a aprobación de todos los criterios originales.

## Luis: bloqueo externo comprobado
La cuenta real conserva los roles `luis`, `administrador`, `veterinario` y su ficha profesional. Cloud sigue mostrando `email_confirmed_at = null`; el inicio de sesión real en navegador devolvió `email_not_confirmed`. No se forzó la confirmación ni se presentó una sesión temporal como la de Luis. La comprobación de sus dos modos después de confirmar sigue pendiente de que llegue esa confirmación. El aviso de correo sin confirmar se muestra ahora en español.

## Auxiliar: verificado en navegador con guardado real
| Flujo | Resultado |
| --- | --- |
| Inicio, asignaciones, agenda, preparación, insumos, kits, tareas, incidencias, mensajes, turnos, academia, perfil, más, cobros, pendientes de envío, traspasos, cierre de jornada y visita | 18 pantallas abren, sin error de ejecución ni desbordamiento horizontal; esto no certifica todos sus procesos |
| Marcar tarea | Se guarda y se lee después de recargar; se espera respuesta en lugar de mostrar éxito prematuro |
| Preparar visita, completar lista, salir y registrar llegada | Todos los pasos guardados; sin botón de iniciar atención para auxiliar |
| Nota sin conexión repetida dos veces | Un borrador y un registro tras reconectar |
| Borrador de otra cuenta | No aparece ni se envía desde la cuenta actual |
| Apartar y consumir insumo propio | Reserva guardada, consumo aplicado y lectura posterior |
| Informar cobro | Registro real informado; auxiliar no puede verificarlo |
| Enviar mensaje y marcar recepción | Persistencia y lectura posterior; contenido recibido inmutable |
| Abrir la visita desde el área compartida del equipo | Tampoco muestra acciones clínicas |
| Entrega dirigida al auxiliar | Aceptada y leída después de recargar; entrega sin emisor rechazada |

También se comprobaron rechazos mediante llamadas autenticadas: iniciar atención en `visit_executions`, modificar directamente el paso clínico de `visits`, cambiar existencias directamente, consumir una reserva ajena, leer una nota ajena, verificar un cobro y alterar el cuerpo de un mensaje recibido.

## Correcciones realizadas
- Las visitas del auxiliar dejaron de usar el flujo antiguo que escribía pasos sin pasar por la autoridad de ejecución.
- Se añadieron enlaces propios a cobros, notas pendientes, entregas y cierre de jornada.
- Las casillas de preparación y su contador usan la ejecución persistida, no la lista genérica de insumos.
- Un auxiliar sin ficha cargada no recibe facultades clínicas por defecto.
- Notas offline aisladas por usuario, eliminación de borradores expirados y protección contra atribución a otra cuenta.
- Reservas limitadas a visitas accesibles; auxiliares no pueden consumir reservas ajenas ni ajustar directamente inventario. Disponibilidad agregada evita revelar reservas de otras visitas.
- Registros del auxiliar limitados a los suyos o entregas dirigidas a su ficha; cobros y notas con visita deben pertenecer a una visita asignada.
- Mensajes recibidos solo admiten cambio de lectura. Entregas necesitan emisor/receptor válidos y solo el receptor puede responder sin alterar sus pendientes.

## Requisitos todavía no completos (no declarar 100%)
1. **Participación conjunta:** el modelo principal conserva un único profesional por visita; falta una relación separada para auxiliares participantes sin sustituir al veterinario responsable.
2. **Tareas avanzadas:** se guarda el estado hecha/pendiente; faltan aceptación, progreso, bloqueo, cancelación, vencimiento y escalamiento del ciclo detallado del Prompt 06.
3. **Kits completos:** existen reservas y consumo; faltan requerimientos por servicio con cantidades, asignación física del kit, reposición/retorno y trazabilidad completa. La lista de preparación no garantiza por sí sola las reservas necesarias.
4. **Entrega efectiva de trabajo:** aceptar la entrega protege la respuesta, pero aún no reasigna automáticamente tareas, visitas e incidencias ni las incorpora a todas las listas del receptor.
5. **Cierre de jornada:** se evalúan pendientes en la interfaz; falta una validación completa en servidor por turno/fecha, con responsabilidad transferida y verificación. No se certificó un cierre real completo.
6. **Contexto de mensajes:** envío y recepción funcionan; faltan hilos específicos por visita/tarea y adjuntos operativos.
7. **Cobros avanzados:** falta vincular tarifas/extras autorizados, comprobante privado, saldos y ciclo financiero completo. Informar no significa verificar o conciliar pago.
8. **Formación individual:** el progreso sigue en el curso compartido; faltan matrícula y evidencia de aprendizaje por persona. Recorrer Academia no prueba aprendizaje real.
9. **Fechas operativas:** persisten fechas antiguas en texto; falta una normalización completa para distinguir hoy, próximos e histórico y calcular cierre únicamente para la jornada correcta.
10. **Offline robusto:** la prueba cubrió duplicado simple y separación entre cuentas, no todos los casos de concurrencia multidispositivo y pérdida/reinicio durante el envío.

Las conexiones reales con WhatsApp, OKVET, tráfico/mapas y automatizaciones externas siguen fuera de esta comprobación. No se activaron envíos externos ni se certificaron escenarios que dependen de ellas.