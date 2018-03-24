import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";
import Crosscut from './crosscut';
import template from './crosscut_view.html';
import './style.css';

export function CrossCutView() {
  let root = null;
  let crosscut = Crosscut();

  function process(partitions) {
    for (let partition of partitions) {
      partition.fitness = Math.random();
    }
  }

  function reset(data) {
    // process(data.partitions);

    let v = data.partitions.map(p => p.model.fitness);
    let histogram = d3.histogram();
    let bins = histogram(v);
    console.log('histogram:', bins);

    crosscut.data(data.tree);
  }

  function resize() {
  }

  function on_slider() {
    let v = +this.value;
    console.log('v = ',v);
    crosscut.level(v);
  }

  let view = {};

  view.setup = function (el) {
    root = d3.select(el);
    root.html(template);

    resize();
    root.select('.crosscut').call(crosscut);
    root.select('.crosscut-slider')
      .on('input', on_slider);

    subscribe('data.new', (topic, data) => reset(data));
  };

  view.set_size = function(w, h) {
  };

  return view;
}