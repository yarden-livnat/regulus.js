import csv
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

def readnewdata(output,newparam):
    return output+newparam

def combinedata(d1, d2,outdir):
    ## Check unique here
    with open(d1, newline='') as csvfile:
        reader = csv.reader(csvfile)
        data1 = list(reader)

    with open(d2, newline='') as csvfile:
        #dialect = csv.Sniffer().sniff(csvfile.read(2048))
        #csvfile.seek(0)
        reader = csv.reader(csvfile)
        data2 = list(reader)

    out = data1+data2[1:]
    print(len(data1))
    print(data2)
    print(len(out))
    with open(outdir+'/'+'simulations.csv', 'w', newline='') as f:
        report = csv.writer(f)
        report.writerows(out)

    return outdir+'/'+'simulations.csv'

def mergedata(output, newparam):
    print(output, newparam)
    [d1,out] = getlatestexp(1)
    d2 = readnewdata(output, newparam)
    new = combinedata(d1,d2,out)
    return new


