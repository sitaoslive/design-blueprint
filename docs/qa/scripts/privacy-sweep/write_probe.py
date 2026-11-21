import json,os,sys,requests,uuid
f=sys.argv[1]; s=json.load(open(f))['session']; uid=s['user']['id']
u=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/'
h={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+s['access_token'],'Content-Type':'application/json','Prefer':'return=representation'}
LUIS='62c8ff25-f100-465f-a8bb-4cb01afa13dd'
def rpc(n,b): r=requests.post(u+'rpc/'+n,headers=h,json=b,timeout=20); return r.status_code,r.text[:140]
def ins(t,b): r=requests.post(u+t,headers=h,json=b,timeout=20); return r.status_code,r.text[:140]
def upd(t,q,b): r=requests.patch(u+t+'?'+q,headers=h,json=b,timeout=20); return r.status_code,r.text[:140]
probes={
 'rpc offer_is_live rf1':rpc('offer_is_live',{'_ref':'rf1','_offer':'x'}),
 'rpc field_day_pending sofia':rpc('field_day_pending',{'_staff':'sofia','_day':'2026-11-21'}),
 'rpc field_billing_balance v4':rpc('field_billing_balance',{'_visit':'v4'}),
 'rpc consultant_metrics':rpc('consultant_metrics',{}),
 'rpc can_access_field_visit v4':rpc('can_access_field_visit',{'_visit':'v4'}),
 'rpc is_director luis':rpc('is_director',{'_uid':LUIS}),
 'rpc inventory_availability':rpc('inventory_availability',{}),
 'rpc reserve_supply':rpc('reserve_supply',{'_item':'in1','_visit':'v4','_qty':1,'_key':'probe-'+uuid.uuid4().hex}),
 'rpc field_task_transition':rpc('field_task_transition',{'_id':'t1','_stage':'done','_version':1,'_reason':''}),
 'rpc apply_field_handover':rpc('apply_field_handover',{}),
 'rpc set_account_profile self admin':rpc('set_account_profile',{'_user_id':uid,'_profile':'administrador'}),
 'rpc quality_checked_command':rpc('quality_checked_command',{'command':{'type':'resolve_complaint'}}),
 'ins user_roles self admin':ins('user_roles',{'user_id':uid,'role':'administrador'}),
 'ins pets for luis':ins('pets',{'id':'probe-'+uuid.uuid4().hex[:6],'owner_id':LUIS,'owner_name':'x','name':'x','species':'x','breed':'x','age':'1','allergies':''}),
 'ins pet_caregivers luna':ins('pet_caregivers',{'pet_id':'luna','caregiver_id':uid,'caregiver_name':'x','tasks':'x'}),
 'ins visits luna':ins('visits',{'id':'probe-'+uuid.uuid4().hex[:6],'pet_id':'luna','service':'x','date':'2026-12-01','time':'10:00','status':'pendiente','zone':'x','address':'x','step':'x','prep':[]}),
 'ins notifications luis':ins('notifications',{'id':'probe-'+uuid.uuid4().hex[:6],'user_id':LUIS,'title':'x','body':'x'}),
 'ins records director':ins('records',{'kind':'nota','scope':'director','title':'x','detail':'x','status':'x','data':{}}),
 'ins records staff':ins('records',{'kind':'nota','scope':'staff','title':'x','detail':'x','status':'x','data':{}}),
 'ins payments verificado':ins('payments',{'id':'probe-'+uuid.uuid4().hex[:6],'client_id':uid,'client':'x','concept':'x','amount':1,'status':'verificado','date':'2026-11-21'}),
 'ins customer_memory other':ins('customer_memory',{'client_id':LUIS,'kind':'x','content':'x','source':'cliente','validation':'validada','sensitivity':'normal'}),
 'ins referral_choices rf1':ins('referral_choices',{'referral_id':'rf1','offer_id':'x','owner_id':uid}),
 'ins staff_messages':ins('staff_messages',{'from_user':uid,'from_name':'x','body':'x'}),
 'ins specialist_reports':ins('specialist_reports',{'author':uid,'title':'x','body':'x'}),
 'ins audit_log':ins('audit_log',{'actor':uid,'action':'x'}),
 'ins knowledge_articles':ins('knowledge_articles',{'title':'x','category':'x','content':'x','source':'x','status':'aprobado'}),
 'ins conversations':ins('conversations',{'channel':'whatsapp','contact_name':'x','contact_phone':'1'}),
 'ins simulations':ins('simulations',{'sim_type':'x','title':'x','params':{},'result':{},'status':'aprobado'}),
 'upd profiles luis':upd('profiles','id=eq.'+LUIS,{'display_name':'hack'}),
 'upd feature_flags':upd('feature_flags','key=neq.zzz',{'enabled':True}),
 'upd org_settings':upd('org_settings','key=neq.zzz',{'value':{}}),
}
for k,v in probes.items(): print(f"{k:38} {v[0]} {v[1]}")
