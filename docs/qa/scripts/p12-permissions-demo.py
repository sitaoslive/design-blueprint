import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/p12-continuation')
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await browser.new_context(viewport={'width':390,'height':844})
  page=await context.new_page(); errors=[]
  page.on('pageerror',lambda e:errors.append(str(e)))
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f: minted=json.load(f)
  await page.goto('http://localhost:8080')
  await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[minted['storage_key'],json.dumps(minted['session'])])
  await page.goto('http://localhost:8080/finanzas/inicio')
  await page.get_by_role('heading',name='Finanzas de Vet Life',exact=True).wait_for()
  await page.get_by_role('main').get_by_role('link',name='Cobros',exact=True).click()
  await page.get_by_label('Buscar cargo').fill('QA P12 Continuación')
  await page.get_by_role('link',name='QA P12 Continuación',exact=True).click()
  await page.get_by_role('heading',name='Detalle de cargo',exact=True).wait_for()
  await page.screenshot(path=str(OUT/'finance-role-charge.png'))
  await page.goto('http://localhost:8080/luis/asistente')
  await page.wait_for_url('**/sin-acceso')
  assert await page.get_by_label('Instrucción para la asistente').count()==0
  print('PASS authenticated Finanzas sees authorized charge; private Luis assistant denied')
  demo=await browser.new_context(viewport={'width':360,'height':800})
  dp=await demo.new_page()
  await dp.goto('http://localhost:8080/demo')
  await dp.get_by_role('button',name='Administración Laura Peña',exact=False).click()
  await dp.get_by_role('heading',name='Centro de Control Vet Freedom',exact=True).wait_for()
  await dp.get_by_text('DEMO sintético',exact=False).wait_for()
  assert '/auth' not in dp.url
  await dp.screenshot(path=str(OUT/'demo-admin.png'))
  await dp.goto('http://localhost:8080/demo')
  await dp.get_by_role('button',name='Dirección Dr. Luis',exact=False).click()
  await dp.goto('http://localhost:8080/luis/asistente')
  await dp.get_by_label('Instrucción para la asistente').wait_for()
  await dp.get_by_label('Instrucción para la asistente').fill('Cobros reportados hoy')
  await dp.get_by_role('button',name='Enviar instrucción',exact=True).click()
  await dp.get_by_text('Datos sintéticos de demostración.',exact=False).wait_for()
  await dp.get_by_role('button',name='Enviar instrucción',exact=True).scroll_into_view_if_needed()
  await dp.screenshot(path=str(OUT/'demo-luis-composer.png'))
  await dp.goto('http://localhost:8080/demo')
  await dp.get_by_role('button',name='Administración Laura Peña',exact=False).wait_for()
  assert await dp.get_by_role('button').count()>=12
  print('PASS admin and Luis demos without login; twelve profiles preserved')
  print('Runtime errors',errors); assert not errors
  await browser.close()
asyncio.run(main())
