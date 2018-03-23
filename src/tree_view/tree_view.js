import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";

import Tree from './lifeline';
import Slider from './slider'

import template from './tree_view.html';
import './style.css';

let root = null;
let msc = null;
let tree = Tree();

let y_min = 0.5;
let y_type = 'log';
let y_range = [1e-5, 1];
let slider = Slider();
let prevent = false;
let saved = [0, 0];

export function setup(el) {
  root = d3.select(el);
  root.html(template);

  root.select('#tree-y-type')
    .on('change', select_y_type)
    .property('value', y_type);

  tree
    .on('highlight', (node, on) => publish('partition.highlight', node, on))
    .on('select', (node, on) => publish('partition.selected', node, on))
    .on('details', (node, on) => publish('partition.details', node, on))
    .y_type(y_type)
    .y_min(y_min);

  root.select('.tree').call(tree);
  resize();

  slider
    .range(y_range)
    .on('change', slider_range_update);

  root.select('#persistence-slider')
    .call(slider);

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('data.loaded', (topic, data) => reset(null));
  subscribe('partition.highlight', (topic, partition, on) => tree.highlight(partition, on));
  subscribe('partition.details', (topic, partition, on) => tree.details(partition, on));
  subscribe('partition.selected', (topic, partition, on) => tree.selected(partition, on));
  subscribe('persistence.range', (topic, range) => set_persistence_range(range) );
  subscribe('data.updated', () => tree.update());
}

export function set_size(w, h) {
  if (root) resize();
}

function resize() {
  let rw = parseInt(root.style('width'));
  let rh = parseInt(root.style('height'));
  let ch = parseInt(root.select('.config').style('height'));

  tree.set_size(rw, rh - ch);
}

function reset(data) {
  msc = data;

  if (!data)
    tree.data([], null);
  else
    tree.data(msc.partitions, msc.tree);
}

function select_y_type() {
  tree.y_type(this.value);
}

function set_persistence_range(range) {
  if (!prevent) {
    prevent = true;
    if (saved[0] != range[0] || saved[1] != range[1]) {
      root.select('#persistence-slider')
        .call(slider.move, range);
    }
    prevent = false;
  } else
  if (prevent) console.log('tree set prevent');

}

function slider_range_update(range) {
  tree.range(range);
  if (!prevent) {
    prevent = true;
    saved = range;
    publish('persistence.range', range);
    prevent = false;
  }
  else
  if (prevent) console.log('tree slider prevent');
}