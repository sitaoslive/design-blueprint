import json

with open('real_supabase_tables.json', 'r', encoding='utf-8') as f:
    real_tables = json.load(f)

table_names = sorted([t['table_name'] for t in real_tables])

print(f"Total Real Tables: {len(table_names)}")
for i in range(0, len(table_names), 30):
    print(f"--- Chunk {i} to {i+30} ---")
    print(", ".join(table_names[i:i+30]))
