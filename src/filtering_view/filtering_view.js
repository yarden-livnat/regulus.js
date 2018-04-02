import * as d3 from 'd3';
import PriorityQueue from 'js-priority-queue';

import {pubsub} from '../utils/pubsub';
import {Model} from '../model/model';

import Features from './features';

import template from './filtering_view.html';
import './style.scss';



export function FilteringView(container_, state_) {
  let container = container_;
  let root = null;
  let listeners = new Map();

  let model = Model();
  let msc = model.msc;
  let features = model.features;

  let {publish, subscribe, unsubscribe} = pubsub();

  root = d3.select(container.getElement()[0]);
  root.html(template);

  register();

  if (!features) {
    features = model.features = Features();
    publish('filters.new', features.filter());
  }

  features
    .on('show', value => publish('filters.show', value))
    .on('update', () => publish('filters.update'))
    .on('color_by', feature => publish('show.color_by', feature));

  root.select('.filtering_view').call(features);

  function register() {
    container.on('resize', () => resize());
    container.on('destroy', () => on_close());
    container.on('open', () => on_open);

    monitor('data.msc', (topic, data) => reset(data));
    monitor('data.updated', (topic, msc) => features.update(msc.minmax));
  }

  function monitor(topic, cb) {
    listeners.set(topic, subscribe(topic, cb));
  }

  function on_close() {
    for (let [topic, listener] of listeners) {
      unsubscribe(topic, listener);

      features
        .on('show', null)
        .on('update', null)
        .on('color_by', null);
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

    features.redraw();

    // let features = root.select('.features');
    // if (!features.empty()) {
    //   let w = root.select('.features').attr('width');
    //   let h = root.select('.features').attr('height');
    // }
  }

  function reset(data) {
    msc = data;
  }

}
