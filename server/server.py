import os
from bottle import Bottle, run, static_file, post, request
from pathlib import Path
import json
import argparse


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

@app.route('/catalog')
def catalog():
    files = [str(f.stem) for f in sorted(data_dir.glob('*.json'))]
    print(files)
    return json.dumps(files);
    #return json.dumps(['deployment']);

@app.route('/data/<path:path>')
def data(path):
    filename = path+'.json'
    print('dataset', filename)
    return static_file(filename, root=str(data_dir))

@app.post('/resample')
def resample():
    spec = request.json
    print('resample', spec)
    return


run(app, host='localhost', port=8081, debug=True, reloader=True)

