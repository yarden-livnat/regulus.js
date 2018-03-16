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

    # {'name': 'tails_assay',
    #  'pattern': './/*/Enrichment/tails_assay',
    #  'range': [0.001, 0.005],
    # },

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


class Generator(object):
    def __init__(self, ns):
        self.ns = ns
        self.template = ET.parse(ns.template_file)
        self.scenario = self.template.getroot()
        self.demand = []
        self.header = []
        self.spec = None
        self.rate = 1.02
        self.init()

    @staticmethod
    def xml_set_values(parent, name, values):
        parent.remove(parent.find(name))
        node = ET.SubElement(parent, name)

        for value in values:
            val = ET.SubElement(node, 'val')
            val.text = str(value)

    @staticmethod
    def set_schedule(parent, schedule):
        when, num, what = schedule
        Generator.xml_set_values(parent, 'build_times', when)
        Generator.xml_set_values(parent, 'n_build', num)
        Generator.xml_set_values(parent, 'prototypes', what)

    def select_values(self, spec):
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
                value = random.randrange(values[0], values[1])

            var['value'] = value
            if 'pattern' in var:
                nodes = self.scenario.findall(var['pattern'])
                for node in nodes:
                    node.text = str(value)
            else:
                setattr(spec, var['name'], value)

    def pick_values(self, spec,samples):
        for idx,var in enumerate(VARS):
            value = None
            # if 'values' in var:
            #     values = var['values']
            #     value = values[random.randrange(0, len(values))]
            # elif 'range' in var:
            #     values = var['range']
            #     value = random.uniform(values[0], values[1])
            # elif 'irange' in var:
            #     values = var['irange']
            #     value = random.randrange(values[0], values[1])
            value = float(samples[idx])
            var['value'] = value

            if 'pattern' in var:
                nodes = self.scenario.findall(var['pattern'])
                for node in nodes:
                    node.text = str(value)
            else:
                setattr(spec, var['name'], value)

    def create_demand(self, d, rate, years):
        self.demand = [2000 * (y//4 + 1) for y in range(20)]
        for year in range(20, years):
            d = d*rate
            self.demand.append(d)

    def init(self):
        # random.seed(RANDOM_SEED)
        self.header = [var['name'] for var in VARS]

        self.spec = Spec()
        self.spec.years = int(self.scenario.find('.//duration').text) // 12
        self.spec.rate = self.rate

        lwr = self.scenario.find(".//*[name='{}']".format('lwr'))
        lwr_cap = float(lwr.find('.//power_cap').text)
        lwr_lifetime = int(lwr.find('lifetime').text)//12

        fr = self.scenario.find(".//*[name='{}']".format('fr'))
        fr_cap = float(fr.find('.//power_cap').text)
        fr_lifetime = int(fr.find('lifetime').text) // 12

        self.spec.capacity = lwr_cap, fr_cap
        self.spec.lifetime = lwr_lifetime, fr_lifetime

        self.create_demand(self.ns.initial_demand, self.spec.rate, self.spec.years)
        self.spec.demand = self.demand

    def author(self):
        lwr_units = [0] * self.spec.years
        fr_units = [0] * self.spec.years
        self.spec.supply = lwr_units, fr_units

        self.select_values(self.spec)
        schedule = scheduler(self.spec)

        deploy = self.scenario.find(".//*[name='{}']/config/DeployInst".format('deploy_inst'))
        self.set_schedule(deploy, schedule)

        return self.scenario, [str(var['value']) for var in VARS]


    def buthor(self,samples):
        lwr_units = [0] * self.spec.years
        fr_units = [0] * self.spec.years
        self.spec.supply = lwr_units, fr_units

        self.pick_values(self.spec,samples)
        schedule = scheduler(self.spec)

        deploy = self.scenario.find(".//*[name='{}']/config/DeployInst".format('deploy_inst'))
        self.set_schedule(deploy, schedule)

        return self.scenario, [str(var['value']) for var in VARS]


