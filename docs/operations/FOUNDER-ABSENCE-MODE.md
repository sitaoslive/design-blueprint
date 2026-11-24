# VET FREEDOM OS — PROTOCOLO DE MODO AUSENCIA DEL FUNDADOR
**Módulo:** VET-CORE-07 | Founder Absence Mode (Dr. Luis Eduardo Ríos)  
**Dirección Médica:** Dr. Luis Eduardo Ríos  
**Dirección Estratégica:** Alpha Vision Method  

---

## 1. Propósito y Filosofía del "Modo Ausencia"

El Dr. Luis Eduardo Ríos, como Director Médico y Fundador de Vet Life, requiere períodos de desconexión médica, académica o de descanso sin que la operación veterinaria se detenga ni se comprometa la seguridad clínica.

El **Modo Ausencia** permite transferir facultades operativas y administrativas a un delegado previamente designado (por ejemplo, Laura Gómez en Coordinación), manteniendo blindada la gobernanza clínica.

---

## 2. Reglas del Modo Ausencia en Base de Datos

En `public.founder_absence_delegations`:
1. **Período Acotado:** Requiere timestamps obligatorios `starts_at` y `expires_at`. Al expirar la fecha, las facultades revierten automáticamente al fundador.
2. **Alcance No Clínico:** El campo `allows_clinical_actions` está fijado en `false` si el delegado no es médico veterinario certificado. Las decisiones sobre diagnósticos, fármacos o eutanasias quedan estrictamente en manos de los veterinarios colegiados en turno.
3. **Límite Financiero de Aprobación:** El campo `financial_spending_limit` fija el tope máximo en COP que el delegado puede autorizar sin consulta previa al fundador (por ejemplo, emergencias de insumos hasta $300,000 COP).
4. **Desvío de Notificaciones:** Durante el modo ausencia, los escalamientos de nivel L3 se desvían al delegado y sólo se interrumpe al Dr. Luis si ocurre un incidente crítico que supere los límites delegados.
