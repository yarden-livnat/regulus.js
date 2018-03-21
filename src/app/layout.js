import 'golden-layout/src/css/goldenlayout-base.css';
import '../style/goldenlayout-theme.less';

import * as $ from 'jquery';
import GoldenLayout from 'golden-layout/dist/goldenlayout';

let config = {
  content: [{
    type: 'column',
    content: [{
      type: 'row',
      content: [
        {
          type: 'component',
          componentName: 'partition',
          componentState: {},
          isClosable: false,
          title: 'Partition'
        },
        {
          type: 'component',
          componentName: 'topology',
          componentState: {},
          title: 'Topology',
          isClosable: false,
        },
        {
          type: 'column',
          content: [{
            type: 'component',
            componentName: 'filtering',
            componentState: {},
            title: 'Filtering',
            isClosable: false,
          }]
        }
      ]
    },
      {
        type: 'row',
        content: [{
          type: 'component',
          componentName: 'details',
          componentState: {},
          title: 'Details',
          isClosable: false,
        },
          {
            type: 'component',
            componentName: 'resample',
            componentState: {},
            title: 'Resample',
            isClosable: false,
          }
        ]
      }]
  }]
};



let state = null; //localStorage.getItem('layout.state');
let layout = new GoldenLayout( state && JSON.parse(state) || config, $('#layoutContainer'));

layout.on('stateChanged', save);


export function register(name, component) {
  layout.registerComponent(name, component);
}

export function init() {
  layout.init();
}

export function save() {
  // let t0= performance.now();
  // let state = JSON.stringify(layout.toConfig());
  // localStorage.setItem('layout.state', state);
  // console.log(`layout save [${Math.round(performance.now()-t0)}]`);
}

