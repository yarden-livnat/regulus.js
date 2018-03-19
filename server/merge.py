import csv
import json
from pathlib import Path
import numpy as np
import os

def getlatestexp(iii):

    existingexp = os.listdir('data')
    expnum = [int(''.join(filter(str.isdigit, fname))) for fname in existingexp]
    sorteddir = [existingexp[ind] for ind in np.argsort(expnum)]

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

def combine_data(new_reg, new_pts,data_dir):
    ## Check unique here

    # suppose the new CSV file for post.py is new_pts.csv
    data_dir = str(data_dir)



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
    new_pts = old_pts+data2#[1:]
    reg_data['pts'] = new_pts
    version = reg_data['version']
    new_data_csv = data_dir + '/' + 'new_pts'+version+'.csv'
    with open(new_reg, 'w') as f:
        json.dump(reg_data, f)

    # store csv for post
    with open(new_data_csv, 'a') as f:
        report = csv.writer(f)
        report.writerow(header)
        report.writerows(new_pts)

    return new_data_csv

def mergedata(sim_dir, sim_out, new_reg, dims,data_dir):

    # New json file already created as json with new_reg as filename
    #new_reg  = create_new(old_reg, new_ver)

    new_pts = read_newdata(sim_dir, sim_out)

    csv_out = combine_data(new_reg,new_pts,data_dir)

    return csv_out


