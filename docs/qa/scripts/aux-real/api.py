import json,os,requests
m=json.load(open(os.path.expanduser("~/.cache/lovable-auth/session.json")))
U=os.popen("grep VITE_SUPABASE_URL /dev-server/.env | cut -d= -f2 | tr -d '\"'").read().strip()
K=os.popen("grep VITE_SUPABASE_PUBLISHABLE_KEY /dev-server/.env | cut -d= -f2 | tr -d '\"'").read().strip()
H={"apikey":K,"Authorization":"Bearer "+m["session"]["access_token"],"Content-Type":"application/json","Prefer":"return=representation"}
def r(meth,path,body=None):
  x=requests.request(meth,U+"/rest/v1/"+path,headers=H,json=body); return x.status_code, x.text[:160]
ex=requests.get(U+"/rest/v1/visit_executions?visit_id=eq.qa-v1&select=state,version",headers=H).json(); print("exec",ex)
v=ex[0]["version"]
#print("saltar a servicio (aux, propio):",r("PATCH",f"visit_executions?visit_id=eq.qa-v1&version=eq.{v}",{"state":"IN_SERVICE","version":v+1}))
print("ver visitas:",[x["id"] for x in requests.get(U+"/rest/v1/visits?select=id",headers=H).json()])
#print("crear ejecución en visita ajena v7:",r("POST","visit_executions",{"visit_id":"v7","state":"PREPARING","prep_checked":[]}))
print("cambiar cita ajena v7:",r("PATCH","visits?id=eq.v7",{"step":"en_camino"}))
print("cambiar estado oficial de su cita:",r("PATCH","visits?id=eq.qa-v1",{"status":"completada"}))
#print("incidencia propia:",r("POST","incidents",{"id":"qa-inc-1","title":"QA incidencia","detail":"prueba","severity":"media","status":"abierta","owner":"QA"}))
#print("mensaje sobre su visita:",r("POST","staff_messages",{"from_user":m["user_id"],"from_name":"QA","visit_id":"qa-v1","body":"QA prueba","urgent":False}))
#print("mensaje sobre visita ajena:",r("POST","staff_messages",{"from_user":m["user_id"],"from_name":"QA","visit_id":"v7","body":"QA ajena","urgent":False}))
print("pagos visibles:",r("GET","payments?select=id"))
def rpc(f,b):
  x=requests.post(U+"/rest/v1/rpc/"+f,headers=H,json=b); return x.status_code,x.text[:140]
items=requests.get(U+"/rest/v1/inventory_items?select=id&limit=1&order=id.desc",headers=H).json(); it=items[0]["id"]
print("apartar insumo visita propia:",rpc("reserve_supply",{"_item":it,"_visit":"qa-v1","_qty":1,"_key":"qa-res-1"}))
print("repetir mismo apartado:",rpc("reserve_supply",{"_item":it,"_visit":"qa-v1","_qty":1,"_key":"qa-res-1"}))
print("apartar en visita ajena:",rpc("reserve_supply",{"_item":it,"_visit":"v7","_qty":1,"_key":"qa-res-2"}))
