import * as d3 from 'd3';

export default function YAxis() {
  let margin = {top: 10, right: 10, bottom: 10, left: 50};
  let width = 60 - margin.left - margin.right;
  let height = 120 - margin.top - margin.bottom;

  let scale = d3.scaleLinear().range([height, 0]);
  let axis = d3.axisLeft(scale).ticks(2, 's');
  let extent = [0, 0];

  let brush_selection;
  let brush = d3.brushY().extent([[2, 0], [12, height]])
    .on('brush', brushed)
    .on('end', brush_ended)
    .on('start', brush_started);


  let name = 'y axis';
  let filter = null;
  let dispatch = d3.dispatch('filter');

  function brushed() {
    let s = d3.brushSelection(this);
    brush_selection = [[2, s[0]], [12, s[1]]];

    let range = d3.event.selection.map(scale.invert);
    if (filter) filter.range([range[1], range[0]]);
    dispatch.call('filter');
  }

  function brush_ended() {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) return; // Ignore empty selections.
    let range = d3.event.selection.map(scale.invert);
    if ((range[0]-range[1])/(extent[1]-extent[0]) < 0.01)
      range = null;
    else
      range = [range[1], range[0]];
    if (filter) filter.range(range);
    dispatch.call('filter');
  }

  function brush_started() {
    brush_selection = [[2, 0], [12, 0]];
    if (filter) filter.range(null);
    dispatch.call('filter');
  }

  function y(selection) {
    selection.selectAll('.y').call(axis);
    if (brush_selection) {
      selection.selectAll('.brush')
        .each(function() {
          if (this.__brush ) {
            this.__brush.selection = brush_selection;
          }
          // {
          //   let s = this.__brush.selection;
          //   console.log(s);
          //   this.__brush.selection[0][1] = brush_selection[0];
          //   this.__brush.selection[1][1] = brush_selection[1];
          // }
        });
    }
    selection.selectAll('.brush').call(brush);
  }

  y.create = function(selection) {
    let svg = selection.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('g')
      .attr('class', 'y axis')
      .call(axis);

    svg.append('g')
      .attr('class', 'brush')
      .call(brush);
  };

  y.domain = function(_) {
    name = _.name;
    extent = _.extent;
    scale.domain(_.extent);
    return this;
  };

  y.filter = function(_) {
    filter = _;
    return this;
  };

  y.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };


  return y;
}