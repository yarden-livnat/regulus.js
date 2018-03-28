import {publish } from "../utils/pubsub";

let JOB_INQUIRY_DELAY = 5000;


export function load_catalog() {
  return fetch('catalog')
    .then( response => response.json() )
}

export function load_dataset(name) {
  return fetch(`data/${name}`)
    .then( d => d.json());
}

export function submit_resample(spec) {
  return fetch('resample', {
    method: 'post',
    body: JSON.stringify(spec),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(r => r.json())
    .then(monitor_job);
}

export function submit_recompute(spec) {
    return fetch('recompute', {
        method: 'post',
        body: JSON.stringify(spec),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(r => r.json())
        .then(monitor_job);
}

export function request_samples(spec) {
    return fetch('request_samples', {
        method: 'post',
        body: JSON.stringify(spec),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then( response =>response.json());
}

function monitor_job(id) {
  publish('status', `job id:${id}`);
  check(id);

  function check(id) {
    setTimeout( () => {
      fetch(`status/${id}`)
        .then(r => r.json())
        .then(reply => {
          if (reply.status === 'done' || reply.status === 'error') {
            publish('status', `job ${id} ${reply.status}`);
          }
          else if (reply.status === 'running') {
            check(id);
          }
        })
    },
      JOB_INQUIRY_DELAY);
  }
}

