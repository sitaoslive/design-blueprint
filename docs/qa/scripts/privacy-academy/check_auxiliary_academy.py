import asyncio,json,os,requests
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path(os.environ.get('ACADEMY_QA_OUTPUT', '/tmp/browser/academy-continuation')); OUT.mkdir(parents=True, exist_ok=True);m=json.loads(Path(os.environ.get('ACADEMY_QA_SESSION_FILE', '/tmp/browser/academy-continuation/session.json')).read_text());s=m['session'];uid=s['user']['id'];url=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/';h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token']};checks=[];errors=[]
def check(name,ok):
 checks.append({'name':name,'passed':bool(ok)});assert ok,name
r=requests.get(url+'records',headers=h,params={'select':'id','kind':'eq.academy_preparation'},timeout=20);check('auxiliary cannot read director preparations directly',r.status_code==200 and r.json()==[])
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(headless=True);ctx=await b.new_context(viewport={'width':360,'height':844});page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
  if m.get('cookies'):await ctx.add_cookies([{**c,'url':'http://localhost:8080'} for c in m['cookies']])
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(s)])
  await page.goto('http://localhost:8080/auxiliar/academia',wait_until='networkidle');await page.get_by_role('heading',name='Mi formación',exact=True).wait_for()
  data=await page.evaluate('async()=>{const mod=await import("/src/features/academy/academy.functions.ts");return mod.readAcademy();}')
  check('auxiliary API returns no reserved drafts or team progress',data['drafts']==[] and data['team']==[])
  check('auxiliary has only role-compatible courses',all(c['role'] in ['Todos','Auxiliar','Auxiliares'] for c in data['courses']))
  check('auxiliary has no preparation editor',await page.get_by_role('button',name='Preparar curso',exact=True).count()==0)
  draft={'requestId':'4933e27a-3385-4e1e-846a-1a44c35c4184','kind':'course','title':'QA forbidden auxiliary draft','purpose':'Verify auxiliary cannot save a reserved preparation.','audience':'Auxiliar','clinical':False,'revision':1,'sourceCourseIds':[],'outline':[],'questions':[]}
  error=await page.evaluate('async data=>{try{const mod=await import("/src/features/academy/academy.functions.ts");await mod.saveAcademyDraft({data});return null;}catch(e){return e.message;}}',draft)
  check('protected handler specifically rejects auxiliary draft',error is not None and 'Solo Administración prepara formación' in error)
  course=next(c for c in data['courses'] if any(l['course_id']==c['id'] for l in data['lessons']))
  await page.get_by_label('Buscar curso').fill(course['title']);await page.get_by_role('button',name='Abrir curso',exact=True).click()
  button=page.get_by_role('button',name='Registrar lectura',exact=True).first;
  if await button.count(): await button.click()
  await page.get_by_role('button',name='Lectura registrada',exact=True).first.wait_for()
  await page.reload(wait_until='networkidle');await page.get_by_label('Buscar curso').fill(course['title']);await page.get_by_role('button',name='Abrir curso',exact=True).click();check('auxiliary own lesson acknowledgement persists',await page.get_by_role('button',name='Lectura registrada',exact=True).first.is_disabled())
  await page.wait_for_timeout(700); await page.screenshot(path=str(OUT/'auxiliary-lesson-mobile.png'))
  await page.get_by_role('button',name='Volver a cursos',exact=True).click();check('return from lesson opens course catalog',await page.get_by_label('Buscar curso').count()==1)
  await page.goto('http://localhost:8080/admin/academia/onboarding',wait_until='networkidle');check('auxiliary admin route denied',('/sin-acceso' in page.url) or await page.get_by_text('Acceso restringido',exact=False).count()>0 or '/auxiliar' in page.url)
  check('no runtime errors',not errors);await b.close()
 (OUT/'auxiliary-results.json').write_text(json.dumps({'checks':checks,'errors':errors},ensure_ascii=False,indent=2));print(len(checks),'auxiliary assertions passed')
asyncio.run(main())
