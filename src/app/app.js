import * as service from "./service";
import {MultiMSC} from '../model/multi_msc';
import {publish, subscribe} from '../utils/pubsub';

import Panel from '../panel/panel';

import * as dataset_view from '../dataset_view';
import * as details_view from '../details_view';
import * as tree_view from '../tree';
import * as partition_view from '../partition_view';
import * as controls_view from '../filtering_view';
import * as resample_view from '../resample_view';

import './style.css';


// let socket = new WebSocket('find the current url');

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

  // socket.onmessage = function(event) {
  //   console.log('received socket message');
  // }
}
