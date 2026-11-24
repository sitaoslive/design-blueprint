# VET FREEDOM OS — RECURRING VISIT PREPARATION
## Procedimiento de Preparación de Insumos, Cadena de Frío y Valija
**Módulo:** VET-CORE-09  
**Interacción:** `recurring_care_supply_checklists` $\rightarrow$ Valija Domiciliaria  

---

## 1. Protocolo de Preparación de Valija Médica

Antes de cada salida a ruta (VET-CORE-08), el personal auxiliar o de farmacia debe preparar los insumos asociados a cada ocurrencia programada:

```mermaid
flowchart LR
    List["Consultar Checklists de la Ocurrencia"] --> Cat{"¿Tipo de Insumo?"}
    Cat -- "MEDICATION (Cadena de Frío)" --> Ice["Nevera Portátil + Gel Termoaislante (2-8°C)"]
    Cat -- "MEDICATION (General)" --> Dry["Valija Farmacológica"]
    Cat -- "CONSUMABLE / EQUIPMENT" --> Bag["Valija de Procedimientos"]
    Ice --> Lot["Verificación y Registro de Lote"]
    Dry --> Lot
    Bag --> Sign["Firma / Registro en Supabase (is_prepared = true)"]
```

---

## 2. Puntos de Control Obligatorios

- **Verificación de Lote y Vencimiento:** Medicamentos como eritropoyetina, fluidos parenterales o antibióticos no pueden cargarse a la valija sin registrar el número de lote y fecha de expiración.
- **Chequeo de Cadena de Frío:** Registro de temperatura previa al embalaje en nevera térmica domiciliaria.
- **Insumos de Paciente Cardiópata / Crítico:** Disponer de oxígeno portátil de emergencia y fonendoscopio calibrado.
