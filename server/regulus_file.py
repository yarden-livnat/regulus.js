import json
import csv
from pathlib import Path


class RegulusFile(object):
    def __init__(self, name = '', version = '1', dims = [], measures = [], pts = [], mscs = [], notes = ''):
        self.name = name
        self.version = version

        self.dims = dims
        self.measures = measures
        self.pts = pts
        self.mscs = mscs
        self.notes = notes
        self.new_sample_input = []
        self.old_version = ''

    def load_reg(self, data):
        self.name = data['name']
        self.dims = data['dims']
        self.version = data['version']
        self.measures = data['measures']
        self.pts = data['pts']
        self.mscs = data['mscs']
        self.notes = data['notes']

    def load_reg_json(self, filename = None, spec = None, version = None, name = None, dir = None):

        if dir is not None:
            cur_dir = dir
        else:
            cur_dir = Path('.')

        if filename is not None:
            self.dir = cur_dir
            with open(cur_dir / filename) as json_data:
                data = json.load(json_data)
            self.cur_temp = data
            self.load_reg(data)

        elif spec is not None:
            # spec is the file from
            name = spec['name']
            version = spec['version']
            self.load_reg_json(name = name, version = version, dir = cur_dir)

        else:

            if (cur_dir / (name +'.'+ version + '.json')).exists():
                self.load_reg_json(filename = name + '.'+ version + '.json', dir = cur_dir)

            elif (cur_dir/(name +'.json')).exists():
                self.load_reg_json(filename = name + '.json', dir= cur_dir)
            elif (cur_dir/(name +'_mc'+'.json')).exists():
                self.load_reg_json(filename = name + '_mc'+'.json', dir= cur_dir)
            elif (cur_dir/(name +'_mc'+version +'.json')).exists():
                self.load_reg_json(filename = name + '_mc'+version +'.json', dir= cur_dir)

    def add_points(self, pts):
        self.pts = self.pts + pts
        self.new_samples = pts

    def add_pts_from_csv(self, filename):
        with open(filename, newline='') as csvfile:
            reader = csv.reader(csvfile,delimiter=',')
            header = next(reader)
            data = [[float(x) for x in row] for row in reader]
        self.add_points(data)

    # Right now used to load specification received and update class
    def update(self, spec = None, version = None, name = None, notes = None, new_version = None, new_input_object = None, new_sample = None):
        if spec is not None:
            try:
                self.name = spec['name']
                self.old_version = self.version
                self.version = spec['new_version']

                self.extract_input(spec['pts'])
            except KeyError as error:
                print(error)
                exit()

        if version is not None:
            self.version = version
        if name is not None:
            self.name = name
        if notes is not None:
            self.notes = notes
        if new_input_object is not None:
            self.extract_input(new_input_object)
        if new_version is not None:
            self.old_version = self.version
            self.version = new_version

        if new_sample is not None:
            self.new_sample_input = new_sample

    def extract_input(self, data):
        self.new_sample_input = [[ptdict[inputdim] for inputdim in self.dims] for ptdict in data]
        print("NEW_SAMPLE_INPUT", self.new_sample_input)
    def save_sample_inputs(self, filename):

        with open(filename, 'w') as f:
            report = csv.writer(f,delimiter=',')
            report.writerows(self.new_sample_input)

    def report_sample_input(self):
        return self.new_sample_input

    def save_all_pts(self, dir = None):
        if dir is None:
            dir = self.dir
        filename = str(dir/(self.name+'.'+self.version+'.csv'))
        header = self.dims+self.measures
        with open(filename, 'w') as f:
            report = csv.writer(f,delimiter=',')
            report.writerow(header)
            report.writerows(self.pts)

        return filename

    def save_json(self, dir = None):

        if dir is None:
            dir = self.dir
        reg_data = {}

        reg_data['pts'] = self.pts
        reg_data['mscs'] = self.mscs
        reg_data['name'] = self.name
        reg_data['version'] = self.version
        reg_data['notes'] = self.notes
        reg_data['measures'] = self.measures
        reg_data['dims'] = self.dims

        filename = str(dir/(self.name+'.'+self.version+'.json'))
        with open(filename, 'w') as f:
            json.dump(reg_data, f)

        return filename



