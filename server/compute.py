import subprocess
import testfun
from regulus_file import RegulusFile
from linearfit import linearfit

def update_params(reg, spec):

    newparams = spec["params"]
    for key, value in newparams.items():
        if value!= '':
            for msc in reg.mscs:
                msc["params"][key] = value

    reg.name = spec["name"]
    reg.version = spec["new_version"]


def recompute(spec, data_dir):
    reg_file = RegulusFile()
    reg_file.load_reg_json(spec=spec, dir=data_dir)

    update_params(reg_file, spec)
    dims = len(reg_file.dims)
    name = reg_file.name
    updated_json = reg_file.save_json()

    status = {}

    status = subprocess.run(['python', 'post.py', '-d', str(dims), '--name', name, '--p', updated_json])
    #if reg_file.name == 'test':
    #    status = subprocess.run(['python', 'post.py', '-d', dims, '--name', name, '-p', 1, updated_json])
    #elif reg_file.name == 'deployment':
    #    status = subprocess.run(['python', 'post.py', '-d', dims, '--name', name, '-p', 1, updated_json])
    #else:
    #    print("Can't resample for selected data")
    #    exit(255)

    linearfit(updated_json)

    print("New Structure is available")
    return status.returncode


if __name__ == '__main__':
    pass
