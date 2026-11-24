# Trazabilidad de Lotes de Biológicos y Fármacos Preventivos (VET-CORE-10)

## 1. Obligatoriedad de Trazabilidad Integral
Conforme a las normativas del ICA (Instituto Colombiano Agropecuario) y estándares clínicos de Vet Life, todo biológico (vacunas antirrábica, polivalente canina, triple felina, leucemia, etc.) y fármaco preventivo administrado a domicilio debe contar con trazabilidad completa de origen y lote.

## 2. Atributos de Lote Obligatorios
La tabla `preventive_product_lots` exige:
- `product_name`: Nombre comercial y biológico exacto.
- `lot_number`: Número de serie/lote asignado por el laboratorio fabricante.
- `manufacturer`: Laboratorio fabricante con registro ICA vigente.
- `expiration_date`: Fecha de vencimiento certificada.
- `requires_cold_chain`: Indicador de necesidad de refrigeración estricta (2°C a 8°C).
- `quarantine_status`: Estado actual de disponibilidad del lote.

## 3. Máquina de Estados de Lote y Cuarentena

```
[ RELEASED ] ──(Expiración detectada)──────► [ QUARANTINE_EXPIRED ]
      │
      ├──(Ruptura térmica detectada)──► [ QUARANTINE_COLD_CHAIN_BREACH ]
      │
      └──(Dosis agotadas)─────────────► [ DEPLETED ]
```

- **Bloqueo Incondicional:** Si un lote entra en cualquier estado de `QUARANTINE_*`, el sistema bloquea inmediatamente la salida en ruta con ese biológico y rechaza cualquier intento de aplicación en el procedimiento `record_preventive_application`.

## 4. Protocolo de Retiro de Mercado (Recall)
En caso de notificación de lote defectuoso emitida por el fabricante o el ICA:
1. Se actualiza el lote a estado de cuarentena preventiva inmediata.
2. Mediante consulta a `preventive_care_application_records`, se identifica en menos de 60 segundos la totalidad de pacientes caninos y felinos que recibieron dosis de dicho lote.
3. Se notifica de forma prioritaria a los tutores involucrados para seguimiento clínico veterinario preventivo.
