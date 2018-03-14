import * as d3 from 'd3'

export default function Plot() {
  let margin = {top: 1, right: 1, bottom: 1, left: 1},
    width = 102 - margin.left - margin.right,
    height = 102 - margin.top - margin.bottom;

  let x = null;
  let y = null;
  let color = null;
  let line = null;
  let area = null;
  let show_filtered = true;
  let use_canvas = true;

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

  function canvas_render_pts(d, i) {
    let bg_ctx = d3.select(this).select('.canvas-bg').node().getContext('2d');
    let fg_ctx = d3.select(this).select('.canvas-fg').node().getContext('2d');

    bg_ctx.save();
    bg_ctx.clearRect(0, 0, width, height);

    fg_ctx.save();
    fg_ctx.clearRect(0, 0, width, height);

    let tx = x.get(this);
    let ty = y.get(this);

    // let visible_pts = show_filtered ? d.pts : d.pts.filter( pt => !pt.filtered);
    bg_ctx.fillStyle = '#eee';
    for (let pt of d.pts) {
      if (!pt.filtered) {
        fg_ctx.fillStyle = color(pt);
        fg_ctx.fillRect(tx(pt), ty(pt), 1, 1);
      }
      else if (show_filtered) {
        bg_ctx.fillRect(tx(pt), ty(pt), 1, 1);
      }
    }

    bg_ctx.restore();
    fg_ctx.restore();
  }

  function plot(selection) {
    let t0 = performance.now();
    selection.select('svg').each(function (d, i)  {
      let root = d3.select(this);

      if (!use_canvas)
        svg_render_pts.call(this, d, i);

      root.select('.line')
        .attr('d', line.get(this)(d.line));

      root.select('.area')
        .attr('d', area.get(this)(d.area));
    });

    if (use_canvas)
      selection.each( function(d, i) { canvas_render_pts.call(this, d, i)});

    let t1 = performance.now();
    // console.log(`details plot render: ${t1-t0} msec`);
  }

  plot.create = function(selection) {
    let t0 = performance.now();
    selection
        .attr('class', 'plot');

    selection.append('canvas')
      .attr('class', 'canvas-bg')
        .attr('width', width-2)
        .attr('height', height-2);

    selection.append('canvas')
        .attr('class', 'canvas-fg')
        .attr('width', width-2)
        .attr('height', height-2);

    let svg = selection.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('rect')
      .attr('x', -1)
      .attr('y', -1)
      .attr('width', width+2)
      .attr('height', height+2);

    svg.append('path').attr('class', 'area');
    svg.append('g').attr('class', 'pts');
    svg.append('path').attr('class', 'line');

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

  plot.use_canvas = function(_) {
    use_canvas = _;
    return this;
  };

  return plot;
}