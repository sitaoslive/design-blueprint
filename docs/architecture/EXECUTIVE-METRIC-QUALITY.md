# Gestión y Taxonomía de Calidad de Métricas Ejecutivas (VET-CORE-16)

**Módulo:** `VET-CORE-16 | DAILY EXECUTIVE REPORTING`  
**Proyecto:** VET FREEDOM OS — Vet Life: Veterinaria a Domicilio  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  
**Fecha:** 2026-11-21  

---

## 1. El Axioma Fundamental: `null != 0`

Uno de los errores más peligrosos en el reporting ejecutivo automatizado es la **coerción silenciosa de valores nulos o faltantes a cero**.

> **Ejemplo de Riesgo Crítico Evitado:**  
> Si la pasarela de pagos experimenta una falla de conexión a las 05:50 AM, un sistema deficiente reportaría:  
> *"Recaudo de ayer: $0 COP"*.  
> Esto generaría una alarma de pánico infundada en el Dr. Luis y la gerencia comercial.

En VET FREEDOM OS rige el siguiente principio inquebrantable:  
**Un dato faltante por desconexión o fallo de fuente se reporta explícitamente como `SOURCE_UNAVAILABLE` o advertencia, jamás como $0 ni 0 unidades.**

---

## 2. Taxonomía Oficial de Estados de Calidad

Cada métrica calculada en `executive_metric_results` y evaluada en `executive_metric_quality_checks` se asocia obligatoriamente a uno de los siguientes estados:

| Estado de Calidad | Definición Operativa | Comportamiento en Visualización |
| :--- | :--- | :--- |
| **`VERIFIED`** | Fuente disponible, datos consistentes y reconciliados al 100%. | Valor normal con semáforo verde. |
| **`PARTIALLY_VERIFIED`** | Dato operativo presente pero falta confirmación de segundo nivel (ej. visita cerrada sin sync OKVET). | Valor reportado con nota aclaratoria. |
| **`PROVISIONAL`** | Estimación preliminar en curso de consolidación. | Indicador provisional (ej. *2 citas en confirmación*). |
| **`STALE`** | La fuente no ha emitido latido en la ventana de frescura tolerada (> 60 min). | Alerta de frescura en el brief. |
| **`INCOMPLETE`** | Faltan registros parciales en un cluster o médico de ruta. | Métrica parcial con advertencia. |
| **`CONFLICTING`** | Divergencia matemática entre dos fuentes (ej. DB local vs API OKVET). | Se resalta la discrepancia para auditoría humana. |
| **`SOURCE_UNAVAILABLE`** | La API o base de datos externa no respondió o arrojó timeout. | Texto: `[FUENTE INDISPONIBLE]`, alerta alta. |
| **`NOT_CONFIGURED`** | La métrica no cuenta con fuente configurada en el entorno actual. | Indicador marcado como no configurado. |
| **`NOT_APPLICABLE`** | La métrica no aplica para el tipo de día (ej. feriado o domingo cerrado). | Omitida o marcada como no aplicable. |

---

## 3. Matriz de Umbrales de Calidad por Dominio

| Dominio | Métrica Clave | Umbral Calidad Mínima | Acción ante Degradación |
| :--- | :--- | :--- | :--- |
| **Finanzas** | Recaudo diario verificado | `VERIFIED` | Alerta inmediata al coordinador financiero si es `SOURCE_UNAVAILABLE` |
| **Personal** | Turnos cubiertos | `VERIFIED` | Si hay `uncovered_shifts > 0` -> Semáforo ROJO inmediato |
| **Clínica** | Cierre clínico en OKVET | `PARTIALLY_VERIFIED` | Recordatorio síncrono al médico en ruta antes de 24h |
| **Rutas** | Retrasos en desplazamientos | `VERIFIED` | Si `delays > 1` -> Notificación a coordinación operativa |
| **Experiencia** | Reclamaciones abiertas | `VERIFIED` | Si `complaints > 0` -> Escalamiento inmediato a Dirección |
