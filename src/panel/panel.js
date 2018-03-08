import * as d3 from 'd3';

import template from './panel.html';
import './panel.css';

let panels = new Map();

export default function Panel(name) {
  let root = null;

  function panel(el) {
    root = d3.select(el).classed('panel', true);
    root.html(template);
    root.select('.header .name').text(name);

    return panel;
  }

  panel.title = function(_) {
    root.select('.header .name').text(_);
    return this;
  };

  panel.content = function() {
    return root.select('.content');
  };

  panels.set(name, panel);

  return panel;
}