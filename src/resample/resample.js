import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";

import BoxPlot from '../components/boxplot';
import template from './resample.html';
import './style.css';

let root = null;
let msc = null;

let format = d3.format('.2g');

let box_plot = BoxPlot()
  .width(100)
  .height(10)
  .tickFormat(d3.format('.2s'));

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('resample', true);
  root.html(template);

  subscribe('data.new', (topic, data) => reset(data));
  subscribe('partition.edit', (topic, partition) => edit(partition));
}

function reset(data) {
  msc = data;
}

function edit(partition) {
  root.select('#resample-id')
    .text(partition.id);
  root.select('#resample-lvl')
    .text(format(partition.lvl));

  let stat = Array.from(partition.statistics.values());

  let dims = stat.filter(s => s.type === 'dim').sort((a,b) => a.name < b.name);
  show('.dims', dims);

  let measures = stat.filter(s => s.type === 'measure').sort( (a,b) => a.measure || a.name < b.name ? -1 : 1);
  show('.measures', measures);
}

function show(selector, data) {
  let stats = root.select(selector).selectAll('.stat')
    .data(data);

  stats.exit().remove();

  let boxes = stats.enter()
    .append('div')
    .attr('class', 'stat');

  boxes.append('label').attr('class', 'name');
  let margin = {top: 0, right: 0, bottom: 10, left: 20};
  let width = 100, height=10;
  boxes.append('svg')
    .attr('class', 'box-plot')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  let b = boxes.merge(stats);
  b.select('.name').text(d => d.name);

  b.select('svg')
    .call(box_plot);


}