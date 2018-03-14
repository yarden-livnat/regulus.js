import * as service from "./service";
import Panel from '../panel/panel';

import * as info from '../info';
import * as details_view from '../details';
import * as tree_view from '../tree';
import * as partition_view from '../partition';
import * as controls_view from '../controls';
import * as sample_view from '../resample';

import './style.css';


let dataset_panel = Panel('Dataset');

setup();
init();

service.submit_resample({
  spec: 'test',
  n: 4
})
  .then( r => console.log('submit:',r));

function setup() {
  info.setup(dataset_panel('#dataset_view').content());
  details_view.setup( Panel('Details')('#details_view').content());
  tree_view.setup(Panel('Tree')('#tree_view').content());
  partition_view.setup(Panel('Partition')('#partition_view').content());
  controls_view.setup(Panel('Controls')('#controls_view').content());
  resample_view.setup(Panel('Resample')('#resample_view').content());
}

function init() {
  service.load_catalog()
    .then(info.set_catalog)
    .then(catalog => dataset_panel.title(`Dataset: ${catalog.name}`));
}


