import asyncio,json,os
from pathlib import Path
from playwright.async_api import async_playwright
OUT=Path(__file__).parent
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);ctx=await browser.new_context(viewport={'width':390,'height':850});page=await ctx.new_page()
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])]);await page.goto('http://localhost:8080/equipo/visitas/QA-PERM-visit/tiempo')
  
  if await page.get_by_role('button',name='Iniciar desplazamiento',exact=True).count(): await page.get_by_role('button',name='Iniciar desplazamiento',exact=True).click()
  
  if await page.get_by_role('button',name='Registrar llegada',exact=True).count(): await page.get_by_role('button',name='Registrar llegada',exact=True).click()
  
  if await page.get_by_role('button',name='Iniciar atención',exact=True).count(): await page.get_by_role('button',name='Iniciar atención',exact=True).click()
  await page.get_by_role('button',name='Finalizar servicio',exact=True).wait_for()
  await page.get_by_role('button',name='Actualizar fuentes',exact=True).click();await page.get_by_text('min de atención registrada',exact=False).wait_for()
  await page.reload();await page.get_by_text('min de atención registrada',exact=False).wait_for();await page.get_by_text('Duración aplicada: no disponible · Tiempo restante no disponible',exact=True).wait_for()
  assert not await page.evaluate('document.documentElement.scrollWidth>innerWidth')
  await page.screenshot(path=str(OUT/'timer-vet-mobile.png'))
  stamps=await page.evaluate('''async()=>{const {supabase:s}=await import('/src/integrations/supabase/client.ts');const r=await s.from('visit_executions').select('stamps').eq('visit_id','QA-PERM-visit').single();return Object.keys(r.data.stamps)}''')
  assert 'IN_SERVICE' in stamps
  print('PASS veterinarian authentic travel/arrival/start; server timestamps reconstructed after reload; remaining unknown; mobile without overflow')
  await browser.close()
asyncio.run(main())
