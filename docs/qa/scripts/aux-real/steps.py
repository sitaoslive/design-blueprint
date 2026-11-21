import asyncio, json, os
from pathlib import Path
from playwright.async_api import async_playwright
S=Path("s"); m=json.load(open(os.path.expanduser("~/.cache/lovable-auth/session.json")))
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True); c=await b.new_context(viewport={"width":390,"height":844}); pg=await c.new_page()
    errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto("http://localhost:8080"); await pg.evaluate("([k,v])=>localStorage.setItem(k,v)",[m["storage_key"],json.dumps(m["session"])])
    await pg.goto("http://localhost:8080/auxiliar/visitas/qa-v1/preparacion"); await pg.wait_for_timeout(2500)
    for lbl in ["Preparación lista","Iniciar desplazamiento","Registrar llegada","Iniciar servicio","Finalizar servicio","Solicitar cierre administrativo"]:
      btn=pg.get_by_role("button",name=lbl)
      if not await btn.count(): print("NO BUTTON",lbl, [ (await x.inner_text()) for x in await pg.get_by_role("button").all()][:25]); break
      await btn.first.click(); await pg.wait_for_timeout(2000)
      toast=await pg.locator("[data-sonner-toast]").all_inner_texts()
      st=" ".join((await pg.inner_text("main")).split())
      i=st.find("Estado de la visita"); print(lbl,"->",st[i:i+70],"|",toast)
    await pg.screenshot(path=str(S/"steps_end.png")); print("ERRS",errs); await b.close()
asyncio.run(main())
