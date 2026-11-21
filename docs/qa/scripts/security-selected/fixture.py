import json,os,sys,requests
from pathlib import Path
s=json.loads(Path('/root/.cache/lovable-auth/session.json').read_text())['session'];uid=s['user']['id']
u=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/';h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token'],'Prefer':'return=minimal'}
def request(method,table,payload,params=None):
 r=requests.request(method,u+table,headers=h,json=payload,params=params,timeout=20)
 assert r.status_code in (200,201,204), f'{table}: {r.status_code}, {r.json().get("code") if r.content else ""}'
if sys.argv[1]=='create':
 request('POST','pets',{'id':'qa-selected-security-pet','owner_id':uid,'owner_name':'Security QA synthetic','name':'QA synthetic','species':'Perro','breed':'QA','age':'QA','allergies':''})
 request('POST','staff_members',{'id':'qa-selected-security-staff','user_id':uid,'name':'Security QA synthetic','short':'QA','role':'Auxiliar','zone':'QA','status':'disponible','skills':[],'load':0})
 request('POST','visits',{'id':'qa-selected-security-visit','pet_id':'qa-selected-security-pet','staff_id':'qa-selected-security-staff','service':'Security QA only','date':'2026-11-21','time':'00:00','status':'pendiente','zone':'QA','address':'Synthetic security fixture','step':'programada','prep':[]})
 for kind,visit in [('visit','qa-selected-security-visit'),('standalone',None)]:
  request('POST','field_files',{'path':uid+'/security-selected-'+kind+'.txt','user_id':uid,'visit_id':visit,'name':'Synthetic metadata only','mime':'text/plain','size_bytes':1})
 print('Created isolated synthetic metadata; no objects uploaded')
else:
 request('PATCH','visits',{'staff_id':None},params={'id':'eq.qa-selected-security-visit'})
 print('Revoked synthetic visit assignment')
