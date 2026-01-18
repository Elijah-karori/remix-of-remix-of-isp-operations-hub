import json
with open(r'c:\Users\elija\OneDrive\Desktop\remix-of-remix-of-isp-operations-hub\src\lib\openapi (2).json', 'r') as f:
    data = json.load(f)

result = {}
search_terms = ['/api/v1/inventory/suppliers', '/api/v1/projects/products/search']

for path in data['paths']:
    for term in search_terms:
        if term in path:
            result[path] = data['paths'][path]

print(json.dumps(result, indent=2))
