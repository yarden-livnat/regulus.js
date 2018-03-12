import * as d3 from 'd3';
import {interpolateRdYlBu} from 'd3-scale-chromatic';

import {publish, subscribe} from "../utils";
import {and, or, not, AttrFilter} from '../model';

import Group from './group';
import XAxis from './x_axis';
import template from './details.html';
import './style.css';

let root = null;

let msc = null;
let dims = [];
let partitions = [];
let measure = null;

let color_by = null;
let color_by_opt = 'current';
let colorScale = d3.scaleSequential(interpolateRdYlBu);

let x_axis = XAxis()
  .on('filter', update_filter);

let sy = d3.scaleLinear().range([100, 0]);
let y = d3.local();

let group = Group()
    .y(y)
    .color(pt => colorScale(pt[color_by.name]))
    .on('filter', update_filter);

let pts_filters = and();

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('details', true);
  root.html(template);

  root.select('.config').select('select')
    .on('change', function(d) {select_color(this.value);});

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('partition.selected', (topic, partition, on) => on ? add(partition) : remove(partition));
}

function reset(data) {
  partitions = [];
  msc = data;
  measure = msc.measure;
  sy.domain(measure.extent);

  dims = msc.dims.map( dim => ({
    name: dim.name,
    extent: dim.extent,
    filter: AttrFilter(dim.name)
  }));

  pts_filters = and();
  let y_filter = AttrFilter(measure.name);
  pts_filters.add(y_filter);
  group.filter(y_filter);
  for (let dim of dims) {
    pts_filters.add(dim.filter);
  }

  group.dims(msc.dims);
  group.measure(measure);

  show_dims();

  let colors = root.select('.config').select('select').selectAll('option')
    .data(['current'].concat(msc.measures.map(m => m.name)));

  colors.enter()
      .append('option')
    .merge(colors)
      .attr('value', d => d)
      .property('selected', d => d === color_by_opt)
      .text(d => d);
  colors.exit().remove();

  select_color(color_by_opt);
}

function show_dims() {
  let axis = root.select('.dims').selectAll('.dim')
    .data(dims);

  let enter = axis.enter()
    .append('div')
      .attr('class', 'dim');
  enter.append('label');
  enter.call(x_axis.create);

  let update = enter.merge(axis);
  update.select('label').text(d => d.name);
  update.call(x_axis);

  axis.exit().remove();
}

function select_color(name) {
  color_by_opt = name;

  color_by = name === 'current' && measure || msc.measure_by_name(name);
  colorScale.domain([color_by.extent[1], color_by.extent[0]]);

  update(partitions, true);
}

function add(partition) {
  let reg_curve = partition.regression_curve;

  partitions.push({
    id: partition.id,
    name: partition.alias,
    pts: partition.pts,
    line: reg_curve.curve,
    area: reg_curve.curve.map((pt, i) => ({pt, std: reg_curve.std[i]}))
  });

  update(partitions);
}

function remove(partition){
  let idx = partitions.findIndex(p => p.id === partition.id);
  if (idx !== -1) {
    partitions.splice(idx, 1);
  }

  update(partitions);
}

function update_filter(attr) {
  console.log('updade filters');
  for (let pt of msc.pts) {
    pt.filtered = !pts_filters(pt);
  }
  update(partitions, true);
}

function update(list, all=false) {
  list.sort( (a,b) => a.id - b.id );
  list.forEach( (d, i) => d.x = i);

  root.select('.groups')
    .each( function() {
      y.set(this, pt => sy(pt[measure.name]));
    });

  let groups = root.select('.groups').selectAll('.group')
    .data(list, d => d.id);

  groups.enter()
    .append('div')
      // .on('mouseenter', d => publish('partition.highlight', d.p, true))
      // .on('mouseleave', d => publish('partition.highlight', d.p, false))
      .call(group.create)
    .merge(groups)
      .call(group, all);

  groups.exit().call(group.remove);
}

