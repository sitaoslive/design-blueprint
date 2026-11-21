import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/journey-security'); OUT.mkdir(exist_ok=True)
async def main():
 results=[]; errors=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  page=await browser.new_page()
  page.on('pageerror',lambda e:errors.append(str(e)))
  await page.goto('http://localhost:8080/',wait_until='networkidle')
  await page.screenshot(path=str(OUT/'home-desktop.png'))
  for role,label,home,paths in [
   ('cliente','Cliente Andrea Gómez','/cliente',['/cliente/mascotas','/cliente/agenda','/cliente/reservar','/cliente/pagos','/cliente/documentos','/cliente/remisiones']),
   ('administrador','Administración Laura Peña','/admin/inicio',['/admin/usuarios','/admin/academia','/admin/academia/rutas','/admin/academia/evaluaciones','/admin/academia/competencias','/admin/finanzas','/admin/okvet/importar']),
   ('luis','Luis · Dueño y Veterinario Dr. Luis','/luis',['/luis/pacientes','/luis/recordatorios','/luis/asistente','/luis/agenda','/luis/mi-jornada']),
   ('auxiliar','Auxiliar Camila Rincón','/auxiliar/inicio',['/auxiliar/asignaciones','/auxiliar/academia','/auxiliar/tareas','/auxiliar/insumos','/auxiliar/mensajes','/auxiliar/cobros','/auxiliar/traspasos'])]:
   for width,height in [(360,844),(1366,1091)]:
    await page.set_viewport_size({'width':width,'height':height})
    await page.goto('http://localhost:8080/demo',wait_until='networkidle')
    await page.get_by_role('button',name=label,exact=False).click()
    await page.wait_for_url('**'+home); await page.wait_for_timeout(450)
    assert '/auth' not in page.url
    await page.screenshot(path=str(OUT/f'{role}-{width}.png'))
    for route in [home]+paths:
     await page.goto('http://localhost:8080'+route,wait_until='networkidle')
     text=await page.locator('body').inner_text()
     results.append({'role':role,'width':width,'path':route,'url':page.url.removeprefix('http://localhost:8080'),'overflow':await page.evaluate('document.documentElement.scrollWidth>innerWidth'),'structure':'Estructura creada' in text,'brokenImages':await page.locator('img').evaluate_all('(xs)=>xs.filter(x=>x.complete&&!x.naturalWidth).length'),'heading':await page.locator('main h1').all_text_contents()})
    await page.get_by_role('button',name='Soporte automático',exact=True).click()
    await page.get_by_role('region',name='Diagnóstico automático').wait_for()
    await page.screenshot(path=str(OUT/f'support-{role}-{width}.png'))
  await page.goto('http://localhost:8080/demo',wait_until='networkidle'); await page.get_by_role('button',name='Administración Laura Peña').click(); await page.wait_for_timeout(250)
  await page.goto('http://localhost:8080/luis',wait_until='networkidle')
  assert await page.get_by_role('tab',name='Veterinario',exact=True).count()==0
  await page.goto('http://localhost:8080/luis/mi-jornada',wait_until='networkidle')
  text=await page.locator('body').inner_text(); assert 'requiere el perfil profesional de Luis' in text
  await page.screenshot(path=str(OUT/'admin-clinical-denied.png'))
  await browser.close()
 (OUT/'demo-results.json').write_text(json.dumps({'checks':results,'pageErrors':errors},ensure_ascii=False,indent=2))
 print(json.dumps({'checks':len(results),'overflows':[r for r in results if r['overflow']],'structures':[r for r in results if r['structure']],'brokenImages':[r for r in results if r['brokenImages']],'errors':errors},ensure_ascii=False))
asyncio.run(main())
