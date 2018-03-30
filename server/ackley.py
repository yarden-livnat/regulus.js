from sys import argv
import math
import numpy as np
import csv
import copy

def create_x(dim,num):
    return np.random.rand(int(num),int(dim)).tolist()

def create(dim,num):
    x = create_x(dim,num)
    out = []
    for i in range(len(x)):
        y = ackley(x[i])
        out.append(x[i]+[y])
    return out
def calc_ackley(x):
    out = []
    for i in range(len(x)):
        y = ackley(x[i])
        out.append(x[i]+[y])
    return out

def ackley(_x):
    x = copy.deepcopy(_x)
    a = 20
    b = 0.2
    c = math.pi*2
    if isinstance(x,np.ndarray) and x.ndim > 1:
        d = x.shape[1]
    else:
        d = len(x)
    for i in range(d):
        x[i] = x[i]*3 - 1.5

    summand1 = 0
    summand2 = 0
    for i in range(d):
        summand1 += x[i]**2
        summand2 += np.cos(c*x[i])
    eps = 0
    for i in range(d):
        eps += 1e-3*x[i]
    return a*np.exp(-b*np.sqrt(summand1/float(d))) - np.exp(summand2/float(d)) #+eps

def saveackley(filename, data):
    header = []
    if len(data[0])>1:
        dims = len(data[0])
    else:
        dims = len(data)

    for i in range(dims-1):
        header.append("X"+str(i))
    header.append("Y")
    with open(filename, 'w',newline='') as f:
        report = csv.writer(f, delimiter=',')
        report.writerow(header)
        report.writerows(data)

if __name__ == '__main__':
    # filename ,dim, num
    #if len(argv)>3:
    #    linear_fit(argv[1],argv[2])
    #else:
    #    linear_fit(argv[1])
    data = create(argv[2], argv[3])
    saveackley(argv[1], data)