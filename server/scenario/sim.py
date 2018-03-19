import os
import sys
import subprocess
import argparse
import csv
import xml.etree.ElementTree as ET
from xml.dom import minidom
from pathlib import Path
import time

from .generator import Generator
from .measures import Measures


def save(filename, scenario):
    xml_str = minidom.parseString(ET.tostring(scenario)).toprettyxml(indent="", newl="")
    with open(filename, 'w') as f:
        f.write(xml_str)


def parse(args):
    p = argparse.ArgumentParser(prog='scenario', description='Cyclus scenario geneartor')
    p.add_argument('-t', '--template', default='template.json', dest='template_file', help='template file')
    p.add_argument('-o', '--output', default='scenarios', dest='output', help='output directory')
    p.add_argument('-s', '--offset', default='0', type=int, dest='offset', help='first output number')

    p.add_argument('-n', '--samples', default=1, dest='samples', type=int, help='number of scenarios to generate')
    ## New
    p.add_argument('-p', '--parameters', default='', dest='params', help='parameters to resample')


    p.add_argument('-d', '--demand', default='10000', type=float, dest='initial_demand', help='initial demand')
    p.add_argument('-r', '--report', default='params.csv',  dest='report', help='report file')
    ns = p.parse_args(args)
    return ns


def sim(args=None):
    args = sys.argv[1:] if args is None else args
    ns = parse(args)
    path = Path(ns.output)
    if not path.exists():
        path.mkdir()

    generator = Generator(ns)
    measures = Measures(generator.demand)

    xml_filename = str(path / 'scenario.xml')
    db = str(path / 'cyclus.sqlite')
    log = open(str(path / 'log'), 'w')

    with open(path / ns.report, 'w') as f:
        report = csv.writer(f)
        report.writerow(generator.header + measures.header)

    if ns.params == '':

        for i in range(ns.samples):
            print('sim',i)
            os.system('rm '+db)

            print('\tcreate...', end="")
            t = time.time()
            scenario, params = generator.author()
            print("scenario")
            print(scenario)
            print("params")
            print(params)
            save(xml_filename, scenario)
            print("{:.3f}".format(time.time() - t))

            print('\tcyclus...', end="")
            t = time.time()
            subprocess.run(['cyclus', xml_filename, '-o', db], check=True, stdout=log, stderr=log, universal_newlines=True)
            print("{:.3f}".format(time.time()-t))

            print('\tpost...', end="")
            t = time.time()
            subprocess.run(['cyan', '-db', db, 'post'], check=True, stdout=log, stderr=log)
            print("{:.3f}".format(time.time()-t))

            print('\tmeasures...', end="")
            t = time.time()
            values = measures.compute(db)
            print("{:.1f}".format(time.time()-t))

            with open(path / ns.report, 'a') as f:
                report = csv.writer(f)
                report.writerow(params + values)

    else:
        with open(ns.params, "r") as f:
            reader = csv.reader(f, delimiter=",")
            data = [[float(x) for x in row] for row in reader]
        for j in range(len(data)):
            print('sim', j)
            os.system('rm ' + db)
            print('\tcreate...', end="")
            t = time.time()

            scenario, params = generator.buthor(data[j])


            save(xml_filename, scenario)
            print("{:.3f}".format(time.time() - t))

            print('\tcyclus...', end="")
            t = time.time()
            subprocess.run(['cyclus', xml_filename, '-o', db], check=True, stdout=log, stderr=log,
                           universal_newlines=True)
            print("{:.3f}".format(time.time() - t))

            print('\tpost...', end="")
            t = time.time()
            subprocess.run(['cyan', '-db', db, 'post'], check=True, stdout=log, stderr=log)
            print("{:.3f}".format(time.time() - t))

            print('\tmeasures...', end="")
            t = time.time()
            values = measures.compute(db)
            print("{:.1f}".format(time.time() - t))

            with open(path / ns.report, 'w') as f:

                report = csv.writer(f)
                report.writerow(params + values)


if __name__ == '__main__':
    sim()
