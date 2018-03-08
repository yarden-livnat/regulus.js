import * as d3 from 'd3';

import template from './controls.html';
import './style.css';
let root = null;
let pchart =

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('partition_view', true);
  root.html(template);

  subscribe('data.new', (topic, data) => reset(data));
}

function reset(data) {
    msc = data;

    controls.data(msc.tree);
}
