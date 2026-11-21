import { describe,it,expect } from "vitest";
import { validateOfficialCommand } from "@/features/customer-experience/application/official-schema";
import { canOpenQualityPath } from "@/features/customer-experience/application/access";
const base={action:'create',kind:'surveys',entityId:'b2faed2e-7d6c-4c7b-8cc7-637aba64d69e',expectedVersion:0,idempotencyKey:'qa-create-001',reason:'Registro QA de encuesta',payload:{id:'b2faed2e-7d6c-4c7b-8cc7-637aba64d69e',title:'Control de calidad',version:1,state:'DRAFT',approvedBy:'',questions:[{id:'csat',label:'Satisfacción con la visita',type:'CSAT',required:true,options:[]}]}};
describe('Comandos oficiales internos',()=>{
 it('admite borrador con pregunta CSAT y clave de idempotencia',()=>expect(validateOfficialCommand(base).payload['title']).toBe('Control de calidad'));
 it('rechaza versión negativa',()=>expect(()=>validateOfficialCommand({...base,expectedVersion:-1})).toThrow());
 it('rechaza clave vacía',()=>expect(()=>validateOfficialCommand({...base,idempotencyKey:''})).toThrow());
 it('rechaza motivo vacío',()=>expect(()=>validateOfficialCommand({...base,reason:''})).toThrow());
 it('rechaza encuestas sin preguntas',()=>expect(()=>validateOfficialCommand({...base,payload:{...base.payload,questions:[]}})).toThrow());
 it('rechaza preguntas duplicadas',()=>expect(()=>validateOfficialCommand({...base,payload:{...base.payload,questions:[...base.payload.questions,...base.payload.questions]}})).toThrow());
 it('rechaza creación de entidades financieras desde calidad',()=>expect(()=>validateOfficialCommand({...base,kind:'payment'})).toThrow('INTEGRATION_UNAVAILABLE'));
 it('rechaza acciones de envío externo',()=>expect(()=>validateOfficialCommand({...base,action:'sendWhatsApp'})).toThrow());
 it('permite revisión de calidad al veterinario, sin administración',()=>{expect(canOpenQualityPath('/equipo/calidad',['veterinario'])).toBe(true);expect(canOpenQualityPath('/admin/calidad/aprobaciones',['veterinario'])).toBe(false);});
 it('el auxiliar no hereda revisión profesional',()=>expect(canOpenQualityPath('/equipo/calidad',['auxiliar'])).toBe(false));
 it('un permiso requiere finalidad específica y fuente explícita',()=>expect(()=>validateOfficialCommand({...base,action:'consent',kind:'consent',payload:{purpose:'ALL',channel:'whatsapp',status:'GRANTED',source:''}})).toThrow());
 it('la revocación de reseñas no autoriza promociones',()=>{const c=validateOfficialCommand({...base,action:'consent',kind:'consent',payload:{purpose:'review',channel:'portal',status:'REVOKED',source:'Decisión explícita de familia'}});expect(c.payload['purpose']).toBe('review');expect(c.payload['status']).toBe('REVOKED');});
});