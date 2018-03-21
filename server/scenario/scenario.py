import sys
import random
import argparse
import csv
from pathlib import Path
import xml.etree.ElementTree as ET
from xml.dom import minidom

from .eg23 import scheduler

from .utils import create_dir

RANDOM_SEED = 0

VARS = [
    {'name': 'sfr_eff',
     'pattern': ".//*[name='{}']//eff".format('sfr_reprocessing'),
     'values': [0.9, 0.99, 0.999],
    },

    {'name': 'uox_eff',
     'pattern': ".//*[name='{}']//eff".format('uox_reprocessing'),
     'values': [0.9, 0.99, 0.999],
    },

    {'name': 'tails_assay',
     'pattern': './/*/Enrichment/tails_assay',
     'range': [0.001, 0.005],
    },

    {'name': 'bias',
     'range': [-0.1, 0.1],
    
     },

    {'name': 'lwr_fr',
     'irange': [1, 5],
    
     },

    {'name': 'fr_fr',
     'irange': [10, 15],
    
     },

    {'name': 'fr_start',
     'irange': [20, 40],
    
     },

    # {'name': 'rate',
    #  'values': [1. + i/100.0 for i in range(1, 4)],
    #  'values': [1. + i/100.0 for i in range(1, 4)],
    #  }
]


class Spec(object):
    pass


def xml_set_values(parent, name, values):
    parent.remove(parent.find(name))
    node = ET.SubElement(parent, name)

    for value in values:
        val = ET.SubElement(node, 'val')
        val.text = str(value)


def set_schedule(parent, schedule):
    when, num, what = schedule
    xml_set_values(parent, 'build_times', when)
    xml_set_values(parent, 'n_build', num)
    xml_set_values(parent, 'prototypes', what)


def select_values(root, spec):
    for var in VARS:
        value = None
        if 'values' in var:
            values = var['values']
            value = values[random.randrange(0, len(values))]
        elif 'range' in var:
            values = var['range']
            value = random.uniform(values[0], values[1])
        elif 'irange' in var:
            values = var['irange']
            value = random.uniform(values[0], values[1])

        var['value'] = value
        if 'pattern' in var:
            nodes = root.findall(var['pattern'])
            for node in nodes:
                node.text = str(value)
        else:
            setattr(spec, var['name'], value)


def create_demand(d, rate, years):
    demand = [2000 * (y//4 + 1) for y in range(20)]

    for year in range(20, years):
        d = d*rate
        demand.append(d)
    return demand


def save(scenario, ns, i):
    xmlstr = minidom.parseString(ET.tostring(scenario)).toprettyxml(indent="", newl="")
    with open('{}/scenario_{}.xml'.format(ns.output, i), 'w') as f:
        f.write(xmlstr)


def author(ns, template):
    with open(Path(ns.output)/ns.report, 'w') as f:
        report = csv.writer(f)

        scenario = template.getroot()
        report.writerow(['sim'] + [[var['name'] for var in VARS]])

        spec = Spec()
        spec.years = int(scenario.find('.//duration').text) // 12
        spec.rate = 1.03

        lwr = scenario.find(".//*[name='{}']".format('lwr'))
        lwr_cap = float(lwr.find('.//power_cap').text)
        lwr_lifetime = int(lwr.find('lifetime').text)//12

        fr = scenario.find(".//*[name='{}']".format('fr'))
        fr_cap = float(fr.find('.//power_cap').text)
        fr_lifetime = int(fr.find('lifetime').text) // 12

        spec.capacity = lwr_cap, fr_cap
        spec.lifetime = lwr_lifetime, fr_lifetime

        for i in range(ns.samples):
            lwr_units = [0] * spec.years
            fr_units = [0] * spec.years
            spec.supply = lwr_units, fr_units

            select_values(scenario, spec)

            spec.demand = create_demand(ns.initial_demand, spec.rate, spec.years)

            schedule = scheduler(spec)

            deploy = scenario.find(".//*[name='{}']/config/DeployInst".format('deploy_inst'))
            set_schedule(deploy, schedule)

            save(scenario, ns, i+ns.offset)


            report.writerow([i] + [str(var['value']) for var in VARS])


def load_template(filename):
    return ET.parse(filename)


def parse(args):
    p = argparse.ArgumentParser(prog='scenario', description='Cyclus scenario geneartor')
    p.add_argument('-t', '--template', default='template.json', dest='template_file', help='template file')
    p.add_argument('-o', '--output', default='scenarios', dest='output', help='output directory')
    p.add_argument('-s', '--offset', default='0', type=int, dest='offset', help='first output number')

    p.add_argument('-n', '--samples', default=1, dest='samples', type=int, help='number of scenarios to generate')

    p.add_argument('-d', '--demand', default='10000', type=float, dest='initial_demand', help='initial demand')
    p.add_argument('-r', '--report', default='params.csv',  dest='report', help='report file')
    ns = p.parse_args(args)
    return ns


def init(args):
    ns = parse(args)
    template = load_template(ns.template_file)
    create_dir(ns.output)
    random.seed(RANDOM_SEED)
    return ns, template


def create(args=None):
    args = sys.argv[1:] if args is None else args
    ns, template = init(args)
    author(ns, template)


if __name__ == '__main__':
    create()

