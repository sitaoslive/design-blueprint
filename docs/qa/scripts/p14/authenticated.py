import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
async def main():
 with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
 results=[];errors=[];writes=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await browser.new_context(viewport={'width':360,'height':800});page=await context.new_page()
  if m.get('cookies'):await context.add_cookies([{**c,'url':'http://localhost:8080'} for c in m['cookies']])
  await page.goto('http://localhost:8080')
  await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])])
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:writes.append(r.url) if r.method not in ['GET','HEAD','OPTIONS'] and '/rest/v1/' in r.url else None)
  for width in [360,390,430,768,1366]:
   await page.set_viewport_size({'width':width,'height':1091 if width>430 else 844})
   await page.goto('http://localhost:8080/admin/sistema/auditoria-aplicacion',wait_until='networkidle')
   await page.get_by_role('tab',name='Producción',exact=True).click()
   await page.get_by_role('status').filter(has_text='Producción bloqueada').wait_for()
   assert await page.get_by_role('button',name='Aprobar lanzamiento').is_disabled()
   assert await page.get_by_role('tabpanel').get_by_text('Sin verificar',exact=True).count()==17
   await page.screenshot(path=f'/tmp/browser/p14/production-{width}.png')
   await page.get_by_role('tab',name='Flujos críticos').click()
   assert await page.get_by_role('tabpanel').locator('b').count()==12
   results.append({'width':width,'url':page.url,'productionGates':17,'criticalFlows':12,'overflow':await page.evaluate('document.documentElement.scrollWidth>innerWidth')})
  await page.get_by_role('tab',name='Aplicación',exact=True).click();await page.screenshot(path='/tmp/browser/p14/application.png')
  await page.goto('http://localhost:8080/luis/rutas',wait_until='networkidle')
  publish=page.get_by_role('button',name='Publicar ruta');assert await publish.count()>0
  for i in range(await publish.count()):assert await publish.nth(i).is_disabled()
  await page.screenshot(path='/tmp/browser/p14/routes-blocked.png')
  await page.goto('http://localhost:8080/admin/okvet/importar',wait_until='networkidle')
  results.append({'importer':page.url,'signedIn': '/auth' not in page.url})
  await browser.close()
 Path('/tmp/browser/p14/authenticated.json').write_text(json.dumps({'checks':results,'errors':errors,'dataWrites':len(writes)},ensure_ascii=False,indent=2))
 print(json.dumps({'checks':results,'errors':errors,'dataWrites':len(writes)},ensure_ascii=False))
asyncio.run(main())
