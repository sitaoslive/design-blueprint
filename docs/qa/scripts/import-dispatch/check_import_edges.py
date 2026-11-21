import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/import-dispatch')
OUT.mkdir(parents=True, exist_ok=True)
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);ctx=await browser.new_context(viewport={'width':390,'height':844});page=await ctx.new_page();errors=[];writes=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r:writes.append(r.method) if '/rest/v1/visits' in r.url and r.method not in ['GET','HEAD','OPTIONS'] else None)
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])]);await page.goto('http://localhost:8080/admin/okvet/importar');await page.get_by_label('Archivo autorizado').check()
  before=await page.evaluate("async()=>{const {db}=await import('/src/lib/vf/db.ts');const r=await db.from('visits').select('*');if(r.error)throw Error('source unavailable');return JSON.stringify(r.data.sort((a,b)=>a.id.localeCompare(b.id)));}")
  long=OUT/'long-header.csv';long.write_text('a'*101+',idcita,petid,staffid,fecha,estado\nref,,pet,staff,2026-11-21,pendiente');await page.set_input_files('input[type=file]',str(long));await page.get_by_role('alert').wait_for();assert '100 caracteres' in await page.get_by_role('alert').inner_text()
  dup=OUT/'duplicate-references.csv';dup.write_text('referenciaokvet,idcita,petid,staffid,fecha,estado\nQA-EDGE,,pet,staff,2026-11-21,pendiente\nQA-EDGE,,pet,staff,2026-11-21,pendiente');await page.set_input_files('input[type=file]',str(dup));await page.get_by_text('duplicate-references.csv',exact=False).wait_for()
  for _ in range(3):await page.get_by_role('button',name='Siguiente',exact=True).click()
  await page.get_by_label('Columna ID de mascota').select_option('');await page.get_by_role('button',name='Siguiente',exact=True).click();await page.get_by_text('ID de mascota: columna obligatoria',exact=False).wait_for();await page.get_by_role('button',name='Anterior',exact=True).click();await page.get_by_label('Columna ID de mascota').select_option('petid')
  for _ in range(4):await page.get_by_role('button',name='Siguiente',exact=True).click()
  await page.get_by_label('Mapeo revisado').check();await page.get_by_label('Evidencia de revisión').fill('QA revisión de duplicados sintéticos');assert await page.get_by_role('button',name='Guardar preparación',exact=True).is_disabled();assert await page.get_by_role('button',name='Siguiente',exact=True).is_disabled();print('PASS long headers, missing mapping, duplicate reference guard')
  await page.get_by_role('button',name='Descartar archivo',exact=True).click();await page.get_by_label('Archivo autorizado').check();file=OUT/'QA-MOBILE-edge-final.csv';file.write_text('referenciaokvet,idcita,petid,staffid,fecha,estado\nQA-EDGE-UNIQUE,,pet,staff,2026-11-21,pendiente');await page.set_input_files('input[type=file]',str(file));await page.get_by_text('QA-MOBILE-edge-final.csv',exact=False).wait_for()
  for _ in range(7):await page.get_by_role('button',name='Siguiente',exact=True).click()
  await page.get_by_label('Mapeo revisado').check();await page.get_by_label('Evidencia de revisión').fill('QA-MOBILE-edge-final: revisión sintética');save=page.get_by_role('button',name='Guardar preparación',exact=True);await save.click();await page.get_by_text('Preparación guardada para revisión; sin importación ni autorización oficial',exact=True).wait_for()
  await page.get_by_role('button',name='Actualizar fuentes',exact=True).click();await page.wait_for_timeout(700);assert await save.is_disabled();print('PASS accepted preparation cannot be resubmitted after refreshing sources');await page.screenshot(path=str(OUT/'import-repeat-save.png'))
  after=await page.evaluate("async()=>{const {db}=await import('/src/lib/vf/db.ts');const r=await db.from('visits').select('*');return JSON.stringify(r.data.sort((a,b)=>a.id.localeCompare(b.id)));}");assert before==after;assert not writes;assert not errors;print('PASS visits unchanged and zero appointment API writes; no runtime errors')
  await browser.close()
asyncio.run(main())
