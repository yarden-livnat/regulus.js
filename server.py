import os
from bottle import Bottle, run, static_file
from pathlib import Path
import json
import argparse


p = argparse.ArgumentParser(description='Regulus server')
p.add_argument('-d', '--data', default=None, help='data directory')
args = p.parse_args()

data_dir = Path(args.data or os.environ['REGULUS_DATA_DIR'] or './data')
print('*** Using data dir:',data_dir)

app = Bottle()


@app.route('/')
@app.route('/<filename>')
def static(filename='index.html'):
    return static_file(filename, root='./dist')


# @app.route('/catalog')
# def catalog():
#     datasets = sorted([str(d.name) for d in data_dir.iterdir() if d.is_dir()])
#     print('catalog', datasets)
#     return json.dumps(datasets)


@app.route('/data/<path:path>')
def data(path):
    print('dataset', path)
    return static_file(path, root=str(data_dir))


run(app, host='localhost', port=8081, debug=True, reloader=True)

