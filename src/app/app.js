import * as d3 from 'd3';
import 'bootstrap';
// import 'bootstrap/js/dist/util';
// import 'bootstrap/js/dist/dropdown';
// import 'bootstrap/dist/css/bootstrap.min.css';


import {layout} from './layout';
import {pubsub} from "../utils/pubsub";

import {ChartsView} from '../charts_view';
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
  {componentName: 'Details',   componentState: {}, type: 'component', factory: DetailsView},
  {componentName: 'Extrema',   componentState: {}, type: 'component', factory: ExtremaView},
  {componentName: 'Filtering', componentState: {}, type: 'component', factory: FilteringView},
  {componentName: 'Lifeline',  componentState: {}, type: 'component', factory: LifelineView},
  {componentName: 'Partition', componentState: {}, type: 'component', factory: PartitionView},
  {componentName: 'Resample',  componentState: {}, type: 'component', factory: ResampleView},
  {componentName: 'Charts',    componentState: {}, type: 'component', factory: ChartsView},
];

d3.select('#views .dropdown-menu').selectAll('a')
  .data(views.sort( (a,b) => a.componentName < b.componentName ? -1 : 1))
  .enter()
  .append('a')
  .attr('class', 'dropdown-item')
  .on('click', add_item)
  .text(d => d.componentName);

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

