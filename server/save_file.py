import json

def save_file(filename, regulus, dir = None):
    if dir == None:
        with open(filename, 'w') as f:
            json.dump(regulus, f, indent=2)
    else:
        name = regulus['name']
        version = regulus['version']
        filename = str(dir / (name + '.' + version + '.json'))
        save_file(filename,regulus)
    return filename