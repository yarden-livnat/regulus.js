import * as d3 from 'd3';

export default function Crosscut() {
  let margin = {top: 10, right: 10, bottom: 10, left:10},
    width = 800 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  let svg;
  let level = 0.5;
  let measure = d => d;

  let dispatch = d3.dispatch('highlight', 'select', 'details');

  let tree = null;

  function preprocess(_) {
    tree = _;
  }

  function update() {
    let active = [];
    visit(tree);

    function visit(node) {

    }
  }

  function render() {
    if (!svg) return;
  }

  function crosscut(selection) {
    svg = selection
      .append('svg')
      .attr('class', 'fitness')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    front = svg.append('g')
      .attr('class', 'front');

    return crosscut;
  }

  crosscut.data = function(_) {
    preprocess(_);
    return this;
  };

  crosscut.set_size = function(w, h) {
    return this;
  };

  crosscut.level = function(_) {
    if (!arguments.length) return level;
    level = _;
    update();
    render();
    return this;
  };

  crosscut.measure = function(_) {
    measure = _;
    return this;
  };

  crosscut.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };

  return crosscut;
}
