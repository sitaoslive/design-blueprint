import asyncio,json,os,sys
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path(__file__).parent
ROLE=sys.argv[1]
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);ctx=await browser.new_context();page=await ctx.new_page()
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])])
  for path in ['/admin','/admin/okvet/importar','/admin/okvet/conciliacion','/admin/citas/duraciones']:
   await page.goto('http://localhost:8080'+path);await page.wait_for_url('**/sin-acceso');assert await page.get_by_label('Archivo CSV').count()==0
  print('PASS',ROLE,'control/import/duration routes denied')
  result=await page.evaluate('''async(role)=>{
   const {supabase:s}=await import('/src/integrations/supabase/client.ts');
   const uid=(await s.auth.getUser()).data.user.id;
   const charges=await s.from('payments').select('id').in('id',['QA-PERM-20261121-own','QA-PERM-20261121-other']);
   const prepared=await s.from('records').select('id').eq('kind','administrative_import_preparation');
   const reserved=await s.from('records').insert({kind:'finance_cost_entry',scope:'staff',status:'requested',title:'QA-PERM forged',detail:'QA',created_by:uid,data:{amount:'100'}}).select('id');
   const settings=await s.from('org_settings').select('key').in('key',['seguridad','sistema/respaldos']);
   const {saveImportPreparation}=await import('/src/features/system-administration/application/preparation.functions.ts');
   let forbidden=false;try{await saveImportPreparation({data:{requestId:crypto.randomUUID(),source:'QA-PERM-forbidden.csv',fingerprint:'a'.repeat(64),rowCount:1,mapping:{externalId:'ref',visitId:'',petId:'pet',staffId:'staff',date:'date',status:'status'},authorizedFile:true,mappingReviewed:true,evidence:'QA-PERM unauthorized role',comparedAt:new Date().toISOString(),conflictCount:0}})}catch(e){forbidden=String(e).includes('FORBIDDEN')}
   return {chargeIds:charges.data?.map(x=>x.id)??[],preparationCount:prepared.data?.length??0,forgedDenied:Boolean(reserved.error),privateSettings:settings.data?.length??0,rpcDenied:forbidden};
  }''',ROLE)
  expected=2 if ROLE=='finanzas' else 1
  assert len(result['chargeIds'])==expected,result
  assert result['preparationCount']==0 and result['privateSettings']==0 and result['forgedDenied'] and result['rpcDenied'],result
  print('PASS',ROLE,'RLS charge count',expected,'reserved preparations/settings hidden, staff-scope bypass and RPC rejected')
  if ROLE=='finanzas':
   await page.goto('http://localhost:8080/finanzas/cobros');await page.get_by_role('heading',name='Cargos y cobros').wait_for();await page.get_by_text('QA permiso propio',exact=True).wait_for()
   print('PASS Finance user UI readback')
  else:
   await page.goto('http://localhost:8080/finanzas/cobros');await page.wait_for_url('**/sin-acceso');print('PASS',ROLE,'global finance UI denied')
  await browser.close()
asyncio.run(main())
