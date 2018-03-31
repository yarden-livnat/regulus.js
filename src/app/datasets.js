import * as d3 from 'd3';
import fontawesome from '@fortawesome/fontawesome';
import faSync from '@fortawesome/fontawesome-free-solid/faSyncAlt';

import * as service from "./service";
import {publish} from "../utils/pubsub";
import {MultiMSC} from "../model/multi_msc";

import Dropdown from '../components/dropdown';

fontawesome.library.add(faSync);

let root;
let menu = Dropdown('Datasets', load_data);

let _init = true;

export function setup(el) {
  root = d3.select(el);

  root.append('div')
    .classed('menu', true)
    .call(menu);

  root.append('div')
    .on('click', init)
    .classed('sync', true)
    .append('i')
    .attr('class', 'fas fa-sync-alt')
    .style('width', '8pt');

}

export function init() {
  service.load_catalog()
    .then(set_catalog);
}

function set_catalog(_) {
  let selected = localStorage.getItem('catalog.selection');

  root.select('.menu').call(menu.items(_.map(name => ({label: name}))));

  if (_.length === 1)
    load_data(_[0]);
  else if (selected && _.find(name => name === selected))
    load_data(selected);

}

function load_data(name) {
  if (!name) return;
  name = typeof name === 'string' && name || name.label;

  localStorage.setItem('catalog.selection', name);

  service.load_dataset(name)
    .then(data => new MultiMSC(data))
    .then(shared_msc => publish('data.loaded', shared_msc));
}




