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

let features = [
  {id: 0, name: 'fitness', range: [0.8,1], step: 0.001, value: 0.5},
  {id: 1, name: 'parent_similarity', range: [-1, 1], step: 0.01, value: 0.5},
  {id: 2, name: 'sibling_similarity', range: [-1, 1], step: 0.01, value: 0.5}
];

let current_feature = features[0];

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
    .y_min(y_min)
    .feature(current_feature)
    .feature_value(current_feature.value);

  root.select('.tree').call(tree);
  resize();

  slider
    .range(y_range)
    .on('change', slider_range_update);

  root.select('#persistence-slider')
    .call(slider);

  root.select('.feature-name')
    .on('change', select_feature)
    .selectAll('option')
      .data(features)
    .enter()
      .append('option')
      .attr('value', d => d.id)
      .text(d => d.name);

  root.select('.feature-slider')
    .on('input', update_feature);

  root.select('.feature-value').text(+root.select('.feature-slider').attr('value'));

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('data.loaded', (topic, data) => reset(null));
  subscribe('data.updated', () => tree.update());

  subscribe('partition.highlight', (topic, partition, on) => tree.highlight(partition, on));
  subscribe('partition.details', (topic, partition, on) => tree.details(partition, on));
  subscribe('partition.selected', (topic, partition, on) => tree.selected(partition, on));
  subscribe('persistence.range', (topic, range) => set_persistence_range(range) );

  subscribe('color-by', (topic, on) => tree.show_simcf)
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

  process_data();

  if (!data)
    tree.data([], null);
  else
    tree.data(msc.partitions, msc.tree);
}

function process_data() {
  if (!msc) return;
  visit(msc.tree, 'parent_similarity', node => node.parent);
  visit(msc.tree, 'sibling_similarity', sibling );

  function visit(node, feature, func) {
    let other = func(node);
    if (other) {
      let c = node.model.linear_reg.coeff;
      let o = other.model.linear_reg.coeff;

      if (c.norm === undefined) c.norm = norm(c);
      if (o.norm === undefined) o.norm = norm(o);

      node.model[feature] = dot(c,o)/(c.norm * o.norm);
      // console.log('similarity:', node.id, node.similarity);
    } else {
      node.model[feature] = 0;
    }
    for (let child of node.children)
      visit(child, feature, func);
  }

  function norm(vec) {
    return Math.sqrt(vec.reduce( (a,v) => a + v*v, 0));
  }

  function dot(v1, v2) {
    let d = 0;
    for (let i=0; i<v1.length; i++) d += v1[i]*v2[i];
    return d;
  }

  function sibling(node) {
    if (node.parent) {
      for (let child of node.parent.children)
        if (child !== node) return child;
      return null;
    }
  }
}

function select_y_type() {
  tree.y_type(this.value);
}

function set_persistence_range(range) {
  if (!prevent) {
    prevent = true;
    if (saved[0] !== range[0] || saved[1] !== range[1]) {
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

function select_feature() {
  current_feature = features[+this.value];
  root.select('.feature-slider')
    .attr('min', current_feature.range[0])
    .attr('max', current_feature.range[1])
    .attr('step', current_feature.step)
    .attr('value', current_feature.value);

  tree.feature(current_feature)
    .feature_value(current_feature.value);
}

function update_feature() {
  let value = +this.value;
  root.select('#feature-value').text(value);
  current_feature.value = value;
  tree.feature_value(value);
}