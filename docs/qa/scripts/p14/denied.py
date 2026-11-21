import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
 result={};errors=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(headless=True);c=await b.new_context(viewport={'width':390,'height':844});pg=await c.new_page()
  pg.on('pageerror',lambda e:errors.append(str(e)))
  await pg.goto('http://localhost:8080');await pg.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])])
  for path in ['/admin/sistema/auditoria-aplicacion','/admin/okvet/importar','/direccion/finanzas','/luis/asistente']:
   await pg.goto('http://localhost:8080'+path,wait_until='networkidle');result[path]=pg.url;assert pg.url.endswith('/sin-acceso')
  await pg.screenshot(path='/tmp/browser/p14/denied.png')
  await pg.goto('http://localhost:8080/equipo',wait_until='networkidle');await pg.get_by_role('link',name='Mi ruta',exact=True).wait_for();result['teamAccess']=pg.url
  # API read-only checks, output booleans and counts only, never record contents.
  checks=await pg.evaluate('''async()=>{const {supabase}=await import('/src/integrations/supabase/client.ts');const out={};for(const [key,table,kind] of [['finance','records','finance_tariff_draft'],['imports','records','administrative_import_preparation']]){const r=await supabase.from(table).select('id',{count:'exact'}).eq('kind',kind);out[key]={count:r.data?.length??0,rejected:!!r.error};}return out;}''')
  assert checks['finance']['count']==0 and checks['imports']['count']==0
  await pg.goto('http://localhost:8080/no-such-p14-page',wait_until='networkidle');assert await pg.get_by_role('heading',name='Página no encontrada').count()==1
  await pg.get_by_role('link',name='Volver al inicio').click();await pg.wait_for_url('http://localhost:8080/')
  Path('/tmp/browser/p14/denied.json').write_text(json.dumps({'urls':result,'api':checks,'errors':errors,'404Recovery':True},indent=2))
  print(json.dumps({'urls':result,'api':checks,'errors':errors,'404Recovery':True}));await b.close()
asyncio.run(main())
