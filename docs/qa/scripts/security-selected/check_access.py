import json,os,sys,requests
from pathlib import Path
session=json.loads(Path('/root/.cache/lovable-auth/session.json').read_text())['session']
url=os.environ['VITE_SUPABASE_URL'].rstrip('/')+'/rest/v1/'
headers={'apikey':os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'],'Authorization':'Bearer '+session['access_token']}
uid=session['user']['id']; phase=sys.argv[1]; results={}
def rpc(name,args):
 r=requests.post(url+'rpc/'+name,headers=headers,json=args,timeout=20)
 assert r.status_code==200, f'{name}: status {r.status_code}'
 return r.json()
def rows(table):
 r=requests.get(url+table,headers=headers,params={'select':'*'},timeout=20)
 assert r.status_code==200, f'{table}: status {r.status_code}'
 return r.json()
def check(name,actual,expected):
 results[name]=actual==expected
 assert actual==expected, name
other='62c8ff25-f100-465f-a8bb-4cb01afa13dd'
if phase in ['client','admin']:
 check('own_role',rpc('has_role',{'_user_id':uid,'_role':'cliente'}),True)
 for name,args in [('has_role',{'_user_id':other,'_role':'luis'}),('has_any_role',{'_user_id':other,'_roles':['administrador','luis']}),('is_director',{'_uid':other}),('is_ops',{'_uid':other}),('is_staff',{'_uid':other})]:
  check('other_account_'+name,rpc(name,args),phase=='admin')
 for table in ['feature_flags','staff_members','specialists']:
  check(table+'_scoped_read',len(rows(table))>0,phase=='admin')
 check('own_director',rpc('is_director',{'_uid':uid}),phase=='admin')
 # Main hydration queries must remain usable: no permission or recursion errors.
 for table in ['pets','visits','tasks','referrals','user_roles','quality_items','field_files']:
  rows(table);results[table+'_query_ok']=True
else:
 check('own_staff_role',rpc('is_staff',{'_uid':uid}),True)
 check('not_operations',rpc('is_ops',{'_uid':uid}),False)
 check('visit_evidence_current_assignment',rpc('can_read_field_file',{'_path':uid+'/security-selected-visit.txt'}),phase=='aux_assigned')
 check('standalone_uploader_preserved',rpc('can_read_field_file',{'_path':uid+'/security-selected-standalone.txt'}),True)
 check('unknown_evidence_denied',rpc('can_read_field_file',{'_path':uid+'/unknown.txt'}),False)
 visible={r['path'] for r in rows('field_files')}
 check('metadata_current_assignment',uid+'/security-selected-visit.txt' in visible,phase=='aux_assigned')
 for table in ['visits','staff_members','user_roles']:
  rows(table);results[table+'_query_ok']=True
Path('/tmp/security-selected/'+phase+'.json').write_text(json.dumps(results,indent=2)+'\n')
print(phase,':',len(results),'checks passed')
