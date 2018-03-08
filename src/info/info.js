import * as d3 from 'd3';

import * as service from "../service";
import {MSC} from '../model/msc';
import {publish, subscribe} from '../utils/pubsub';
import template from './info.html';
import './info.css';

let root = null;
let format = d3.format('.2g');

let msc;
let catalog;
let measure = null;

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('info', true)
    .html(template);

  root.select('#measures')
    .on('change', function () {
      select_dataset(this.value)
    });
}

export function set_catalog(_) {
  catalog = _;

  catalog.msc.sort();
  let opts = root.select('#measures').selectAll('option')
    .data(["select measure"].concat(catalog.msc));

  opts.enter().append('option')
    .merge(opts)
    .attr('value', (d, i) => i && d)
    .attr('disabled', (d, i) => i===0 ? true : null)
    .text( d => d);
  opts.exit().remove();

  msc = new MSC();

  service.load_data(catalog)
    .then(data => msc.samples(data, catalog.dims))
    .then(show);

  return catalog;
}


function show()
{
  let dims = new Set(msc.dims);

  // Dimensions
  let li = root.select('.dims').selectAll('li')
    .data(msc.minmax.filter( d => dims.has(d.name)), d=>d.name);
  li.enter()
    .append('li')
    .merge(li)
    .html(d => `${d.name}: [${format(d.minmax[0])}, ${format(d.minmax[1])}]`);
  li.exit().remove();

  // Measures
  let available = new Set(catalog.msc);
  let measures = msc.minmax.filter( d => !dims.has(d.name));
  measures.forEach(m => m.available = available.has(m.name));
  li = root.select('.measures').selectAll('li')
    .data(measures, d => d.name);

  li.enter()
    .append('li')
    .on('click', select_measure)
    .merge(li)
      .html(d => `${d.name}: [${format(d.minmax[0])}, ${format(d.minmax[1])}]`)
      .classed('disabled', d => !d.available);

  li.exit().remove();
}

function select_measure(d) {
  if (measure === d || !d.available) return;

  if (measure) measure.selected = false;
  measure = d;
  measure.selected = true;
  root.select('.measures').selectAll('li')
    .classed('selected', d => d.selected);

  load_measure(measure.name);
}

function load_measure(name) {
  service.load_msc(name)
    .then( tree => msc.msc = tree )
    .then( () => publish('data.new', msc));
}