import csv
import json
from pathlib import Path
import numpy as np
import os

def getlatestexp(iii):
    print("Get Latest Dataset")
    existingexp = os.listdir('data')
    expnum = [int(''.join(filter(str.isdigit, fname))) for fname in existingexp]
    sorteddir = [existingexp[ind] for ind in np.argsort(expnum)]

    print(iii)
    while os.path.exists("data/V%s" %iii):
        iii = iii+1
    os.makedirs("data/V%s" %iii)
    outdir = "data/V%s" %iii
    return ['data'+'/'+sorteddir[-1]+'/'+'simulations.csv', outdir]

def rename(exp_name, new_ver):

    return exp_name+new_ver+'.json'

def create_new(old_reg, new_ver):

    with open(old_reg) as json_data:
        reg_data = json.load(json_data)

    del reg_data['mscs']
    reg_data['version'] = new_ver

    new_reg = rename(reg_data['name'], new_ver)

    with open(new_reg, 'w') as f:
        json.dump(reg_data, f)

    return new_reg

def read_newdata(output,newparam):
    return output+'/'+newparam

def combine_data(new_reg, new_pts):
    ## Check unique here
    #with open(d1, newline='') as csvfile:
    #    reader = csv.reader(csvfile)
    #    data1 = list(reader)

    with open(new_pts, newline='') as csvfile:
        #dialect = csv.Sniffer().sniff(csvfile.read(2048))
        #csvfile.seek(0)
        reader = csv.reader(csvfile)
        header = next(reader)
        data2 = [[float(x) for x in row] for row in reader]
        #data2 = list(reader)

    with open(new_reg) as json_data:
        reg_data = json.load(json_data)

    old_pts = reg_data['pts']
    new_pts = old_pts+data2[1:]
    reg_data['pts'] = new_pts

    with open(new_reg, 'w') as f:
        json.dump(reg_data, f)

    return #new_reg

def mergedata(sim_dir, sim_out, new_reg, dims):

    # New json file already created as json with new_reg as filename
    #new_reg  = create_new(old_reg, new_ver)

    new_pts = read_newdata(sim_dir, sim_out)

    combine_data(new_reg,new_pts)

    return


