import numpy as np
import csv
from sys import argv

def create_x(num):
    return np.random.rand(int(num),int(6)).tolist()

def create(num):
    x = create_x(num)
    out = []
    for i in range(len(x)):
        y = fx(x[i])
        out.append(x[i]+[y])
    return out

def calc_Hartmann(x):
    out = []
    for i in range(len(x)):
        y = fx(x[i])
        out.append(x[i]+[y])
    return out

def fx(x):
    A = np.array(
        [[10, 3, 17, 3.5, 1.7, 8], [0.05, 10, 17, 0.1, 8, 14], [3, 3.5, 1.7, 10, 17, 18], [17, 8, 0.05, 10, 0.1, 14]])

    P = 0.0001 * np.array([[1312, 1696, 5569, 124, 8283, 5886], [2329, 4135, 8307, 3736, 1004, 9991],
                           [2348, 1451, 3522, 2883, 3047, 6650], [4047, 8828, 8732, 5743, 1091, 381]])

    alpha = np.array([1, 1.2, 3, 3.2])

    out = 2.58

    for i in range(4):
        out += alpha[i] * np.exp(-np.sum(np.multiply(A[i, :], np.multiply(x - P[i, :], x - P[i, :]))))
    out = -out / 1.94
    # - for using MC
    return -out

def saveHart(filename, data):
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
    data = create(argv[2])
    saveHart(argv[1], data)