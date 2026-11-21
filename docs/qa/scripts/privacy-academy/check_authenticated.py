import asyncio,json,os,requests
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/journey-security');m=json.loads((OUT/'viewer-session.json').read_text());s=m['session'];target=json.loads((OUT/'target-session.json').read_text())['session']['user']['id'];uid=s['user']['id'];url=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/';headers={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token']};checks=[]
def check(name,ok):
 checks.append({'name':name,'passed':bool(ok)});assert ok,name
def rpc(name,args):return requests.post(url+'rpc/'+name,headers=headers,json=args,timeout=20)
for name,expected in [('is_clinical',False),('is_aux_only',False),('can_refer',True)]:
 r=rpc(name,{'_uid':uid});check('administrator own '+name,r.status_code==200 and r.json() is expected)
for name,t in [('is_clinical','62c8ff25-f100-465f-a8bb-4cb01afa13dd'),('can_refer','62c8ff25-f100-465f-a8bb-4cb01afa13dd'),('is_aux_only','061102d1-15f3-4ef8-9419-771d51a02b4b')]:
 r=rpc(name,{'_uid':t});check('director authorized lookup '+name,r.status_code==200 and r.json() is True)
for profile in ['soporte','especialista','veterinario','luis']:
 r=rpc('set_account_profile',{'_user_id':target,'_profile':profile});check('administrator rejected profile '+profile,r.status_code>=400)
r=rpc('set_account_profile',{'_user_id':uid,'_profile':'auxiliar'});check('self role changes denied',r.status_code>=400)
r=requests.post(url+'user_roles',headers=headers,json={'user_id':target,'role':'soporte'},timeout=20);check('direct legacy profile insert denied',r.status_code>=400)
r=requests.post(url+'records',headers=headers,json={'id':'6e4a96ee-1eb8-4f96-bc94-b88f2e12c6b5','kind':'ejecucion_tratamiento','scope':'staff','title':'QA denied dose','status':'registrada','created_by':uid},timeout=20);check('administrator direct dose denied',r.status_code>=400)
async def main():
 errors=[];writes=[];routes=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);context=await browser.new_context(viewport={'width':360,'height':844});page=await context.new_page()
  page.on('pageerror',lambda e:errors.append(str(e)))
  if m.get('cookies'):await context.add_cookies([{**c,'url':'http://localhost:8080'} for c in m['cookies']])
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(s)])
  await page.goto('http://localhost:8080/admin/academia',wait_until='networkidle')
  await page.get_by_role('heading',name='Academy · Centro de formación').wait_for()
  await page.get_by_role('button',name='Preparar curso',exact=True).click()
  await page.get_by_label('Título de preparación').fill('QA Academy preparación verificable')
  await page.get_by_label('Objetivo de preparación').fill('QA sintético: verificar guardado y relectura, no publicar un curso real.')
  await page.get_by_label('Contenido de preparación').fill('Preparación del kit\nComunicación interna')
  await page.get_by_role('button',name='Guardar preparación',exact=True).click()
  await page.get_by_text('QA Academy preparación verificable',exact=True).wait_for()
  await page.reload(wait_until='networkidle');await page.get_by_text('QA Academy preparación verificable',exact=True).wait_for()
  check('academy director draft persists and reads back',True)
  await page.screenshot(path=str(OUT/'academy-draft-mobile.png'))
  await page.get_by_role('link',name='Evaluaciones',exact=True).click();await page.get_by_role('button',name='Preparar evaluación',exact=True).click()
  await page.get_by_label('Título de preparación').fill('QA evaluación sin claves')
  await page.get_by_label('Objetivo de preparación').fill('Verificar editor y preguntas sin clave de respuestas, sin nota oficial.')
  await page.get_by_role('button',name='Añadir pregunta',exact=True).click();await page.get_by_label('Enunciado 1').fill('¿Cómo comunicarías una diferencia en el kit?')
  await page.get_by_role('button',name='Previsualizar',exact=True).click();await page.screenshot(path=str(OUT/'assessment-preview.png'))
  await page.get_by_role('button',name='Guardar preparación',exact=True).click();await page.get_by_text('QA evaluación sin claves',exact=True).wait_for()
  check('assessment draft created without answers or official grade',True)
  await page.get_by_role('button',name='Publicar',exact=True).first.wait_for();check('publication remains disabled',await page.get_by_role('button',name='Publicar',exact=True).first.is_disabled())
  await page.goto('http://localhost:8080/admin/academia',wait_until='networkidle');await page.get_by_label('Buscar curso').fill('QA Academy aislada');await page.get_by_role('button',name='Abrir curso',exact=True).click()
  await page.get_by_role('button',name='Registrar lectura',exact=True).click();await page.get_by_role('button',name='Lectura registrada',exact=True).wait_for();await page.reload(wait_until='networkidle')
  await page.get_by_label('Buscar curso').fill('QA Academy aislada');await page.get_by_role('button',name='Abrir curso',exact=True).click();check('personal lesson acknowledgement reads after reload',await page.get_by_role('button',name='Lectura registrada',exact=True).is_disabled())
  await page.screenshot(path=str(OUT/'academy-read-personal.png'))
  await page.goto('http://localhost:8080/admin/usuarios',wait_until='networkidle');card=page.locator('div').filter(has=page.get_by_label('Perfil de agent-test+6421135c')).filter(has=page.get_by_role('button',name='Asignar perfil',exact=True))
  select=page.get_by_label('Perfil de agent-test+6421135c');await select.wait_for()
  await select.select_option('auxiliar');page.once('dialog',lambda dialog:dialog.accept())
  await select.locator('..').get_by_role('button',name='Asignar perfil',exact=True).click()
  await page.wait_for_timeout(900)
  r=requests.get(url+'user_roles',headers=headers,params={'select':'role','user_id':'eq.'+target},timeout=20);check('UI assigns auxiliary atomically',r.status_code==200 and {x['role'] for x in r.json()}=={'auxiliar'})
  await page.screenshot(path=str(OUT/'assigned-auxiliary.png'))
  for width,height in [(360,844),(1366,1091)]:
   await page.set_viewport_size({'width':width,'height':height})
   for route in ['/admin/academia','/admin/academia/rutas','/admin/academia/empleados','/admin/academia/competencias','/admin/academia/versiones','/admin/soporte-automatico','/admin/finanzas','/admin/okvet/importar','/luis/asistente']:
    await page.goto('http://localhost:8080'+route,wait_until='networkidle');check(route+' signed in '+str(width),'/auth' not in page.url and '/sin-acceso' not in page.url)
    routes.append({'route':route,'width':width,'overflow':await page.evaluate('document.documentElement.scrollWidth>innerWidth')})
   await page.screenshot(path=str(OUT/f'authenticated-end-{width}.png'))
  await page.goto('http://localhost:8080/luis',wait_until='networkidle');check('administrator cannot select veterinary mode',await page.get_by_role('tab',name='Veterinario',exact=True).count()==0)
  await browser.close()
 check('no page runtime errors',len(errors)==0);check('no authenticated overflow',not any(r['overflow'] for r in routes))
 (OUT/'authenticated-admin.json').write_text(json.dumps({'checks':checks,'routes':routes,'errors':errors},ensure_ascii=False,indent=2));print(len(checks),'authenticated checks passed;',len(routes),'route/viewport observations')
asyncio.run(main())
