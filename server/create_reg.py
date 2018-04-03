import argparse
from pathlib import Path
from load_file import load_file
from save_file import save_file
from compute_topology import compute_topology
from linearfit import calc_regression
from pca import calc_pca
import sys
import re

def create_reg(args=None):
    p = argparse.ArgumentParser(prog='analyze', description='Extract input dimension and a single measure')
    p.add_argument('filename', help='input file [.csv data file or a regulus .json file]')
    p.add_argument('-k', '--knn', type=int, default=100, help='knn')
    p.add_argument('-b', '--beta', type=float, default=1.0, help='beta')
    p.add_argument('-n', '--norm', default='feature', help='norm')
    p.add_argument('-g', '--gradient', default='steepest', help='gradient')
    p.add_argument('-G', '--graph', default='relaxed beta skeleton', help='graph')

    p.add_argument('--p', action='store_true', help='use parameters in json')
    p.add_argument('-o', '--out', default=None, help='output filename')

    p.add_argument('-d', '--dims', type=int, default=None, help='number of input dimensions')
    p.add_argument('-m', '--measure', default=None, help='measure name')
    p.add_argument('-c', '--col', type=int, default=None, help='measure column index starting at 0')

    p.add_argument('-s', '--sim', default='Predictor', help='Simulation Method')
    p.add_argument('-t', '--topo', default='morse_smale', help='type of topology')
    p.add_argument('-p', '--cmps', type=int, default=2, help='number of principal components')

    p.add_argument('--name', default=None, help='dataset name')
    #p.add_argument('--morse', default='smale', choices=['smale', 'ascend', 'descend'], help='type of complex to compute')
    p.add_argument('--debug', action='store_true', help='process all measures')

    ns = p.parse_args(args)

    sys_argv = sys.argv[1:]
    sys_argv.remove(ns.filename)

    filename = Path(ns.filename)

    if ns.out:
        out = ns.out
    else:
        out = filename

    regulus = None

    topo = ns.topo

    regulus = load_file(filename, dim = ns.dims, measure = ns.measure, col = ns.col, name = ns.name, sim_method = ns.sim)

    param_list = []
    if 'mscs' in regulus:
        mscs = regulus['mscs']
        if mscs != []:
            for msc in mscs:

                arg_list = [ns.filename]
                keys = list(re.split(r'-',msc['params']))#.remove('')
                keys.remove('')

                for cur_k in keys:
                    print(cur_k)
                    if ('-'+cur_k[0]) in sys_argv:
                        ind = sys_argv.index('-'+cur_k[0])
                        arg_list.append('-' + cur_k[0])
                        arg_list.append(sys_argv[ind+1])
                    else:
                        arg_list.append('-'+cur_k[0])
                        arg_list.append(cur_k[1:].strip())

                ns2 = p.parse_args(arg_list)
                param_list.append(ns2)

            # this will be changed later to multiple mscs with different params
            ns2 = param_list[0]
            regulus = compute_topology(regulus, k=ns2.knn, b=ns2.beta, n=ns2.norm, g=ns2.gradient, G=ns2.graph, topo=topo,
                                       debug=None)
        else:
            regulus = compute_topology(regulus, k=ns.knn, b=ns.beta, n=ns.norm, g=ns.gradient, G=ns.graph, topo=topo,
                                       debug=None)

    ndims = len(regulus['dims'])
    n_com = ns.cmps
    mscs = regulus["mscs"]
    pts = regulus["pts"]

    calc_regression(mscs, pts, ndims)

    calc_pca(mscs, pts, ndims, n_com)

    save_file(out.with_suffix('.json'), regulus)

if __name__ == '__main__':
    create_reg()


