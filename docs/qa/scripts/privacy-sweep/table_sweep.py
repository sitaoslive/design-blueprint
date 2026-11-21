import json,os,sys,requests
role=sys.argv[1]; f=sys.argv[2]
s=json.load(open(f))['session']
u=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/'
h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token'],'Prefer':'count=exact'}
tables=sys.argv[3].split(',')
for t in tables:
  r=requests.get(u+t,headers={**h,'Range':'0-0'},params={'select':'*'},timeout=20)
  cnt=r.headers.get('content-range','?')
  print(f"{t:30} {r.status_code} {cnt}")
