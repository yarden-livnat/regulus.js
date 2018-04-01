import * as d3 from 'd3';

import * as service from "./service";
import {publish} from "../utils/pubsub";
import {MultiMSC} from "../model/multi_msc";

d3.select('#datasets .refresh')
  .on('click', init);

export function init() {
  service.load_catalog()
    .then(set_catalog);
}

function set_catalog(_) {
  let selected = localStorage.getItem('catalog.selection');

  let items = d3.select('#datasets .dropdown-menu').selectAll('.dataset')
    .data(_);

  items.enter()
    .insert('a', '.dropdown-divider')
    .classed('dropdown-item dataset', true)
    .on('click', load_data)
    .merge(items)
    .text(d => d);

  items.exit().remove();

  if (_.length === 1)
    load_data(_[0]);
  else if (selected && _.find(name => name === selected))
    load_data(selected);

}

function load_data(name) {
  if (!name) return;

  localStorage.setItem('catalog.selection', name);

  d3.select('#datasets .dropdown-menu').selectAll('.dataset')
    .classed('active', d => d == name);

  service.load_dataset(name)
    .then(data => new MultiMSC(data))
    .then(shared_msc => publish('data.shared_msc', shared_msc));
}




