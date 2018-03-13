import * as d3 from 'd3'
import './lifeline.css';

export default function Lifeline() {
  let margin = {top: 10, right: 10, bottom: 10, left:40},
    width = 600 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

  let svg = null;
  let root = null;
  let nodes = null;
  let edges = null;

  let sx = d3.scaleLinear().domain([0, 1]).range([0, width]);
  let sy = d3.scaleLog().domain([0.001+Number.EPSILON, 1]).range([height, 0]).clamp(true);
  let y_axis = d3.axisLeft(sy).ticks(4, '.3g');

  let dispatch = d3.dispatch('highlight', 'select', 'edit');


  function preprocess() {
    edges = [];
    visit(root);

    function visit(node) {
      for (let child of node.children) {
        edges.push( {parent: node, child: child});
        visit(child);
      }
    }
  }

  function layout() {
    visit(root, [0, 1]);

    function visit(node, range) {
      let w = range[1] - range[0];
      node.pos = {x: range[0] + w/2, y: node.lvl, w: w, yp: node.parent && node.parent.lvl || 1};
      console.log(node.id, node.lvl, node.parent && node.parent.lvl || 1, node.pos.y,  sy(node.pos.y), sy(node.pos.yp));
      let from = range[0];
      for (let child of node.children) {
        let to = from + w * child.size / node.size;
        visit(child, [from, to]);
        from = to;
      }
    }
  }

  function render() {
    console.log(`render ${nodes.length} nodes`);
    let d3nodes = svg.select('.nodes').selectAll('.node')
      .data(nodes, d => d.id);

    d3nodes.enter()
      .append('rect')
      .attr('class', 'node')
      .merge(d3nodes)
        .attr('x', d => sx(d.pos.x-d.pos.w/2))
        .attr('y', d => sy(d.pos.yp))
        .attr('width', 1) //sx(d => d.pos.w))
        .attr('height', d => sy(d.pos.y) - sy(d.pos.yp));

    d3nodes.exit().remove();

    let d3edges = svg.select('.edges').selectAll('.edge')
      .data(edges);

    d3edges.enter()
      .append('line')
        .attr('class', 'edge')
      .merge(d3edges)
        .attr('x1', d => sx(d.parent.pos.x))
        .attr('x2', d => sx(d.child.pos.x))
        .attr('y1', d => sy(d.parent.pos.y))
        .attr('y2', d => sy(d.parent.pos.y));

    d3edges.exit().remove();
  }

  function lifeline(selection) {
    svg = selection
      .append('svg')
        .attr('class', 'lifeline')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('g')
      .attr('class', 'nodes');

    svg.append('g')
      .attr('class', 'edges');

    svg.append('g')
      .attr('class', 'y axis')
      .call(y_axis);

    return lifeline;
  }

  lifeline.data = function(_nodes, _root) {
    root = _root;
    nodes = _nodes;
    preprocess();
    layout();
    render();
    return this;
  };

  lifeline.highlight = function() {
    // not implemented yet
    return this;
  };


  lifeline.update = function() {
    // not implemented yet
    return this;
  };

  lifeline.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };


  return lifeline;
}