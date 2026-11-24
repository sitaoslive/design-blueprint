import json

with open('types/supabase.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

section = None
tables = []
views = []
functions = []

for line in lines:
    stripped = line.strip()
    if stripped.startswith('Tables: {'):
        section = 'Tables'
        continue
    elif stripped.startswith('Views: {'):
        section = 'Views'
        continue
    elif stripped.startswith('Functions: {'):
        section = 'Functions'
        continue
    elif stripped.startswith('Enums: {') or stripped.startswith('CompositeTypes: {'):
        section = 'Other'
        continue

    # Look for table/view/function names indented by 6 spaces: '      name: {'
    if line.startswith('      ') and not line.startswith('        ') and ': {' in line:
        name = line.split(':')[0].strip().strip('"').strip("'")
        if section == 'Tables':
            tables.append(name)
        elif section == 'Views':
            views.append(name)
        elif section == 'Functions':
            functions.append(name)

print(f"Total Tables: {len(tables)}")
print(f"Total Views: {len(views)}")
print(f"Total Functions: {len(functions)}")

with open('parsed_schema_inventory.json', 'w', encoding='utf-8') as out:
    json.dump({'tables': tables, 'views': views, 'functions': functions}, out, indent=2)
