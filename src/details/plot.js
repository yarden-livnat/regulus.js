import * as d3 from 'd3'

export default function Plot() {
  let margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 100 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  let x = null;
  let y = null;
  let color = null;
  let line = null;
  let area = null;

  function plot(selection) {
    selection.each(function (d, i)  {
      let tx = x.get(this);
      let ty = y.get(this);

      let pts = d3.select(this).select('.pts').selectAll('circle')
          .data(d.pts);

      pts.enter().append('circle')
          .attr('r', 1.5)
          .attr('cx', d => tx(d))
          .attr('cy', d => ty(d))
        .merge(pts)
          .style("fill", d => d.filtered && '#eee' || color(d))
          .attr('z-index', d => d.filtered && -1 || 1);

      pts.exit().remove();

      let test =  d3.select(this).select('.line');

      d3.select(this).select('.line')
        // .datum(d.line)
        .attr('d', line.get(this)(d.line));

      d3.select(this).select('.area')
        .attr('d', area.get(this)(d.area));
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

    g.append('path').attr('class', 'area');
    g.append('g').attr('class', 'pts');
    g.append('path').attr('class', 'line');
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

  plot.line = function(_) {
    line = _;
    return this;
  };

  plot.area = function(_) {
    area = _;
    return this;
  };

  plot.color = function(_) {
    color = _;
    return this;
  };

  return plot;
}