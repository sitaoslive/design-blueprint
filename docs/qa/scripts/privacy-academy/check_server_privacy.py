import json,os,requests
from pathlib import Path
OUT=Path('/tmp/browser/journey-security')
s=json.loads((OUT/'viewer-session.json').read_text())['session'];u=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/'
h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token']};uid=s['user']['id'];results=[]
def check(name,ok):
 results.append({'name':name,'passed':bool(ok)})
 assert ok,name
targets={'is_clinical':'62c8ff25-f100-465f-a8bb-4cb01afa13dd','can_refer':'62c8ff25-f100-465f-a8bb-4cb01afa13dd','is_aux_only':'061102d1-15f3-4ef8-9419-771d51a02b4b'}
for name,target in targets.items():
 r=requests.post(u+'rpc/'+name,headers=h,json={'_uid':target},timeout=20)
 check('client cannot discover another '+name,r.status_code==200 and r.json() is False)
 r=requests.post(u+'rpc/'+name,headers=h,json={'_uid':uid},timeout=20)
 check('client own '+name+' remains false',r.status_code==200 and r.json() is False)
 r=requests.post(u+'rpc/'+name,headers={'apikey':h['apikey']},json={'_uid':target},timeout=20)
 check('anonymous '+name+' denied',r.status_code>=400)
for table in ['user_roles','visits','pets','course_lessons','lesson_completions','records']:
 r=requests.get(u+table,headers=h,params={'select':'*','limit':5},timeout=20);check(table+' query no recursion',r.status_code==200)
target=json.loads((OUT/'target-session.json').read_text())['session']['user']['id']
r=requests.post(u+'rpc/set_account_profile',headers=h,json={'_user_id':target,'_profile':'administrador'},timeout=20);check('client cannot grant administrator',r.status_code>=400)
(OUT/'privacy-client.json').write_text(json.dumps(results,indent=2));print(len(results),'real client and anonymous checks passed')
