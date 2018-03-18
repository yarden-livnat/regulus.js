import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";

import template from './resample.html';
import './style.css';

let root = null;
let msc = null;
let selected = null;
let format = d3.format('.2g');

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('resample', true);
  root.html(template);


  root.select('.submit')
    .attr('disabled', true)
    .on('click', d => resample(root.select('.samples').property('value')));

  root.select('.samples')
    .on('input', function() {
      console.log('input',this.value);
      let disabled = !this.value;
      root.select('.submit').attr('disabled', disabled);
    });

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('partition.selected', (topic, partition, on) => select(partition, on));
}

function reset(data) {
  msc = data;
  selected = null;
  root.select('.submit').attr('disabled', true);
}

function select(partition, on) {
  root.select('#resample-id')
    .text(partition.id);
  root.select('.submit').attr('disabled', !on);
}

function resample(n) {
  console.log('resample', n);
}
