import subprocess
import testfun
from regulus_file import RegulusFile

from linearfit import linear_fit



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


def compute(spec, data_dir):
    print(spec)

    reg_file = RegulusFile()
    reg_file.load_reg_json(spec=spec, dir=data_dir)

    update_params(reg_file, spec)

    dims = len(reg_file.dims)
    name = reg_file.name
    updated_json = reg_file.save_json(dir=data_dir)

    status = {}
    status = subprocess.run(['python', 'create_reg.py', '-d', str(dims), spec['params'],updated_json])

    linear_fit(updated_json)

    print("New Structure is available")
    return status.returncode


if __name__ == '__main__':
    pass
