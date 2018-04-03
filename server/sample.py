import subprocess
import numpy as np
from pathlib import Path
import testfun
from load_file import get_file
from linearfit import linear_fit
from save_file import save_file
from pca import pca
from Predictor import Predictor
from ackley import calc_ackley,saveackley
from Hartmann import calc_Hartmann, saveHart
import csv
import shutil

sim_dir = 'temp'
sim_out = 'new_sample_outputs.csv'
sim_in = 'new_sample_inputs.csv'
'''
def pts2json(reg):
    dims = reg.dims
    pts = reg.new_samples
    measures = reg.measures
    out = []
    for pt in pts:
        cur = {}
        i = 0
        for dim in dims:
            cur[dim] = pt[i]
            i = i+1
        for measure in measures:
            cur[measure] = pt[i]
            i = i+1
        out.append(cur)
    return out
'''

def pts2json(pts, dims, measures):
    #dims = reg.dims
    #pts = reg.new_samples
    #measures = reg.measures
    out = []
    for pt in pts:
        cur = {}
        i = 0
        for dim in dims:
            cur[dim] = pt[i]
            i = i+1
        for measure in measures:
            cur[measure] = pt[i]
            i = i+1
        out.append(cur)
    return out
def extract_input(data, dims):
    new_sample_input = [[ptdict[inputdim] for inputdim in dims] for ptdict in data]
    print("NEW_SAMPLE_INPUT", new_sample_input)
    return new_sample_input

def create_reg(spec, data_dir):
    regulus = get_file(spec=spec, dir=data_dir)
    return regulus

    #reg_file.save_sample_inputs(sim_in)

    #sample_input = reg_file.report_sample_input()
    #msg = sample(reg_file, sample_input)
    #if msg == 0:
    #    return 0
    #else:
    #    reg_file.add_pts_from_csv(sim_dir+'/'+sim_out)
    #    print("New Results are available")
    #    return reg_file
'''
def sample(reg_file, sample_input):

    if reg_file.name == 'deployment':
        subprocess.run(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p',sim_in, '-r', sim_out], check=True)
        return 1
    elif reg_file.name == 'test':
        new_input = testfun.load_input(sample_input)
        new_data = testfun.generateres(new_input)
        testfun.savefile(new_data, sim_dir, sim_out)
        return 1
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
        return 1
    elif 'ackley' in reg_file.name:
        out = calc_ackley(sample_input)
        path = Path(sim_dir)
        if not path.exists():
            path.mkdir()
        saveackley(sim_dir+'/'+sim_out, out)
        return 1
    elif 'hart' in reg_file.name.lower():
        out = calc_Hartmann(sample_input)
        path = Path(sim_dir)
        if not path.exists():
            path.mkdir()
        saveHart(sim_dir + '/' + sim_out, out)
        return 1
    else:
        print("can't resample for " + reg_file.name)
        #exit(255)
        return 0
'''
def save_samples(data, filename):
    with open(filename, 'w',newline='') as f:
        report = csv.writer(f, delimiter=',')
        report.writerows(data)

def sample(regulus, spec):
    dims = regulus['dims']
    #measures = regulus['measures']
    #sim_method = regulus['sim_method']
    new_inputs = extract_input(spec['pts'], dims)
    result = run_simulation(new_inputs,regulus)
    if result ==1:
        with open(sim_dir+'/'+sim_out, newline='') as csvfile:
        #with open(filename, newline='') as csvfile:
            reader = csv.reader(csvfile, delimiter=',')
            header = next(reader)
            data = [[float(x) for x in row] for row in reader]
    shutil.rmtree(sim_dir)

    return data

def run_simulation(sample_input,regulus):
    sim_method = regulus['sim_method']
    if sim_method == 'deployment':
        save_samples(sample_input, (sim_dir+'/'+sim_in))
        subprocess.run(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p',(sim_dir+'/'+sim_in), '-r', sim_out], check=True)
        return 1
    elif sim_method == 'test':
        new_input = testfun.load_input(sample_input)
        new_data = testfun.generateres(new_input)
        testfun.savefile(new_data, sim_dir, sim_out)
        return 1
    elif 'pnnl' in sim_method.lower():
        data = np.array(regulus['pts'])
        X = data[:, :-1]
        y = data[:, -1]
        model = Predictor(X, y)
        new_data = model.predict(sample_input)
        path = Path(sim_dir)
        if not path.exists():
            path.mkdir()
        np.savetxt(sim_dir / Path(sim_out), np.hstack((np.array(sample_input), np.atleast_2d(new_data).T)),
                   delimiter=',')
        return 1
    elif 'ackley' in sim_method.lower():
        out = calc_ackley(sample_input)
        path = Path(sim_dir)
        if not path.exists():
            path.mkdir()
        saveackley(sim_dir+'/'+sim_out, out)
        return 1
    elif 'hart' in sim_method.lower():
        out = calc_Hartmann(sample_input)
        path = Path(sim_dir)
        if not path.exists():
            path.mkdir()
        saveHart(sim_dir + '/' + sim_out, out)
        return 1
    else:
        print("can't resample for " + sim_method)
        #exit(255)
        return 0

    #print('simulation code here')

def add_pts(regulus,pts):
    regulus['pts'] = regulus['pts'] + pts
    return regulus

def post_process(regulus,data_dir):
    try:
        updated_json = save_file('', regulus, dir=data_dir)
        dims = len(regulus.dims)
        status = subprocess.run(['python', 'create_reg.py', '-d', str(dims), updated_json])

        linear_fit(updated_json)
        pca(updated_json)
        return status.returncode

    except Exception as e:
        print(e)
        print("Error, Recompute MSC Not Finished")
        return 1

def resample2(spec, data_dir):
    regulus = create_reg(spec,data_dir)
    newsamples = sample(regulus, spec)
    regulus = add_pts(regulus,newsamples)
    return post_process(regulus, data_dir)

def get_sample(spec, data_dir):
    regulus = create_reg(spec,data_dir)
    newsamples = sample(regulus, spec)
    dims = regulus['dims']
    measures = regulus['measures']
    return pts2json(newsamples, dims, measures)#compute_msc(regulus, data_dir)

if __name__ == '__main__':
    pass
