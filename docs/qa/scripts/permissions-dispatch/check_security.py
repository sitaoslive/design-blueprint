import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path(__file__).parent
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);ctx=await browser.new_context();page=await ctx.new_page()
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])]);await page.goto('http://localhost:8080/admin')
  await page.get_by_role('heading',name='Centro de Control Vet Freedom',exact=True).wait_for()
  results=await page.evaluate('''async ()=>{
   const {supabase:s}=await import('/src/integrations/supabase/client.ts');
   const denied=[];
   const paid=await s.from('payments').update({status:'pagado'}).eq('id','QA-PERM-20261121-own').select('id');denied.push(['mark paid',Boolean(paid.error)]);
   const fake=await s.from('payments').insert({id:'QA-PERM-forged',client:'QA',concept:'QA',amount:100,status:'pagado',date:'2026-11-21'}).select('id');denied.push(['create paid',Boolean(fake.error)]);
   const audit=await s.from('audit_log').insert({action:'QA-PERM invented official receipt',actor:(await s.auth.getUser()).data.user.id}).select('id');denied.push(['forge audit',Boolean(audit.error)]);
   const event=await s.from('event_outbox').select('event_id,status').limit(1);if(event.data?.length){const r=await s.from('event_outbox').update({status:'QA_FORGED'}).eq('event_id',event.data[0].event_id).select('event_id');denied.push(['edit outbox',Boolean(r.error)||!r.data?.length]);}
   const prep=await s.from('records').select('id,data').eq('kind','administrative_import_preparation').eq('created_by',(await s.auth.getUser()).data.user.id).single();
   const edited=await s.from('records').update({status:'APPLIED'}).eq('id',prep.data.id).select('id');denied.push(['apply metadata preparation',Boolean(edited.error)||!edited.data?.length]);
   const payload={...prep.data.data,requestId:crypto.randomUUID(),comparedAt:new Date().toISOString()};
   const {saveImportPreparation}=await import('/src/features/system-administration/application/preparation.functions.ts');
   const first=await saveImportPreparation({data:payload});const second=await saveImportPreparation({data:payload});denied.push(['idempotent preparation',first.id===second.id]);
   const count=await s.from('records').select('id').eq('id',first.id);denied.push(['one preparation row',count.data.length===1]);
   const final=await s.from('payments').select('status').eq('id','QA-PERM-20261121-own').single();denied.push(['official charge unchanged',final.data.status==='pendiente']);
   return denied;
  }''')
  for name,ok in results:assert ok,name;print('PASS',name)
  await page.set_viewport_size({'width':360,'height':850});await page.goto('http://localhost:8080/direccion/finanzas/cobros');await page.get_by_role('heading',name='Cargos y cobros').wait_for();await page.get_by_text('QA permiso propio',exact=True).wait_for();await page.screenshot(path=str(OUT/'finance-mobile-visible.png'))
  await page.goto('http://localhost:8080/operaciones/despacho');await page.get_by_role('heading',name='Despacho y tiempos de visitas').wait_for();await page.get_by_text('Ubicación no disponible',exact=True).wait_for();await page.screenshot(path=str(OUT/'dispatch-mobile.png'))
  print('PASS loaded mobile finance and dispatch fallback captured')
  await browser.close()
asyncio.run(main())
