import numpy as np
import json
import csv
import argparse
from pathlib import Path
from collections import defaultdict
from datetime import date
from getpass import getuser

from topopy.MorseSmaleComplex import MorseSmaleComplex as MSC, TopologicalObject


class Merge(object):
    def __init__(self, level, is_max, src, dest):
        self.level = level
        self.is_max = is_max
        self.src = src
        self.dest = dest


class Partition(object):
    _id_generator = -1

    @staticmethod
    def gen_id():
        Partition._id_generator += 1
        return Partition._id_generator

    @staticmethod
    def reset():
        Partition._id_generator = -1

    def __init__(self, persistence, base_pts=None, min_idx=None, max_idx=None, child=None, is_max=None):
        self.id = Partition.gen_id()
        self.persistence = persistence
        self.span = []
        self.parent = None
        self.children = []

        self.extrema = []
        self.base_pts = base_pts if base_pts is not None else []
        self.min_idx = min_idx
        self.max_idx = max_idx
        self.is_max_merge = is_max

        if child is not None:
            self.min_idx = child.min_idx
            self.max_idx = child.max_idx
            self.children.append(child)
            child.parent = self

    def add_child(self, child):
        child.parent = self
        self.children.append(child)
        if child.min_idx != self.min_idx and child.max_idx != self.max_idx:
            print("ERROR: child {} [{} {}] merged into parent {} [{} {}] without a matching extrema".format(child.id,
                    child.min_idx, child.max_idx, self.id, self.min_idx, self.max_idx))


class Post(object):
    def __init__(self, debug=False):
        self.base = None
        self.merges = []
        self.min_map = defaultdict(set)
        self.max_map = defaultdict(set)
        self.active = set()
        self.root = None
        self.pts = []
        self.original_pts = set()
        self.debug = debug
        self.mapping = dict()
        self.unique = set()
        self.all = dict()
        self.data_pts = []
        self.single = 0

    def load(self, path):
        with open(path / 'Base_Partition.json') as f:
            self.base = json.load(f)

        with open(path / 'Hierarchy.csv') as f:
            self.merges = [Merge(float(row[0]), row[1] == '1', int(row[2]), int(row[3])) for row in csv.reader(f)]
        return self

    def data(self, pts):
        self.data_pts = pts
        return self

    def msc(self, base, hierarchy):
        self.base = base
        for entry in hierarchy:
            row = entry.split(',')
            self.merges.append(Merge(float(row[1]), row[0] == 'Maxima', int(row[2]), int(row[3])))
        return self

    def prepare(self):
        Partition.reset()
        for key, value in self.base.items():
            m, x = [int(s) for s in key.split(',')]
            p = Partition(0, list(value), m, x)
            if self.debug:
                self.check_partition(p)
            self.add(p)

        # self.find_unique()
        self.remove_non_unique()

        self.merges.sort(key=lambda m: (m.level, m.src))
        high = self.merges[-1].level
        for merge in self.merges:
            merge.level /= high
        return self

    def check_partition(self, p):
        min_v = self.data_pts[p.min_idx]
        max_v = self.data_pts[p.max_idx]
        if min_v > max_v:
            print('*** min > max', min_v, max_v)
        for pt_idx in p.base_pts:
            if pt_idx != p.min_idx and self.data_pts[pt_idx] < min_v:
                print('*** Partition check p:{} min:{} at {} found min:{} at {}'.format(p.id, min_v, p.min_idx, self.data_pts[pt_idx], pt_idx))
            if pt_idx != p.max_idx and self.data_pts[pt_idx] > max_v:
                print('*** Partition check p:{} max:{} at {} found max:{} at {}'.format(p.id, max_v, p.max_idx, self.data_pts[pt_idx], pt_idx))

    #
    # build
    #

    def follow(self, partition):
        while partition in self.mapping:
            partition = self.mapping[partition]
        return partition

    def build(self):
        self.prepare()
        for merge in self.merges:
            # print(merge.level, merge.is_max, merge.src, merge.dest)
            if merge.src == merge.dest:
                continue

            # merge.dest may have been merged already (same persistence level: degenerate case)
            # dest = merge.dest
            # while dest in self.mapping:
            #     dest = self.mapping[dest]
            dest = self.follow(merge.dest)
            src = self.follow(merge.src)

            if src == dest:
                print('*** loop: dest points back to src', self.find_loop(dest))
                continue

            merge.dest = dest
            merge.src = src
            self.mapping[merge.src] = merge.dest

            if merge.is_max:
                self.update(merge, self.max_map, lambda item: item.min_idx)
            else:
                self.update(merge, self.min_map, lambda item: item.max_idx)

        if len(self.active) != 1:
            raise RuntimeError('Error: found {} roots'.format(len(self.active)))

        self.root = self.active.pop()

        self.single = 0
        self.visit(self.root, 0)
        print('found {} singles'.format(self.single))

        self.pts.extend([self.root.min_idx, self.root.max_idx])
        self.rename(self.root, 0)
        return self

    def find_loop(self, dest):
        loop = [dest]
        while dest in self.mapping:
            dest = self.mapping[dest]
            loop.append(dest)
        return loop

    def find_unique(self):
        count = defaultdict(int)
        for p in self.active:
            count[p.min_idx] += 1
            count[p.max_idx] += 1
        self.unique = {k for k, v in count.items() if v == 1}
        print('   unique:', self.unique)
        self.all = count

    def remove_non_unique(self):
        for p in self.active:
            for idx in [p.min_idx, p.max_idx]:
                if idx not in self.unique:
                    p.base_pts.remove(idx)

    def update(self, merge, idx_map, idx):
        add = []
        remove = set()

        for d in idx_map[merge.dest]:
            n = None
            remove_src = set()
            for s in idx_map[merge.src]:
                if idx(s) == idx(d):
                    if s.persistence == merge.level:
                        # s is an intermediate and should be absorbed
                        if len(s.children) == 0:
                            # s is a base partition
                            d.base_pts.extend(s.base_pts)
                        else:
                            for child in s.children:
                                d.add_child(child)
                    else:
                        if n is None:
                            n = Partition(merge.level, child=d, is_max=merge.is_max)
                            remove.add(d)  # can't be removed during the iterations
                            add.append(n)
                        n.add_child(s)
                    remove_src.add(s)  # can't be removed during the iterations
            for s in remove_src:
                self.remove(s)

        for s in idx_map[merge.src]:
            n = Partition(merge.level, child=s)
            if merge.is_max:
                n.max_idx = merge.dest
            else:
                n.min_idx = merge.dest
            add.append(n)

        for r in remove | idx_map[merge.src]:
            self.remove(r)

        # assign the eliminated extrema as an extra internal point to the first new partition
        if merge.src not in self.unique:
            if len(add) > 0:
                target = add[0]
            else:
                target = next(iter(idx_map[merge.dest]))
            target.extrema.append(merge.src)

        for n in add:
            self.add(n)

    def add(self, n):
        self.min_map[n.min_idx].add(n)
        self.max_map[n.max_idx].add(n)
        self.active.add(n)

    def remove(self, p):
        self.max_map[p.max_idx].discard(p)
        self.min_map[p.min_idx].discard(p)
        self.active.remove(p)

    def visit(self, partition, idx):
        first = idx
        if len(partition.children) == 0:
            add = partition.base_pts
            if partition.min_idx in add and partition.min_idx not in self.unique:
                print('*** min in partition', partition.min_idx)
            if partition.max_idx in add and partition.max_idx not in self.unique:
                print('*** max in partition', partition.max_idx)
            if len(add) > 0:
                self.pts.extend(add)
                idx += len(add)
        else:
            if len(partition.children) == 1:
                self.single += 1

            if len(partition.extrema) > 0:
                self.pts.extend(partition.extrema)
                idx += len(partition.extrema)

            for child in partition.children:
                idx = self.visit(child, idx)

        partition.span = (first, idx)
        return idx

    def rename(self, node, idx):
        node.id = idx
        idx += 1
        if node.persistence > 0:
            for child in node.children:
                idx = self.rename(child, idx)
        return idx

    #
    # save
    #

    def get_tree(self, name, params=''):
        partitions = []
        self.collect(self.root, partitions)
        tree = {
            'name': name,
            'params': params,
            'partitions': partitions,
            'pts_idx': self.pts
        }
        return tree

    def save(self, path, name, params):
        tree = self.get_tree(name, params)
        filename = name + ".json"
        with open(path / filename, 'w') as f:
            json.dump(tree, f)

    def collect(self, node, array):
        array.append({
            'id': node.id,
            'lvl': node.persistence,
            'span': [node.span[0], node.span[1]],
            'minmax_idx': [node.min_idx, node.max_idx],
            'merge': 'max' if node.is_max_merge else 'min',
            'parent': node.parent.id if node.parent is not None else None,
            'children': [child.id for child in node.children] if node.persistence > 0 else []
        })

        self.check_partition(node)

        if node.persistence > 0:
            if len(node.children) > 2:
                print('\t{} has {} children at level {}'.format(node.id, len(node.children), node.persistence))
            for child in node.children:
                self.collect(child, array)

    #
    # verify
    #

    def verify(self):
        if self.debug:
            self.statistics()
        return self

    def statistics(self):
        levels = defaultdict(list)
        self.stat(self.root, levels)
        n = 0
        b = 0
        for level in levels.keys():
            if level > 0:
                n += len(levels[level])
            else:
                b = len(levels[level])
        print('\tstatistics: {} levels {} base, {} new'.format(len(levels), b, n))
        # for level in sorted(levels.keys()):
        #     print("{:.2g} {}".format(level, len(levels[level])))

    def stat(self, node, levels):
        levels[node.persistence].append(node)
        if node.persistence > 0:
            for child in node.children:
                self.stat(child, levels)


def create_from_csv(filename, name, ndims):
    with open(filename) as f:
        reader = csv.reader(f)
        header = next(reader)
        data = [[float(x) for x in row] for row in reader]
        # data = [p for p in data if p[-1] > 700]
        # print('new len', len(data))

        if ndims is None:
            ndims = len(header) - 1

        regulus = {
            'name': name,
            'version': '1',
            'dims': header[0:ndims],
            'measures': header[ndims:],
            'notes': [{"date": str(date.today()), "author": getuser()}],
            'pts': data,
            'mscs': []
        }
        return regulus


def load_regulus(filename):
    with open(filename) as f:
        regulus = json.load(f)
        return regulus


def save_regulus(filename, regulus):
    #print("Post_filename", filename)
    with open(filename, 'w') as f:
        json.dump(regulus, f, indent=2)


def post(args=None):
    p = argparse.ArgumentParser(prog='analyze', description='Extract input dimension and a single measure')
    p.add_argument('filename', help='input file [.csv data file or a regulus .json file]')
    p.add_argument('-k', '--knn', type=int, default=100, help='knn')
    p.add_argument('-b', '--beta', type=float, default=1.0, help='beta')
    p.add_argument('-n', '--norm', default='feature', help='norm')
    p.add_argument('-g', '--gradient', default='steepest', help='gradient')
    p.add_argument('-G', '--graph', default='relaxed beta skeleton', help='graph')

    p.add_argument('--p', action='store_true', help='use parameters in json')
    p.add_argument('-o', '--out', help='use parameters in json')

    p.add_argument('-d', '--dims', type=int, default=None, help='number of input dimensions')
    p.add_argument('-m', '--measure', default=None, help='measure name')
    p.add_argument('-c', '--col', type=int, default=None, help='measure column index starting at 0')

    p.add_argument('--name', default=None, help='dataset name')
    p.add_argument('--morse', default='smale', choices=['smale', 'ascend', 'descend'], help='type of complex to compute')

    p.add_argument('--debug', action='store_true', help='process all measures')

    ns = p.parse_args(args)

    filename = Path(ns.filename)
    path = filename.parent

    catalog = {}
    regulus = None
    measures = []

    if filename.suffix == '.csv':
        print(filename.stem)
        regulus = create_from_csv(filename, ns.name or filename.stem or path.name, ns.dims)
    elif filename.suffix == '.json':
        regulus = load_regulus(filename)
    else:
        print('Unknown input file type')
        exit(255)

    ndims = len(regulus['dims'])

    if ns.col is not None:
        measures = regulus['measures'][ns.col:ns.col]
    elif ns.measure is not None:
        measures = [regulus['measures'].index(ns.measure)]
    else:
        measures = regulus['measures']

    data = regulus['pts']

    np_data = np.array(data)
    x = np_data[:, 0:ndims]
    y = np_data[:, ndims:]

    x, y = TopologicalObject.aggregate_duplicates(x, y)

    np_data = np.concatenate((x, y), axis=1)
    data = np_data.tolist()
    regulus['pts'] = data

    if ns.p:
        param_in_file = regulus['mscs'][0]["params"]
        if type(param_in_file) is dict:
            if "k" in param_in_file:
                ns.knn = param_in_file["k"]
            if "b" in param_in_file:
                ns.beta = param_in_file["b"]
            if "n" in param_in_file:
                ns.norm = param_in_file["n"]
            if "G" in param_in_file:
                ns.graph = param_in_file["G"]
            if "g" in param_in_file:
                ns.gradient = param_in_file["g"]


    mscs = dict()
    for msc in regulus['mscs']:
        mscs[msc['name']] = msc

    #params = '-k {} -b {} -n {} -G "{}" -g {}'.format(ns.knn, ns.beta, ns.norm, ns.graph, ns.gradient)
    params = {}
    params['k'] = ns.knn
    params['b'] = ns.beta
    params['n'] = ns.norm
    params['G'] = ns.graph
    params['g'] = ns.gradient

    for i, measure in enumerate(measures):
        try:
            print('\npost ', measure)
            y = np_data[:, ndims+i]
            msc = MSC(ns.graph, ns.gradient, ns.knn, ns.beta, ns.norm, debug=True, aggregator='mean')  # connect=True
            msc.build(X=x, Y=y, names=regulus['dims']+[measure])

            x = msc.X
            y = msc.Y

            if ns.morse == 'descend':
                tmp = Post(ns.debug) \
                    .data(y) \
                    .msc(msc.descending_partitions, msc.max_hierarchy)
            elif ns.morse == 'ascend':
                tmp = Post(ns.debug) \
                    .data(y) \
                    .msc(msc.ascending_partitions, msc.min_hierarchy)
            else:
                tmp = Post(ns.debug) \
                    .data(y) \
                    .msc(msc.base_partitions, msc.hierarchy)

            mscs[measure] = tmp \
                .build() \
                .verify() \
                .get_tree(measure, params)

        except RuntimeError as error:
            print(error)

    regulus['mscs'] = list(mscs.values())
    #print("filename",filename)
    if ns.out:
        out = ns.out
    elif ns.morse == 'ascend':
        out = filename.with_name(filename.stem+'_ascend')
    elif ns.morse == 'descend':
        out = filename.with_name(filename.stem + '_descend')
    else:
        out = filename
    #print(out)
    save_regulus(out.with_suffix('.json'), regulus)


if __name__ == '__main__':
    post()
