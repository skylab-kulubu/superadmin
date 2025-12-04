import json

try:
    with open(r'd:\Siteler\skylab-superadmin\backend_datalari\backend.md', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    paths = data.get('paths', {})
    session_path = paths.get('/api/sessions/', {})
    get_method = session_path.get('get', {})
    
    if get_method:
        print("GET /api/sessions/ found.")
        print("Parameters:")
        for param in get_method.get('parameters', []):
            print(f"- {param.get('name')} ({param.get('in')}): {param.get('schema', {}).get('type')}")
    else:
        print("GET /api/sessions/ NOT found.")

except Exception as e:
    print(f"Error: {e}")
