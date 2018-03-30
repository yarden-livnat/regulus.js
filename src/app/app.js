import * as d3 from 'd3';
import {layout} from './layout';
import Component from '../components/component';
import {publish, subscribe} from "../utils/pubsub";
import dropdown from '../components/dropdown';
import * as dataset_view from '../dataset_view';
import * as details_view from '../details_view';
import * as tree_view from '../tree_view';
import {PartitionView} from '../partition_view/partition_view';
import * as controls_view from '../filtering_view';
import * as resample_view from '../resample_view';
import * as extrema_view from '../extrema_view';

// import '../style/fontawesome-all.min';
import './style.less';


let views = [
  {label:'Partition', componentName: 'partition', componentState: {}, type: 'component'}
];

setup();

function setup() {
  subscribe('status', report_status);
  dataset_view.setup('.dataset_view');

  layout.registerComponent('partition', PartitionView);
  layout.registerComponent('topology', Component(tree_view));
  layout.registerComponent('filtering', Component(controls_view));
  layout.registerComponent('details', Component(details_view));
  layout.registerComponent('resample', Component(resample_view));
  layout.registerComponent('extrema', Component(extrema_view));
  layout.on('initialised', init);
  layout.init();

  dropdown('.views', 'Views', views, add_item);

  // let d3views = d3.select('.views')
  //   .classed('dropdown', true);
  //
  // d3views.append('button')
  //   .attr('class', 'drop-btn')
  //   .text('Views');
  //
  // d3views.append('div')
  //   .attr('class', 'dropdown-content')
  //   .selectAll('div')
  //   .data(views)
  //   .enter()
  //     .append('div')
  //     .attr('class', 'dropdown-item')
  //     .on('click', add_item)
  //     .text(d => d.componentName);
}

function add_item(d) {
  let l = layout;
  if (layout.selectedItem)
    layout.selectedItem.addChild(d);
  else
    layout.root.contentItems[0].addChild(d);
}

function init() {
  publish('init');
  dataset_view.init();
}

function report_status(topic, msg) {
  d3.select('#status').text(msg);
}

