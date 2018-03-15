import * as d3 from 'd3'
import {ensure_single} from "../utils/events";
import './lifeline.css';

export default function Lifeline() {
  let margin = {top: 10, right: 10, bottom: 50, left:60},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  let svg = null;
  let root = null;
  let nodes = [];
  let edges = [];
  let selected = null;

  let pt_scale = d3.scaleLinear().domain([0,1]).range([0,width]);
  let y_min = +Number.EPSILON;
  let range = [0, 1];
  let y_type = 'log';
  let sx = d3.scaleLinear().domain([0, 1]).range([0, width]);
  let sy = d3.scaleLog().domain([y_min, 1]).range([height, 0]).clamp(true);
  let y_axis = d3.axisLeft(sy).ticks(4, '.1e');
  let x_axis = d3.axisBottom(pt_scale).ticks(8, 's');
  let value_scale = d3.scaleLog().domain([Number.EPSILON, 1]).range([0,1]).clamp(true);

  let dispatch = d3.dispatch('highlight', 'select', 'details');


  function preprocess() {
    pt_scale.domain([0, root.size]);
    edges = [];
    // visit(root);

    function visit(node) {
      for (let child of node.children) {
        edges.push( {parent: node, child: child});
        visit(child);
      }
    }
  }

  function hover(d, on) {
    dispatch.call('highlight',this, d, on);
  }

  function select(d) {
    if (d === selected) {
      d3.select(this).classed('selected', false);
      selected = null;
      dispatch.call('select', this, d, false);
      return;
    }

    if (selected)
      svg.selectAll('.node').filter(node => node === selected)
        // .data([selected])
        .classed('selected', false);

    selected = d;
    d3.select(this).classed('selected', true);
    dispatch.call('select', this, d, true);
  }

  function details(d) {
    d.details = !d.details;
    d3.select(this).classed('details', d.details);
    dispatch.call('details', this, d, d.details);
  }

  function layout() {
    visit(root, [0, 1]);

    function visit(node, range) {
      let w = range[1] - range[0];
      node.pos = {x: range[0], y: node.lvl, w: w, yp: node.parent && node.parent.lvl || 1};
      let from = range[0];
      for (let child of node.children) {
        let to = from + w * child.size / node.size;
        visit(child, [from, to]);
        from = to;
      }
    }
  }

  function render() {
    if (!svg) return;

    svg.select('.x').call(x_axis);
    svg.select('.y').call(y_axis);

    let d3nodes = svg.select('.nodes').selectAll('.node')
      .data(nodes, d => d.id);

    d3nodes.enter()
      .append('rect')
      .attr('class', 'node')
      .on('mouseenter', d => hover(d, true))
      .on('mouseleave', d => hover(d, false))
      .on('click', ensure_single(select))
      .on('dblclick', details)
      .merge(d3nodes)
        .attr('x', d => sx(d.pos.x))
        .attr('y', d => sy(d.pos.yp))
        .attr('width', d => sx(d.pos.x +d.pos.w) - sx(d.pos.x))
        .attr('height', d => sy(d.pos.y) - sy(d.pos.yp));

    d3nodes.exit().remove();

    // let d3edges = svg.select('.edges').selectAll('.edge')
    //   .data(edges);
    //
    // d3edges.enter()
    //   .append('line')
    //     .attr('class', 'edge')
    //   .merge(d3edges)
    //     .attr('x1', d => sx(d.parent.pos.x))
    //     .attr('x2', d => sx(d.child.pos.x))
    //     .attr('y1', d => sy(d.parent.pos.y))
    //     .attr('y2', d => sy(d.parent.pos.y));
    //
    // d3edges.exit().remove();
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

    svg.append("g")
      .attr('class', 'x axis')
      .attr("transform", "translate(0," + height + ")");
      // .call(d3.axisBottom(pt_scale));

    svg.append("text")
      .attr("transform",
        "translate(" + (width/2) + " ," +
        (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Points");

    svg.append('g')
      .attr('class', 'y axis');

    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Persistence");

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

  lifeline.highlight = function(node, on) {
    svg.selectAll('.node').data([node], d => d.id)
      .classed('highlight', on);
    return this;
  };

  lifeline.details = function(node, on) {
    svg.selectAll('.node').data([node], d => d.id)
      .classed('details', on);
    return this;
  };


  lifeline.update = function() {
    // not implemented yet
    return this;
  };

  lifeline.y_type = function(type) {
    y_type = type;
    if (type === 'linear') {
      sy = d3.scaleLinear().domain(range).range([height, 0]).clamp(true);
      y_axis.scale(sy);
    }
    else {
      sy = d3.scaleLog().domain(range).range([height, 0]).clamp(true);
      y_axis.scale(sy);
    }
    render();
    return this;
  };

  lifeline.y_min = function(value) {
    y_min = y_type === 'linear' ? value : value+Number.EPSILON;
    sy.domain([y_min, 1]);
    render();
    return this;
  };

  lifeline.range = function(_) {
    range = _;
    // y_min = y_type === 'linear' ? value : value+Number.EPSILON;
    sy.domain(range);
    render();
    return this;
  };
  lifeline.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };


  return lifeline;
}