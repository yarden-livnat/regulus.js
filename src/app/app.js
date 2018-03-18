import * as service from "./service";
import {MultiMSC} from '../model/multi_msc';
import {publish, subscribe} from '../utils/pubsub';

import Panel from '../panel/panel';

import * as dataset_view from '../dataset_view';
import * as details_view from '../details';
import * as tree_view from '../tree';
import * as partition_view from '../partition_view';
import * as controls_view from '../controls';
import * as resample_view from '../resample';

import './style.css';

let catalog = null;
let msc = null;

let dataset_panel = Panel('Dataset');

setup();
init();

function setup() {
  dataset_view.setup( Panel('Dataset')('#dataset_view').content());
  details_view.setup( Panel('Details')('#details_view').content());
  tree_view.setup(Panel('Topology')('#tree_view').content());
  partition_view.setup(Panel('Partition')('#partition_view').content());
  controls_view.setup(Panel('Filtering')('#controls_view').content());
  resample_view.setup(Panel('Resample')('#resample_view').content());
}

function init() {
  dataset_view.init();
  // subscribe('load.measure', load_measure);

  // service.load_catalog()
  //   .then(set_catalog)
  //   // .then(catalog => dataset_panel.title(`Dataset: ${catalog.name}`))
  //   ;
}

function set_catalog(_) {
  catalog = _;
  msc = new MultiMSC();

  service.load_data(catalog)
    .then(data => msc.samples(data, catalog.dims))
    .then(() => publish('data.pts', msc));

  return catalog;
}


function load_measure(topic, name) {
  service.load_msc(name)
    .then( tree => msc.msc = tree )
    .then( () => publish('data.new', msc));
}

