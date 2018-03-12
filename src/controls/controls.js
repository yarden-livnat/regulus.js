import * as d3 from 'd3';
import {publish, subscribe} from '../utils/pubsub';
import template from './controls.html';
import Chart from './chart';
import './style.css';
let root = null;
let msc = null;
let pchart = Chart();

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('control_view', true);
  root.html(template);

  subscribe('data.new', (topic, data) => reset(data));
}

function reset(data) {
    msc = data;

    pchart.data(msc.tree);
}
