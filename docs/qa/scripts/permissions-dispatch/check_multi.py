import asyncio,json,os
from playwright.async_api import async_playwright
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True);page=await browser.new_page()
  with open(os.path.expanduser('~/.cache/lovable-auth/session.json')) as f:m=json.load(f)
  await page.goto('http://localhost:8080');await page.evaluate('([k,v])=>localStorage.setItem(k,v)',[m['storage_key'],json.dumps(m['session'])])
  await page.goto('http://localhost:8080/equipo/visitas/QA-PERM-visit/tiempo')
  await page.get_by_text('min de atención registrada',exact=False).wait_for()
  result=await page.evaluate('''async()=>{const {supabase:s}=await import('/src/integrations/supabase/client.ts');const mine=await s.rpc('field_billing_balance',{_visit:'QA-PERM-visit'});const other=await s.rpc('field_billing_balance',{_visit:'v1'});return {ownUnknown:mine.data?.authorized===null,ownBalanceUnknown:mine.data?.balance===null,otherDenied:other.error!==null}}''')
  # Run once with combined ops roles and once with veterinarian only.
  assert result['ownUnknown'] and result['ownBalanceUnknown'] and result['otherDenied']
  print('PASS veterinary unrelated billing RPC denied; missing authorized amount and balance remain unknown')
  await browser.close()
asyncio.run(main())
