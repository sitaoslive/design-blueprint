# Privacidad de Datos y Confidencialidad Médica (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Normativa Aplicable:** Ley 1581 de 2012 (Habeas Data Colombia), Código de Ética COMVEZCOL (Ley 576 de 2000)  
**Fecha:** 2026-11-21  

---

## 1. Protección de Datos Clínicos y Secretos Profesionales

En Vet Life, el secreto profesional veterinario es sagrado. Los reportes ejecutivos están diseñados bajo la premisa de **agregación sin exposición innecesaria de PII (Personally Identifiable Information)**:

1. **Anonimización en Mensajería Ejecutiva:**  
   El brief de 60 segundos que se envía a WhatsApp nunca incluye nombres completos de tutores ni direcciones residenciales exactas, a menos que se trate de un caso puntual de reclamación de alta gravedad que requiera intervención directa del Dr. Luis.
2. **Exclusión de Datos Sensibles de Personal:**  
   Las razones médicas específicas de las ausencias del personal (incapacidades de salud) se registran únicamente bajo la categoría protegida `MEDICAL_ABSENCE`, sin detallar diagnósticos privados en el resumen público o de coordinación.
3. **Protección en Protocolos de Duelo:**  
   Las familias con mascotas fallecidas se encuentran bajo el flag estricto `BEREAVEMENT_ACTIVE`. Queda estrictamente prohibido incluir a estos tutores en listas de cobro, campañas promocionales o encuestas masivas en los resúmenes diarios.

---

## 2. Prevención de Fugas de Información hacia Modelos de Lenguaje (IA)

Cuando se utiliza un modelo de lenguaje para redactar la síntesis o asistir en la formulación de recomendaciones:
- **Cero Envío de PII:** Solo se transmiten cifras consolidadas, tipos de especies tratadas (caninos, felinos) y categorías operativas.
- **Prohibición de Almacenamiento para Re-entrenamiento:** Se utilizan APIs empresariales con política de retención cero (`zero-data retention`), impidiendo que los datos de Vet Life sean incorporados a modelos públicos.
- **Sanitización de Logs:** Los logs de ejecución en n8n y Supabase enmascaran números telefónicos, tokens bancarios y credenciales de acceso.
