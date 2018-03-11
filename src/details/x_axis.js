import * as d3 from 'd3';

export default function XAxis() {
  let margin = {top: 10, right: 10, bottom: 0, left: 10};
  let width = 120 - margin.left - margin.right;
  let height = 30 - margin.top - margin.bottom;

  let scale = d3.scaleLinear().range([0, width]);
  let axis =  d3.axisBottom(scale).ticks(2, 's');
  let name = 'x axis';

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
      // .attr("transform", `translate(0,${height})`)
      .call(axis);

    svg.append('text')
      .attr('class', 'label')
      .attr('transform', `translate(${width/2},${height + margin.top + 20})`)
      .style('text-anchor', 'middle');
      // .text(name);
  };

  x.domain = function(_) {
    name = _.name;
    scale.domain(_.extent);
    return this;
  };

  return x;
}