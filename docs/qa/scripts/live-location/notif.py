import asyncio, json
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True); m=json.load(open("luis.json"))
    pg=await (await b.new_context(viewport={"width":390,"height":844})).new_page(); pg.set_default_timeout(20000)
    await pg.goto("http://localhost:8080"); await pg.evaluate("([k,v])=>localStorage.setItem(k,v)",[m["storage_key"],json.dumps(m["session"])])
    await pg.goto("http://localhost:8080/luis"); await pg.wait_for_timeout(4000)
    t=" ".join((await pg.inner_text("main")).split()); print("inicio:", t[:200])
    await pg.get_by_label("Notificaciones").click(); await pg.wait_for_timeout(4000)
    print("notif:", " ".join((await pg.inner_text("main")).split())[:400]); await pg.screenshot(path="notif.png"); await b.close()
asyncio.run(main())
