import * as d3 from 'd3'
import {ensure_single} from '../utils/events';
import './lifeline.css';
import * as chromatic from "d3-scale-chromatic";

export default function Lifeline() {
  let margin = {top: 10, right: 10, bottom: 50, left:60},
    width = 800 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

  let svg = null;
  let root = null;
  let nodes = [];
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
  let color = d3.scaleSequential(chromatic['interpolateRdYlBu']).domain([1,0.8]);

  let active = [];
  let level = 0;
  let feature = null;
  let feature_name = null;
  let feature_value = 0;

  let dispatch = d3.dispatch('highlight', 'select', 'details');


  function preprocess() {
    selected = null;
    if (!root) return;
    pt_scale.domain([0, root.size]);
  }

  function update_front() {
    if (!svg) return;
    for (let node of active)
      node.front = false;

    active = [];
    if (root && root.model && feature)
      visit(root);

    let d3nodes = svg.select('.nodes').selectAll('.node')
      .data(active, d => d.id);

    d3nodes
      // .attr('fill', d => color(d.model && d.model[feature_name] || 0));
    .attr('fill', d => d3.rgb(color(d.model && d.model[feature_name] || 0)).brighter(2));

    d3nodes.exit()
      .attr('fill', 'white');

    function visit(node) {
      if (node.model[feature_name] > feature_value) {
        node.front = true;
        active.push(node);
      }
      // else
        node.children.forEach(visit);
    }
  }

  function hover(d, on) {
    dispatch.call('highlight',this, d, on);
  }

  function select(d) {
    d.selected = !d.selected;
    render_names();
    dispatch.call('select', this, d, d.selected);
  }

  function details(d) {
    d.details = !d.details;
    dispatch.call('details', this, d, d.details);
    if (d.details) select(d);
  }

  function layout() {
    if (!root) return;
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

  function render(items = null) {
    if (!svg) return;

    items = items || nodes;
    svg.select('.x').call(x_axis);
    svg.select('.y').call(y_axis);

    let d3nodes = svg.select('.nodes').selectAll('.node')
      .data(items, d => d.id);

    let enter = d3nodes.enter()
      .append('rect')
        .attr('class', 'node')
        .on('mouseenter', d => hover(d, true))
        .on('mouseleave', d => hover(d, false))
        .on('click', ensure_single(details))
        .on('dblclick', select)
      .merge(d3nodes)
        .attr('x', d => sx(d.pos.x))
        .attr('y', d => sy(d.pos.yp))
        .attr('width', d => {
          // console.log(d.id, d.pos.x, d.pos.w, sx(d.pos.x + d.pos.w), sx(d.pos.x));
          return Math.max(0, sx(d.pos.x + d.pos.w) - sx(d.pos.x)-1)
        })
        .attr('height', d => Math.max(0, sy(d.pos.y) - sy(d.pos.yp)-1))
        .classed('highlight', d => d.highlight)
        .classed('selected', d => d.selected)
        .classed('details', d => d.details);

    d3nodes.exit().remove();

    svg.select('.nodes').selectAll('.details')
      .each(function() { this.parentNode.appendChild(this);});

    render_names(items.filter(d => d.details || d.highlight || d.selected ));
  }

  function render_names(items = null) {
    items = items || nodes.filter(d => d.details || d.highlight || d.selected || d.alias);
    let names = svg.select('.names').selectAll('.name')
     .data(items, d => d.id);

    names.enter()
     .append('text')
     .attr('class', 'name')
     .merge(names)
      .text( d => d.alias ? d.alias : d.id)
       .attr('x', d => sx((d.pos.x + d.pos.w/2)))
       .attr('y', d => (sy(d.pos.y) + sy(d.pos.yp))/2)
       .each( function(d)  {
         let bbox = this.getBBox();
         let w = sx(d.pos.x + d.pos.w)- sx(d.pos.x);
         let h = sy(d.pos.y) - sy(d.pos.yp);
         d3.select(this).attr('visibility', (w > bbox.width && h > bbox.height) ? 'visible' : 'hidden');
       });
    names.exit().remove();
  }

  function lifeline(selection) {
    console.log('lifeline', width, height);
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
      .attr('class', 'names');

    svg.append('g')
      .attr('class', 'x axis')
      .attr('transform', `translate(0,${height})`)
      .append('text')
        .attr('class', 'axis-label')
        .attr('transform', `translate(${width/2},${margin.top + 20})`)
        .style('text-anchor', 'middle')
        .text('Points');

    svg.append('g')
      .attr('class', 'y axis')
      .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margin.left)
        .attr('x',0 - (height / 2))
        .attr('dy', '1em')
        .style('text-anchor', 'middle')
        .text('Persistence');

    let defs = svg.append('defs');

    let filter = defs.append('filter')
      .attr('id', 'drop-shadow')
      .attr('height', '130%')
      .attr('width', '130%');

    filter.append("feGaussianBlur")
      .attr("in", "SourceAlpha")
      .attr("stdDeviation", 5)
      .attr("result", "blur");

    filter.append("feOffset")
      .attr("in", "blur")
      .attr("dx", 5)
      .attr("dy", 5)
      .attr("result", "shadow");

    let feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode")
      .attr("in", "shadow");
    feMerge.append("feMergeNode")
      .attr("in", "SourceGraphic");


    return lifeline;
  }

  lifeline.data = function(_nodes, _root) {
    render([]);

    root = _root;
    nodes = _nodes;
    preprocess();
    layout();
    render();
    update_front();
    return this;
  };

  lifeline.highlight = function(node, on) {
    node.highlight = on;
    svg.selectAll('.node').data([node], d => d.id).classed('highlight', on);
    if (on) render_names();
    return this;
  };

  lifeline.details = function(node, on) {
    node.details = on;
    node.highlight = on;
    render();
    return this;
  };

  lifeline.selected = function(node, on) {
    if (selected) selected.selected = false;
    selected = on && node;
    node.selected = on;
    render();
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
    sy.domain(range);
    render();
    return this;
  };

  lifeline.feature_value = function(_) {
    feature_value = _;
    update_front();
    return this;
  };

  lifeline.feature = function(_) {
    feature = _;
    feature_name = feature.name;
    color.domain([feature.range[1], feature.range[0]]);
    update_front();
    return this;
  };

  lifeline.set_size = function(w, h) {
    width = w - margin.left - margin.right;
    height = h - margin.top - margin.bottom;
    console.log('lifeline.setsize', width, height);

    pt_scale.range([0, width]);
    sx.range([0, width]);
    sy.range([height, 0]);

    if (svg) {
      d3.select(svg.node().parentNode)
        .attr('width', w)
        .attr('height', h);

      svg.select('.x')
        .attr('transform', `translate(0,${height})`);

      svg.select('.x .axis-label')
        .attr('transform', `translate(${width / 2}, ${margin.top + 20})`);

      svg.select('.y .axis-label')
        .attr('y', 0 - margin.left)
        .attr('x', 0 - (height / 2));

      render();
    }
    return this;
  };

  lifeline.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };


  return lifeline;
}