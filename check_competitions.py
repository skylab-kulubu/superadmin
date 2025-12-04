import json

try:
    with open(r'd:\Siteler\skylab-superadmin\backend_datalari\backend.md', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    paths = data.get('paths', {})
    competition_paths = [p for p in paths.keys() if 'competition' in p.lower()]
    
    print(f"Competition paths found: {len(competition_paths)}")
    for p in competition_paths:
        print(p)
        
except Exception as e:
    print(f"Error: {e}")
