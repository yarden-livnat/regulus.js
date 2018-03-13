import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";

// import Tree from './list';
import Tree from './lifeline';

import template from './tree_view.html';
import './style.css';

let root = null;
let msc = null;
let tree = Tree();

let y_min = 0.5;
let y_type = 'log'
export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('tree_view', true);
  root.html(template);

  root.select('#tree-y-type')
    .on('change', select_y_type)
    .property('value', y_type);

  root.select('#tree-y-min')
    .on('input', set_y_min)
    .property('value', y_min);

  tree(root.select('.tree'))
    .on('highlight', (node, on) => publish('partition.highlight', node, on))
    .on('select', (node, on) => publish('partition.selected', node, on))
    .on('edit', node => publish('partition.edit', node))
    .y_type(y_type)
    .y_min(y_min);

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('partition.highlight', (topic, partition, on) => {
    tree.highlight(partition, on);
  });
  subscribe('data.updated', () => tree.update());
}


function reset(data) {
  msc = data;

  tree.data(msc.partitions, msc.tree);
}

function select_y_type() {
  tree.y_type(this.value);
}

function set_y_min() {
  tree.y_min(+this.value);
}
