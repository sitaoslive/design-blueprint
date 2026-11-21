import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright
S=Path("/tmp/browser/auxreal/s")
m=json.load(open(os.path.expanduser("~/.cache/lovable-auth/session.json")))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True); c=await b.new_context(viewport={"width":390,"height":844}); pg=await c.new_page()
    errs=[]; pg.on("pageerror",lambda e:errs.append(str(e))); pg.on("console",lambda m_: errs.append(m_.text) if m_.type=="error" else None)
    await pg.goto("http://localhost:8080"); await pg.evaluate("([k,v])=>localStorage.setItem(k,v)",[m["storage_key"],json.dumps(m["session"])])
    for path in ["/auxiliar","/auxiliar/asignaciones","/auxiliar/preparacion","/auxiliar/visitas/qa-v1/preparacion","/auxiliar/visitas/v7/preparacion","/auxiliar/tareas","/auxiliar/mensajes","/auxiliar/insumos","/auxiliar/incidencias","/auxiliar/cierre-jornada"]:
      await pg.goto("http://localhost:8080"+path); await pg.wait_for_timeout(2500)
      t=await pg.inner_text("main") if await pg.locator("main").count() else await pg.inner_text("body")
      n=path.strip("/").replace("/","_"); await pg.screenshot(path=str(S/f"{n}.png"))
      ow=await pg.evaluate("document.documentElement.scrollWidth>innerWidth")
      print("==",path,pg.url,"overflow" if ow else "", "|", " ".join(t.split())[:300])
    print("ERRS",errs[:8]); await b.close()
asyncio.run(main())
