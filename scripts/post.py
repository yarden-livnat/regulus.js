import numpy as np
import json
import csv
import pandas as pd
import fileinput, sys
import argparse
from pathlib import Path
from collections import namedtuple, defaultdict

from topopy.MorseSmaleComplex import MorseSmaleComplex as MSC


class Merge(object):
    def __init__(self, level, is_max, src, dest):
        self.level = level
        self.is_max = is_max
        self.src = src
        self.dest = dest


class Partition(object):
    _id = 0

    @staticmethod
    def gen_id():
        Partition._id += 1
        return Partition._id

    def __init__(self, persistence, base_pts=None, min_idx=None, max_idx=None, child=None):
        self.id = Partition.gen_id()
        self.persistence = persistence
        self.pts_idx = []
        self.parent = None
        self.children = []

        self.extrema = None
        self.base_pts = base_pts
        self.min_idx = min_idx
        self.max_idx = max_idx

        if child is not None:
            self.min_idx = child.min_idx
            self.max_idx = child.max_idx
            self.children.append(child)
            child.parent = self

    def add_child(self, child):
        child.parent = self
        self.children.append(child)


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

    def load(self, path):
        with open(path / 'Base_Partition.json') as f:
            self.base = json.load(f)

        with open(path / 'Hierarchy.csv') as f:
            self.merges = [Merge(float(row[0]), row[1] == '1', int(row[2]), int(row[3])) for row in csv.reader(f)]

        return self

    def data(self, base, hierarchy):
        self.base = base
        for entry in hierarchy:
            row = entry.split(',')
            self.merges.append(Merge(float(row[1]), row[0] == 'Maxima', int(row[2]), int(row[3])))
        return self

    def build(self):
        self.prepare()
        for merge in self.merges:
            if merge.src == merge.dest:
                # print('degenerate', merge.level, merge.is_max, merge.src, merge.dest)
                continue

            if merge.is_max:
                self.update(merge, self.max_map, lambda item: item.min_idx)
            else:
                self.update(merge, self.min_map, lambda item: item.max_idx)

        if len(self.active) != 1:
            raise RuntimeError('Error: found {} roots'.format(len(self.active)))

        self.root = self.active.pop()
        self.root.extrema.extend([self.root.min_idx, self.root.max_idx])
        self.visit(self.root, 0)
        if self.debug:
            self.statistics()
        return self

    def save(self, path, name):
        partitions = []
        self.collect(self.root, partitions)
        tree = {
            'name': name,
            'partitions': partitions,
            'pts': self.pts
        }
        filename = name + ".json"
        with open(path / filename, 'w') as f:
            json.dump(tree, f)

    # Private functions

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
        print('statistics: {} levels {} base, {} new'.format(len(levels), b, n))
        for level in sorted(levels.keys()):
            print("{:.2g} {}".format(level, len(levels[level])))

    def stat(self, node, levels):
        levels[node.persistence].append(node)
        for child in node.children:
            self.stat(child, levels)

    def prepare(self):
        for key, value in self.base.items():
            m, x = [int(s) for s in key.split(',')]
            p = Partition(0, list(value), m, x)
            self.add(p)

        self.merges.sort(key=lambda m: m.level)
        high = self.merges[-1].level
        for merge in self.merges:
            merge.level /= high
        return self

    def collect(self, node, array):
        array.append({
            'id': node.id,
            'lvl': node.persistence,
            'pts_idx': [node.pts_idx[0], node.pts_idx[1]],
            'extrema': node.extrema,
            'parent': node.parent.id if node.parent is not None else None,
            'children': [child.id for child in node.children]
        })
        for child in node.children:
            self.collect(child, array)

    def update(self, merge, idx_map, idx):
        add = []
        remove = set()

        for d in idx_map[merge.dest]:
            n = None
            remove_s = set()
            for s in idx_map[merge.src]:
                if idx(s) == idx(d):
                    if n is None:
                        n = Partition(merge.level, child=d)
                        remove.add(d) # can't be removed during the iterations
                        add.append(n)
                    n.add_child(s)
                    remove_s.add(s)  # can't be removed during the iterations
            for s in remove_s:
                self.remove(s)

        for s in idx_map[merge.src]:
            n = Partition(merge.level, child=s)
            if idx(s) == s.min_idx:
                n.max_idx = merge.dest
            else:
                n.min_idx = merge.dest
            add.append(n)

        for r in remove | idx_map[merge.src]:
            self.remove(r)

        # assign the eliminated extrema as an extra internal point to the first new partition
        add[0].extrema = [merge.src]
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
            add.remove(partition.min_idx)
            add.remove(partition.max_idx)
            if len(add) > 0:
                self.pts.extend(add)
                idx += len(add)
        else:
            if partition.extrema is not None:
                self.pts.extend(partition.extrema)
                idx += len(partition.extrema)
            for child in partition.children:
                idx = self.visit(child, idx)

        partition.pts_idx = (first, idx)
        return idx

    def count(self, partition):
        if len(partition.children) == 0:
            return 0, 1
        n = 1
        b = 0
        for child in partition.children:
            n1, b1 = self.count(child)
            n += n1
            b += b1
        return n, b


def post(args=None):
    p = argparse.ArgumentParser(prog='analyze', description='Extract input dimension and a single measure')
    p.add_argument('filename', help='input data file [.csv format]')
    p.add_argument('-k', '--knn', type=int, default=100, help='knn')
    p.add_argument('-b', '--beta', type=float, default=1.0, help='beta')
    p.add_argument('-n', '--norm', default='feature', help='norm')
    p.add_argument('-g', '--gradient', default='steepest', help='gradient')
    p.add_argument('-G', '--graph', default='relaxed beta skeleton', help='graph')

    p.add_argument('-d', '--dims', type=int, default=None, help='number of input dimensions')
    p.add_argument('-m', '--measure', default=None, help='measure name')
    p.add_argument('-c', '--col', type=int, default=-1, help='measure column index starting at 0')
    p.add_argument('-a', '--all', action='store_true', help='process all measures')

    p.add_argument('--name', default=None, help='dataset name')

    p.add_argument('--debug', action='store_true', help='process all measures')

    ns = p.parse_args(args)
    path = Path(ns.filename).parent

    with open(ns.filename) as f:
        reader = csv.reader(f)
        header = next(reader)
        data = [[float(x) for x in row] for row in reader]

    dims = ns.dims if ns.dims is not None else len(header) - 1
    data = np.array(data)
    x = data[:, 0:dims]

    measures = []
    if ns.all:
        measures = range(dims, len(header))
    elif ns.measure:
        if ns.measure in header:
            measures = [header.index(ns.measure)]
        else:
            print('unknown measure:', ns.measure)
            exit(255)
    else:
        measures = [ns.col]

    catalog_path = path / 'catalog.json'
    if catalog_path.exists():
        with open(catalog_path) as f:
            catalog = json.load(f)
    else:
        catalog = {
            'name': Path(ns.filename).parent,
            'data': Path(ns.filename).name,
            'dims': dims,
            'msc': []
        }

    if ns.name is not None:
        catalog['name'] = ns.name

    available = set(catalog['msc'])
    for measure in measures:
        try:
            name = header[measure]
            print('post ', name)
            y = data[:, measure]
            msc = MSC(ns.graph, ns.gradient, ns.knn, ns.beta, ns.norm)
            msc.Build(X=x, Y=y, names=header[:dims]+[name])
            Post(ns.debug).data(msc.base_partitions, msc.hierarchy).build().save(path, name)
            available.add(name)
        except RuntimeError as error:
            print(error)

    catalog['msc'] = sorted(list(available))
    with open(catalog_path, 'w') as f:
        json.dump(catalog, f, indent=2)

    # msc.LoadData(ns.filename)
    # msc.Save(path / 'Hierarchy.csv', path / 'Base_Partition.json')
    # Post().load(path).build().rearrange().save(path / 'msc.json')


if __name__ == '__main__':
    post()
