import numpy as np
import json
from sys import argv
from ForwardLinearRegression import ForwardLinearRegression as flr
from sklearn.metrics import r2_score as fit
def load_file(file):
    with open(file) as json_data:
        data = json.load(json_data)

    return data

def calc_regression(mscs, pts, dims):
    array_pts = np.array(pts)
    dim_len = len(dims)
    measure_col = 0
    for msc in mscs:

        for partition in msc["partitions"]:
            span = partition["span"]
            pts_idx = msc["pts_idx"][span[0]:span[1]]
            [min, max] = partition["minmax_idx"]
            if min not in pts_idx:
                pts_idx.append(min)
            if max not in pts_idx:
                pts_idx.append(max)
            cur_xy = array_pts[pts_idx,:]
            cur_x = cur_xy[:,0:dim_len]
            cur_y = cur_xy[:,dim_len+measure_col]
            ref = flr(cur_x,cur_y)

            model = {}
            linear = {}
            linear["coeff"] = ref.coefficients.tolist()
            linear["intercept"] = ref.intercept
            linear["fitness"] = fit(ref.apply(cur_x),cur_y)

            model["lieanr_reg"] = linear

            partition["model"] = model

        measure_col = measure_col + 1
    return
def linearfit(filename, rename = None):
    data = load_file(filename)
    calc_regression(data["mscs"], data["pts"], data["dims"])

    if rename is not None:
        with open(rename, 'w') as outfile:
            json.dump(data, outfile)

    else:
        with open(filename, 'w') as outfile:
            json.dump(data, outfile)

if __name__ == '__main__':
    if len(argv)>2:
        linearfit(argv[1],argv[2])
    else:
        linearfit(argv[1])
