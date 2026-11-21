import asyncio,json,sys,re
from playwright.async_api import async_playwright
P=json.load(open('/tmp/browser/full/paths.json'))
ROLE={'admin':'Administración','operaciones':'Coordinación','app':'Cliente','cliente':'Cliente','equipo':'Veterinaria','luis':'Luis · Dueño','auxiliar':'Auxiliar'}
BAD=['Algo salió mal','Error inesperado','Cannot read','undefined','NaN','[object Object]','no encontrad','No encontrado']
SKIP=re.compile(r'(Salir|Cerrar sesión|Eliminar|Borrar|Descargar|Exportar|Imprimir|Abrir Waze|Google Maps)',re.I)
async def run(b,g):
  pg=await b.new_page(viewport={'width':390,'height':844}); pg.set_default_timeout(15000); errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)[:150])); pg.on('dialog',lambda d: asyncio.ensure_future(d.dismiss()))
  await pg.goto('http://localhost:8080/demo',wait_until='networkidle'); await pg.locator('summary').click()
  await pg.locator('button',has_text=ROLE[g]).first.click(); await pg.wait_for_timeout(1200)
  pref='/'+g; det=set()
  for h in [p for p in P if p.startswith(pref+'/') or p==pref]:
    try: await pg.goto('http://localhost:8080'+h,wait_until='networkidle')
    except: continue
    for x in await pg.eval_on_selector_all('a[href^="/"]','xs=>xs.map(x=>x.getAttribute("href"))'):
      x=x.split('?')[0].split('#')[0]
      if x.startswith(pref) and x not in P: det.add(x)
  out=[]
  for h in sorted(det)[:70]:
    n=len(errs)
    try: await pg.goto('http://localhost:8080'+h,wait_until='networkidle')
    except: out.append({'p':h,'bad':['timeout']}); continue
    await pg.wait_for_timeout(300); bad=[w for w in BAD if w in await pg.locator('body').inner_text()]
    clicked=0; berr=[]
    btns=await pg.locator('main button:visible').all()
    for bt in btns[:12]:
      try:
        t=(await bt.inner_text()).strip()
        if not t or SKIP.search(t) or await bt.is_disabled(): continue
        await bt.click(timeout=3000); clicked+=1; await pg.wait_for_timeout(250)
        if pg.url[21:].split('?')[0]!=h: await pg.goto('http://localhost:8080'+h,wait_until='networkidle'); break
      except Exception as e: pass
    bad2=[w for w in BAD if w in await pg.locator('body').inner_text()]
    out.append({'p':h,'bad':bad,'after':bad2,'err':errs[n:],'clicked':clicked})
  await pg.close(); return g,out,len(det)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True)
    for g,o,n in await asyncio.gather(*[run(b,g) for g in sys.argv[1].split(',')]):
      json.dump(o,open(f'd_{g}.json','w'),ensure_ascii=False); print(g,'detalles',n)
asyncio.run(main())
