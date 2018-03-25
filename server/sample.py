import subprocess
import numpy as np
from pathlib import Path

import testfun
from regulus_file import RegulusFile
from linearfit import linear_fit
from Predictor import Predictor

sim_dir = 'temp'
sim_out = 'new_sample_outputs.csv'
sim_in = 'new_sample_inputs.csv'


def sample(spec, data_dir):
    reg_file = RegulusFile()
    reg_file.load_reg_json(spec=spec, dir=data_dir)
    reg_file.update(spec=spec)
    reg_file.save_sample_inputs(sim_in)

    sample_input = reg_file.report_sample_input()

    if reg_file.name == 'deployment':
        subprocess.run(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p',sim_in, '-r', sim_out], check=True)
    elif reg_file.name == 'test':
        new_input = testfun.load_input(sample_input)
        new_data = testfun.generateres(new_input)
        testfun.savefile(new_data, sim_dir, sim_out)
    elif 'pnnl' in reg_file.name.lower():
        data = np.array(reg_file.pts)
        X = data[:, :-1]
        y = data[:, -1]
        model = Predictor(X, y)
        new_data = model.predict(sample_input)
        path = Path(sim_dir)
        if not path.exists():
            path.mkdir()
        np.savetxt(sim_dir / Path(sim_out), np.hstack((np.array(sample_input), np.atleast_2d(new_data).T)),
                   delimiter=',')
    else:
        print("can't resample for " + reg_file.name)
        exit(255)

    dims = len(reg_file.dims)
    name = reg_file.name

    reg_file.add_pts_from_csv(sim_dir+'/'+sim_out)
    updated_dataset = reg_file.save_all_pts()
    updated_json = reg_file.save_json()

    status = subprocess.run(['python', 'post.py', '-d', str(dims), '--name', name, '--p', updated_json])
    linear_fit(updated_json)

    print("New Results are available")
    return status.returncode


def sample_without_processing(spec, data_dir):
    reg_file = RegulusFile()
    reg_file.load_reg_json(spec=spec, dir=data_dir)
    reg_file.update(spec=spec)
    reg_file.save_sample_inputs(sim_in)

    sample_input = reg_file.report_sample_input()

    if reg_file.name == 'deployment':
        subprocess.run(
            ['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p', sim_in, '-r', sim_out],
            check=True)
    elif reg_file.name == 'test':
        new_input = testfun.load_input(sample_input)
        new_data = testfun.generateres(new_input)
        testfun.savefile(new_data, sim_dir, sim_out)
    elif 'pnnl' in reg_file.name.lower():
        data = np.array(reg_file.pts)
        X = data[:, :-1]
        y = data[:, -1]
        model = Predictor(X, y)
        new_data = model.predict(sample_input)
        np.savetxt(sim_dir + '/' + sim_out,
                   np.hstack((np.array(sample_input), np.atleast_2d(new_data).T)), delimiter=',')
    else:
        print("can't resample for " + reg_file.name)
    reg_file.add_pts_from_csv(sim_dir + '/' + sim_out)
    updated_dataset = reg_file.save_all_pts()
    updated_json = reg_file.save_json()

    print("New Results are available")
    # Adding a dummy subprocess here?



if __name__ == '__main__':
    pass
