import json
with open(r'c:\Users\elija\OneDrive\Desktop\remix-of-remix-of-isp-operations-hub\src\lib\openapi (2).json', 'r') as f:
    data = json.load(f)

for path in data['paths']:
    # Check for paths that might be related to inventory but maybe misspelled or structured differently
    if '/inventory/' in path:
        print(f"{path}: {list(data['paths'][path].keys())}")
