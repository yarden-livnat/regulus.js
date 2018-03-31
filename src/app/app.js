import * as d3 from 'd3';
import {layout} from './layout';
import Component from '../components/component';
import {publish, subscribe} from "utils/pubsub";
import dropdown from '../components/dropdown';

import {DetailsView} from '../details_view';
import {ExtremaView} from 'extrema_view';
import {FilteringView} from '../filtering_view';
import {LifelineView} from '../tree_view';
import {PartitionView} from 'partition_view';
import {ResampleView} from '../resample_view';

import * as datasets from './datasets';

import './style.less';

let views = [
  {label:'Details',   componentName: 'details',   componentState: {}, type: 'component'},
  {label:'Extrema',   componentName: 'extrema',   componentState: {}, type: 'component'},
  {label:'Filtering', componentName: 'filtering', componentState: {}, type: 'component'},
  {label:'Lifeline',  componentName: 'lifeline',  componentState: {}, type: 'component'},
  {label:'Partition', componentName: 'partition', componentState: {}, type: 'component'},
  {label:'Resample',  componentName: 'resample',  componentState: {}, type: 'component'},
];


subscribe('status', report_status);
datasets.setup('.datasets');

layout.registerComponent('details',   DetailsView);
layout.registerComponent('extrema',   ExtremaView);
layout.registerComponent('filtering', FilteringView);
layout.registerComponent('lifeline',  LifelineView);
layout.registerComponent('partition', PartitionView);
layout.registerComponent('resample',  ResampleView);

layout.on('initialised', init);
layout.init();

d3.select('.views')
  .call(dropdown('Views', add_item).items(views));


function add_item(d) {
  let l = layout;
  if (layout.selectedItem)
    layout.selectedItem.addChild(d);
  else
    layout.root.contentItems[0].addChild(d);
}

function init() {
  publish('init');
  datasets.init();
}

function report_status(topic, msg) {
  d3.select('#status').text(msg);
}

