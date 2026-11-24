# Procedimiento de Revisión Financiera y Conciliación Semanal (VET-CORE-17)

**Módulo:** `VET-CORE-17 | WEEKLY REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Entorno:** DEVELOPMENT / QA  
**Fecha:** 2026-11-21  

---

## 1. El Ciclo Semanal de Conciliación Financiera

La revisión financiera de Vet Life se fundamenta en la estricta conciliación entre lo emitido contablemente y los fondos reales acreditados en cuentas bancarias o pasarelas:

```mermaid
flowchart LR
    subgraph S1 ["Lunes 07:00 AM"]
        RUN["Corte Automático VET-CORE-17"]
    end

    subgraph S2 ["Lunes 09:00 AM"]
        REV["Revisión de Cartera Pendiente: Saldos no Conciliados"]
    end

    subgraph S3 ["Martes 05:00 PM"]
        REC["Cierre de Conciliación Bancaria Extemporánea"]
    end

    subgraph S4 ["Miércoles 08:00 AM"]
        V2["Generación de Versión v2 si hubo Ajustes > $200.000 COP"]
    end

    RUN --> REV --> REC --> V2
```

---

## 2. Puntos de Control y Auditoría Financiera

1. **Brecha Facturado vs Cobrado:** Si la efectividad de recaudo es inferior al **90%**, el sistema lista individualmente las cuentas con más de 48 horas sin comprobante para gestión de cartera.
2. **Costos Directos Variables:**
   - Comparación de consumo de medicamentos contra el inventario teórico de visitas.
   - Rendimiento de combustible por kilómetro recorrido registrado por los vehículos.
   - Pagos pendientes a especialistas por interconsultas ya facturadas a tutores.
3. **Margen de Contribución por Servicio:** Evaluación del margen porcentual entre medicina preventiva, consultas generales, urgencias y paquetes de tratamiento crónico.
