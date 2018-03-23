import os
import threading
from bottle import Bottle, run, static_file, post, request
from pathlib import Path
import json
import argparse
from sample import sample

p = argparse.ArgumentParser(description='Regulus server')
p.add_argument('-d', '--data', default=None, help='data directory')
args = p.parse_args()

data_dir = Path(args.data or os.environ['REGULUS_DATA_DIR'] or '../data')
print('*** Using data dir:',data_dir)

app = Bottle()

jobs = dict()
jobs_lock = threading.Lock()


@app.route('/')
@app.route('/<filename>')
def static(filename='index.html'):
    return static_file(filename, root='../dist')


@app.route('/catalog')
def catalog():
    print('req catalog')
    files = [str(f.stem) for f in sorted(data_dir.glob('*.json'))]
    print(files)
    return json.dumps(files)


@app.route('/data/<path:path>')
def data(path):
    print('req data ', path)
    filename = path+'.json'
    print('dataset', filename)
    return static_file(filename, root=str(data_dir))


@app.post('/resample')
def resample():
    spec = request.json
    print('resample request received', spec)

    job = new_job()
    job['status'] = 'scheduled'
    thread = threading.Thread(target=resample_job, args=[job, spec])
    thread.start()

    return job['id']


@app.route('/status/<job_id>')
def status(job_id):
    print('status', job_id)
    with jobs_lock:
        if job_id in jobs:
            job = jobs[job_id]
            reply = {'status': job['status'], 'code': job['code']}
        else:
            reply = {'status': 'unknown job id', 'job_id': job_id}
    print('reply', reply)
    return json.dumps(reply)


def new_job():
    with jobs_lock:
        job = {'id': len(jobs)}
        jobs[job['id']] = job
    return job


def resample_job(job, spec):
    job['status'] = 'started'
    code = sample(spec, data_dir)
    print('job {} done with code:{}'.format(job['id'], code))
    with jobs_lock:
        job['status'] = 'done' if status == 0 else 'error'
        job['code'] = code


run(app, host='localhost', port=8081, debug=True, reloader=True)

