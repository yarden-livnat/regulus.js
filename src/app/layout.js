import GoldenLayout from 'golden-layout/dist/goldenlayout';
import 'golden-layout/src/css/goldenlayout-base.css';
import './goldenlayout-theme.less';
import * as $ from 'jquery';

import * as d3 from 'd3';

import fontawesome from '@fortawesome/fontawesome';
import faCogs from '@fortawesome/fontawesome-free-solid/faCogs';
import faCog from '@fortawesome/fontawesome-free-solid/faCog';
fontawesome.library.add(faCogs);
fontawesome.library.add(faCog);

import {config} from './layout_config';

let timer = null;
export let layout = null;

let params = new URLSearchParams(document.location.search.substring(1));
init_layout(!params.has('noload'), !params.has('nosave'));

export function init_layout(load, do_save) {
  let state = load && localStorage.getItem('layout.state');
  layout = new GoldenLayout(state && JSON.parse(state) || config, $('#workbench'));
  layout._isFullPage = true;

  layout.on('stackCreated',on_stack);
  if (do_save)
    layout.on('stateChanged', save);
}

function on_stack(stack) {
  stack.header.controlsContainer.prepend('<div class="cogs"><i class="fas fa-cogs"></div>');
  let cogs = d3.select(stack.header.controlsContainer[0]).select('.cogs')
    .on('click', () => {
      let item = stack.getActiveContentItem().container.emit('config');
    });
  stack.on('activeContentItemChanged', contentItem => {});
  // stack.getActiveContentItem().container.extendState({});
}

function save() {
  if (timer) return;

  timer = setTimeout(() => {
    let state = JSON.stringify(layout.toConfig());
    localStorage.setItem('layout.state', state);
    timer = null;
  }, 500);
}


