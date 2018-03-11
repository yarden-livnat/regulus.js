import * as d3 from 'd3';

export default function YAxis() {
  let margin = {top: 10, right: 10, bottom: 10, left: 50};
  let width = 60 - margin.left - margin.right;
  let height = 120 - margin.top - margin.bottom;

  let scale = d3.scaleLinear().range([height, 0]);
  let axis = d3.axisLeft(scale).ticks(2, 's');
  let name = 'y axis';

  function y(selection) {
    selection.selectAll('.y').call(axis);
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

    svg.append('text')
      .attr('class', 'label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left)
      .attr('x', -height/2)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text(name);
  };

  y.domain = function(_) {
    name = _.name;
    scale.domain(_.extent);
    return this;
  };

  return y;
}