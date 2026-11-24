# VET FREEDOM OS — FUENTE DE VERDAD Y CONSISTENCIA DEL FEEDBACK

## 1. Modelo de Verdad Centralizada
- **Supabase (PostgreSQL 17):** Base de datos relacional inmutable que almacena las 26 tablas del hub de experiencia del cliente (`customer_experience_*`), protegidas con RLS estricto y `forcerowsecurity = true`.
- **n8n Orchestrator (`YVEIO4UW2DWTztoy`):** Automatizador reactivo y programado que orquesta el triaje de feedback, el desvío clínico hacia CORE-04, la escalación a CORE-07 y la preparación de despachos neutros vía CORE-03.
- **Lovable Frontend:** Portal web para tutores y consola de administración operativa, consumiendo Supabase mediante RPCs autorizadas.
- **OKVET:** Registro clínico oficial y legal. No se replican quejas ni disputas comerciales en el historial clínico legal a menos que tengan impacto directo en la salud del paciente.

## 2. Inmutabilidad de Respuestas
Las respuestas de encuestas (`customer_experience_responses` y `customer_experience_survey_answers`) son de inserción exclusiva (*append-only*). No se permite edición ni borrado de calificaciones para prevenir cualquier manipulación de métricas de calidad.
