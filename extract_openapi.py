import json
import sys

with open(r'c:\Users\elija\OneDrive\Desktop\remix-of-remix-of-isp-operations-hub\src\lib\openapi (2).json', 'r') as f:
    data = json.load(f)

result = {}
paths_to_find = [
    '/api/v1/inventory/turnover-analysis',
    '/api/v1/inventory/dead-stock',
    '/api/v1/inventory/valuation'
]

for path in paths_to_find:
    if path in data['paths']:
        result[path] = data['paths'][path]

print(json.dumps(result, indent=2))
