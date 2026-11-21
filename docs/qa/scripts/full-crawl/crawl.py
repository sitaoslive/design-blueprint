import asyncio,json,sys
from playwright.async_api import async_playwright
P=json.load(open('paths.json'))
MAP={'admin':'Administración','operaciones':'Coordinación','app':'Cliente','cliente':'Cliente','equipo':'Veterinaria','direccion':'Luis · Dueño','luis':'Luis · Dueño','auxiliar':'Auxiliar','recepcion':'Recepción','especialista':'Especialista','finanzas':'Finanzas','soporte':'Soporte','cuidador':'Cuidador','consultor':'Consultor'}
groups=sys.argv[1].split(',')
BAD=['Estructura creada','Algo salió mal','Error inesperado','Cannot read','undefined','NaN','[object Object]','no encontrada','No encontrado']
async def run(b,g):
  paths=[p for p in P if (p.split('/')[1] if g!='public' else None)==g] if g!='public' else [p for p in P if p.split('/')[1] not in MAP]
  pg=await b.new_page(viewport={'width':390,'height':844}); pg.set_default_timeout(30000); errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)[:150]))
  await pg.goto('http://localhost:8080/demo',wait_until='networkidle')
  if g!='public':
    await pg.locator('summary').first.click(); await pg.wait_for_timeout(300)
    await pg.locator('button',has_text=MAP[g]).first.click(); await pg.wait_for_timeout(1200)
  out=[]
  for h in paths:
    n=len(errs)
    try: await pg.goto('http://localhost:8080'+h,wait_until='networkidle',timeout=20000)
    except Exception as e: out.append({'p':h,'bad':['timeout']}); continue
    await pg.wait_for_timeout(300)
    t=await pg.locator('body').inner_text()
    ow=await pg.evaluate("document.documentElement.scrollWidth-innerWidth")
    bad=[w for w in BAD if w in t]
    fin=pg.url[21:]
    out.append({'p':h,'final':fin,'bad':bad,'err':errs[n:],'ow':ow,'h1':(await pg.locator('h1').all_text_contents())[:1]})
  await pg.close(); return g,out
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True)
    res=await asyncio.gather(*[run(b,g) for g in groups])
    for g,o in res: json.dump(o,open(f'r_{g}.json','w'),ensure_ascii=False)
asyncio.run(main())
