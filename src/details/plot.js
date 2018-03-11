import * as d3 from 'd3'

export default function Plot() {
  let margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 100 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  let x = null;
  let y = null;
  let color = null;

  function plot(selection) {
    selection.each(function (d, i)  {
      let tx = x.get(this);
      let ty = y.get(this);

      let pts = d3.select(this).select('.pts').selectAll('circle')
          .data(d);

      pts.enter().append('circle')
          .attr('r', 1.5)
          .attr('cx', d => tx(d))
          .attr('cy', d => ty(d))
        .merge(pts)
          .style("fill", d => color(d));
      pts.exit().remove();
    });
  }

  plot.create = function(selection) {
    let g = selection
        .attr('class', 'plot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('rect')
      .attr('width', width)
      .attr('height', height);

    g.append('g').attr('class', 'pts');
  };

  plot.size = function(_) {
    if (!arguments.length) return [width, height];
    [width, height] = _;
    return this;
  };

  plot.x = function(_) {
    x = _;
    return this;
  };

  plot.y = function(_) {
    y = _;
    return this;
  };

  plot.color = function(_) {
    color = _;
    return this;
  };

  return plot;
}