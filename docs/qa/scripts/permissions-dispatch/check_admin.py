import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path(__file__).parent
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  ctx=await browser.new_context(); page=await ctx.new_page(); errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
  await page.goto('http://localhost:8080'); await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])])
  await page.goto('http://localhost:8080/admin/okvet/importar')
  await page.get_by_label('Archivo autorizado').wait_for(); await page.get_by_label('Archivo autorizado').check()
  csv=OUT/'QA-PERM-review.csv';csv.write_text('referenciaokvet,idcita,petid,staffid,fecha,estado\nQA-NEW-20261121,,luna,valeria,2026-11-21,pendiente\n')
  await page.set_input_files('input[type=file]',str(csv));await page.get_by_text('QA-PERM-review.csv',exact=False).wait_for()
  for _ in range(7): await page.get_by_role('button',name='Siguiente',exact=True).click()
  await page.get_by_label('Mapeo revisado').check();await page.get_by_label('Evidencia de revisión').fill('QA-PERM responsable de revisión sintética')
  save=page.get_by_role('button',name='Guardar preparación',exact=True)
  await save.wait_for(); assert await save.is_enabled()
  await save.click();await page.get_by_text('Preparación guardada para revisión; sin importación ni autorización oficial',exact=True).wait_for()
  await page.screenshot(path=str(OUT/'preparation-saved.png'))
  await page.reload();await page.get_by_label('Archivo autorizado').wait_for();assert not await page.get_by_label('Archivo autorizado').is_checked()
  await page.goto('http://localhost:8080/admin/okvet');await page.get_by_text('QA-PERM responsable de revisión sintética',exact=True).wait_for()
  assert await page.get_by_role('button',name='Aplicar importación oficial',exact=True).is_disabled()
  print('PASS authenticated admin: saved metadata, reload readback, raw file discarded, official apply disabled')
  await page.goto('http://localhost:8080/admin/citas/duraciones');await page.get_by_label('Nombre del tipo').fill('QA-PERM Control duración')
  await page.get_by_label('Motivo de duración').fill('QA-PERM propuesta sintética no clínica')
  await page.get_by_role('button',name='Guardar borrador',exact=True).click();await page.get_by_text('Propuesta guardada; sin política publicada ni cambios en citas',exact=True).wait_for()
  await page.reload();await page.get_by_text('QA-PERM Control duración',exact=True).wait_for();assert await page.get_by_role('button',name='Publicar configuración',exact=True).is_disabled()
  print('PASS duration proposal saved/readback, publish disabled')
  await page.goto('http://localhost:8080/direccion/finanzas/cobros');await page.get_by_text('QA permiso propio',exact=True).wait_for();await page.get_by_text('QA permiso ajeno',exact=True).wait_for()
  print('PASS administrator finance charges visible')
  for width in [360,390,430,768,1366]:
   await page.set_viewport_size({'width':width,'height':1091 if width==1366 else 850})
   for path in ['/admin','/admin/okvet','/admin/okvet/importar','/admin/citas/duraciones','/operaciones/despacho','/direccion/finanzas/cobros']:
    await page.goto('http://localhost:8080'+path); await page.wait_for_timeout(500)
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth'),(width,path)
   if width==360:await page.screenshot(path=str(OUT/'finance-mobile.png'))
  print('PASS 6 authenticated routes at 360/390/430/768/1366 without overflow')
  assert not errors,errors
  print('PASS no page errors')
  await browser.close()
asyncio.run(main())
