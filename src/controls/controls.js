import * as d3 from 'd3';

import template from './controls.html';
import './style.css';

let root = null;

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('controls_view', true);
  root.html(template);
}