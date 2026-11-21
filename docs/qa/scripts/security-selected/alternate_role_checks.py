import os,json,requests
from pathlib import Path
s=json.loads(Path('/root/.cache/lovable-auth/session.json').read_text())['session'];h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token']}
u=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/rpc/'
results={}
for name,target in [('is_clinical','62c8ff25-f100-465f-a8bb-4cb01afa13dd'),('can_refer','62c8ff25-f100-465f-a8bb-4cb01afa13dd'),('is_aux_only','061102d1-15f3-4ef8-9419-771d51a02b4b')]:
 r=requests.post(u+name,headers=h,json={'_uid':target},timeout=20)
 assert r.status_code==200, f'{name} status {r.status_code}'
 results[name]={'status':r.status_code,'other_account_membership_revealed':r.json() is True}
 print(name,'other-account disclosure confirmed' if r.json() is True else 'not revealed')
Path('/tmp/security-selected/alternate-role-results.json').write_text(json.dumps(results,indent=2)+'\n')
