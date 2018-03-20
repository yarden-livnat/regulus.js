import * as d3 from 'd3'
import config from './config';

export default function Plot() {
  let margin = {top: 1, right: 1, bottom: 1, left: 1},
    width = config.plot_width,
    height = config.plot_height;

  let ctx = null;
  let y = null;
  let color = null;

  let show_filtered = 'all';
  let show_regression = true;
  let use_canvas = true;
  let canvas_draw_circles = false;

  let brush = d3.brush().extent([[0, 0], [width, height]])
    .on('start', start)
    .on('brush', brushed);
  let dispatch = d3.dispatch('start', 'brush');

  function brushed() {
    if (!d3.event.sourceEvent || !d3.event.selection) return; // Only transition after input.
    let cctx = ctx.get(this);

    let s = d3.event.selection;
    let rx = [s[0][0], s[1][0]].map(cctx.sx.invert);
    let ry = [s[0][1], s[1][1]].map(cctx.sy.invert);

    dispatch.call('brush', this, rx, [ry[1], ry[0]]);
  }

  function start(partition) {
    if (!d3.event.sourceEvent || !d3.event.selection) return; // Only transition after input.
    let cctx = ctx.get(this);
    let s = d3.event.selection;
    let rx = [s[0][0], s[1][0]].map(cctx.sx.invert);
    let ry = [s[0][1], s[1][1]].map(cctx.sy.invert);
    dispatch.call('start', this, partition.pts, cctx.name, rx, [ry[1], ry[0]]);
  }

  function svg_render_pts(d ,i) {
    let cctx = ctx.get(this);
    let tx = pt => cctx.sx(pt[cctx.name]);
    let ty = y.get(this);

    let visible_pts = (show_filtered === 'all' || show_filtered === cctx.name) ? d : d.filter( pt => !pt.filtered);

    let pts = d3.select(this).select('.pts').selectAll('circle')
      .data(visible_pts, pt => pt.id);

    pts.enter().append('circle')
      .attr('r', config.pt_radius)
      .attr('cx', d => tx(d))
      .attr('cy', d => ty(d))
      .merge(pts)
      .style("fill", d => d.filtered && '#eee' || color(d))
      .attr('z-index', d => d.filtered && -1 || 1);

    pts.exit().remove();
  }

  function svg_render_extra_pts(pts ,i) {
    let cctx = ctx.get(this);
    let tx = pt => cctx.sx(pt[cctx.name]);
    let ty = y.get(this);

    let extra = d3.select(this).select('.pts').selectAll('.extra')
      .data(pts);

    extra.enter().append('circle')
      .attr('class', 'extra')
      .attr('r', config.extra_pt_radius)
      .style("fill", 'black')
      .attr('z-index', 2)
      .merge(extra)
      .attr('cx', d => tx(d))
      .attr('cy', d => ty(d));

    extra.exit().remove();
  }

  function draw_shape(ctx, x, y, r) {
    if (canvas_draw_circles) {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      ctx.fillRect(x, y, r, r);
    }
  }
  function canvas_render_pts(d, i) {
    let bg_ctx = d3.select(this).select('.canvas-bg').node().getContext('2d');
    let fg_ctx = d3.select(this).select('.canvas-fg').node().getContext('2d');

    bg_ctx.save();
    bg_ctx.fillStyle = 'white';
    bg_ctx.fillRect(0, 0, width, height);

    fg_ctx.save();
    fg_ctx.clearRect(0, 0, width, height);

    let cctx = ctx.get(this);
    let tx = pt => cctx.sx(pt[cctx.name]);
    let ty = y.get(this);

    bg_ctx.fillStyle = '#eee';
    for (let pt of d.pts) {
      if (!pt.filtered) {
        fg_ctx.fillStyle = color(pt);
        draw_shape(fg_ctx, tx(pt), ty(pt), config.pt_radius);
      } else if (show_filtered === 'all' || show_filtered == cctx.name) {
        draw_shape(bg_ctx, tx(pt), ty(pt), config.pt_radius);
      }
    }

    bg_ctx.restore();
    fg_ctx.restore();
  }

  function plot(selection) {
    selection.select('svg').each(function (d, i)  {
      let root = d3.select(this);
      let cctx = ctx.get(this);

      if (!use_canvas)
        svg_render_pts.call(this, d.pts, i);

      svg_render_extra_pts.call(this, d.extra || [], i);

      if (show_regression) {
        root.select('.line')
          .attr('d', cctx.line(d.line));

        root.select('.area')
          .attr('d', cctx.area(d.area));

        root.select('.brush').call(brush);
      }
      root.select('.line').style('display', show_regression && 'inline' || 'none');
      root.select('.area').style('display', show_regression && 'inline' || 'none');

    });

    if (use_canvas)
      selection.each( function(d, i) { canvas_render_pts.call(this, d, i)});
  }

  plot.create = function(selection) {
    let t0 = performance.now();
    selection
        .attr('class', 'plot');


    selection.append('canvas')
      .attr('class', 'canvas-bg')
        .attr('width', width)
        .attr('height', height);

    selection.append('canvas')
        .attr('class', 'canvas-fg')
        .attr('width', width)
        .attr('height', height);

    let svg = selection.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('rect')
      .attr('class', 'frame')
      .attr('x', -1)
      .attr('y', -1)
      .attr('width', width+2)
      .attr('height', height+2);

    svg.append('path').attr('class', 'area');
    svg.append('g').attr('class', 'pts');
    svg.append('path').attr('class', 'line');
    svg.append('g')
      .attr('class', 'brush')
      .call(brush);

    let t1 = performance.now();
    // console.log(`details plot create: ${t1-t0} msec`);
  };

  plot.size = function(_) {
    if (!arguments.length) return [width, height];
    [width, height] = _;
    return this;
  };

  plot.ctx = function(_) {
    ctx = _;
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

  plot.show_filtered = function(_) {
    show_filtered = _;
    return this;
  };

  plot.show_regression= function(_) {
    show_regression = _;
    return this;
  };

  plot.use_canvas = function(_) {
    use_canvas = _;
    return this;
  };

  plot.brush = function() {
    return brush;
  };

  plot.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };

  return plot;
}