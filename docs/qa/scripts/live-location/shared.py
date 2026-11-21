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
    print("== Cliente ve la ruta")
    await A.goto("http://localhost:8080/auxiliar/visitas/qa-v5/preparacion"); await A.wait_for_timeout(3000)
    for l in ["Iniciar preparación","Preparación lista","Iniciar desplazamiento","Compartir mi ubicación"]: await click(A,l); await A.wait_for_timeout(2000)
    await C.goto("http://localhost:8080/cliente"); await C.wait_for_timeout(4000)
    t=" ".join((await C.inner_text("main")).split()); print(" inicio cliente:", "El equipo va en camino a tu casa" in t)
    await C.get_by_text("El equipo va en camino a tu casa").click(); await C.wait_for_timeout(6000)
    t=" ".join((await C.inner_text("main")).split()); print(" seguimiento:", C.url[21:], "| marcadores:", await C.locator(".leaflet-marker-icon").count(), "|", "va en camino a tu casa" in t)
    await C.screenshot(path="client_track.png")
    await click(A,"Registrar llegada"); await A.wait_for_timeout(2500)
    print("== Visita compartida en dos dispositivos")
    V=await login(b,"luis.json")
    await A.goto("http://localhost:8080/auxiliar/visitas/qa-v6/preparacion"); await V.goto("http://localhost:8080/equipo/visitas/qa-v6/ejecucion")
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
    await A.screenshot(path="sharedA.png"); await V.screenshot(path="sharedV.png")
    print("errores:",A.errs,V.errs,C.errs)
    await b.close()
asyncio.run(main())
