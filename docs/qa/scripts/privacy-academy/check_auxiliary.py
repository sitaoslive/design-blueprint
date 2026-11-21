import asyncio,json,os,requests
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/journey-security');m=json.loads((OUT/'target-session.json').read_text());s=m['session'];uid=s['user']['id'];u=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/';h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token']};checks=[]
def check(name,ok):checks.append({'name':name,'passed':bool(ok)});assert ok,name
for name,t in [('is_clinical','62c8ff25-f100-465f-a8bb-4cb01afa13dd'),('can_refer','62c8ff25-f100-465f-a8bb-4cb01afa13dd'),('is_aux_only','061102d1-15f3-4ef8-9419-771d51a02b4b')]:
 r=requests.post(u+'rpc/'+name,headers=h,json={'_uid':t},timeout=20);check('aux cannot query another '+name,r.status_code==200 and r.json() is False)
r=requests.post(u+'rpc/is_aux_only',headers=h,json={'_uid':uid},timeout=20);check('own auxiliary status preserved',r.status_code==200 and r.json() is True)
r=requests.get(u+'lesson_completions',headers=h,params={'select':'user_id,lesson_id'},timeout=20);check('aux cannot read other learner progress',r.status_code==200 and all(row['user_id']==uid for row in r.json()))
r=requests.get(u+'records',headers=h,params={'select':'id','kind':'eq.academy_preparation'},timeout=20);check('aux cannot read director academy drafts',r.status_code==200 and r.json()==[])
r=requests.post(u+'records',headers=h,json={'kind':'academy_preparation','scope':'director','created_by':uid,'title':'QA denied academy','status':'DRAFT_ONLY'},timeout=20);check('aux cannot create academy authority',r.status_code>=400)
r=requests.post(u+'course_lessons',headers=h,json={'course_id':'qa-journey-academy-20261121','title':'QA denied lesson','body':'QA denied'},timeout=20);check('aux cannot author lessons',r.status_code>=400)
r=requests.post(u+'lesson_completions',headers=h,json={'user_id':json.loads((OUT/'viewer-session.json').read_text())['session']['user']['id'],'lesson_id':'071d15d9-34ab-4bfe-875d-f4be747526d9'},timeout=20);check('aux cannot record another learner completion',r.status_code>=400)
r=requests.post(u+'records',headers=h,json={'kind':'ejecucion_tratamiento','scope':'staff','created_by':uid,'title':'QA dose denied','status':'registrada'},timeout=20);check('aux dose denied by server',r.status_code>=400)
async def main():
 errors=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);context=await browser.new_context(viewport={'width':360,'height':844});page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  if m.get('cookies'):await context.add_cookies([{**c,'url':'http://localhost:8080'} for c in m['cookies']])
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(s)])
  await page.goto('http://localhost:8080/auxiliar/asignaciones',wait_until='networkidle');text=await page.locator('body').inner_text();check('real auxiliary sees own shared visit','QA Paciente aislado' in text or 'Control preventivo' in text)
  await page.screenshot(path=str(OUT/'real-aux-visits.png'))
  await page.goto('http://localhost:8080/auxiliar/visitas/qa-journey-visit/preparacion',wait_until='networkidle')
  
  if await page.get_by_role('button',name='Iniciar preparación',exact=True).count(): await page.get_by_role('button',name='Iniciar preparación',exact=True).click();
  await page.get_by_role('button',name='Preparación lista',exact=True).wait_for();await page.reload(wait_until='networkidle');check('shared preparation persisted',await page.get_by_role('button',name='Preparación lista',exact=True).count()==1)
  check('aux no clinical start control',await page.get_by_role('button',name='Iniciar atención',exact=True).count()==0)
  await page.screenshot(path=str(OUT/'real-aux-preparation.png'))
  await page.goto('http://localhost:8080/auxiliar/academia',wait_until='networkidle');await page.get_by_label('Buscar curso').fill('QA Academy aislada');await page.get_by_role('button',name='Abrir curso',exact=True).click();
  if await page.get_by_role('button',name='Registrar lectura',exact=True).count(): await page.get_by_role('button',name='Registrar lectura',exact=True).click();
  await page.get_by_role('button',name='Lectura registrada',exact=True).wait_for();await page.reload(wait_until='networkidle');await page.get_by_label('Buscar curso').fill('QA Academy aislada');await page.get_by_role('button',name='Abrir curso',exact=True).click();check('aux own academy acknowledgement persists',await page.get_by_role('button',name='Lectura registrada',exact=True).is_disabled());await page.screenshot(path=str(OUT/'real-aux-academy.png'))
  await page.goto('http://localhost:8080/auxiliar/tareas',wait_until='networkidle');
  if await page.get_by_role('button',name='Aceptar',exact=True).count(): await page.get_by_role('button',name='Aceptar',exact=True).click();
  await page.get_by_role('button',name='Iniciar',exact=True).wait_for();await page.reload(wait_until='networkidle');check('aux task acceptance persists',await page.get_by_role('button',name='Iniciar',exact=True).count()==1);await page.screenshot(path=str(OUT/'real-aux-task.png'))
  await page.goto('http://localhost:8080/auxiliar/mensajes',wait_until='networkidle');await page.get_by_label('Para',exact=True).select_option('qa-journey-vet');await page.get_by_label('Contexto de visita').select_option('qa-journey-visit');await page.get_by_placeholder('Mensaje',exact=True).fill('QA mensaje interno verificable de la visita compartida');await page.get_by_role('button',name='Enviar',exact=True).click();await page.wait_for_timeout(1200);await page.screenshot(path=str(OUT/'aux-message-after-send.png'));print('message-state',await page.locator('body').inner_text());await page.get_by_text('QA mensaje interno verificable de la visita compartida',exact=True).wait_for();await page.reload(wait_until='networkidle');await page.get_by_text('QA mensaje interno verificable de la visita compartida',exact=True).wait_for();check('internal message persists and reads',True);await page.screenshot(path=str(OUT/'real-aux-message.png'))
  await page.goto('http://localhost:8080/admin/academia',wait_until='networkidle');check('aux admin route denied','sin-acceso' in page.url)
  check('no auxiliary runtime errors',not errors)
  await browser.close()
 (OUT/'authenticated-aux.json').write_text(json.dumps({'checks':checks,'errors':errors},ensure_ascii=False,indent=2));print(len(checks),'authenticated auxiliary checks passed')
asyncio.run(main())
