import { useState } from "react";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useVF } from "@/lib/vf/store";
import { Btn } from "@/components/vf/ui";
import { executeOfficialQuality } from "../application/official.functions";
import type { Database } from "@/integrations/supabase/types";
import { inputClass, qualityError } from "./shared";
import { supabase } from "@/integrations/supabase/client";

export type OfficialItem = Database["public"]["Tables"]["quality_items"]["Row"];
export function notifyQuality() { window.dispatchEvent(new Event("vf-quality-updated")); }
const steps: Record<string, Record<string,string[]>> = {
  complaints: { NEW:["ACKNOWLEDGED","ESCALATED"], ACKNOWLEDGED:["UNDER_REVIEW","ASSIGNED","ESCALATED"], UNDER_REVIEW:["ASSIGNED","ACTION_PLAN_PENDING","ESCALATED"], ASSIGNED:["ACTION_PLAN_PENDING","IN_PROGRESS","ESCALATED"], ACTION_PLAN_PENDING:["IN_PROGRESS","ESCALATED"], IN_PROGRESS:["WAITING_CUSTOMER","WAITING_INTERNAL_TEAM","WAITING_EXTERNAL_PARTY","RESOLUTION_PROPOSED","ESCALATED"], WAITING_CUSTOMER:["IN_PROGRESS","RESOLUTION_PROPOSED","ESCALATED"], WAITING_INTERNAL_TEAM:["IN_PROGRESS","ESCALATED"], WAITING_EXTERNAL_PARTY:["IN_PROGRESS","ESCALATED"], RESOLUTION_PROPOSED:["IN_PROGRESS","RESOLUTION_CONFIRMED","ESCALATED"], RESOLUTION_CONFIRMED:["CLOSED","REOPENED"], CLOSED:["REOPENED"], REOPENED:["UNDER_REVIEW","ASSIGNED","ESCALATED"], ESCALATED:["UNDER_REVIEW","ASSIGNED","IN_PROGRESS"] },
  surveys: { DRAFT:["APPROVED"], APPROVED:["PUBLISHED","ARCHIVED"], PUBLISHED:["ARCHIVED"] },
  education:{ DRAFT:["PENDING_PROFESSIONAL_REVIEW","APPROVED"], PENDING_PROFESSIONAL_REVIEW:["APPROVED"], APPROVED:["PUBLISHED","ARCHIVED"], PUBLISHED:["OUTDATED","ARCHIVED"] },
  improvements:{ IDEA:["UNDER_REVIEW"], UNDER_REVIEW:["APPROVED","IDEA"], APPROVED:["IMPLEMENTATION_PENDING"], IMPLEMENTATION_PENDING:["IN_PROGRESS"], IN_PROGRESS:["VALIDATION_PENDING"], VALIDATION_PENDING:["EFFECTIVE","INEFFECTIVE"], EFFECTIVE:["CLOSED"], INEFFECTIVE:["UNDER_REVIEW","CLOSED"] },
  standards:{DRAFT:["APPROVED"],APPROVED:["ARCHIVED"]},
};
export const officialLabels:Record<string,string>={NEW:"Nueva",ACKNOWLEDGED:"Recibida",UNDER_REVIEW:"En revisión",ASSIGNED:"Asignada",ACTION_PLAN_PENDING:"Plan pendiente",IN_PROGRESS:"En curso",WAITING_CUSTOMER:"Esperando familia",WAITING_INTERNAL_TEAM:"Esperando equipo",WAITING_EXTERNAL_PARTY:"Esperando tercero",RESOLUTION_PROPOSED:"Solución propuesta",RESOLUTION_CONFIRMED:"Solución implementada",CLOSED:"Cerrada",REOPENED:"Reabierta",ESCALATED:"Escalada",DRAFT:"Borrador",APPROVED:"Aprobada",PUBLISHED:"Publicada en el portal",ARCHIVED:"Archivada",PENDING_PROFESSIONAL_REVIEW:"Revisión profesional",OUTDATED:"Desactualizada",IDEA:"Idea",IMPLEMENTATION_PENDING:"Implementación pendiente",VALIDATION_PENDING:"Validación pendiente",EFFECTIVE:"Efectiva",INEFFECTIVE:"Inefectiva"};
export function OfficialActions({ item }: { item:OfficialItem }) {
  const run=useServerFn(executeOfficialQuality);
  const roles=useVF(s=>s.roles), staff=useVF(s=>s.staff),uid=useVF(s=>s.userId);
  const p=item.payload as Record<string,unknown>;
  const [reason,setReason]=useState(""),[evidence,setEvidence]=useState(String(p['evidence']??p['implementationEvidence']??'')),[plan,setPlan]=useState(String(p['plan']??'')),[assigned,setAssigned]=useState(""),[valid,setValid]=useState(""),[measured,setMeasured]=useState(String(p['measuredAfter']??'')),[implemented,setImplemented]=useState(p['solutionImplemented']===true),[busy,setBusy]=useState(false);
  const director=roles.some(r=>["luis","administrador"].includes(r));
  const clinical=roles.some(r=>["luis","veterinario"].includes(r));
  const options=(steps[item.kind]?.[item.state]??[]).filter(s=>director||(item.kind==='education'&&s==='APPROVED'&&clinical&&item.assigned_user_id===uid)||!["APPROVED","RESOLUTION_CONFIRMED","CLOSED","EFFECTIVE","INEFFECTIVE","PUBLISHED"].includes(s));
  const [next,setNext]=useState(options[0]??"");
  const [history,setHistory]=useState<{action:string;reason:string;new_version:number;at:string}[]>([]);
  useEffect(()=>{let active=true;void supabase.rpc('quality_timeline',{_entity:item.id}).then(r=>{if(active&&!r.error)setHistory(r.data??[]);});return()=>{active=false;};},[item.id,item.version]);
  const action=async (act:"transition"|"clinical_review")=>{
    if(busy)return; setBusy(true);
    try {
      const payload:Record<string,unknown>={state:next,evidence,plan,implementationEvidence:evidence,measuredAfter:measured,solutionImplemented:implemented};
      if(assigned) {payload['assignedTo']=assigned;payload['reviewerId']=staff.find(s=>s.id===assigned)?.userId;}
      if(valid) payload['validUntil']=`${valid}T23:59:59-05:00`;
      await run({data:{action:act,kind:item.kind,entityId:item.id,expectedVersion:item.version,idempotencyKey:crypto.randomUUID(),reason,payload}});
      notifyQuality();toast.success("Acción interna registrada con historial");
    }catch(e){toast.error(qualityError(e instanceof Error?e.message:"No se confirmó la acción"));notifyQuality();}finally{setBusy(false);}
  };
  if(!director && !roles.some(r=>["coordinador","recepcion"].includes(r)) && !(clinical&&item.assigned_user_id===uid))return null;
  return <section className="mt-4 space-y-3 border-t border-border pt-4">
    <p className="text-sm font-bold">Registro oficial · revisión {item.version} · {officialLabels[item.state]??item.state}</p>
    {options.length>0 && <label className="block">Siguiente acción<select aria-label="Acción oficial" className={inputClass} value={next} onChange={e=>setNext(e.target.value)}>{options.map(s=><option key={s} value={s}>{officialLabels[s]??s}</option>)}</select></label>}
    <label className="block">Motivo<input aria-label="Motivo oficial" className={inputClass} value={reason} onChange={e=>setReason(e.target.value)} /></label>
    {item.kind==='complaints' && <label className="block">Plan<textarea aria-label="Plan oficial" className={inputClass} value={plan} onChange={e=>setPlan(e.target.value)} /></label>}
    {['complaints','education','improvements'].includes(item.kind)&&<label className="block">Evidencia<textarea aria-label="Evidencia oficial" className={inputClass} value={evidence} onChange={e=>setEvidence(e.target.value)} /></label>}
    {['complaints','education'].includes(item.kind)&&<label className="block">Responsable vinculado<select aria-label="Responsable oficial" className={inputClass} value={assigned} onChange={e=>setAssigned(e.target.value)}><option value="">Conservar responsable</option>{staff.filter(s=>s.userId).map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>}
    {item.kind==='complaints'&&<label className="flex items-center gap-2"><input type="checkbox" checked={implemented} onChange={e=>setImplemented(e.target.checked)} />Solución implementada</label>}
    {item.kind==='education'&&<label className="block">Vigencia hasta<input aria-label="Vigencia oficial" type="date" className={inputClass} value={valid} onChange={e=>setValid(e.target.value)} /></label>}
    {item.kind==='improvements'&&<label className="block">Medición posterior<input aria-label="Medición oficial" className={inputClass} value={measured} onChange={e=>setMeasured(e.target.value)} /></label>}
    <div className="flex flex-wrap gap-2">{options.length>0&&<Btn disabled={busy||reason.trim().length<3} onClick={()=>void action('transition')}>Confirmar acción interna</Btn>}{item.kind==='complaints'&&clinical&&<Btn variant="sage" disabled={busy||reason.trim().length<3||evidence.trim().length<3} onClick={()=>void action('clinical_review')}>Registrar revisión profesional</Btn>}</div>
    {history.length>0&&<details className="border-t border-border pt-3"><summary className="cursor-pointer text-sm font-bold">Historial de aprobaciones</summary>{history.map(h=><p key={h.new_version} className="my-2 text-xs">{new Date(h.at).toLocaleString('es-CO',{timeZone:'America/Bogota'})} · {h.action} · revisión {h.new_version} · {h.reason}</p>)}</details>}
  </section>;
}