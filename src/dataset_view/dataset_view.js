import * as d3 from 'd3';
import template from './dataset_view.html';
import './style.css';
import * as service from "../app/service";
import {publish} from "../utils/pubsub";
import {MultiMSC} from "../model/multi_msc";

let root;
let _init = true;

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('dataset_view', true);
  root.html(template);

  root.select('select')
    .on('change', function() {load_data(this.value);});
}

export function init() {
  service.load_catalog()
    .then(set_catalog);
}

function set_catalog(_) {
  let opts = root.select('select').selectAll('option')
    .data(['select dataset'].concat(_));

  opts.enter()
    .append('option')
    .merge(opts)
    .attr('value', d => d)
    .text(d => d);

  if (_.length === 1) {
    load_data(_[0]);
  }
}

function load_data(name) {
  if (!name) return;
  remove_placeholder();
  service.load_dataset(name)
    .then( data => new MultiMSC(data))
    .then( msc => publish('data.loaded', msc));
}

function remove_placeholder() {
  if (_init) {
    root.select('select').selectAll('option')
      .filter( d => d === 'select dataset')
      .remove();
  }
}