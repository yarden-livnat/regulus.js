import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";

import List from './list';
import template from './tree_view.html';
import './style.css';

let root = null;
let msc = null;
let tree = List();

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('tree_view', true);
  root.html(template);

  tree(root.select('.tree'))
    .on('highlight', (node, on) => publish('partition.highlight', node, on))
    .on('select', (node, on) => publish('partition.selected', node, on))
    .on('edit', node => publish('partition.edit', node));

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('partition.highlight', (topic, partition, on) => {
    tree.highlight(partition, on);
  });
}


function reset(data) {
  msc = data;

  tree.data(msc.tree);
}


