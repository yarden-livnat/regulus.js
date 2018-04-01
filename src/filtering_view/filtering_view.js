import * as d3 from 'd3';
import PriorityQueue from 'js-priority-queue';

import {pubsub} from '../utils/pubsub';

import template from './filtering_view.html';
import './style.scss';
import {Model} from '../model/model';


export function FilteringView(container_, state_) {
  let container = container_;
  let root = null;
  let listeners = new Map();

  let model = Model();
  let msc = model.msc;

  let {publish, subscribe, unsubscribe} = pubsub();

  root = d3.select(container.getElement()[0]);
  root.html(template);

  register();

  function register() {
    container.on('resize', () => resize());
    container.on('destroy', () => on_close());
    container.on('open', () => on_open);

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

    let features = root.select('.features');
    if (!features.empty()) {
      let w = root.select('.features').attr('width');
      let h = root.select('.features').attr('height');
    }
  }

  function report_filter(type, value) {
    publish(type, value);
  }

  function reset(data) {
    msc = data;
  }

}
