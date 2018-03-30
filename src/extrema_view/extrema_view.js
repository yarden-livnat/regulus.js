import * as d3 from 'd3';

import {publish, subscribe} from "../utils";
import template from './extrema_view.html';
import './extrema.css';



let root = null;
let msc = null;

let extrema_map = new Map();

let extrema = [];
let sort_by = 'max';

let width = 100, height = 100;

let format = d3.format('.3g');

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

function add(p, loc, map) {
  let idx = p.minmax_idx[loc];
  let entry = map.get(idx);
  if (!entry) {
    entry = {partitions: new Set(), type: loc};
    map.set(idx, entry);
  }
  entry.partitions.add(p);
}

function reset(msc) {

  let measure = msc.measure;
  let m = measure.name;
  let map = new Map();

  extrema_map = new Map();
  extrema = [];

  if (msc) {
    for (let p of msc.partitions) {
      add(p, 0, map);
      add(p, 1, map);
    }
  }

  let cols = [
    {id: 'id', label: 'id', format: d3.format('d')},
    {id: 'value', label: 'value', format: d3.format('.3g')},
    {id: 'n', label: 'partitions', format: d3.format('d')}
  ];

  for (let [idx, entry] of map.entries()) {
    extrema.push({'id': idx, 'value': msc.pts[idx][m], 'n':entry.partitions.size, type: entry.type && 'max' || 'min'});
    extrema_map.set(idx, {type: entry.type && 'max' || 'min', partitions: Array.from(entry.partitions)});
  }

  if (sort_by === 'max')
    extrema.sort((a, b) => (b.value - a.value));
  else
    extrema.sort((a, b) => (a.value - b.value));


  for (let col of cols) {
    let type = `extrema-${col.id}`;
    let list = root.select(`.${type}s`).selectAll(`.${type}`)
      .data(extrema, d => d.id);

    list.enter()
      .append('div')
      .attr('class', type)
      .classed('extrema-max', d =>
        col.id === 'id' &&  d.type === 'max')
      .classed('extrema-min', d => col.id === 'id' &&  d.type === 'min')
      .on('mouseenter', pt => highlight_pt(pt, true))
      .on('mouseleave', pt => highlight_pt(pt, false))
      .on('click', select_pt)
      .merge(list)
      .text(d => col.format(d[col.id]));

    list.exit().remove();
  }
}

function select_pt(pt) {
  console.log(pt);
}


function highlight_pt(pt, on) {
  let list = extrema_map.get(pt.id);
  
  publish('partitions.highlight', list, on);
}
