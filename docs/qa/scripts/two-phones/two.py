import asyncio, json, os
from playwright.async_api import async_playwright
m=json.load(open(os.path.expanduser("~/.cache/lovable-auth/session.json")))
U="http://localhost:8080/auxiliar/visitas/qa-v3/preparacion"
async def phone(b):
  c=await b.new_context(viewport={"width":390,"height":844}); pg=await c.new_page(); pg.set_default_timeout(20000)
  await pg.goto("http://localhost:8080"); await pg.evaluate("([k,v])=>localStorage.setItem(k,v)",[m["storage_key"],json.dumps(m["session"])])
  await pg.goto(U); await pg.wait_for_timeout(3000); return pg
def state(t): i=t.find("Estado de la visita en campo"); return t[i+29:i+50]
async def snap(pg,tag):
  t=" ".join((await pg.inner_text("main")).split()); toasts=await pg.locator("[data-sonner-toast]").all_inner_texts()
  print(tag,"| estado:",state(t),"| avisos:",toasts); return t
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True); A,B=await asyncio.gather(phone(b),phone(b))
    print("1) ambos pulsan «Iniciar preparación» a la vez")
    await asyncio.gather(A.get_by_role("button",name="Iniciar preparación").click(),B.get_by_role("button",name="Iniciar preparación").click())
    await A.wait_for_timeout(3000); await snap(A,"  A"); await snap(B,"  B")
    print("2) A marca un insumo; B marca otro sin recargar")
    await asyncio.gather(A.locator("label",has_text="Vacuna").locator("input").click(),B.locator("label",has_text="Jeringa").locator("input").click()); await A.wait_for_timeout(3000)
    await A.reload(); await A.wait_for_timeout(3000)
    print("  A tras recargar, marcados:",[await A.locator("label",has_text=x).locator("input").is_checked() for x in ["Vacuna","Jeringa"]])
    print("3) A avanza; B (desactualizado) intenta el mismo paso")
    await A.get_by_role("button",name="Preparación lista").click(); await A.wait_for_timeout(2500)
    if await B.get_by_role("button",name="Preparación lista").count():
      await B.get_by_role("button",name="Preparación lista").click(); await B.wait_for_timeout(3000)
    await snap(A,"  A"); await snap(B,"  B")
    for x in (A,B): await x.screenshot(path=f"{'A' if x is A else 'B'}.png")
    await b.close()
asyncio.run(main())
