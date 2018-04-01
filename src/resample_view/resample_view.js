import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";
import {resample} from './resample';
import * as service from '../app/service'

import template from './resample.html';
import './style.css';

export function ResampleView(contianer_, state_) {
  let container = contianer_;

  let root = null;
  let msc = null;
  let selected = null;
  let current = null;
  let sample_range = null;
  let sigma_scale = 1;
  let n_samples = 0;
  let queue= [];

  let format = d3.format('.3g');

  container.on('open', () => setup());
  container.on('resize', () => resize());
  container.on('destroy', () => console.log('ResampleView::destroy'));

  function setup() {
    root = d3.select(container.getElement()[0]);
    root.html(template);

    root.select('#resample')
      // .attr('disabled', true)
      .on('click', d => submit(root.select('#add-samples').property('value')));

    root.select('#add-samples')
      .on('input', function() {
        n_samples = +this.value;
        review();
      });

    root.select('#add-sigma')
      .on('input', function() {
        update_sigma(+this.value);
      });

    root.select('#validate')
    // .attr('disabled', true)
        .on('click', d => submit_validate(root.select('#add-samples').property('value')));


    root.select('#validate-samples')
        .on('input', function() {
            n_samples = +this.value;
            review();
        });

    root.select('#validate-sigma')
        .on('input', function() {
            update_sigma(+this.value);
        });

    root.select('#recompute')
      // .attr('disabled', true)
      .on('click', d => submit_params(root.select('.parameters').property('value')));


    subscribe('data.msc', (topic, data) => reset(data));
    subscribe('partition.selected', (topic, partition, on) => select(partition, on));
    subscribe('range.selected', (topic, range) => set_resample_range(range));
  }

  function resize() {
    if (!root) setup();
  }

  function reset(data) {
    msc = data;
    selected = null;
    current = null;
    queue = [];
    root.select('#msc-parameters')
        .text(Object.entries(msc.parms));
    // root.select('.submit').attr('disabled', true);
  }

  function set_resample_range(range){
    sample_range = range;
  }

  function select(partition, on) {
    root.select('#resample-id')
      .text(partition.id);
    root.select('#resample-name')
      .text(partition.alias);

    selected = on && partition || null;

    if (selected) {
      current = {
        partition: selected,
        spec:  prepare(selected, sigma_scale),
        sigma_scale
      }
    }
    else {
      current = null;
    }
  }

  function update_sigma(v) {
    sigma_scale = v;
    if (current) {
      current.sigma_scale = v;
      current.spec = prepare(current.partition, v);
      review();
    }
  }

  function prepare(partition, scale) {
    let reg = partition.inverse_regression_curve;

    let m = reg.columns.length-1;
    let measure = [];
    for (let j=0; j<reg.curve.length; j++) {
      measure.push(reg.curve[j][m]);
    }
    let spec = {
      name: reg.columns[m],
      measure,
      dims: [],

    };

    for (let i=0; i<reg.columns.length-1; i++) {
      let from = [], to = [];

      for (let j=0; j<reg.curve.length; j++) {
        from.push(reg.curve[j][i] - scale*reg.std[j][i]/2);
        to.push(reg.curve[j][i] + scale*reg.std[j][i]/2);
      }
      spec.dims.push({
        name: reg.columns[i],
        from,
        to
      });
    }

    return spec;
  }


  function review() {
    if (!current) return;

    let proposed = resample(current.spec, n_samples, sample_range);

    let reg = current.partition.inverse_regression_curve;

    let pts = [];
    let y = reg.columns.length-1;
    for (let p of proposed) {
      let pt = {};
      for (let i=0; i<p[1].length; i++)
        pt[reg.columns[i]] = p[1][i];
      pt[reg.columns[y]] = p[0];
      pts.push(pt);
    }
    current.pts = pts;
    publish('resample.pts', pts);
  }


  function submit(n) {
    if (!current) return;
    if(current.pts!=undefined)
      service.submit_resample({
        name: msc.shared.name,
        version: msc.shared.version,
        new_version: msc.shared.version+'.1',
        pts: current.pts
      })
  }

  function submit_validate(n) {
      if (!current) return;
      if(current.pts!=undefined)
          service.request_samples({
              name: msc.shared.name,
              version: msc.shared.version,
              new_version: msc.shared.version+'.1',
              pts: current.pts
          }).then(process);
  }

  function submit_params(parameters) {

      if (!parameters || msc === null) return;

      service.submit_recompute({
          name: msc.shared.name,
          version: msc.shared.version,
          new_version: msc.shared.version+'.1',
          params: parameters
      })
  }

  function process(pts) {
    console.log(pts);
    if (typeof(pts) === 'string') {
      root.select('#R2_val')
        .text('  ' + pts);
    }
    else {
      let coeff = current.partition.model.linear_reg.coeff;
      let intercept = current.partition.model.linear_reg.intercept;
      let measure = current.spec.name;
      let dim_num = coeff.length;
      let y_avg = pts.map(x => x[measure]).reduce((p, c) => p + c, 0) / pts.length;
      let res = 0;
      let tot = 0;
      for (let pt of pts) {
        let y_real = pt[measure];
        let y_pred = intercept;
        let allX = Object.values(pt);
        for (let i = 0; i < dim_num; i++) {
          y_pred += allX[i] * coeff[i];
        }
        res += Math.pow((y_pred - y_real), 2);
        tot += Math.pow((y_avg - y_real), 2);
      }
      if (tot === 0) {
        root.select('#R2_val')
          .text("  R2:  " + NaN);
      }
      else {
        let fit = 1 - (res / tot);
        root.select('#R2_val')
          .text("  R2:  " + format(fit));
      }
      publish('resample.pts', pts);
    }
  }
}