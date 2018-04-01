import * as d3 from 'd3';

import {publish, subscribe} from "../utils";
import template from './extrema_view.html';
import './extrema.scss';


export function ExtremaView(container_, state_) {
  let container = container_;
  let root = null;

  let msc = null;

  let extrema_map = new Map();
  let extrema = [];
  let sort_by = 'max';
  let width = 100, height = 100;
  let format = d3.format('.3g');

  container.on('open', () => setup());
  container.on('resize', () => resize());
  container.on('destroy', () => console.log('ExtremaView::destroy'));

  function setup() {
    root = d3.select(container.getElement()[0]);
    root.html(template);

    resize();

    subscribe('data.msc', (topic, data) => reset(data));
  }

  function resize() {
    if (!root) setup();

    let h = parseInt(root.select('.ev_header').style('height'));

    root.select('.scroll')
      .style('max-width', `${container.width - 5}px`)
      .style('max-height', `${container.height - h - 5}px`);
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

    for (let [idx, entry] of map.entries()) {
      extrema.push({
        'id': idx,
        'value': msc.pts[idx][m],
        'n': entry.partitions.size,
        type: entry.type && 'max' || 'min'
      });
      extrema_map.set(idx, {type: entry.type && 'max' || 'min', partitions: Array.from(entry.partitions)});
    }

    root.select('.ev_header_value').text(extrema_map.size);

    if (sort_by === 'max')
      extrema.sort((a, b) => (b.value - a.value));
    else
      extrema.sort((a, b) => (a.value - b.value));

    show_color(extrema);
    show('id', extrema);
    show('value', extrema);
    show('n', extrema);
  }

  function show(field, data) {
    let format = d3.format( field == 'value' ? '.3g' : 'd');
    let items = root.select('.grid').selectAll(`.ev_${field}`).data(extrema);
    let all = items.enter()
      .append('div')
      .attr('class', `ev_${field}`)
      .merge(items)
      .style('grid-row', (d, i) => i+2)
            .classed('ev_min', d => field == 'color' && d.type == 'min')
      .classed('ev_max', d => field == 'color' && d.type == 'max')
      .text(d => format(d[field]));
    items.exit().remove();

    if (field == 'id')
      all
        .on('mouseenter', d => highlight_pt(d, true))
        .on('mouseleave', d => highlight_pt(d, false));
  }

  function show_color(data) {
    let items = root.select('.grid').selectAll(`.ev_color`).data(extrema);
    let all = items.enter()
      .append('div')
      .attr('class', 'ev_color')
      .merge(items)
      .style('grid-row', (d, i) => i+2)
      .classed('ev_min', d => d.type == 'min')
      .classed('ev_max', d => d.type == 'max');
    items.exit().remove();
  }

  function select_pt(pt) {
    console.log(pt);
  }


  function highlight_pt(pt, on) {
    let list = extrema_map.get(pt.id);

    publish('partition.highlight_list', list, on);
  }
}