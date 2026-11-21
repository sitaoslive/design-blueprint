"""Real Data API regression. Run with --session <minted file> --profile cliente|auxiliar|administrador.
Requires VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY; never prints tokens.
Read-only: no fixtures, role changes, or cleanup. Targets must have the indicated positive roles.
"""
import argparse
import json
import os
from pathlib import Path
import requests

parser = argparse.ArgumentParser()
parser.add_argument('--session', required=True)
parser.add_argument('--profile', choices=['cliente', 'auxiliar', 'administrador'], required=True)
parser.add_argument('--clinical-target', required=True)
parser.add_argument('--auxiliary-target', required=True)
parser.add_argument('--output', required=True)
args = parser.parse_args()
minted = json.loads(Path(args.session).read_text())
session = minted['session']
url = os.environ['VITE_SUPABASE_URL'].rstrip('/') + '/rest/v1/'
headers = {'apikey': os.environ['VITE_SUPABASE_PUBLISHABLE_KEY'], 'Authorization': 'Bearer ' + session['access_token']}
results = []

def check(name, ok):
    results.append({'name': name, 'passed': bool(ok)})
    assert ok, name

for name, target, own in [
    ('is_clinical', args.clinical_target, False),
    ('is_aux_only', args.auxiliary_target, args.profile == 'auxiliar'),
    ('can_refer', args.clinical_target, args.profile == 'administrador'),
]:
    response = requests.post(url + 'rpc/' + name, headers=headers, json={'_uid': target}, timeout=20)
    check(f'{args.profile}: authorized target lookup {name}', response.status_code == 200 and response.json() is (args.profile == 'administrador'))
    response = requests.post(url + 'rpc/' + name, headers=headers, json={'_uid': session['user']['id']}, timeout=20)
    check(f'{args.profile}: own status {name}', response.status_code == 200 and response.json() is own)
    response = requests.post(url + 'rpc/' + name, headers=headers, json={'_uid': '00000000-0000-0000-0000-000000000001'}, timeout=20)
    check(f'{args.profile}: unknown target {name}', response.status_code == 200 and response.json() is False)
    response = requests.post(url + 'rpc/' + name, headers={'apikey': headers['apikey']}, json={'_uid': target}, timeout=20)
    check(f'anonymous: denied {name}', response.status_code >= 400)
    response = requests.post(url + 'rpc/' + name, headers=headers, json={'_uid': None}, timeout=20)
    check(f'{args.profile}: null target discloses nothing {name}', response.status_code == 200 and response.json() is not True)

Path(args.output).parent.mkdir(parents=True, exist_ok=True)
Path(args.output).write_text(json.dumps(results, ensure_ascii=False, indent=2))
print(f'{len(results)} permission assertions passed for {args.profile}')