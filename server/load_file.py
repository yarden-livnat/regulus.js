import json
from pathlib import Path
from topopy.MorseSmaleComplex import TopologicalObject
import numpy as np
import csv
from datetime import date
from getpass import getuser


### Takes in json or csv, returns a regulusfile

def create_from_csv(filename, name, ndims, sim_method):
    with open(filename) as f:
        reader = csv.reader(f)
        header = next(reader)
        data = [[float(x) for x in row] for row in reader]

        if ndims is None:
            ndims = len(header) - 1

        if sim_method is None:
            sim_method = "Predictor"

        regulus = {
            'name': name,
            'version': '1',
            'sim_method': sim_method,
            'dims': header[0:ndims],
            'measures': header[ndims:],
            'notes': [{"date": str(date.today()), "author": getuser()}],
            'pts': data,
            'mscs': []
        }
        return regulus


def load_regulus(filename):
    with open(filename) as f:
        regulus = json.load(f)
        return regulus


def load_file(filename, dim = None, measure = None, col = None, name = None, sim_method = None):

    filename = Path(filename)
    path = filename.parent

    if filename.suffix == '.csv':
        print(filename.stem)
        regulus = create_from_csv(filename, name or filename.stem or path.name, dim, sim_method)

    elif filename.suffix == '.json':
        regulus = load_regulus(filename)

    else:
        print('Unknown input file type')
        exit(255)

    ndims = len(regulus['dims'])

    if col is not None:
        measures = regulus['measures'][col:col]
    elif measure is not None:
        measures = [regulus['measures'].index(measure)]
    else:
        measures = regulus['measures']

    data = regulus['pts']

    np_data = np.array(data)
    x = np_data[:, 0:ndims]
    y = np_data[:, ndims:]

    x, y = TopologicalObject.aggregate_duplicates(x, y)

    np_data = np.concatenate((x, y), axis=1)
    data = np_data.tolist()
    regulus['pts'] = data

    return regulus


def get_file(spec = None, version = None, name = None, dir = None):
    if dir is not None:
        cur_dir = dir
    else:
        cur_dir = Path('.')

    if spec is not None:
        # spec is the file from
        name = spec['name']
        version = spec['version']
        get_file(name = name, version = version, dir = cur_dir)

    else:

        if (cur_dir / (name +'.'+ version + '.json')).exists():
            regulus = load_file(cur_dir/(name + '.'+ version + '.json'))

        elif (cur_dir/(name +'.json')).exists():
            regulus = load_file(cur_dir/(name + '.json'))

        else:
            print("Can not find old regulus file")
        #elif (cur_dir/(name +'_mc'+'.json')).exists():
        #    load_file(filename = name + '_mc'+'.json', dir= cur_dir)
        #elif (cur_dir/(name +'_mc'+version +'.json')).exists():
        #    self.load_reg_json(filename = name + '_mc'+version +'.json', dir= cur_dir)
    return regulus