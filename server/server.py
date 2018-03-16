import os
from bottle import Bottle, run, static_file, post, request
from pathlib import Path
import json
import argparse
import sample

p = argparse.ArgumentParser(description='Regulus server')
p.add_argument('-d', '--data', default=None, help='data directory')
args = p.parse_args()

data_dir = Path(args.data or os.environ['REGULUS_DATA_DIR'] or '../data')
print('*** Using data dir:',data_dir)

app = Bottle()


@app.route('/')
@app.route('/<filename>')
def static(filename='index.html'):
    return static_file(filename, root='../dist')


@app.route('/data/<path:path>')
def data(path):
    print('dataset', path)
    return static_file(path, root=str(data_dir))

@app.route('/resample')
#@app.post('/resample')
def resample():
    spec = request.json
    print('resample post received', spec)
    sample.createsample(spec)
    return


run(app, host='localhost', port=8081, debug=True, reloader=True)

