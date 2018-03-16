import * as d3 from 'd3';
import PriorityQueue from 'js-priority-queue';
import Chart from './chart';
import {publish, subscribe} from "../utils";
import template from './controls.html';
import './style.css';

let root = null;
let msc = null;
let chart = Chart().width(300).height(150);
let prevent = false;

let sx = d3.scaleLinear();
let sy = d3.scaleLinear();


export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('controls_view', true);
  root.html(template);

  chart.on('range', range => {if (!prevent) { prevent = true; publish('persistence.range', range); prevent=false;}});

  subscribe('persistence.range', (topic, range) => move_range(range));
  subscribe('data.new', (topic, data) => reset(data));
}

function reset(data) {
  msc = data;

  reset_persistence();
}

function move_range(range) {
  if (!prevent) {
    prevent = true;
    root.select('.persistence_chart').selectAll('svg').call(chart.move, [sx(range[0]), sy(range[1])]);
    prevent = false;
  }
}

function reset_persistence() {
  let heap = new PriorityQueue( {comparator: (a,b) => b.lvl - a.lvl});
  let histogram = new Map();

  let p = msc.root;
  heap.queue(p);
  histogram.set(1, 1);

  while (heap.length) {
    p = heap.dequeue();
    if (p.lvl === 0) {
      histogram.set(p.lvl, heap.length);
      break;
    }
    for (let child of p.children) {
      heap.queue(child);
    }
    histogram.set(p.lvl, heap.length);
  }

  let values = Array.from(histogram).sort((a, b) => (a[0] - b[0]));

  let opts = {
    curve: values,
    sx: sx.domain([d3.min(values, pt => pt[0]), 1]).clamp(true),
    sy: sy.domain([0, d3.max(values, pt => pt[1])])
  };

  root.select('.persistence_chart').selectAll('svg')
    .data([opts])
    .call(chart);
}

function reset_size() {

}