import asyncio
from playwright.async_api import async_playwright
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(headless=True); pg=await b.new_page(viewport={'width':390,'height':844}); pg.set_default_timeout(30000)
    await pg.goto('http://localhost:8080/demo',wait_until='networkidle'); await pg.locator('summary').click()
    await pg.locator('button',has_text='Veterinaria').first.click(); await pg.wait_for_timeout(1500)
    await pg.goto('http://localhost:8080/equipo/incidencias/nueva',wait_until='networkidle'); await pg.wait_for_timeout(800)
    print(" ".join((await pg.locator('main').inner_text()).split())[:300])
    await pg.screenshot(path='inc.png'); await b.close()
asyncio.run(main())
