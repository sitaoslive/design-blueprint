# VET FREEDOM OS — DATA RETENTION AND PRIVACY POLICY
## Política de Retención de Datos, Purga y Cumplimiento Normativo
**Proyecto:** VET FREEDOM OS  
**Empresa:** Vet Life — Veterinaria a Domicilio  
**Marco Legal:** Ley 576 de 2000 (Código de Ética Médico Veterinaria), Ley 1581 de 2012 (Habeas Data)  
**Fecha:** 2026-11-21  

---

## 1. MARCO LEGAL Y DIRECTRICES DE RETENCIÓN

En la República de Colombia, la historia clínica veterinaria es un documento privado sujeto a reserva y custodia obligatoria:
- **Ley 576 de 2000 (Art. 73 a 78):** La historia clínica y sus anexos deben conservarse de manera íntegra, legible y verídica durante un periodo mínimo de **10 años** contados a partir de la última fecha de atención.
- **Ley 1581 de 2012:** Garantiza el derecho de los tutores a conocer, actualizar y rectificar sus datos personales, así como a revocar autorizaciones comerciales respetando las obligaciones legales de custodia clínica y fiscal.
- **Estatuto Tributario (DIAN):** Los comprobantes de contabilidad, facturas y soportes bancarios deben conservarse por un mínimo de **5 años**.

---

## 2. TABLA MAESTRA DE PERÍODOS DE RETENCIÓN

| Dominio / Entidad | Tiempo de Retención | Acción al Vencimiento | Fundamento Jurídico / Operativo |
|-------------------|---------------------|------------------------|----------------------------------|
| Historias Clínicas y Documentos Médicos (`medical_records`, `signed_consent_records`) | 10 años mínimo | Archivo frío / Cripto-custodia | Ley 576 de 2000 |
| Datos de Clientes y Pacientes (`clients`, `patients`) | Activo + 10 años | Anonimización irreversible | Habeas Data / Responsabilidad Profesional |
| Facturas y Recibos Financieros (`invoices`, `financial_transactions`, `payment_receipts`) | 5 años | Archivo fiscal digital | Estatuto Tributario / DIAN |
| Bitácoras de Auditoría Forense (`audit_logs`) | 3 años activo, 7 años archivado | Traslado a almacenamiento inmutable | Auditoría de Seguridad SOC2 / ISO 27001 |
| Eventos Transaccionales (`transactional_outbox`, `event_inbox`) | 90 días en tabla activa | Purga automática a tabla histórica | Optimización de rendimiento de base de datos |
| Reservas Temporales Expiradas (`appointment_holds`) | 7 días | Purga física (`DELETE`) | Datos efímeros de concurrencia |
| Encuestas de Satisfacción (`customer_satisfaction_surveys`) | 2 años | Agregación anónima para KPIs | Calidad y mejora continua |
| Casos de Duelo y Homenajes (`grief_support_cases`, `memorial_records`) | Permanente salvo revocación del tutor | Conservación respetuosa | Protección emocional del cliente |

---

## 3. PROCEDIMIENTOS DE PURGA Y AUTOMATIZACIÓN

La base de datos cuenta con funciones programadas mediante `pg_cron` para la limpieza de datos temporales sin intervención humana:

```sql
-- Purga diaria de holds obsoletos con más de 7 días
CREATE OR REPLACE FUNCTION public.purge_expired_holds()
RETURNS INT AS $$
DECLARE
    v_deleted INT;
BEGIN
    DELETE FROM public.appointment_holds
    WHERE is_released = true
      AND expires_at < (now() - interval '7 days');
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Archivo de eventos Outbox procesados con más de 90 días
CREATE OR REPLACE FUNCTION public.archive_processed_outbox_events()
RETURNS INT AS $$
DECLARE
    v_archived INT;
BEGIN
    WITH moved_rows AS (
        DELETE FROM public.transactional_outbox
        WHERE status = 'PROCESSED'
          AND processed_at < (now() - interval '90 days')
        RETURNING *
    )
    INSERT INTO public.transactional_outbox_archive
    SELECT * FROM moved_rows;
    GET DIAGNOSTICS v_archived = ROW_COUNT;
    RETURN v_archived;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
