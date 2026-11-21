import asyncio, json
from playwright.async_api import async_playwright
def ses(f): return json.load(open(f))
async def login(b, f, **kw):
  m=ses(f); c=await b.new_context(viewport={"width":390,"height":844}, **kw); pg=await c.new_page(); pg.set_default_timeout(20000)
  await pg.goto("http://localhost:8080"); await pg.evaluate("([k,v])=>localStorage.setItem(k,v)",[m["storage_key"],json.dumps(m["session"])]); return pg
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True)
    A=await login(b,"aux.json",geolocation={"latitude":4.7110,"longitude":-74.0721},permissions=["geolocation"])
    await A.goto("http://localhost:8080/auxiliar/visitas/qa-v4/preparacion"); await A.wait_for_timeout(3000)
    for l in ["Iniciar preparación","Preparación lista","Iniciar desplazamiento"]:
      await A.get_by_role("button",name=l).click(); await A.wait_for_timeout(2000)
    await A.get_by_role("button",name="Compartir mi ubicación").click(); await A.wait_for_timeout(4000)
    await A.screenshot(path="aux_sharing.png")
    print("aux:", "Dejar de compartir" in await A.inner_text("main"))
    L=await login(b,"luis.json")
    await L.goto("http://localhost:8080/operaciones/despacho"); await L.wait_for_timeout(6000)
    t=" ".join((await L.inner_text("main")).split()); i=t.find("QA Auxiliar Mapa"); print("mapa:", t[i-5:i+80] if i>=0 else "NO VISIBLE", "| marcadores:", await L.locator(".leaflet-marker-icon").count())
    await L.screenshot(path="luis_map.png")
    await A.get_by_role("button",name="Registrar llegada").click(); await A.wait_for_timeout(3000)
    await L.reload(); await L.wait_for_timeout(6000); print("tras llegada marcadores:", await L.locator(".leaflet-marker-icon").count())
    await b.close()
asyncio.run(main())
