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
  let show_filtered = true;

  function svg_render_pts(d ,i) {
    let tx = x.get(this);
    let ty = y.get(this);

    let visible_pts = show_filtered ? d.pts : d.pts.filter( pt => !pt.filtered);

    let pts = d3.select(this).select('.pts').selectAll('circle')
      .data(visible_pts, pt => pt.id);

    pts.enter().append('circle')
      .attr('r', 1)
      .attr('cx', d => tx(d))
      .attr('cy', d => ty(d))
      .merge(pts)
      .style("fill", d => d.filtered && '#eee' || color(d))
      .attr('z-index', d => d.filtered && -1 || 1);

    pts.exit().remove();
  }

  function plot(selection) {
    let t0 = performance.now();
    selection.each(function (d, i)  {
      let root = d3.select(this);

      svg_render_pts.call(this, d, i);

      root.select('.line')
        .attr('d', line.get(this)(d.line));

      root.select('.area')
        .attr('d', area.get(this)(d.area));
    });
    let t1 = performance.now();
    // console.log(`details plot render: ${t1-t0} msec`);
  }

  plot.create = function(selection) {
    let t0 = performance.now();
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
    let t1 = performance.now();
    // console.log(`details plot create: ${t1-t0} msec`);
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

  plot.show_filtered = function(_) {
    show_filtered = _;
    return this;
  };

  return plot;
}