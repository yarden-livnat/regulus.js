import json

def save_file(filename, regulus):

    with open(filename, 'w') as f:
        json.dump(regulus, f, indent=2)