import asyncio,json,os,requests
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path(os.environ.get('ACADEMY_QA_OUTPUT', '/tmp/browser/academy-continuation')); OUT.mkdir(parents=True, exist_ok=True)
m=json.loads(Path(os.environ.get('ACADEMY_QA_SESSION_FILE', '/tmp/browser/academy-continuation/session.json')).read_text());session=m['session'];uid=session['user']['id'];url=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/'
h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+session['access_token']}
checks=[];routes=[];errors=[];draft_ids=[]
def check(name,ok):
 checks.append({'name':name,'passed':bool(ok)});assert ok,name
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);context=await browser.new_context(viewport={'width':360,'height':844});page=await context.new_page()
  page.on('pageerror',lambda error:errors.append(str(error)))
  if m.get('cookies'):await context.add_cookies([{**c,'url':'http://localhost:8080'} for c in m['cookies']])
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(session)])
  await page.goto('http://localhost:8080/admin/academia/onboarding',wait_until='networkidle')
  await page.get_by_role('button',name='Preparar ruta de aprendizaje',exact=True).click()
  await page.get_by_label('Título de preparación').fill('QA Continuación incorporación')
  await page.get_by_label('Objetivo de preparación').fill('Verificar orden, persona prevista y fecha sin asignación oficial.')
  courses=page.get_by_role('group',name='Cursos vinculados').get_by_role('checkbox');check('at least two authorized courses',await courses.count()>=2)
  await courses.nth(0).check();await courses.nth(1).check();await page.get_by_role('button',name='Bajar curso 1',exact=True).click()
  planned=page.get_by_role('checkbox',name='Planificar a').first;await planned.check()
  await page.get_by_label('Fecha propuesta de incorporación').fill('2026-12-01')
  await page.get_by_role('button',name='Guardar preparación',exact=True).click();await page.get_by_text('QA Continuación incorporación',exact=True).wait_for()
  await page.get_by_label('Persona prevista').wait_for();check('planned member and date displayed',await page.get_by_text('Fecha propuesta: 2026-12-01',exact=True).count()==1)
  await page.reload(wait_until='networkidle');await page.get_by_text('QA Continuación incorporación',exact=True).wait_for();check('onboarding plan reads after reload',True)
  r=requests.get(url+'records',headers=h,params={'select':'id,data','created_by':'eq.'+uid,'kind':'eq.academy_preparation'},timeout=20);r.raise_for_status();records=r.json();draft_ids.extend(row['id'] for row in records)
  plan=next(row for row in records if row['data']['title']=='QA Continuación incorporación')
  check('plan order saved',len(plan['data']['sourceCourseIds'])==2);check('plan member saved',len(plan['data']['targetUserIds'])==1)
  await page.wait_for_timeout(700); await page.get_by_text('Plan de incorporación · Sin asignación oficial',exact=True).first.locator('..').screenshot(path=str(OUT/'onboarding-mobile.png'))
  await page.get_by_role('button',name='Nueva revisión',exact=True).click();await page.get_by_label('Título de preparación').fill('QA Continuación incorporación v2')
  await page.get_by_role('button',name='Guardar preparación',exact=True).click();await page.get_by_text('QA Continuación incorporación v2',exact=True).wait_for()
  await page.reload(wait_until='networkidle');await page.get_by_text('QA Continuación incorporación v2',exact=True).wait_for()
  r=requests.get(url+'records',headers=h,params={'select':'id,data','created_by':'eq.'+uid,'kind':'eq.academy_preparation'},timeout=20);r.raise_for_status();records=r.json();draft_ids[:]=[row['id'] for row in records]
  nextplan=next(row for row in records if row['data']['title']=='QA Continuación incorporación v2')
  check('revision links immutable parent',nextplan['data']['parentDraftId']==plan['id'] and nextplan['data']['revision']==2 and any(row['id']==plan['id'] for row in records))
  forged={**nextplan['data'],'requestId':'b022b2b2-3cc8-4d7b-9a90-a454e1a5b2ea','revision':4}
  rejected=await page.evaluate('async data=>{try{const mod=await import("/src/features/academy/academy.functions.ts");await mod.saveAcademyDraft({data});return null;}catch(e){return e.message;}}',forged)
  check('server rejects skipped revision',isinstance(rejected,str) and 'La revisión debe continuar' in rejected)
  forged={**plan['data'],'requestId':'b022b2b2-3cc8-4d7b-9a90-a454e1a5b2eb','targetUserIds':['00000000-0000-0000-0000-000000000001']}
  rejected=await page.evaluate('async data=>{try{const mod=await import("/src/features/academy/academy.functions.ts");await mod.saveAcademyDraft({data});return null;}catch(e){return e.message;}}',forged)
  check('server rejects unlinked target',isinstance(rejected,str) and 'Una persona no tiene' in rejected)
  await page.goto('http://localhost:8080/admin/academia/procedimientos',wait_until='networkidle');await page.get_by_role('button',name='Preparar procedimiento',exact=True).click()
  await page.get_by_label('Título de preparación').fill('QA Continuación procedimiento')
  await page.get_by_label('Objetivo de preparación').fill('Verificar borrador de procedimiento sin publicar protocolo clínico.')
  await page.get_by_label('Contenido de preparación').fill('Comprobar kit\nComunicar faltantes')
  await page.get_by_role('button',name='Guardar preparación',exact=True).click();await page.get_by_text('QA Continuación procedimiento',exact=True).wait_for()
  await page.reload(wait_until='networkidle');await page.get_by_text('QA Continuación procedimiento',exact=True).wait_for();check('procedure preparation reads back',True)
  check('procedure publishing disabled',await page.get_by_role('button',name='Publicar',exact=True).first.is_disabled())
  await page.goto('http://localhost:8080/admin/academia/evaluaciones',wait_until='networkidle');await page.get_by_role('button',name='Preparar evaluación',exact=True).click()
  await page.get_by_label('Título de preparación').fill('QA Continuación ensayo')
  await page.get_by_label('Objetivo de preparación').fill('Ensayar respuestas de selección y reflexión sin nota oficial.')
  await page.get_by_role('button',name='Añadir pregunta',exact=True).click();await page.get_by_label('Enunciado 1').fill('¿Qué comprobar antes de salir?')
  await page.get_by_label('Tipo de pregunta 1').select_option('single');await page.get_by_label('Opciones 1').fill('El kit\nLa agenda')
  await page.get_by_role('button',name='Añadir pregunta',exact=True).click();await page.get_by_label('Enunciado 2').fill('¿Cómo comunicarías un faltante?')
  await page.get_by_role('button',name='Guardar preparación',exact=True).click();await page.get_by_text('QA Continuación ensayo',exact=True).wait_for()
  await page.get_by_role('radio',name='El kit',exact=True).check();await page.get_by_label('Respuesta de reflexión 2').fill('Avisaría al equipo antes de desplazarme.')
  await page.get_by_role('button',name='Revisar ensayo',exact=True).click();await page.get_by_role('status').filter(has_text='2/2 preguntas respondidas').wait_for()
  check('reflection and selection rehearsal works',True);await page.screenshot(path=str(OUT/'assessment-mobile.png'))
  await page.get_by_role('button',name='Reiniciar ensayo',exact=True).click();check('rehearsal resets answers',await page.get_by_label('Respuesta de reflexión 2').input_value()=='' and not await page.get_by_role('radio',name='El kit',exact=True).is_checked())
  await page.reload(wait_until='networkidle');check('practice answers not persisted',await page.get_by_label('Respuesta de reflexión 2').input_value()=='')
  check('publication stays blocked',await page.get_by_role('button',name='Publicar',exact=True).first.is_disabled())
  for width,height in [(360,844),(1366,1091)]:
   await page.set_viewport_size({'width':width,'height':height})
   for route in ['/admin/academia/rutas','/admin/academia/evaluaciones','/admin/academia/procedimientos','/admin/academia/empleados','/admin/academia/competencias','/admin/academia/onboarding','/admin/academia/versiones','/admin/academia/lecciones','/admin/citas/reglas-retrasos','/admin/citas/notificaciones','/admin/operaciones/mapa-en-vivo']:
    await page.goto('http://localhost:8080'+route,wait_until='networkidle');await page.wait_for_timeout(250)
    heading=await page.get_by_role('heading',level=1).all_text_contents()
    observations={'route':route,'width':width,'headings':heading,'url':page.url,'overflow':await page.evaluate('document.documentElement.scrollWidth>innerWidth')}
    routes.append(observations);check(route+' authorized '+str(width),'/auth' not in page.url and '/sin-acceso' not in page.url and len(heading)>0 and not observations['overflow'])
   await page.screenshot(path=str(OUT/f'end-{width}.png'))
  check('no runtime errors',not errors)
  r=requests.get(url+'records',headers=h,params={'select':'id','created_by':'eq.'+uid,'kind':'eq.academy_preparation'},timeout=20);r.raise_for_status();draft_ids[:]=[row['id'] for row in r.json()]
  await browser.close()
 (OUT/'admin-results.json').write_text(json.dumps({'checks':checks,'routes':routes,'errors':errors,'draftIds':draft_ids},ensure_ascii=False,indent=2));print(len(checks),'checks;',len(routes),'authenticated page observations passed')
try:asyncio.run(main())
finally:(OUT/'fixture-ids.json').write_text(json.dumps(draft_ids))
