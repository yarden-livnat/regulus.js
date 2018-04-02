import * as d3 from 'd3';
import * as chromatic from 'd3-scale-chromatic';

import {cmaps} from '../utils/colors';
import {pubsub} from "../utils/pubsub";
import {and, or, not, AttrRangeFilter, XYFilter} from '../model';
import {ensure_single} from "../utils/events";

import config from './config';
import Group from './group';
import XAxis from './x_axis';
import template from './details_view.html';
import './style.scss';


// TODO: simplify or break up code
export function DetailsView(container_, state_) {

  let container = container_;
  let root = null;
  let listeners = new Map();

  let {publish, subscribe, unsubscribe} = pubsub();

  let msc = null;
  let dims = [];
  let partitions = [];
  let measure = null;
  let selected = null;
  let highlight = null;

  let width = 0, height = 0;

  let initial_cmap = 'RdYlBu';
  let color_by = null;
  let color_by_opt = 'current';
  let colorScale = d3.scaleSequential(chromatic['interpolate' + initial_cmap]);

  let pattern = null;

  let x_axis = XAxis()
    .width(config.plot_width)
    .on('filter', update_filter);

  let sy = d3.scaleLinear().range([config.plot_height, 0]);
  let y = d3.local();

  let group = Group()
    .y(y)
    .color(pt => colorScale(pt[color_by.name]))
    .on_y('filter', update_filter)
    .on_plot('start', start_pts_filter)
    .on_plot('brush', update_pts_filter);

  let pts_filters = and();
  let plot_filter = null;

  root = d3.select(container.getElement()[0]);
  root.html(template);

  root.select('.config').select('.color-by')
    .on('change', function (d) {
      select_color(this.value);
    });

  root.select('.config').select('.cmap')
    .on('change', function (d) {
      select_cmap(chromatic['interpolate' + this.value])
    })
    .selectAll('option').data(cmaps)
    .enter()
    .append('option')
    .attr('value', d => d.name)
    .property('selected', d => d.name === initial_cmap)
    .text(d => d.name);

  root.select('#details_show_filtered')
    .property('checked', true)
    .on('change', on_show_filtered);

  root.select('#details_show_regression')
    .property('checked', true)
    .on('change', on_show_regression);

  root.select('#details_use_canvas')
    .property('checked', true)
    .on('change', on_use_canvas);

  register();

  function register() {
    container.on('open', () => on_open());
    container.on('resize', () => resize());
    container.on('destroy', () => on_close());

    monitor('data.msc', (topic, data) => reset(data));
    monitor('data.shared_msc', (topic, data) => update([]));
    monitor('partition.details', (topic, partition, on) => on ? add(partition) : remove(partition));
    monitor('partition.highlight', (topic, partition, on) => on_highlight(partition, on));
    monitor('partition.selected', (topic, partition, on) => on_selected(partition, on));
    monitor('resample.pts', (topic, pts) => on_resample_pts(pts));
  }

  function monitor(topic, cb) {
    listeners.set(topic, subscribe(topic, cb));
  }

  function on_open() {
    // reset(shared_msc);
  }

  function on_close() {
    for (let [topic, listener] of listeners) {
      unsubscribe(topic, listener);
    }
    listeners = new Map();
  }

  function resize() {
    let rw = container.width;
    let rh = container.height;

    let cw = parseInt(root.select('.config').style('width'));
    let ch = parseInt(root.select('.config').style('height'));

    let dw = parseInt(root.select('.dims').style('width'));
    let dh = parseInt(root.select('.dims').style('height'));

    root.select('.groups')
      .style('width', `${Math.max(dims.length * (config.plot_width + 10) + 100, dw)}px`)
      .style('height', `${rh - ch - dh - 35}px`);
  }


  function reset(data) {
    partitions = [];
    msc = data;
    measure = msc.measure;
    sy.domain(measure.extent);

    dims = msc.dims.map(dim => ({
      name: dim.name,
      extent: dim.extent,
      filter: AttrRangeFilter(dim.name, null, true)
    }));

    pts_filters = and();
    let y_filter = AttrRangeFilter(measure.name, null, true);
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

    resize();
  }

  function on_highlight(partition, on) {
    highlight = on && partition || null;
    root.select('.groups').selectAll('.group')
      .data(partitions, d => d.id)
      .classed('highlight', d => on && d.id === partition.id)
  }

  function on_selected(partition, on) {
    selected = on && partition || null;

    root.select('.groups').selectAll('.group')
      .data(partitions, d => d.id)
      .classed('selected', d => selected && d.id === selected.id)
  }

  function show_dims() {
    // let list = root.select('.config .dims-list')
    //   .selectAll('div')
    //   .data(dims, d => d.name);
    //
    // list.enter()
    //   .append('div')
    //   .attr('class', 'dim-ctrl')
    //   .on('click', dim_clicked)
    //   .merge(list)
    //   .text(d => d.name);
    // list.exit().remove();

    let axis = root.select('.dims').selectAll('.dim')
      .data(dims.filter(d => !d.disabled));

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

  function dim_clicked(d) {
    d.disabled = !d.disabled;
    d3.select(this).classed('non-active', d.disabled);
    show_dims();
    update(partitions, true);
  }

  function select_cmap(cmap) {
    colorScale.interpolator(cmap);
    update(partitions, true);
  }

  function select_color(name) {
    color_by_opt = name;

    color_by = name === 'current' && measure || msc.measure_by_name(name);
    colorScale.domain([color_by.extent[1], color_by.extent[0]]);

    update(partitions, true);
  }

  function on_show_filtered() {
    group.show_filtered(this.checked && 'all');
    update(partitions, true);
  }

  function on_show_regression() {
    group.show_regression(this.checked);
    update(partitions, true);
  }

  function on_use_canvas() {
    group.use_canvas(this.checked);
    update(partitions, true);
  }

  function on_resample_pts(pts) {
    if (!selected) {
      console.log('no selected partition. ignored');
      return;
    }
    let p = partitions.find(pr => pr.id === selected.id);
    p.extra = pts;
    update(partitions, true);
  }

  function add(partition) {
    let reg_curve = partition.inverse_regression_curve;

    partitions.push({
      id: partition.id,
      name: partition.alias,
      p: partition,
      pts: partition.pts,
      line: reg_curve.curve,
      area: reg_curve.curve.map((pt, i) => ({pt, std: reg_curve.std[i]}))
    });

    update(partitions);
  }

  function remove(partition) {
    let idx = partitions.findIndex(p => p.id === partition.id);
    if (idx !== -1) {
      partitions.splice(idx, 1);
    }

    update(partitions);
  }

  function update_filter() {
    for (let pt of msc.pts) {
      pt.filtered = !pts_filters(pt);
    }
    update(partitions, true);
    publish('filters.updated');
  }

  function start_pts_filter(pts, name, xr, yr) {
    if (plot_filter) {
      publish('range.selected', null);
      pts_filters.delete(plot_filter);
      root.selectAll('.plot').select('.brush').call(group.plot().brush().move, null);
    }
    plot_filter = XYFilter(pts, name, measure.name).xr(xr).yr(yr);
    pts_filters.add(plot_filter);
    update_filter();
  }

  function update_pts_filter(xr, yr) {
    plot_filter.xr(xr).yr(yr);
    publish('range.selected', yr);
    update_filter();
  }

  function update(list, all = false) {
    list.sort((a, b) => a.id - b.id);
    list.forEach((d, i) => d.x = i);

    root.select('.groups')
      .each(function () {
        y.set(this, pt => sy(pt[measure.name]));
      });

    let t0 = performance.now();

    let groups = root.select('.groups').selectAll('.group')
      .data(list, d => d.id);

    let g = groups.enter()
      .append('div')
      .on('mouseenter', d => publish('partition.highlight.details', d.p, true))
      .on('mouseleave', d => publish('partition.highlight.details', d.p, false))
      .call(group.create);

    g.select('.group-header')
      .on('click', ensure_single(d => publish('partition.details', d.p, false)))
      .on('dblclick', d => publish('partition.selected', d.p, d.p !== selected));

    g.merge(groups)
      .classed('highlight', d => highlight && d.id === highlight.id)
      .classed('selected', d => selected && d.id === selected.id)
      .call(group, all);

    groups.exit().call(group.remove);
    let t1 = performance.now();
    console.log(`details update: ${Math.round(t1 - t0)} msec`);
  }

  function select(d) {
    publish('partition.selected', d.p, !selected || d.p.id !== selected.id);
  }
}