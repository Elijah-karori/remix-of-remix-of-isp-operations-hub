import json
with open(r'c:\Users\elija\OneDrive\Desktop\remix-of-remix-of-isp-operations-hub\src\lib\openapi (2).json', 'r') as f:
    data = json.load(f)

for path in data['paths']:
    if 'suppliers' in path:
        print(f"{path}: {list(data['paths'][path].keys())}")
