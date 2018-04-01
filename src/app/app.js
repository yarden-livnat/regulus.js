import * as d3 from 'd3';
import {layout, init_layout} from './layout';
import {pubsub} from "utils/pubsub";
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
  {label:'Details',   componentName: 'details',   componentState: {}, type: 'component', factory: DetailsView},
  {label:'Extrema',   componentName: 'extrema',   componentState: {}, type: 'component', factory: ExtremaView},
  {label:'Filtering', componentName: 'filtering', componentState: {}, type: 'component', factory: FilteringView},
  {label:'Lifeline',  componentName: 'lifeline',  componentState: {}, type: 'component', factory: LifelineView},
  {label:'Partition', componentName: 'partition', componentState: {}, type: 'component', factory: PartitionView},
  {label:'Resample',  componentName: 'resample',  componentState: {}, type: 'component', factory: ResampleView},
];

let {publish, subscribe} = pubsub();

let params = new URLSearchParams(document.location.search.substring(1));
init_layout(!params.has('noload'), !params.has('nosave'));

subscribe('status', report_status);
datasets.setup('.datasets');

views.forEach(view => layout.registerComponent(view.componentName, view.factory));

layout.on('initialised', init);
// layout.on('windowOpened', on_open);
layout.init();

d3.select('.views')
  .call(dropdown('Views', add_item).items(views));


function add_item(d) {
  if (layout.selectedItem)
    layout.selectedItem.addChild(d);
  else
    layout.root.contentItems[0].addChild(d);
}

function on_open() {
  console.log('on open', arguments);
}

function init() {
  publish('init');
  datasets.init();
}

function report_status(topic, msg) {
  d3.select('#status').text(msg);
}

