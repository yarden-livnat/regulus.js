import * as d3 from 'd3';
import PriorityQueue from 'js-priority-queue';

import {pubsub} from '../utils/pubsub';
import {Model} from '../model/model';
import Chart from './chart';

import template from './charts_view.html';
import './style.scss';


export function ChartsView(container_, state_) {
  let container = container_;
  let root = null;
  let listeners = new Map();
  ;
  let chart = Chart().width(250).height(100);
  let prevent = false;
  let saved = [0, 1];
  let sx = d3.scaleLog().clamp(true);
  let sy = d3.scaleLinear();
  let width = 290, height = 450;

  let model = Model();
  let msc = model.msc;

  let {publish, subscribe, unsubscribe} = pubsub();

  root = d3.select(container.getElement()[0]);
  root.html(template);

  chart.on('range', range => {
    if (!prevent) {
      prevent = true;
      saved = range;
      publish('persistence.range', range);
      prevent = false;
    }
    // else console.log('ctrl move prevent');
  });

  register();

  function register() {
    container.on('resize', () => resize());
    container.on('destroy', () => on_close());
    container.on('open', () => on_open);

    monitor('persistence.range', (topic, range) => move_range(range));
    monitor('data.msc', (topic, data) => reset(data));
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

  function on_open() {
    reset(msc);
  }

  function resize() {
    root.select('.filtering_view')
      .style('max-width', `${container.width - 5}px`)
      .style('max-height', `${container.height}px`);
  }

  function report_filter(type, value) {
    publish(type, value);
  }

  function reset(data) {
    msc = data;

    reset_persistence();
  }

  function move_range(range) {
    if (prevent) console.log('ctrl move prevent');
    if (!prevent) {
      prevent = true;
      if (saved[0] !== range[0] || saved[1] !== range[1]) {
        root.select('.persistence_chart').selectAll('svg').call(chart.move, [sx(range[0]), sx(range[1])]);
      }
      prevent = false;
    }
  }

  function reset_persistence() {
    let heap = new PriorityQueue({comparator: (a, b) => b.lvl - a.lvl});
    let histogram = new Map();

    let p = msc.root;
    heap.queue(p);
    histogram.set(1, 1);

    while (heap.length) {
      p = heap.dequeue();
      if (p.lvl === 0) {
        // histogram.set(p.lvl, heap.length);
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
      sx: sx.domain([Number.EPSILON + d3.min(values, pt => pt[0]), 1]).clamp(true),
      sy: sy.domain([0, d3.max(values, pt => pt[1])])
    };

    root.select('.persistence_chart').selectAll('svg')
      .data([opts])
      .call(chart);
  }
}
