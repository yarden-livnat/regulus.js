import * as d3 from 'd3';
import * as chromatic from "d3-scale-chromatic";

export default function Crosscut() {
  let margin = {top: 10, right: 10, bottom: 10, left:10},
    width = 400 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  let svg;
  let level = 0.5;
  let active = [];
  let sx = d3.scaleLinear().range([0, width]);
  let color = d3.scaleSequential(chromatic['interpolateRdYlBu']).domain([0,1]);
  let dispatch = d3.dispatch('highlight', 'select', 'details');

  let tree = null;


  function preprocess(_) {
    tree = _;
    // visit(tree);

    function visit(node) {
    }
  }

  function update() {
    active = [];
    let x = 0;
    visit(tree);

    function visit(node) {
      // console.log(node.id, node.lvl, node.fitness);
      if (node.fitness > level) {
        active.push({
          id: node.id,
          x0: x,
          x1: x + node.size,
          value: node.fitness,
          node
        });
        x += node.size;
      }
      else node.children.forEach(visit);
    }
  }

  function render() {
    if (!svg) return;

    let list = d3.select('.front').selectAll('rect')
      .data(active, d => d.id);

    list.enter()
      .append('rect')
      .merge(list)
      .attr('x', d => sx(d.x0))
      .attr('y', 0)
      .attr('width', d => sx(d.x1)- sx(d.x0))
      .attr('height', 20)
      .attr('fill', d => color(d.value));

    list.exit().remove();
  }

  function crosscut(selection) {
    svg = selection
      .append('svg')
      .attr('class', 'fitness')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

   svg.append('g')
      .attr('class', 'front');

    return crosscut;
  }

  crosscut.data = function(tree, size) {
    preprocess(tree);
    sx.domain([0, size]);
    update();
    render();
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
