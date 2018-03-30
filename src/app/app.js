import * as d3 from 'd3';
import * as layout from './layout';
import Component from '../components/component';
import {publish, subscribe} from "../utils/pubsub";

import * as dataset_view from '../dataset_view';
import * as details_view from '../details_view';
import * as tree_view from '../tree_view';
import {PartitionView} from '../partition_view/partition_view';
import * as controls_view from '../filtering_view';
import * as resample_view from '../resample_view';
import * as extrema_view from '../extrema_view';

// import '../style/fontawesome-all.min';
import './style.less';


setup();
// init();

function setup() {
  subscribe('status', report_status);
  dataset_view.setup('#dataset_view');

  layout.register('partition', PartitionView);
  layout.register('topology', Component(tree_view));
  layout.register('filtering', Component(controls_view));
  layout.register('details', Component(details_view));
  layout.register('resample', Component(resample_view));
  layout.register('extrema', Component(extrema_view));
  layout.on('initialised', init);
  layout.init();
}

function init() {
  publish('init');
  dataset_view.init();
}

function report_status(topic, msg) {
  d3.select('#status').text(msg);
}
