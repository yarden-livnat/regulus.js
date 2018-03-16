import json

def load(file):
    data = json.loads(file)
    print(data)
    return