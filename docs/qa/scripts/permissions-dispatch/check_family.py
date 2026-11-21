import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path(__file__).parent
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);ctx=await browser.new_context(viewport={'width':360,'height':850});page=await ctx.new_page()
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])]);await page.goto('http://localhost:8080/app/visitas/QA-PERM-visit/seguimiento')
  await page.get_by_text('QA-PERM Mascota · Consulta general',exact=True).wait_for();assert not await page.get_by_role('button',name='Iniciar atención',exact=True).count()
  await page.get_by_text('Sin seguimiento activo ni ETA confirmado. No se recopila ubicación.',exact=True).wait_for();await page.screenshot(path=str(OUT/'family-tracking.png'))
  await page.goto('http://localhost:8080/app/visitas/v1/seguimiento');await page.get_by_text('Visita no encontrada entre tus datos autorizados',exact=True).wait_for()
  result=await page.evaluate('''async()=>{const {supabase:s}=await import('/src/integrations/supabase/client.ts');const r=await s.from('visits').select('id').eq('id','v1');return r.data?.length??0}''');assert result==0
  print('PASS family own tracking readback, other visit denied via UI/RLS, no staff actions or GPS')
  demo=await browser.new_context(viewport={'width':360,'height':850});dp=await demo.new_page();await dp.goto('http://localhost:8080/demo');await dp.get_by_role('button',name='Administración Laura Peña',exact=False).click();await dp.goto('http://localhost:8080/admin/citas/duraciones');await dp.get_by_label('Nombre del tipo').wait_for();assert await dp.get_by_role('button',name='Guardar borrador',exact=True).is_disabled()
  await dp.goto('http://localhost:8080/operaciones/cita-rapida');await dp.get_by_label('Duración de esta cita').wait_for();await dp.get_by_label('Duración de esta cita').fill('90');await dp.get_by_text('Previsualización recalculada.',exact=False).wait_for();assert await dp.get_by_role('button',name='Crear solicitud',exact=True).is_disabled()
  await dp.screenshot(path=str(OUT/'duration-preview.png'))
  await dp.goto('http://localhost:8080/demo');assert await dp.get_by_role('button').count()>=12
  print('PASS demo no login, custom duration preview blocks creation; twelve profiles preserved')
  await browser.close()
asyncio.run(main())
