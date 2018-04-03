import subprocess
import re
from linearfit import linear_fit
from pca import pca
from load_file import get_file
from save_file import save_file

def decode2(param):
    keys = list(re.split(r'-', param))  # .remove('')
    keys.remove('')
    for i in range(len(keys)):
        keys[i] = '-'+keys[i]

    return keys
def decode(param_received):
    newparams = {}
    # k, G, g, b, n
    param_map = ["g","G","k","n","b"]
    param_list = param_received.split(",")
    strip_list = [item.strip() for item in param_list]
    for idx, param in enumerate(strip_list):
        if param in param_map:
            if (param == "G" or param == "n") :
                newparams[param] = strip_list[idx+1]
            elif param == "b":
                newparams[param] = float(strip_list[idx+1])
            else:
                newparams[param] = int(strip_list[idx+1])
    return newparams
def update_params(reg, spec):

    #newparams = decode(spec["params"])

    #newparams = spec["params"]

    #for key, value in newparams.items():
    #    if value!= '':
    #        for msc in reg.mscs:
    #            msc["params"][key] = value

    reg.name = spec["name"]
    reg.version = spec["new_version"]

    keys = list(re.split(r'-', spec['params']))  # .remove('')
    keys.remove('')
    for i in range(len(keys)):
        keys[i] = '-'+keys[i]

    return keys


def compute(spec, data_dir):
    print(spec)

    regulus = get_file(spec = spec, dir = data_dir)
    param = update_params(regulus, spec)
    dims = len(regulus.dims)
    updated_json = save_file('',regulus,dir = data_dir)

    status = {}
    status = subprocess.run(['python', 'create_reg.py', '-d', str(dims), updated_json] + param)

    linear_fit(updated_json)
    pca(updated_json)

    print("New Structure is available")
    return status.returncode


if __name__ == '__main__':
    pass
