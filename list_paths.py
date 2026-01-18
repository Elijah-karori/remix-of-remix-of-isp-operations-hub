import json
with open(r'c:\Users\elija\OneDrive\Desktop\remix-of-remix-of-isp-operations-hub\src\lib\openapi (2).json', 'r') as f:
    data = json.load(f)

for path in data['paths']:
    if path.startswith('/api/v1/inventory/suppliers/'):
        print(path)
