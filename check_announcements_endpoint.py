import json

try:
    with open(r'd:\Siteler\skylab-superadmin\backend_datalari\backend.md', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    paths = data.get('paths', {})
    announcement_path = paths.get('/api/announcements/', {})
    post_method = announcement_path.get('post', {})
    
    if post_method:
        print("POST /api/announcements/ found.")
        print("Request Body:")
        content = post_method.get('requestBody', {}).get('content', {})
        for content_type, details in content.items():
            print(f"- Content-Type: {content_type}")
            schema = details.get('schema', {})
            print(f"  Schema Type: {schema.get('type')}")
            if schema.get('properties'):
                print("  Properties:")
                for prop, prop_details in schema.get('properties', {}).items():
                    print(f"    - {prop}: {prop_details.get('type')}")
    else:
        print("POST /api/announcements/ NOT found.")

except Exception as e:
    print(f"Error: {e}")
