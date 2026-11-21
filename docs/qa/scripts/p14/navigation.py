import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
roles=['Cliente','Administración','Dirección','Coordinación','Veterinaria','Auxiliar','Recepción','Finanzas','Cuidador','Especialista','Soporte','Consultor']
async def main():
 results=[]
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  for role in roles:
   context=await browser.new_context(viewport={'width':360,'height':800})
   page=await context.new_page(); errors=[]; writes=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   page.on('request',lambda r:writes.append(r.url) if r.method not in ['GET','HEAD','OPTIONS'] and '/rest/v1/' in r.url else None)
   await page.goto('http://localhost:8080/demo',wait_until='networkidle')
   await page.get_by_role('button',name=role,exact=False).first.click()
   await page.wait_for_timeout(500)
   initial=page.url
   links=await page.get_by_role('navigation',name='Navegación principal').get_by_role('link').evaluate_all('(xs)=>xs.map(x=>({label:x.textContent,href:x.getAttribute("href")}))')
   for link in links:
    await page.goto('http://localhost:8080'+link['href'],wait_until='networkidle')
    text=await page.locator('body').inner_text()
    results.append({'role':role,'link':link,'url':page.url,'unregistered':'Pantalla no registrada' in text,'denied':'/sin-acceso' in page.url or '/auth' in page.url,'overflow':await page.evaluate('document.documentElement.scrollWidth>innerWidth'),'errors':errors.copy(),'dataWrites':len(writes)})
   await context.close()
  await browser.close()
 Path('/tmp/browser/p14/navigation.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
 print('checked',len(results));print('failures',json.dumps([r for r in results if r['unregistered'] or r['denied'] or r['overflow'] or r['errors'] or r['dataWrites']],ensure_ascii=False))
asyncio.run(main())
