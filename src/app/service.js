import {publish } from "../utils/pubsub";

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

function monitor_job(id) {
  console.log('job:', id);
  publish('status', `job id:${id}`);
  check(id);

  function check(id) {
    setTimeout( () => {
      fetch(`status/${id}`)
        .then(r => r.json())
        .then(reply => {
          console.log(`job ${id} status:${reply}`);

          if (reply.status === 'done') {
            publish('status', `job ${id} done`);
          }
          else if (reply.status === 'running') {
            check(id);
          }
        })
    },
    1000);
  }
}

