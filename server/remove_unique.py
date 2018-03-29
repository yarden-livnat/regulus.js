import numpy as np
import csv
from sys import argv

def remove_duplicates(input):
    with open(input) as f:
        reader = csv.reader(f)
        header = next(reader)
        data = [[float(x) for x in row] for row in reader]

    arr = np.asarray(data)
    x = arr[:, 0:-1]
    [a, b] = np.unique( x.round(decimals=15), axis=0, return_index=1)
    out = arr[b, :]
    unique_data = out.tolist()

    fname = input[:-4]+'_unique'+'.csv'
    with open(fname, 'w') as f:
        report = csv.writer(f, delimiter=',')
        report.writerow(header)
        report.writerows(unique_data)

    return fname

if __name__ == '__main__':
    remove_duplicates(argv[1])
