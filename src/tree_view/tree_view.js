import * as d3 from 'd3';
import * as chromatic from "d3-scale-chromatic";

import {publish, subscribe} from "../utils/pubsub";
import {AttrRangeFilter, AttrValueFilter} from "../model/attr_filter";
import {and} from '../model/filter';
import Tree from './lifeline';
import Slider from './slider'

import template from './tree_view.html';
import feature_template from './feature.html';
import './style.css';
import './feature.css';

let root = null;
let msc = null;
let tree = Tree();

let format= d3.format('.3f');

let slider = Slider();
let prevent = false;
let saved = [0, 0];

let features = [];

init_features();

function init_features() {
  add_fitness_feature();
  add_parent_feature();
  add_sibling_feature();
  add_minmax_feature()
}

function add_fitness_feature() {
  let name = 'fitness';
  let domain = [0.8, 1];
  let cmap = ["#3e926e", "#f2f2f2", "#9271e2"];
  let colorScale = d3.scaleSequential(d3.interpolateRgbBasis(cmap)).domain(domain);

  features.push({
    id: 0, name: name, label: 'fitness',
    domain: domain, step: 0.001, value: 1,
    cmp: (a, b) => a > b,
    filter: AttrValueFilter('fitness', null, (a, b) => a > b),
    active: false,
    cmap: cmap,
    colorScale: colorScale,
    color: p => colorScale(p.model[name]),
    interface: true
  });
}

function add_parent_feature() {
  let name = 'parent_similarity';
  let domain = [-1, 1];
  let cmap = ["#4472a5", "#f2f2f2", "#d73c4a"];
  let colorScale = d3.scaleSequential(d3.interpolateRgbBasis(cmap)).domain(domain);

  features.push({
    id: 1, name: name, label: 'parent similarity',
    domain: domain, step: 0.01, value: 0.5,
    cmp: (a, b) => a < b,
    filter: AttrValueFilter('parent_similarity', null, (a, b) => a < b),
    active: false,
    cmap: cmap,
    colorScale: colorScale,
    color: p => {
      let c = colorScale(p.model[name]);
      return c;
    },
    interface: true
  });
}

function add_sibling_feature() {
  let name = 'sibling_similarity';
  let domain = [-1, 1];
  let cmap = ["#4472a5", "#f2f2f2", "#d73c4a"];
  let colorScale = d3.scaleSequential(d3.interpolateRgbBasis(cmap)).domain(domain);

  features.push({
    id: 2, name: name, label: 'sibling similarity',
    domain: domain, step: 0.01, value: 0.5,
    cmp: (a, b) => a < b,
    filter: AttrValueFilter('sibling_similarity', null, (a, b) => a < b),
    active: false,
    cmap: cmap,
    colorScale: colorScale,
    color: p => colorScale(p.model[name]),
    interface: true
  });
}

function add_minmax_feature() {
  let name = 'minmax';
  let domain = [0, 1];
  let cmap = chromatic['interpolateRdYlBu'];
  // let colorScale = d3.scaleSequential(cmap).domain(domain);
  let colorScale = d3.scaleLinear().domain(domain).range(['blue', 'red']);

  features.push({
    id: 3, name: name, label: 'min max',
    domain: domain, step: 1, value: 0.5,
    cmp: (a, b) => a < b,
    filter: AttrRangeFilter('minmax'),
    active: false,
    cmap: cmap,
    colorScale: colorScale,
    color: p => {
      let c= colorScale(p);
      return c;
    },
    interface: false
  });
}


let sliders = [
  { id: 'y', type: 'log', domain: [Number.EPSILON, 1], ticks:{ n: 4, format: '.1e'}, selection: [0.3, 1]},
  { id: 'x', type: 'linear', domain: [Number.EPSILON, 1], ticks: {n: 5, format: 'd'}, selection: [0, 1]}
];

let filter = and();

features.forEach(f => filter.add(f.filter));

export function setup(el) {
  root = d3.select(el);
  root.html(template);

  load_setup();

  root.select('#tree-y-type')
    .on('change', select_y_type)
    .property('value', sliders[0].type);

  root.select('#tree-x-type')
    .on('change', select_x_type)
    .property('value', sliders[1].type);

  tree
    .on('highlight', (node, on) => publish('partition.highlight', node, on))
    .on('select', (node, on) => publish('partition.selected', node, on))
    .on('details', (node, on) => publish('partition.details', node, on))
    .y_type(sliders[0].type)
    .x_type(sliders[1].type)
    .filter(filter);

  root.select('.tree').call(tree);
  resize();

  slider.on('change', on_slider_change);

  let s = root.selectAll('.slider')
    .data(sliders)
    .call(slider);

  subscribe('init', init);
  subscribe('data.new', (topic, data) => reset(data));
  subscribe('data.loaded', (topic, data) => reset(null));
  subscribe('data.updated', () => tree.update());

  subscribe('partition.highlight', (topic, partition, on) => tree.highlight(partition, on));
  subscribe('partition.details', (topic, partition, on) => tree.details(partition, on));
  subscribe('partition.selected', (topic, partition, on) => tree.selected(partition, on));
  subscribe('persistence.range', (topic, range) => set_persistence_range(range) );
}

export function set_size(w, h) {
  if (root) resize();
}

let version='1';

function load_setup() {
  if (localStorage.getItem('tree_view.version') === version) {
    features[0].value = +localStorage.getItem(`feature.${features[0].name}.value`);
    features[0].active = localStorage.getItem(`feature.${features[0].name}.active`) === 'on';

    features[1].value = +localStorage.getItem(`feature.${features[1].name}.value`);
    features[1].active = localStorage.getItem(`feature.${features[1].name}.active`) === 'on';

    features[2].value = +localStorage.getItem(`feature.${features[2].name}.value`);
    features[2].active = localStorage.getItem(`feature.${features[2].name}.active`) === 'on';

    features.forEach(f => {
      f.filter.active(f.active);
      if (f.filter.value)
        f.filter.value(f.value);
    });

    sliders[0].type = localStorage.getItem('tree.y.type');
    sliders[1].type = localStorage.getItem('tree.x.type');
  } else {
    localStorage.setItem('tree_view.version', version);
  }
}

function resize() {
  let rw = parseInt(root.style('width'));
  let rh = parseInt(root.style('height'));
  let ch = parseInt(root.select('.config').style('height'));

  tree.set_size(rw, rh - ch);
}

function init() {
  let d3features = d3.select('.filtering_view')
    .selectAll('.feature')
    .data(features.filter(f => f.interface))
    .enter()
    .append('div')
    .html(feature_template);

  d3features.select('.feature-name').text(d => d.label);

  d3features.select('.feature-active')
    .property('checked', d => d.active)
    .on('change', activate_filter);

  d3features.select('.feature-slider')
    .property('value', d => d.value)
    .on('input', update_feature);

  d3features.select('.feature-cmap')
    .style('background-image', d => `linear-gradient(to right, ${d.cmap.join()}`);

  d3features.select('.feature-value')
    .text(d => format(d.value));

  d3features.select('.feature-slider')
    .attr('min', d => d.domain[0])
    .attr('max', d => d.domain[1])
    .attr('step', d => d.step)
    .property('value', d => d.value)
    .each( function(d) {
      update_feature.call(this, d);
    });

  let idx = +localStorage.getItem('feature.color_by') || 0;
  tree.color_by(features[idx]);

  d3.select('.filtering_view .feature-color')
    .on('change', update_color_by)
    .selectAll('option')
    .data(features)
    .enter()
    .append('option')
    .attr('value', d => d.id)
    .property('selected', d => +d.id === idx)
    .text(d => d.label);

  let show = localStorage.getItem('feature.show_opt');
  d3.select('.filtering_view').selectAll('input[name="show-nodes')
    .property('checked', function() { return this.value === show;})
    .on('change', function() {
      tree.show(this.value);
      localStorage.setItem('feature.show_opt', this.value);
    });


}

function reset(data) {
  msc = data;

  process_data();

  if (!data)
    tree.data([], null);
  else {
    tree.x_range([0, msc.pts.length]);
    sliders[1].domain = [Number.EPSILON, msc.pts.length];
    let mmf = features.find(f => f.name === 'minmax');
    mmf.domain =  [msc.minmax[0], msc.minmax[1]];
    mmf.colorScale.domain(mmf.domain);
    console.log(`new data: min/max: ${mmf.domain}`);

    root.selectAll('.slider').call(slider);
    tree.data(msc.partitions, msc.tree);
  }
}

function process_data() {
  if (!msc) return;
  visit(msc.tree, features[1].name, node => node.parent);
  visit(msc.tree, features[2].name, sibling );

  function visit(node, feature, func) {
    if (!node ) {
      console.log("**** process_data: null node");
      return;
    }
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
      return null;
    }
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
    localStorage.setItem('tree.x.range', JSON.stringify(range));
  }
  else {
    tree.y_range(range);
    localStorage.setItem('tree.y.range', JSON.stringify(range));
  }
}

function set_persistence_range(range) {
  // if (!prevent) {
  //   prevent = true;
  //   if (saved[0] !== range[0] || saved[1] !== range[1]) {
  //     root.select('#persistence-slider')
  //       .call(slider.move, range);
  //   }
  //   prevent = false;
  // } else
  // if (prevent) console.log('tree set prevent');

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


function update_feature(feature) {
  let section = d3.select(this.parentNode.parentNode);

  feature.value = +this.value;
  feature.filter.value(feature.value);
  let at = 100*(feature.value - feature.domain[0])/(feature.domain[1] - feature.domain[0]);
  let [left, right] = feature.id === 0 ? [0, 100-at] : [at, 0];

  section.select('.feature-value').text(format(feature.value));

  if (feature.id === 0)
    section.select('.feature-cover')
      .style('left', null)
      .style('width', `${at}%`);
  else
    section.select('.feature-cover')
      .style('left', `${at}%`)
      .style('width', `${100-at}%`);

  tree.update();
  localStorage.setItem(`feature.${feature.name}.value`, String(feature.value));

}

function activate_filter(feature) {
  let active = d3.select(this).property('checked');
  feature.active = active;
  feature.filter.active(feature.active);
  tree.update();
  localStorage.setItem(`feature.${feature.name}.active`, feature.active ? 'on' : 'off');
}

function update_color_by() {
  let feature = features[+this.value];
  tree.color_by(feature);
  localStorage.setItem('feature.color_by', feature.id);
}