import * as d3 from 'd3';

import {Model} from '../model';
import {pubsub} from "../utils/pubsub";


import Tree from './lifeline';
import Slider from '../components/slider'

import template from './tree_view.html';
import './style.scss';


export function LifelineView(container_, state_) {
  let container = container_;

  let root = null;
  let tree = Tree();
  let listeners = new Map();

  let slider = Slider();

  let prevent = false;
  let saved = [0, 0];

  let model = Model();
  let msc = model.msc;


  let sliders = [
    { id: 'x', type: 'linear', domain: [Number.EPSILON, 1], ticks: {n: 5, format: 'd'}, selection: [0, 1]},
    { id: 'y', type: 'log', domain: [Number.EPSILON, 1], ticks:{ n: 4, format: '.1e'}, selection: [0.3, 1]}
  ];

  let {publish, subscribe, unsubscribe} = pubsub();

  root = d3.select(container.getElement()[0]);
  root.html(template);

  sliders.forEach(slider => {
    slider.type = localStorage.getItem(`tree.${slider.id}.type`);
    let s = localStorage.getItem(`tree.${slider.id}.selection`);
    slider.selection = s && JSON.parse(s) || slider.domain;
  });

  root.select('#tree-x-type')
    .on('change', select_x_type)
    .property('value', sliders[0].type);

  root.select('#tree-y-type')
    .on('change', select_y_type)
    .property('value', sliders[1].type);

  tree
    .on('highlight', (node, on) => publish('partition.highlight.lifeline', node, on))
    .on('select', (node, on) => publish('partition.selected', node, on))
    .on('details', (node, on) => publish('partition.details', node, on))
    .x_type(sliders[0].type)
    .y_type(sliders[1].type);

  if (model.features) {
    tree
      .filter(model.features.filter())
      .color_by(model.color_by);
  }

  root.select('.lifeline').call(tree);

  slider.on('change', on_slider_change);

  root.selectAll('.slider')
    .data([sliders[1], sliders[0]])
    .call(slider);

  register();

  function register() {
    container.on('resize', () => resize());
    container.on('destroy', () => on_close());
    container.on('open', () => on_open);

    monitor('data.msc', (topic, data) => reset(data));
    monitor('data.shared_msc', (topic, data) => reset(null));
    monitor('filters.updated', () => tree.update());

    monitor('partition.highlight', (topic, partition, on) =>  tree.highlight(partition, on));
    monitor('partition.highlight_list', (topic, partitions, on) => tree.highlight_list(partitions, on));

    monitor('partition.details', (topic, partition, on) => tree.details(partition, on));
    monitor('partition.selected', (topic, partition, on) => tree.selected(partition, on));

    monitor('filters.new', (topic, filter) => tree.filter(filter));
    monitor('filters.show', (topic, value) => tree.show(value));
    monitor('filters.update', (topic) => tree.update());
    monitor('show.color_by', (topic, feature) => tree.color_by(feature));
  }

  function monitor(topic, cb) {
    listeners.set(topic, subscribe(topic, cb));
  }

  function on_close() {
    for (let [topic, listener] of listeners) {
      unsubscribe(topic, listener);
    }
    listeners = new Map();
  }


  function resize() {
    let rw = container.width; // parseInt(root.style('width'));
    let rh = container.height; // parseInt(root.style('height'));
    let ch = parseInt(root.select('.config').style('height'));

    root.select('.tree')
      .style('width', rw)
      .style('height', rh - ch);

    root.select('.lifeline').call(tree);
    // tree.set_size(rw-20, rh - ch);
  }

  function on_open() {
    reset(msc);
  }

  function reset(data) {
    msc = data;

    process_data();

    if (!data)
      tree.data([], null);
    else {
      tree.x_range([0, msc.pts.length]);
      sliders[0].domain = [Number.EPSILON, msc.pts.length];
      root.selectAll('.slider').call(slider);

      publish('data.updated', msc);
      tree.data(msc.partitions, msc.tree);
    }
  }

  function process_data() {
    if (!msc) return;
    visit(msc.tree, 'parent_similarity', node => node.parent);

    visit(msc.tree, 'sibling_similarity', sibling );
    msc.partitions.forEach( p => p.model.minmax = p.minmax);


    function visit(node, feature, func) {
      let other = func(node);
      if (other) {
        let c = node.model.linear_reg.coeff;
        let o = other.model.linear_reg.coeff;

        if (c.norm === undefined) c.norm = norm(c);
        if (o.norm === undefined) o.norm = norm(o);

        node.model[feature] = dot(c,o)/(c.norm * o.norm);
      } else {
        node.model[feature] = 1;
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
      }
      return null;
    }
  }

  function select_y_type() {
    tree.y_type(this.value);
    root.select('#persistence_slider').call(slider);
    localStorage.setItem('tree.y.type', this.value);
  }

  function select_x_type() {
    tree.x_type(this.value);
    root.select('#size_slider').call(slider);
    localStorage.setItem('tree.x.type', this.value);
  }

  function on_slider_change(data, range) {
    if (data.id === 'x') {
      tree.x_range(range);
      localStorage.setItem('tree.x.selection', JSON.stringify(range));
    }
    else {
      tree.y_range(range);
      localStorage.setItem('tree.y.selection', JSON.stringify(range));
    }
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
}