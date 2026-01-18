import json
with open(r'c:\Users\elija\OneDrive\Desktop\remix-of-remix-of-isp-operations-hub\src\lib\openapi (2).json', 'r') as f:
    data = json.load(f)

schemas = ['DeadStockItem', 'InventoryTurnoverResponse', 'InventoryValuationResponse']
result = {}
for s in schemas:
    if s in data['components']['schemas']:
        result[s] = data['components']['schemas'][s]

print(json.dumps(result, indent=2))
