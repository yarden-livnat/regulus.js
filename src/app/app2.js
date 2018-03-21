import GoldenLayout from 'golden-layout/dist/goldenlayout';
import 'golden-layout/src/css/goldenlayout-base.css';
import './goldenlayout-theme.less';
import * as $ from 'jquery';

import {DatasetView} from '../dataset_view';
import * as details_view from '../details_view';
import * as tree_view from '../tree';
import * as partition_view from '../partition_view';
import * as controls_view from '../filtering_view';
import * as resample_view from '../resample_view';

import './style.css';

function Component(c) {
  let container = null;
  let state = null;

  function component(_container, _state) {
    container = _container;
    state = _state;
    container.setTitle(state.label);
    container.on('open', () => c.setup(container.getElement()[0]));
  }

  component._bindContainerEvents = function() {
    this._container.on( 'resize', () => console.log('resize'));
    this._container.on( 'destroy', () => console.log('destroy'));
  };

  component._setSize = function() {
    console.log('resize', this._container.width, this._container.height );
  };

  return component;
}

let dataset_view = DatasetView();

setup();
// init();

function setup() {

  let config = {
    content: [{
      type: 'column',
      content: [{
        type: 'row',
        content: [{
          type: 'column',
          content: [{
            type: 'component',
            componentName: 'dataset',
            componentState: {label: 'Dataset'}
          }, {
            type: 'component',
            componentName: 'partition',
            componentState: {label: 'Partition'}
          }]
        },
          {
            type: 'component',
            componentName: 'topology',
            componentState: {label: 'Topology'}
          },
          {
            type: 'column',
            content: [{
              type: 'component',
              componentName: 'filtering',
              componentState: {label: 'Filtering'}
            }]
          }
        ]
      },
        {
          type: 'row',
          content: [{
            type: 'component',
            componentName: 'details',
            componentState: {label: 'Details'}
          },
            {
              type: 'component',
              componentName: 'resample',
              componentState: {label: 'Resample'}
            }
          ]
        }]
    }]
  };

  let layout = new GoldenLayout(config, $('#layoutContainer'));

  layout.registerComponent('dataset', dataset_view);
  layout.registerComponent('partition', Component(partition_view));
  layout.registerComponent('topology', Component(tree_view));
  layout.registerComponent('filtering', Component(controls_view));
  layout.registerComponent('details', Component(details_view));
  layout.registerComponent('resample', Component(resample_view));

  layout.init();

  let addMenuItem = function( text ) {
    let element = $( '<li>' + text + '</li>' );
    $( '#menuContainer' ).append( element );

    //insertion code will go here
  };

  addMenuItem( 'User added component A' );
  addMenuItem( 'User added component B' );
}

// function init() {
//   dataset_view.init();
// }


