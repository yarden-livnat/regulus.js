#!/usr/bin/env python

import json
import numpy as np
#from sklearn import linear_model
import argparse
from sklearn import decomposition


def load_file(file):
    with open(file) as json_data:
        data = json.load(json_data)
        return data


def update_partition(partition, idx, pts, ndims, measure, n_com):
    span = partition["span"]
    pts_idx = idx[span[0]:span[1]]
    [min, max] = partition["minmax_idx"]
    pts_idx.append(min)
    pts_idx.append(max)

    data = pts[pts_idx, :]
    x = data[:, 0:ndims]
    y = data[:, ndims + measure]

    pcamodel = decomposition.PCA(n_components=n_com)
    pcamodel.fit(x)
    X = pcamodel.transform(x)
    #reg = linear_model.LinearRegression()
    #reg.fit(x, y)

<<<<<<< HEAD
    if 'model' not in partition:
        partition['model'] = {
            "pca": {
                "components": X.tolist(),
                "y": y.tolist()
                }
        #    'fitness': reg.score(x,y)
            }
    else:
        partition['model']['pca'] = \
            {
                "components": X.tolist(),
                "y": y.tolist()
            }
=======
    partition['model'] = {
        "pca": {
            "components": X.tolist(),
            "y": y.tolist()
            }
    #    'fitness': reg.score(x,y)
        }
>>>>>>> cf79d5289cd549a2e5cb758b47983dfeadd3b74a


def update_msc(msc, pts, ndims, measure, n_com):
    print(msc['name'])
    if 'pts_idx' not in msc:
        print('ignored')
    for partition in msc["partitions"]:
        update_partition(partition, msc['pts_idx'], pts, ndims, measure, n_com)


def calc_pca(mscs, pts, ndims, n_com):
    array_pts = np.array(pts)
    for measure, msc in enumerate(mscs):
        update_msc(msc, array_pts, ndims, measure, n_com)


def pca(args=None):
    p = argparse.ArgumentParser(prog='analyze', description='Extract input dimension and a single measure')
    p.add_argument('filename', help='input file [regulus .json file]')
    p.add_argument('-n', '--components', type=int, default=2, help='number of components')
    p.add_argument('-o', '--out', default='', help='output file')

    ns = p.parse_args(args)
    if ns.out =='':
        ns.out = ns.filename

    filename = ns.filename
    output = ns.out
    n_com = ns.components

    regulus = load_file(filename)
    calc_pca(regulus["mscs"], regulus["pts"], len(regulus["dims"]), n_com)

    with open(output, 'w') as outfile:
        json.dump(regulus, outfile, indent=2)



if __name__ == '__main__':
    pca()
