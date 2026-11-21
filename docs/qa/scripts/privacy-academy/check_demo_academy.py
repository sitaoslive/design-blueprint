import asyncio,json,re
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/academy-continuation');OUT.mkdir(parents=True,exist_ok=True)
async def main():
 async with async_playwright() as p:
  b=await p.chromium.launch(headless=True);c=await b.new_context(viewport={'width':360,'height':844});page=await c.new_page();await page.goto('http://localhost:8080/demo',wait_until='networkidle')
  await page.get_by_role('button',name=re.compile('Auxiliar')).first.click();await page.wait_for_url('**/auxiliar/**');await page.goto('http://localhost:8080/auxiliar/academia',wait_until='networkidle');await page.get_by_label('Buscar curso').wait_for()
  checks=[{'name':'demo auxiliary reaches Academy without login','passed':'/auth' not in page.url},{'name':'demo auxiliary hides veterinarian-only course','passed':await page.get_by_text('Protocolo de visita domiciliaria',exact=True).count()==0},{'name':'demo auxiliary retains all-role course','passed':await page.get_by_text('Bioseguridad y manejo de residuos',exact=True).count()==1}]
  assert all(row['passed'] for row in checks);(OUT/'demo-academy.json').write_text(json.dumps(checks,indent=2));await b.close();print('3 demo Academy assertions passed')
asyncio.run(main())
