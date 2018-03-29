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

  // subscribe('data.new', (topic, data) => reset(data));
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
  let extrema_map = new Map();
  let measure = msc.measure;
  let m = measure.name;
  let entry;

  if (msc) {
    for (let p of msc.partitions) {
      entry = extrema_map.get(p.minmax_idx[0]);
      if (!entry) {
        entry = new Set();
        extrema_map.set(p.minmax_idx[0], entry)
      }
      entry.add(p);

      entry = extrema_map.get(p.minmax_idx[1]);
      if (!entry) {
        entry = new Set();
        extrema_map.set(p.minmax_idx[1], entry)
      }
      entry.add(p);
    }
  }

  extrema = [];
  for (let idx of extrema_map.values()) {
    extrema.push(msc.pts[idx]);
  }

  console.log('found', extrema.length, ' extrema');
  extrema.sort((a, b) => (b[m] - a[m]));

  let d3pts = root.select('.extrema').selectAll('li')
    .data(extrema, d => d.id);

  d3pts.enter()
    .append('li')
    .attr('class', 'extrema-pt')
    .on('mouseover', pt => highlight_pt(pt, true))
    .on('mouseleave', pt => highlight_pt(pt, false))
    .on('click', select_pt)
    .merge(d3pts)
    .text(d => d[m]);

  d3pts.exit().remove();
}

function select_pt(pt) {

}


function highlight_pt(pt, on) {

}
