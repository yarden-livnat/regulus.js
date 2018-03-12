import * as d3 from 'd3';

export default function XAxis() {
  let margin = {top: 10, right: 10, bottom: 0, left: 10};
  let width = 120 - margin.left - margin.right;
  let height = 30 - margin.top - margin.bottom;

  let scale = d3.scaleLinear().range([0, width]);
  let axis =  d3.axisBottom(scale).ticks(2, 's');
  let name = 'x axis';

  function brushed(dim) {
    let range = d3.event.selection.map(scale.domain(dim.extent).invert);
    console.log('bushed', dim, range);
  }

  function brush_ended(dim) {
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) return; // Ignore empty selections.
    let range = d3.event.selection.map(scale.domain(dim.extent).invert);
    console.log('end', dim, range);;
  }

  function brush_started(dim) {
    let range = d3.event.selection.map(scale.domain(dim.extent).invert);
    console.log('started', dim, range);
  }

  function x(selection) {
    selection.select('.x').each(function (d) {
      scale.domain(d.extent);
      d3.select(this).call(axis);
    });
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
      .call(d3.brushX()
        .extent([[0, -10], [width, 0]])
        .on('brush', brushed)
        .on('end', brush_ended)
        .on('start', brush_started));

    svg.append('text')
      .attr('class', 'label')
      .attr('transform', `translate(${width/2},${height + margin.top + 20})`)
      .style('text-anchor', 'middle');
  };

  x.domain = function(_) {
    name = _.name;
    scale.domain(_.extent);
    return this;
  };

  return x;
}