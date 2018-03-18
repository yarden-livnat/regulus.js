import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";
import {resample} from './resample';

import template from './resample.html';
import './style.css';

let root = null;
let msc = null;
let selected = null;
let current = null;

let sigma_scale = 1;
let n_samples = 0;

let queue= [];


let format = d3.format('.2g');

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('resample', true);
  root.html(template);


  root.select('.submit')
    // .attr('disabled', true)
    .on('click', d => submit(root.select('.samples').property('value')));

  root.select('.samples')
    .on('input', function() {
      n_samples = +this.value;
      review();
    });

  root.select('.sigma')
    .on('input', function() {
      update_sigma(+this.value);
    });

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('partition.selected', (topic, partition, on) => select(partition, on));
}

function reset(data) {
  msc = data;
  selected = null;
  current = null;
  queue = [];
  // root.select('.submit').attr('disabled', true);
}

function select(partition, on) {
  root.select('#resample-id')
    .text(partition.id);
  root.select('#resample-name')
    .text(partition.alias);

  selected = on && partition || null;

  if (selected) {
    current = {
      partition: selected,
      spec:  prepare(selected, sigma_scale),
      sigma_scale
    }
  }
  else {
    current = null;
  }
}

function update_sigma(v) {
  sigma_scale = v;
  if (current) {
    current.sigma_scale = v;
    current.spec = prepare(current.partition, v);
    review();
  }
}

function prepare(partition, scale) {
  let reg = partition.regression_curve;

  let m = reg.columns.length-1;
  let measure = [];
  for (let j=0; j<reg.curve.length; j++) {
    measure.push(reg.curve[j][m]);
  }
  let spec = {
    name: reg.columns[m],
    measure,
    dims: [],

  };

  for (let i=0; i<reg.columns.length-1; i++) {
    let from = [], to = [];

    for (let j=0; j<reg.curve.length; j++) {
      from.push(reg.curve[j][i] - scale*reg.std[j][i]/2);
      to.push(reg.curve[j][i] + scale*reg.std[j][i]/2);
    }
    spec.dims.push({
      name: reg.columns[i],
      from,
      to
    });
  }

  return spec;
}


function review() {
  if (!current) return;

  let proposed = resample(current.spec, n_samples);

  let reg = current.partition.regression_curve;

  let pts = [];
  let y = reg.columns.length-1;
  for (let p of proposed) {
    let pt = {};
    for (let i=0; i<p[1].length; i++)
      pt[reg.columns[i]] = p[1][i];
    pt[reg.columns[y]] = p[0];
    pts.push(pt);
  }
  current.pts = pts;
  publish('resample.pts', pts);
}

function submit(n) {
  if (!current) return;

  service.submit_resample({
    name: msc.name,
    version: msc.version +'.1',
    pts: current.pts
  })
}
