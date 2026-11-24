import os
import re
import json

migrations_dir = 'supabase/migrations'
migration_files = sorted(os.listdir(migrations_dir))

tables_created = set()
functions_created = set()
triggers_created = set()
rls_enabled_tables = set()

for mf in migration_files:
    if not mf.endswith('.sql'):
        continue
    with open(os.path.join(migrations_dir, mf), 'r', encoding='utf-8') as f:
        sql = f.read()
    
    # find CREATE TABLE
    cts = re.findall(r'CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?([a-zA-Z0-9_]+)', sql, re.IGNORECASE)
    for t in cts:
        tables_created.add(t)
        
    # find CREATE FUNCTION / OR REPLACE FUNCTION
    cfs = re.findall(r'CREATE\s+(?:OR\s+REPLACE\s+)?FUNCTION\s+(?:public\.)?([a-zA-Z0-9_]+)', sql, re.IGNORECASE)
    for fn in cfs:
        functions_created.add(fn)
        
    # find CREATE TRIGGER
    ctrs = re.findall(r'CREATE\s+TRIGGER\s+([a-zA-Z0-9_]+)', sql, re.IGNORECASE)
    for tr in ctrs:
        triggers_created.add(tr)
        
    # find ENABLE ROW LEVEL SECURITY
    rls = re.findall(r'ALTER\s+TABLE\s+(?:public\.)?([a-zA-Z0-9_]+)\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY', sql, re.IGNORECASE)
    for r in rls:
        rls_enabled_tables.add(r)

print(f"Total Migrations: {len(migration_files)}")
print(f"Unique Tables created in migrations: {len(tables_created)}")
print(f"Unique Functions created in migrations: {len(functions_created)}")
print(f"Unique Triggers created in migrations: {len(triggers_created)}")
print(f"Tables with RLS enabled explicitly: {len(rls_enabled_tables)}")

with open('parsed_migration_inventory.json', 'w', encoding='utf-8') as out:
    json.dump({
        'migration_count': len(migration_files),
        'tables': sorted(list(tables_created)),
        'functions': sorted(list(functions_created)),
        'triggers': sorted(list(triggers_created)),
        'rls_tables': sorted(list(rls_enabled_tables))
    }, out, indent=2)
