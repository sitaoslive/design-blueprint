# Protocolo y Evidencia de Cadena de Frío (VET-CORE-10)

## 1. Rango Térmico Estándar
Los biológicos veterinarios exigen una temperatura continua y estable entre **+2.0°C y +8.0°C**. Cualquier desviación fuera de este rango pone en riesgo la viabilidad de los antígenos y la inmunogenicidad en el paciente.

## 2. Puntos de Control Obligatorios en Ruta Móvil
Para el servicio a domicilio de Vet Life, no basta con una medición aislada en la base. Se exige registro en los siguientes hitos:
1. **Punto de Salida de Base:** Medición al transferir las ampollas desde la nevera central a la hielera portátil con acumuladores térmicos.
2. **Llegada al Domicilio:** Verificación de la temperatura del termómetro digital calibrado con sensor interno en la hielera antes de ingresar a la residencia.
3. **Pre-Aplicación Inmediata:** Verificación final antes de cargar la jeringa estéril.

## 3. Registro en Base de Datos
Cada verificación se asienta en `preventive_cold_chain_checks`:
- `recorded_temperature_celsius`
- `min_allowed_temp` (2.0°C)
- `max_allowed_temp` (8.0°C)
- `is_within_range` (TRUE/FALSE)
- `checker_vet_id`

## 4. Protocolo de Ruptura Térmica (Cold Chain Breach)
Si la temperatura registrada es **< 2.0°C** (riesgo de congelación y desnaturalización proteica) o **> 8.0°C** (riesgo de inactivación térmica):
1. **Bloqueo Inmediato:** El procedimiento `verify_product_lot_and_cold_chain` rechaza la viabilidad del producto.
2. **Transición a Cuarentena:** El lote pasa a `QUARANTINE_COLD_CHAIN_BREACH`.
3. **Registro de Incidente:** Se crea un incidente en `preventive_care_incidents` con severidad `CRITICAL`.
4. **Protección al Paciente:** **BAJO NINGUNA CIRCUNSTANCIA SE APLICA EL BIOLÓGICO AFECTADO.** Se procede a reprogramar la visita o utilizar biológico de respaldo certificado si está disponible en ruta.
