import asyncio, json
from playwright.async_api import async_playwright
async def login(b, f, **kw):
  m=json.load(open(f)); c=await b.new_context(viewport={"width":390,"height":844}, **kw); pg=await c.new_page(); pg.set_default_timeout(20000)
  errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)[:120])); pg.errs=errs
  await pg.goto("http://localhost:8080"); await pg.evaluate("([k,v])=>localStorage.setItem(k,v)",[m["storage_key"],json.dumps(m["session"])]); return pg
async def toasts(pg): return await pg.locator("[data-sonner-toast]").all_inner_texts()
async def click(pg,name): await pg.get_by_role("button",name=name).first.click()
GEO=dict(geolocation={"latitude":4.70,"longitude":-74.05},permissions=["geolocation"])
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True)
    A=await login(b,"aux.json",**GEO); C=await login(b,"client.json")
    print("== Visita compartida en dos dispositivos")
    V=await login(b,"luis.json")
    await A.goto("http://localhost:8080/auxiliar/visitas/qa-v8/preparacion"); await V.goto("http://localhost:8080/equipo/visitas/qa-v8/ejecucion")
    await asyncio.gather(A.wait_for_timeout(3500),V.wait_for_timeout(3500))
    print(" A pantalla:", " ".join((await A.inner_text("main")).split())[:120])
    print(" V pantalla:", " ".join((await V.inner_text("main")).split())[:120])
    btnsA=[(await x.inner_text()).strip() for x in await A.get_by_role("button").all()]; btnsV=[(await x.inner_text()).strip() for x in await V.get_by_role("button").all()]
    print(" botones A:",[x for x in btnsA if x][:8]); print(" botones V:",[x for x in btnsV if x][:8])
    await asyncio.gather(click(A,"Iniciar preparación"),click(V,"Iniciar preparación")); await A.wait_for_timeout(3000)
    print(" ambos inician:", await toasts(A), await toasts(V))
    await A.locator("label",has_text="Termómetro").locator("input").click(); await V.locator("label",has_text="Termómetro").locator("input").click(); await A.wait_for_timeout(3000)
    btnsA=[(await x.inner_text()).strip() for x in await A.get_by_role("button").all()]; print(" A tras preparar:",[x for x in btnsA if x][:6], await toasts(A))
    print(" V tras preparar:",await toasts(V))
    await asyncio.gather(click(A,"Preparación lista"),click(V,"Preparación lista")); await A.wait_for_timeout(3000)
    L=await login(b,"luis.json")
    await asyncio.gather(click(A,"Salir hacia la visita"),click(V,"Iniciar desplazamiento")); await A.wait_for_timeout(3000)
    await click(A,"Compartir mi ubicación"); await A.wait_for_timeout(3000)
    print(" A en camino:", " ".join((await A.inner_text("main")).split())[60:140], await toasts(A))
    print(" V en camino:", await toasts(V))
    await L.goto("http://localhost:8080/operaciones/despacho"); await L.wait_for_timeout(6000); print(" mapa Luis marcadores:", await L.locator(".leaflet-marker-icon").count())
    await asyncio.gather(click(A,"He llegado"),click(V,"Registrar llegada")); await A.wait_for_timeout(3000)
    await click(V,"Iniciar atención"); await V.wait_for_timeout(3000)
    t=" ".join((await V.inner_text("main")).split()); i=t.find("Estado de la visita"); print(" V:", t[i:i+50], await toasts(V))
    t=" ".join((await A.inner_text("main")).split()); print(" A:", t[60:150], await toasts(A))
    await A.screenshot(path="sharedA.png"); await V.screenshot(path="sharedV.png")
    print("errores:",A.errs,V.errs,C.errs)
    await b.close()
asyncio.run(main())
