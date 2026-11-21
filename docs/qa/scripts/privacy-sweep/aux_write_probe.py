import json,os,requests,uuid
s=json.load(open('client-session.json'))['session']; uid=s['user']['id']
u=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/'
h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token'],'Content-Type':'application/json','Prefer':'return=representation'}
LUIS='62c8ff25-f100-465f-a8bb-4cb01afa13dd'
P=lambda t,b:requests.post(u+t,headers=h,json=b).status_code
U=lambda t,q,b:requests.patch(u+t+'?'+q,headers=h,json=b).text[:40]
print('aux create course',P('courses',{'id':'qa-'+uuid.uuid4().hex[:6],'title':'x','role':'auxiliar'}))
print('aux edit courses',U('courses','id=neq.zzz',{'required':False}))
print('aux notify luis',P('notifications',{'id':'qa-'+uuid.uuid4().hex[:6],'user_id':LUIS,'title':'x','body':'x'}))
print('aux mark broadcast',U('notifications','user_id=is.null',{'read':True}))
print('aux pet for luis',P('pets',{'id':'qa-'+uuid.uuid4().hex[:6],'owner_id':LUIS,'owner_name':'x','name':'x','species':'x','breed':'x','age':'1','allergies':''}))
print('aux delete slots',requests.delete(u+'specialist_slots?id=neq.00000000-0000-0000-0000-000000000000',headers=h).text[:40])
r=requests.get(u+'courses',headers={**h,'Prefer':'count=exact','Range':'0-0'});print('aux still reads courses',r.headers.get('content-range'))
