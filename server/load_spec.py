import json
import os
import csv
def create_new(name, old_ver, new_ver,data_dir):

    data_dir = str(data_dir)

    if os.path.isfile(data_dir+'/'+name + '.json'):

        with open(data_dir+'/'+name + '.json') as json_data:
            reg_data = json.load(json_data)

    elif os.path.isfile(data_dir+'/'+name + '.' + old_ver + '.json'):

        with open(data_dir+'/'+name + '.' + old_ver + '.json') as json_data:
            reg_data = json.load(json_data)

    else:
        print("Can't find data")

    new_reg = data_dir+'/'+ name +'.'+new_ver + '.json'

    del reg_data['mscs']

    reg_data['version'] = new_ver

    dims = reg_data['dims']

    with open(new_reg, 'w') as f:
        json.dump(reg_data, f)

    return [new_reg,dims]

def extract_input(data,dims):

    # This should be pythonic way?
    sample_input = [[ptdict[inputdim] for inputdim in dims] for ptdict in data]
    return sample_input



def save_list(sample_inputs):
    with open('resample_params.csv', 'a') as f:
        report = csv.writer(f)
        report.writerows(sample_inputs)
    return 'resample_params.csv'


def load(received,data_dir):
    # extract spec, name of original, version number
    #data = 111#json.loads(received)
    #ver = "2.0"
    #name = "deployment"

    old_ver = received['version']
    new_ver = received['new_version']
    name = received['name']
    data = received['pts']

    [new_reg,dims] = create_new(name, old_ver, new_ver,data_dir)

    # sample_input is a list of new input parameters

    sample_input = extract_input(data,dims)

    return [new_reg,dims,sample_input]#[data,name,old_ver,new_ver]
