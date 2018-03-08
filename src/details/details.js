import * as d3 from 'd3';
import {publish, subscribe} from "../utils";

import Group from '../components/group';
import template from './details.html';
import './style.css';

let root = null;
let group = Group();

let msc = null;
let partitions = [];

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('details', true);
  root.html(template);

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('partition.selected', (topic, partition, on) => on ? add(partition) : remove(partition));
}

function reset(data) {
  render([]);
  msc = data;
 // group.dims(msc.dims);
}

function add(partition) {
  if (!partition.pts) {
    partition.pts = msc.pts.slice(partition.pts_idx[0], partition.pts_idx[1]);
  }

  partitions.push({
    id: partition.id,
    name: partition.alias,
    size: partition,
    pts: partition.pts
  });


  // todo: compute partion minmax and update global minmax
  render(partitions);
}

function remove(partition){
  let idx = partitions.findIndex(p => p.id === partition.id);
  if (idx !== -1) {
    partitions.splice(idx, 1);
  }
  // toodo: update global minmax
  render(partitions);
}

function render(list) {
  list.sort( (a,b) => a.id - b.id );
  list.forEach( (d, i) => d.x = i);

  let groups = root.select('.groups').selectAll('.group')
    .data(list, d => d.id);

  groups.enter()
    .append('div')
    .call(group.create)
    .merge(groups)
    .call(group);

  groups.exit().remove();
}

