import * as d3 from 'd3';
import {publish, subscribe} from '../utils/pubsub';
import BoxPlot from '../components/boxplot';
import template from './partition_view.html';
import './style.css';


let root = null;
let highlight = null;
let selected = null;
let current = null;
let timer = null;
let shared_msc = null;
let measure = null;

let width = 0, height=0;

let format = d3.format('.2g');

let box_plot = BoxPlot()
  .width(100)
  .height(10)
  .tickFormat(d3.format('.2s'));


export function setup(el) {
  root = d3.select(el);
  root.html(template);

  root.select('.partition_alias')
    .property('disabled', true)
    // .attr('placeholder', 'assign alias')
    .on('change', alias_changed)
    .on('input', alias_changed);

  root.select('.partition_notes')
    .property('disabled', true)
    .on('change', notes_changed)
    .on('input', notes_changed);

  subscribe('data.pts', (topic, data) => reset(data));
  subscribe('data.loaded', (topic, data) => reset(data));
  subscribe('partition.highlight', (topic, partition, show) => highlight_partition(partition, show));
  subscribe('partition.selected', (topic, partition, show) => select_partition(partition, show));
}

export function set_size(w, h) {
  [width, height] = [w, h];
  if (root) resize();
}

function resize() {
  let w = parseInt(root.select('table').style('width'));
  let h = parseInt(root.select('table').style('height'));

  root.select('.scroll').style('max-height', `${height - h}px`);
  root.select('.scroll').style('max-width', `${width}px`);
}

function alias_changed() {
  current.alias = this.value;
}

function notes_changed() {
  current.notes = this.value;
}

function reset(_) {
  shared_msc = _;
  selected = null;
  highlight = null;
  measure = null;
  show_partition(true);
}

function select_partition(partition, show) {
  selected = show && partition || null;
  current = selected || highlight;
  show_partition()
}


function highlight_partition(partition, show) {
  // console.log('highlight', show, timer !== null);
  if (!show) {
    timer = d3.timeout( () => {highlight = null; show_partition(); }, 250);
  } else {
    if (timer) {
      timer.stop();
      timer = null;
    }
    highlight = partition;
    show_partition();
  }
}

function show_partition(init=false) {
  current = highlight || selected || shared_msc.as_partition;

  root.select('.partition_id')
    .classed('selected', current === selected)
    .classed('highlight', current === highlight)
    .text(current && current.id || "");

  root.select('.partition_alias')
    .property('value', current && current.alias || "")
    .attr('disabled', current ? null : true);

  root.select('.partition_size')
    .text(current && current.size || '');

  root.select('.partition_notes')
    .property('value', current && current.notes || "")
    .attr('disabled', current ? null : true);


  let stat = current && Array.from(current.statistics.values()) || [];

  let dims = stat.filter(s => s.type === 'dim')
    .sort((a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  show('.dims', dims);

  let measures = stat.filter(s => s.type === 'measure')
    .sort( (a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
  show('.measures', measures, true);
  if (init && measures.length === 1) {
    select_measure(measures[0]);
  }
}

function show(selector, data, listen=false) {
  let stats = root.select(selector).selectAll('.stat')
    .data(data, d => d.name);

  stats.exit().remove();

  let boxes = stats.enter()
    .append('div')
    .attr('class', 'stat');

  boxes.append('label').attr('class', 'name');
  if (listen) {
    boxes.on('click', select_measure);
  }

  let margin = {top: 0, right: 0, bottom: 10, left: 20};
  let width = 100, height=10;
  boxes.append('svg')
    .attr('class', 'box-plot')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

  let b = boxes.merge(stats);
  b.select('.name')
    .text(d => d.name)
    .classed('selected', d => measure && d.name === measure.name);

  b.select('svg')
    .call(box_plot);
}

function select_measure(d) {
  if (measure === d /*|| !d.available*/) return;

  measure = d;
  root.select('.measures').selectAll('.name')
    .classed('selected', d => d.name === measure.name);
  selected = highlight = null;

  publish('data.new', shared_msc.msc(d.name));
}

