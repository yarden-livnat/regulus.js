import 'golden-layout/src/css/goldenlayout-base.css';
import './goldenlayout-theme.less';

import * as $ from 'jquery';
import GoldenLayout from 'golden-layout/dist/goldenlayout';

let config = {
  settings: {
    hasHeaders: true,
    constrainDragToContainer: true,
    reorderEnabled: true,
    selectionEnabled: true,
    popoutWholeStack: false,
    blockedPopoutsThrowError: true,
    closePopoutsOnUnload: true,
    showPopoutIcon: true,
    showMaximiseIcon: true,
    showCloseIcon: true
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
              },
              {
                type: 'component',
                componentName: 'resample',
                componentState: {},
                title: 'Resample',
              },
              {
                type: 'component',
                componentName: 'extrema',
                componentState: {},
                title: 'Extrema',
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
            componentName: 'lifeline',
            componentState: {},
            title: 'Lifeline',
          },
          {
            type: 'component',
            componentName: 'details',
            componentState: {},
            title: 'Details',
          }
        ]
      }
    ]
  }]
};


let load_layout = false;
let save_layout = false;


let state = load_layout && localStorage.getItem('layout.state');
export let layout = new GoldenLayout(state && JSON.parse(state) || config, $('#layoutContainer'));
layout._isFullPage = true;

if (save_layout)
  layout.on('stateChanged', save);

export function save() {
  if (!layout.isInitialised) return;
  let t0 = performance.now();
  let state = JSON.stringify(layout.toConfig());
  localStorage.setItem('layout.state', state);
  // console.log(`layout save [${Math.round(performance.now() - t0)}]`);
}


