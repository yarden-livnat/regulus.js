
import * as layout from './layout';
import Component from '../components/component'

import * as dataset_view from '../dataset_view';
import * as details_view from '../details_view';
import * as tree_view from '../tree';
import * as partition_view from '../partition_view';
import * as controls_view from '../filtering_view';
import * as resample_view from '../resample_view';
import {CrossCutView} from '../cutcross_view';

import '../style/fontawesome-all.min';
import './style.css';




setup();
init();

function setup() {
  dataset_view.setup('#dataset_view');

  layout.register('partition', Component(partition_view));
  layout.register('topology', Component(tree_view));
  layout.register('filtering', Component(controls_view));
  layout.register('details', Component(details_view));
  layout.register('resample', Component(resample_view));
  layout.register('crosscut', Component(CrossCutView()));

  layout.init();
}

function init() {
  dataset_view.init();
}


