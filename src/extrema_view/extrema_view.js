import * as d3 from 'd3';

import {publish, subscribe} from "../utils";
import template from './extrema_view.html';
import './extrema.css';



let root = null;
let msc = null;
let extrema = [];
let width = 100, height = 100;

let format = d3.format('.2g');

export function setup(el) {
  root = d3.select(el);
  root.html(template);

  resize();

  subscribe('data.new', (topic, data) => reset(data));
}


export function set_size(w, h) {
  [width, height] = [w, h];
  if (root) resize();
}

function resize() {
  root.select('.extrema_view')
    .style('max-width', `${width-5}px`)
    .style('max-height', `${height}px`);
}

function reset(msc) {
  let set = new Set();
  let measure = msc.measure;
  let m = measure.name;

  if (msc) {
    for (let p of msc.partitions) {
      set.add(p.minmax_idx[0]);
      set.add(p.minmax_idx[1]);
    }
  }

  extrema = [];
  for (let idx of set.values()) {
    extrema.push(msc.pts[idx]);
  }

  console.log('found', extrema.length, ' extrema');
  extrema.sort((a, b) => (b[m] - a[m]));

  let d3pts = root.select('.extrema').selectAll('li')
    .data(extrema, d => d.id);

  d3pts.enter()
    .append('li')
    .attr('class', 'extrema-pt')
    .on('click', select_pt)
    .merge(d3pts)
    .text(d => d[m]);

  d3pts.exit().remove();
}

function select_pt(pt) {

}
