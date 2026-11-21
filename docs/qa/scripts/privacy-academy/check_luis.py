import asyncio,json,os,requests
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/journey-security');m=json.loads((OUT/'viewer-session.json').read_text());s=m['session'];u=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/';h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token']};checks=[]
def check(name,ok):checks.append({'name':name,'passed':bool(ok)});assert ok,name
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);context=await browser.new_context(viewport={'width':360,'height':844});page=await context.new_page()
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(s)])
  await page.goto('http://localhost:8080/luis',wait_until='networkidle');await page.get_by_role('tab',name='Veterinario',exact=True).click();await page.get_by_role('heading',name='Hola, Dr. Luis',exact=True).wait_for();check('Luis dual mode real session',True)
  await page.goto('http://localhost:8080/luis/pacientes',wait_until='networkidle');await page.get_by_label('Buscar paciente').fill('QA Paciente aislado');await page.get_by_role('button').filter(has_text='QA Paciente aislado').click();await page.get_by_role('heading',name='QA Paciente aislado',exact=True).wait_for();check('Luis opens patient and current visit','Control preventivo' in await page.locator('body').inner_text());await page.screenshot(path=str(OUT/'luis-patient.png'))
  await page.goto('http://localhost:8080/equipo/visita/qa-journey-visit',wait_until='networkidle')
  for label in ['Iniciar preparación','Preparación lista','Iniciar desplazamiento','Registrar llegada','Iniciar atención']:
   button=page.get_by_role('button',name=label,exact=True);await button.wait_for();await button.click();await page.wait_for_timeout(450)
  await page.reload(wait_until='networkidle');await page.get_by_role('button',name='Finalizar servicio',exact=True).wait_for();check('Luis attention persisted through UI',True);await page.screenshot(path=str(OUT/'luis-attention.png'))
  r=requests.get(u+'visits',headers=h,params={'select':'status','id':'eq.qa-journey-visit'},timeout=20);check('attention preserves official pending appointment',r.status_code==200 and r.json()[0]['status']=='pendiente')
  target=json.loads((OUT/'target-session.json').read_text())['session']['user']['id'];r=requests.post(u+'rpc/set_account_profile',headers=h,json={'_user_id':target,'_profile':'luis'},timeout=20);check('Luis can assign combined profile atomically',r.status_code==200 and set(r.json()['roles'])=={'luis','administrador','veterinario'})
  r=requests.post(u+'rpc/set_account_profile',headers=h,json={'_user_id':target,'_profile':'auxiliar'},timeout=20);check('Luis can restore synthetic auxiliary',r.status_code==200)
  await browser.close()
 (OUT/'authenticated-luis.json').write_text(json.dumps(checks,indent=2));print(len(checks),'Luis authenticated checks passed')
asyncio.run(main())
