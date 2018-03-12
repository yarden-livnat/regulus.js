import * as d3 from 'd3'
window.d3 = d3;
import {lasso as Lasso} from 'd3-lasso';

export default function Plot() {
  let margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = 100 - margin.left - margin.right,
    height = 100 - margin.top - margin.bottom;

  let x = null;
  let y = null;
  let color = null;
  let line = null;
  let area = null;
  let lasso = Lasso()
    .closePathSelect(true)
    .closePathDistance(100)
    // .items(circles)
    // .targetArea(svg)
    .on("start",lasso_start)
    .on("draw",lasso_draw)
    .on("end",lasso_end);

  let use_lasso = true;

  let brush = d3.brush().extent([[0, 0], [width, height]])
    .on('brush', brushed)
    .on('end', brush_ended)
    .on('start', brush_started);

  function brushed() {
    console.log('brushed')
    // let range = d3.event.selection.map(scale.domain(dim.extent).invert);
    // dim.filter.range(range);
    // dispatch.call('filter', this, dim, range);
  }

  function brush_started() {

  }

  function brush_ended() {
  }

  function lasso_start() {
    console.log('lasso start');
    lasso.items()
      .attr("r",3.5) // reset size
      .classed("not_possible",true)
      .classed("selected",false);
  }

  function lasso_draw() {
    console.log('lasso draw');
    // Style the possible dots
    lasso.possibleItems()
      .classed("not_possible",false)
      .classed("possible",true);

    // Style the not possible dot
    lasso.notPossibleItems()
      .classed("not_possible",true)
      .classed("possible",false);
  }

  function lasso_end() {
    console.log('lasso end')
    // Reset the color of all dots
    lasso.items()
      .classed("not_possible",false)
      .classed("possible",false);

    // Style the selected dots
    lasso.selectedItems()
      .classed("selected",true)
      .attr("r",7);

    // Reset the style of the not selected dots
    lasso.notSelectedItems()
      .attr("r",3.5);

  }

  function svg_render_pts(d ,i) {
    let tx = x.get(this);
    let ty = y.get(this);

    let pts = d3.select(this).select('.pts').selectAll('circle')
      .data(d.pts);

    pts.enter().append('circle')
      .attr('r', 1)
      .attr('cx', d => tx(d))
      .attr('cy', d => ty(d))
      .merge(pts)
      .style("fill", d => d.filtered && '#eee' || color(d))
      .attr('z-index', d => d.filtered && -1 || 1);

    pts.exit().remove();

    if (use_lasso) {
      let c = d3.select(this).select('.pts').selectAll('circle');
      lasso.items(c);
      // d3.select(this).call(lasso);
    }
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
    let svg = selection
        .attr('class', 'plot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('rect')
      .classed('background', true)
      .attr('width', width)
      .attr('height', height);

    svg.append('path').attr('class', 'area');
    svg.append('g').attr('class', 'pts');
    svg.append('path').attr('class', 'line');

    if (!use_lasso) {
      svg.append('g')
        .attr('class', 'brush')
        .call(brush);
    }
    else {
      lasso.targetArea(svg);
      svg.call(lasso);
    }

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

  return plot;
}