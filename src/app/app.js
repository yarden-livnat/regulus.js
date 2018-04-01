import * as d3 from 'd3';
import 'bootstrap';
// import 'bootstrap/js/dist/util';
// import 'bootstrap/js/dist/dropdown';
// import 'bootstrap/dist/css/bootstrap.min.css';


import {layout} from './layout';
import {pubsub} from "../utils/pubsub";

import {DetailsView} from '../details_view';
import {ExtremaView} from '../extrema_view';
import {FilteringView} from '../filtering_view';
import {LifelineView} from '../tree_view';
import {PartitionView} from '../partition_view';
import {ResampleView} from '../resample_view';

import * as datasets from './datasets';

import './style.scss';

let {publish, subscribe} = pubsub();
subscribe('status', report_status);

let views = [
  {label:'Details',   componentName: 'details',   componentState: {}, type: 'component', factory: DetailsView},
  {label:'Extrema',   componentName: 'extrema',   componentState: {}, type: 'component', factory: ExtremaView},
  {label:'Filtering', componentName: 'filtering', componentState: {}, type: 'component', factory: FilteringView},
  {label:'Lifeline',  componentName: 'lifeline',  componentState: {}, type: 'component', factory: LifelineView},
  {label:'Partition', componentName: 'partition', componentState: {}, type: 'component', factory: PartitionView},
  {label:'Resample',  componentName: 'resample',  componentState: {}, type: 'component', factory: ResampleView},
];

d3.select('#views .dropdown-menu').selectAll('a')
  .data(views)
  .enter()
  .append('a')
  .attr('class', 'dropdown-item')
  .on('click', add_item)
  .text(d => d.label);

views.forEach(view => layout.registerComponent(view.componentName, view.factory));
layout.on('initialised', init);
layout.init();


function add_item(d) {
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
  // d3.select('#status').text(msg);
}

