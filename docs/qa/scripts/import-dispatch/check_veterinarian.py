import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/import-dispatch')
OUT.mkdir(parents=True, exist_ok=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);ctx=await browser.new_context(viewport={'width':390,'height':844});page=await ctx.new_page();errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])]);await page.goto('http://localhost:8080/equipo/hoy');await page.get_by_label('Fecha de despacho').fill('2026-11-21');await page.get_by_text('Paciente QA móvil · Siguiente visita QA',exact=True).wait_for();assert not await page.get_by_label('Profesional de despacho').count();assert not await page.get_by_text('Visita otro día QA',exact=False).count();print('PASS veterinarian sees own itinerary, date filter and no global professional selector')
  await page.goto('http://localhost:8080/equipo/visitas/QA-MOB-DISPATCH-next/tiempo');await page.get_by_role('button',name='Iniciar desplazamiento',exact=True).wait_for()
  observer=await ctx.new_page();observer.on('pageerror',lambda e:errors.append(str(e)));await observer.goto(page.url);await observer.get_by_text('Tiempo de atención no disponible',exact=True).wait_for()
  for name in ['Iniciar desplazamiento','Registrar llegada','Iniciar atención']:
   await page.get_by_role('button',name=name,exact=True).click()
  await page.get_by_role('button',name='Finalizar servicio',exact=True).wait_for();await page.get_by_text('min de atención registrada',exact=False).wait_for();await observer.get_by_text('min de atención registrada',exact=False).wait_for()
  assert not await page.get_by_text('El paso de campo quedó guardado, pero no se pudo actualizar el resumen de la cita',exact=True).count()
  print('PASS accepted start refreshes both tabs and compatibility step; no summary error')
  await page.get_by_text('min de atención registrada',exact=False).screenshot(path=str(OUT/'vet-clock-390.png'));await page.get_by_role('button',name='Finalizar servicio',exact=True).click();await page.get_by_role('button',name='Solicitar cierre',exact=True).wait_for();await page.reload();await page.get_by_role('button',name='Solicitar cierre',exact=True).wait_for()
  snapshot=await page.evaluate("async()=>{const {db}=await import('/src/lib/vf/db.ts');const v=await db.from('visits').select('status,step,okvet_ref').eq('id','QA-MOB-DISPATCH-next').single();const e=await db.from('visit_executions').select('state,stamps').eq('visit_id','QA-MOB-DISPATCH-next').single();return {visit:v.data,execution:e.data};}")
  assert snapshot['visit']=={'status':'pendiente','step':'finalizada','okvet_ref':None};assert snapshot['execution']['state']=='SERVICE_FINISHED';assert 'IN_SERVICE' in snapshot['execution']['stamps'];assert 'SERVICE_FINISHED' in snapshot['execution']['stamps'];print('PASS readback pending appointment/no official reference, completed field step and server stamps')
  for width in [360,390,430]:
   await page.set_viewport_size({'width':width,'height':844});await page.goto('http://localhost:8080/equipo/hoy');await page.get_by_text('Paciente QA móvil · Siguiente visita QA',exact=True).wait_for();assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth');await page.screenshot(path=str(OUT/f'vet-dispatch-{width}.png'))
   await page.goto('http://localhost:8080/equipo/visitas/QA-MOB-DISPATCH-next/tiempo');await page.get_by_text('min de atención registrada',exact=False).wait_for();assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth');await page.screenshot(path=str(OUT/f'vet-duration-{width}.png'))
  await page.goto('http://localhost:8080/admin/okvet/importar');await page.wait_for_url('**/sin-acceso');print('PASS veterinarian cannot access importer')
  assert not errors;print('PASS no runtime errors; 360/390/430 mobile dispatch and timing')
  await browser.close()
asyncio.run(main())
