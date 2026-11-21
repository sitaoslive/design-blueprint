import asyncio,json
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path('/tmp/browser/crawl')
ROLES=[('cliente','Cliente Andrea Gómez','/cliente'),('administrador','Administración Laura Peña','/admin/inicio'),('luis','Luis · Dueño y Veterinario Dr. Luis','/luis'),('auxiliar','Auxiliar Camila Rincón','/auxiliar/inicio')]
BAD=['Estructura creada','Something went wrong','Algo salió mal','Error inesperado','404','No se encontró','Cannot read','undefined']
async def main():
 res=[]
 async with async_playwright() as p:
  b=await p.chromium.launch(headless=True)
  for role,label,home in ROLES:
   page=await b.new_page(viewport={'width':1366,'height':1000}); errs=[]
   page.on('pageerror',lambda e,errs=errs:errs.append(str(e)[:160]))
   await page.goto('http://localhost:8080/demo',wait_until='networkidle')
   await page.get_by_role('button',name=label,exact=False).click(); await page.wait_for_url('**'+home)
   await page.wait_for_timeout(600)
   prefix='/'+home.strip('/').split('/')[0]
   hrefs=await page.eval_on_selector_all('a[href^="/"]','xs=>[...new Set(xs.map(x=>x.getAttribute("href")))]')
   hrefs=[h for h in hrefs if h.startswith(prefix)][:60]
   for h in hrefs:
    n=len(errs)
    await page.goto('http://localhost:8080'+h,wait_until='networkidle'); await page.wait_for_timeout(250)
    t=await page.locator('body').inner_text()
    hits=[w for w in BAD if w in t]
    res.append({'role':role,'path':h,'final':page.url[21:],'bad':hits,'errors':errs[n:],'h1':(await page.locator('h1').all_text_contents())[:1]})
   await page.close()
  await b.close()
 json.dump(res,open(OUT/'crawl.json','w'),ensure_ascii=False,indent=1)
 print('pages',len(res)); [print(r) for r in res if r['bad'] or r['errors'] or '/auth' in r['final']]
asyncio.run(main())
