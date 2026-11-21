import asyncio,json,os,csv,io
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/import-dispatch')
OUT.mkdir(parents=True, exist_ok=True)
async def session(page):
 with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
 await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])])
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for width,height in [(360,800),(1366,1091)]:
   ctx=await browser.new_context(viewport={'width':width,'height':height});page=await ctx.new_page();errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   await session(page);await page.goto('http://localhost:8080/admin/okvet/importar');await page.get_by_label('Archivo autorizado').wait_for()
   assert await page.get_by_role('button',name='Seleccionar CSV',exact=True).is_disabled()
   await page.get_by_label('Archivo autorizado').check()
   bad=OUT/'bad.csv';bad.write_text('id,id\n1,2')
   await page.set_input_files('input[type=file]',str(bad));await page.get_by_role('alert').wait_for();assert await page.get_by_role('button',name='Siguiente',exact=True).is_disabled()
   name=f'QA-MOBILE-{width}-'+('archivoautorizadopararevisionsinteticasinoperacionesoficiales'*3)+'.csv'
   file=OUT/name;file.write_text('referenciaokvet,idcita,petid,staffid,fecha,estado\nQA-MOB-'+str(width)+',,qa-local-pet,qa-local-staff,2026-11-21,pendiente\n')
   await page.set_input_files('input[type=file]',str(file));await page.get_by_role('alert').wait_for();assert '200 caracteres' in await page.get_by_role('alert').inner_text();assert await page.get_by_role('button',name='Siguiente',exact=True).is_disabled();print('PASS long file name rejected before review');name=f'QA-MOBILE-{width}-final.csv';file=OUT/name;file.write_text('referenciaokvet,idcita,petid,staffid,fecha,estado\nQA-MOB-'+str(width)+',,qa-local-pet,qa-local-staff,2026-11-21,pendiente\n');await page.set_input_files('input[type=file]',str(file));await page.get_by_text(name,exact=False).wait_for()
   for step in range(8):
    await page.screenshot(path=str(OUT/f'import-{width}-step{step}.png'))
    overflow=await page.evaluate('document.documentElement.scrollWidth>innerWidth');print('step',width,step,'overflow',overflow)
    if step==7:
     await page.get_by_label('Mapeo revisado').check();await page.get_by_label('Evidencia de revisión').fill(f'QA-MOBILE-{width}-final: revisión sintética; sin aprobación oficial')
     save=page.get_by_role('button',name='Guardar preparación',exact=True);await save.wait_for();print('save enabled',await save.is_enabled())
     await save.click();await page.wait_for_timeout(1200);print('statuses',await page.get_by_role('status').all_text_contents());await page.screenshot(path=str(OUT/f'import-{width}-save-attempt.png'));await page.get_by_text('Preparación guardada para revisión; sin importación ni autorización oficial',exact=True).wait_for()
     assert await save.is_disabled();await page.screenshot(path=str(OUT/f'import-{width}-saved.png'),animations='disabled')
    await page.get_by_role('button',name='Siguiente',exact=True).click()
   await page.get_by_role('button',name='Consultar disponibilidad de importación protegida',exact=True).click();await page.get_by_role('alert').wait_for()
   assert 'BACKEND_UNAVAILABLE' in await page.get_by_role('alert').inner_text()
   await page.reload();await page.get_by_label('Archivo autorizado').wait_for();assert not await page.get_by_label('Archivo autorizado').is_checked()
   await page.goto('http://localhost:8080/admin/okvet');await page.get_by_text(f'QA-MOBILE-{width}-final: revisión sintética; sin aprobación oficial',exact=True).wait_for()
   await page.screenshot(path=str(OUT/f'import-{width}-readback.png'),animations='disabled')
   print('readback overflow',width,await page.evaluate('document.documentElement.scrollWidth>innerWidth'));print('runtime errors',errors);assert not errors
   await ctx.close()
  await browser.close()
asyncio.run(main())
