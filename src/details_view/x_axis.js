import * as d3 from 'd3';

export default function XAxis() {
  let margin = {top: 10, right: 10, bottom: 0, left: 10};
  let width = 120 - margin.left - margin.right;
  let height = 30 - margin.top - margin.bottom;

  let scale = d3.scaleLinear().range([0, width]);
  let axis =  d3.axisBottom(scale).ticks(2, 's');
  let name = 'x axis';
  let brush = d3.brushX().extent([[0, -10], [width, 0]])
    .on('brush', brushed)
    .on('end', brush_ended)
    .on('start', brush_started);
  let dispatch = d3.dispatch('filter');

  function brushed(dim) {
    let range = d3.event.selection.map(scale.domain(dim.extent).invert);
    dim.filter.range(range);
    dispatch.call('filter', this, dim, range);
  }

  function brush_ended(dim) {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) return; // Ignore empty selections.
    if (dim.filter) {
      let range = d3.event.selection.map(scale.domain(dim.extent).invert);
      if ((range[1] - range[0]) / (dim.extent[1] - dim.extent[0]) < 0.01)
        dim.filter.range(null);
      else
        dim.filter.range(range);
      dispatch.call('filter', this, dim, range);
    }
  }

  function brush_started(dim) {
    if (!d3.event.sourceEvent) return;
    if (!d3.event.selection) return;
    dim.filter.range(null);
    dispatch.call('filter');
  }

  function x(selection) {
    selection.select('.x').each(function (d) {
      scale.domain(d.extent);
      d3.select(this).call(axis);
    });

    selection.select('.brush').call(brush);
  }

  x.create = function(selection) {
    let svg = selection.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('g')
      .attr('class', 'x axis')
      .call(axis);

    svg.append('g')
      .attr('class', 'brush')
      .call(brush);

    svg.append('text')
      .attr('class', 'label')
      .attr('transform', `translate(${width/2},${height + margin.top + 20})`)
      .style('text-anchor', 'middle');
  };

  x.width = function(_) {
    width = _;
    scale.range([0, width]);
    brush.extent([[0, -10], [width, 0]]);
    return this;
  };

  x.domain = function(_) {
    name = _.name;
    scale.domain(_.extent);
    return this;
  };

  x.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };

  return x;
}