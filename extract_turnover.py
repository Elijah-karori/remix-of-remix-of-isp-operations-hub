import json
with open(r'c:\Users\elija\OneDrive\Desktop\remix-of-remix-of-isp-operations-hub\src\lib\openapi (2).json', 'r') as f:
    data = json.load(f)
path = '/api/v1/inventory/turnover-analysis'
if path in data['paths']:
    print(json.dumps(data['paths'][path], indent=2))
