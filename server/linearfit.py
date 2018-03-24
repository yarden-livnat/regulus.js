#!/usr/bin/env python

from sys import argv
import json
import numpy as np
from sklearn.metrics import r2_score as fitness
from sklearn.metrics import explained_variance_score
from sklearn import linear_model


def load_file(file):
    with open(file) as json_data:
        data = json.load(json_data)
        return data


def update_partition(partition, idx, pts, ndims, measure):
    span = partition["span"]
    pts_idx = idx[span[0]:span[1]]
    [min, max] = partition["minmax_idx"]
    pts_idx.append(min)
    pts_idx.append(max)

    data = pts[pts_idx, :]
    x = data[:, 0:ndims]
    y = data[:, ndims + measure]
    reg = linear_model.LinearRegression()
    reg.fit(x, y)

    partition['model'] = {
        "linear_reg": {
            "coeff": reg.coef_.tolist(),
            "intercept": reg.intercept_
            },
        'fitness': reg.score(x,y)
        }


def update_msc(msc, pts, ndims, measure):
    print(msc['name'])
    if 'pts_idx' not in msc:
        print('ignored')
    for partition in msc["partitions"]:
        update_partition(partition, msc['pts_idx'], pts, ndims, measure)


def calc_regression(mscs, pts, ndims):
    array_pts = np.array(pts)
    for measure, msc in enumerate(mscs):
        update_msc(msc, array_pts, ndims, measure)


def linear_fit(filename, output=None):
    regulus = load_file(filename)
    calc_regression(regulus["mscs"], regulus["pts"], len(regulus["dims"]))

    if output is None:
        output = filename

    with open(output, 'w') as outfile:
        json.dump(regulus, outfile)


if __name__ == '__main__':
    if len(argv)>2:
        linear_fit(argv[1],argv[2])
    else:
        linear_fit(argv[1])
