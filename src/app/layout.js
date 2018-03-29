import 'golden-layout/src/css/goldenlayout-base.css';
import '../style/goldenlayout-theme.less';

import * as $ from 'jquery';
import GoldenLayout from 'golden-layout/dist/goldenlayout';

let config = {
  settings: {
    hasHeaders: true,
    constrainDragToContainer: true,
    reorderEnabled: true,
    selectionEnabled: false,
    popoutWholeStack: false,
    blockedPopoutsThrowError: true,
    closePopoutsOnUnload: true,
    showPopoutIcon: false,
    showMaximiseIcon: true,
    showCloseIcon: false
  },
  dimensions: {},
  content: [{
    type: 'row',
    content: [
      {
        type: 'column',
        width: 13,
        content: [
          {
            type: 'component',
            componentName: 'partition',
            componentState: {},
            isClosable: false,
            title: 'Partition'
          },
          {
            type: 'stack',
            content: [
              {
                type: 'component',
                componentName: 'filtering',
                componentState: {},
                title: 'Filtering',
                isClosable: false,
              },
              {
                type: 'component',
                componentName: 'resample',
                componentState: {},
                title: 'Resample',
                isClosable: false,
              },
              {
                type: 'component',
                componentName: 'extrema',
                componentState: {},
                title: 'Extrema',
                isClosable: false,
              }
            ]
          }
        ]
      },
      {
        type: 'column',
        content: [
          {
            type: 'component',
            componentName: 'topology',
            componentState: {},
            title: 'Topology',
            isClosable: false,
          },
          {
            type: 'component',
            componentName: 'details',
            componentState: {},
            title: 'Details',
            isClosable: false,
          }
        ]
      }
    ]
  }]
};


let load_layout = null;

let state = load_layout && localStorage.getItem('layout.state');
let layout = new GoldenLayout(state && JSON.parse(state) || config, $('#layoutContainer'));
layout._isFullPage = true;


export function register(name, component) {
  layout.registerComponent(name, component);
}

export function init() {
  layout.init();
  // if (save_layout)
  layout.on('stateChanged', save);
}

export function on(event, cb, ctx) {
  layout.on(event, cb, ctx);
}

export function save() {
  let t0 = performance.now();
  let state = JSON.stringify(layout.toConfig());
  localStorage.setItem('layout.state', state);
  // console.log(`layout save [${Math.round(performance.now() - t0)}]`);
}

