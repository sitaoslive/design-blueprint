import asyncio,json,os,csv,io
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/p13-import')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await browser.new_context()
  page=await context.new_page(); errors=[]; mutations=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  page.on('request',lambda r: mutations.append(r.method) if '/rest/v1/' in r.url and r.method not in ['GET','HEAD','OPTIONS'] else None)
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f: minted=json.load(f)
  await page.goto('http://localhost:8080')
  await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[minted['storage_key'],json.dumps(minted['session'])])
  await page.goto('http://localhost:8080/admin/okvet/importar')
  await page.get_by_role('heading',name='Revisión de archivo OKVET',exact=True).wait_for()
  await page.get_by_label('Archivo autorizado').wait_for()
  assert await page.get_by_role('button',name='Seleccionar CSV',exact=True).is_disabled()
  snapshot=await page.evaluate('''async()=>{ const {db}=await import('/src/lib/vf/db.ts'); const r=await db.from('visits').select('id,pet_id,staff_id,date,operational_on,status,okvet_ref,address'); if(r.error)throw new Error('source denied'); return r.data; }''')
  assert snapshot, 'real authorized visits required'
  target=next((v for v in snapshot if v['pet_id'] and v['staff_id'] and len(v.get('operational_on') or v['date'])==10),None)
  headers=['Referencia OKVET','ID cita','ID mascota','ID profesional','Fecha','Estado']
  if target:
   row=[target.get('okvet_ref') or 'QA-P13-UNVERIFIED',target['id'],target['pet_id'],target['staff_id'],target.get('operational_on') or target['date'],target['status']]
  else:
   row=['QA-P13-UNVERIFIED','qa-unmatched','qa-pet','qa-staff','2026-11-21','pendiente']
  def csv_file(name,rows):
   out=io.StringIO();w=csv.writer(out);w.writerow(headers);w.writerows(rows);path=OUT/name;path.write_text(out.getvalue());return str(path)
  valid=csv_file('review.csv',[row]); dup=csv_file('duplicates.csv',[row,row])
  bad=OUT/'bad.csv';bad.write_text('id,id\n1,2')
  await page.get_by_label('Archivo autorizado').check()
  await page.set_input_files('input[type=file]',str(bad))
  await page.get_by_text('Encabezados vacíos o duplicados',exact=True).wait_for()
  assert await page.get_by_role('button',name='Siguiente',exact=True).is_disabled()
  await page.set_input_files('input[type=file]',dup)
  await page.get_by_text('duplicates.csv',exact=False).wait_for()
  async def nextstep():
   await page.get_by_role('button',name='Siguiente',exact=True).click()
  for _ in range(3): await nextstep()
  await page.get_by_role('heading',name='4. Mapeo',exact=True).wait_for()
  await page.get_by_label('Columna ID de mascota').select_option('')
  await nextstep()
  await page.get_by_text('ID de mascota: columna obligatoria',exact=False).wait_for()
  await page.get_by_role('button',name='Anterior',exact=True).click()
  await page.get_by_label('Columna ID de mascota').select_option('ID mascota')
  await nextstep();await nextstep()
  await page.get_by_text('DUPLICATE_REFERENCE',exact=False).first.wait_for()
  await nextstep();await nextstep()
  await page.get_by_label('Mapeo revisado').check()
  await page.get_by_label('Evidencia de revisión').fill('QA: duplicados detectados; no aprobar ni fusionar.')
  assert await page.get_by_role('button',name='Siguiente',exact=True).is_disabled()
  print('PASS consent required, malformed CSV, required mapping and duplicate review blocked')
  await page.get_by_role('button',name='Descartar archivo',exact=True).click()
  await page.get_by_label('Archivo autorizado').check()
  await page.set_input_files('input[type=file]',valid)
  await page.get_by_text('review.csv',exact=False).wait_for()
  for _ in range(6): await nextstep()
  await page.get_by_role('heading',name='7. Conflictos',exact=True).wait_for()
  await page.screenshot(path=str(OUT/'comparison.png'))
  await nextstep()
  await page.get_by_label('Mapeo revisado').check()
  await page.get_by_label('Evidencia de revisión').fill('QA local: comparación con fuentes existentes. Sin autorización de importación ni confirmación.')
  await nextstep()
  await page.get_by_role('button',name='Consultar disponibilidad de importación protegida',exact=True).click()
  await page.get_by_text('BACKEND_UNAVAILABLE:',exact=False).wait_for()
  await page.screenshot(path=str(OUT/'blocked-result.png'))
  after=await page.evaluate('''async()=>{ const {db}=await import('/src/lib/vf/db.ts'); const r=await db.from('visits').select('id,pet_id,staff_id,date,operational_on,status,okvet_ref,address'); return r.data; }''')
  assert sorted(snapshot,key=lambda v:v['id'])==sorted(after,key=lambda v:v['id'])
  assert not mutations,mutations
  print('PASS nine steps, protected request unavailable, zero API writes, source snapshot unchanged')
  await page.reload()
  await page.get_by_label('Archivo autorizado').wait_for()
  assert not await page.get_by_label('Archivo autorizado').is_checked()
  assert await page.get_by_role('button',name='Siguiente',exact=True).is_disabled()
  print('PASS file discarded on reload, not stored as clinical backup')
  paths=['/admin/okvet','/admin/okvet/importar','/admin/okvet/conciliacion','/admin/okvet/conflictos','/admin/datos/calidad','/admin/desarrollo/dependencias']
  for width in [360,390,768,1366]:
   await page.set_viewport_size({'width':width,'height':900})
   for path in paths:
    await page.goto('http://localhost:8080'+path)
    await page.get_by_role('heading',level=1).first.wait_for()
    await page.wait_for_timeout(300)
    assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth'),(width,path)
    if width==360 and path=='/admin/datos/calidad':await page.screenshot(path=str(OUT/'quality-mobile.png'))
   print('PASS six administrative routes no overflow',width)
  await page.goto('http://localhost:8080/admin/desarrollo/dependencias')
  await page.get_by_label('Buscar contrato').fill('requestOkvetImport')
  await page.get_by_text('requestOkvetImport',exact=True).wait_for()
  print('PASS import contract appears in existing dependencies board; runtime errors',errors)
  assert not errors
  await browser.close()
asyncio.run(main())
