import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";

import template from './resample.html';
import './style.css';

let root = null;
let msc = null;

let format = d3.format('.2g');

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('resample', true);
  root.html(template);

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('partition.selected', (topic, partition) => selected(partition));
}

function reset(data) {
  msc = data;
}

function selected(partition) {
  root.select('#resample-id')
    .text(partition.id);
}
