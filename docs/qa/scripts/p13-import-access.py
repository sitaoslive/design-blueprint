import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/p13-import')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await browser.new_context();page=await context.new_page()
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:minted=json.load(f)
  await page.goto('http://localhost:8080')
  await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[minted['storage_key'],json.dumps(minted['session'])])
  await page.goto('http://localhost:8080/admin/okvet/importar');await page.wait_for_url('**/sin-acceso')
  assert await page.get_by_label('Archivo CSV').count()==0
  print('PASS authenticated non-admin rejected at /sin-acceso')
  dc=await browser.new_context(viewport={'width':360,'height':800});dp=await dc.new_page()
  await dp.goto('http://localhost:8080/demo')
  await dp.get_by_role('button',name='Administración Laura Peña',exact=False).click()
  await dp.goto('http://localhost:8080/admin/okvet/importar');await dp.get_by_label('Archivo autorizado').wait_for()
  await dp.get_by_label('Archivo autorizado').check()
  await dp.set_input_files('input[type=file]',str(OUT/'review.csv'))
  await dp.get_by_text('review.csv',exact=False).wait_for()
  for _ in range(3):await dp.get_by_role('button',name='Siguiente',exact=True).click()
  await dp.get_by_role('heading',name='4. Mapeo',exact=True).wait_for()
  assert not await dp.evaluate('document.documentElement.scrollWidth>innerWidth')
  await dp.screenshot(path=str(OUT/'mapping-mobile-demo.png'))
  for _ in range(3):await dp.get_by_role('button',name='Siguiente',exact=True).click()
  await dp.get_by_role('heading',name='7. Conflictos',exact=True).wait_for()
  await dp.screenshot(path=str(OUT/'conflicts-mobile-demo.png'))
  assert '/auth' not in dp.url
  await dp.goto('http://localhost:8080/demo');await dp.get_by_role('button',name='Administración Laura Peña',exact=False).wait_for()
  assert await dp.get_by_role('button').count()>=12
  print('PASS demo mobile mapping/conflicts and twelve profiles no login')
  await browser.close()
asyncio.run(main())
