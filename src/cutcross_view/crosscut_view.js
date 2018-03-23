import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";
import Crosscut from './crosscut';
import template from './crosscut_view.html';
import './style.css';

export function CrossCutView() {
  let root = null;
  let crosscut = Crosscut();

  function fitness(d, y, yp) {
    let mean = d3.mean(y, pt => pt[d]);

    let s_reg = 0, s_stat = 0;
    for (let i=0; i<y.length; i++) {
      let diff = y[i][d] - yp[i];
      s_reg += diff * diff;
      diff = y[i][d] - mean;
      s_stat += diff * diff;
    }
    return 1 - s_reg/s_stat;
  }

  function process(partitions) {
    if (partitions.length === 0 || partitions[0].fitness) return;

    let t = performance.now();
    let name =  partitions[0].measure_name;
    for (let partition of partitions) {
      let yp = partition.regression_curve(partition.dims_vec);

      partition.fitness = fitness(name, partition.pts, yp);
      console.log('process:', partition.id, partition.lvl, partition.fitness);
    }
    console.log('crosscut process', Math.round(performance.now() - t));
  }

  function reset(data) {
    process(data.partitions);
    let v = data.partitions.map(p => p.fitness);
    let histogram = d3.histogram();
    let bins = histogram(v);
    console.log('histogram:', bins);
    crosscut.data(data.tree, data.pts.length);
  }

  function resize() {
  }

  let view = {};

  view.setup = function (el) {
    root = d3.select(el);
    root.html(template);

    resize();
    d3.select('.crosscut').call(crosscut);

    // subscribe('data.new', (topic, data) => reset(data));
  };

  view.set_size = function(w, h) {
  };

  return view;
}