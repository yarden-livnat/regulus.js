import * as d3 from "d3";
import config from './config';
import Plot from "./plot";
import YAxis from './y_axis';

import template from './group.html';


export default function Group() {
  let dims = [];
  let measure = null;
  let y_axis = YAxis();
  let sy = d3.scaleLinear().range([config.plot_height, 0]);

  let yScale = d3.scaleLinear().range([config.plot_height, 0]);

  let ctx = d3.local();
  let plot = Plot().ctx(ctx);

  function loc(i) {
    return `${config.group_offset + i * config.group_size}px`;
  }

  function group(selection, all) {
    selection
      .transition().duration(config.duration)
      .style('top', (d, i) => loc(i))
      .style('opacity', 1)
    ;

    let t0 = performance.now();
    selection
      .each(function(d, i) {
        let g = d3.select(this);
        g.select('.group-header .id').text(d => `id: ${d.id}`);
        g.select('.group-header .name').text(d => d.name);
        g.select('.group-header .size').text(d => `${d.pts.length} pts`);

        g.select('.measure .name').text(measure.name);
        g.select('.measure .y_axis').call(y_axis);

        // let fdims = dims.filter( d => !d.disabled);
        let plots = g.select('.plots').selectAll('.plot')
          .data(dims); //, d => d.name);

        let list = plots.enter()
          .append('div')
          .call(plot.create);

        if (all)
          list = list.merge(plots);

        list
          .each(function (dim, i) {
            let sx = d3.scaleLinear().range([0, config.plot_width]).domain(dim.extent);
            let mi = dims.length;

            ctx.set(this, {
              name: dim.name,
              sx, sy,
              line: d3.line()
                .x(pt => sx(pt[i]))
                .y(pt => sy(pt[mi])),
              area: d3.area()
                .y0((p) => sy(p.pt[mi]))
                .y1((p) => sy(p.pt[mi]))
                .x0((p) => sx(p.pt[i] - p.std[i]/2))
                .x1((p) => sx(p.pt[i] + p.std[i]/2))
            });
          })
          .datum(d)
          .call(plot);

        list.exit().remove();
      });
    // let t1 = performance.now();
    // console.log(`details group render: ${t1-t0} msec`);
  }

  group.create = function(selection) {
    selection
      .attr('class', 'group')
      .style('top', (d, i)=> loc(i))
      .style('opacity', 0)
    ;
    selection.html(template);

    selection.select('.measure').selectAll('.y_axis').call(y_axis.create);
  };

  group.remove = function(selection) {
    selection
      .transition().duration(config.duration)
      .style('opacity', 0)
      .remove();
  };

  group.dims = function(_) {
    dims = _;
    return this;
  };

  group.measure = function(_) {
    measure = _;
    y_axis.domain(_);
    sy.domain(_.extent);
  };

  group.color = function(_) {
    plot.color(_);
    return this;
  };

  group.y = function(_) {
    plot.y(_);
    return this;
  };

  group.filter = function(_) {
    y_axis.filter(_);
    return this;
  };

  group.show_filtered = function(_) {
    plot.show_filtered(_);
    return this;
  };

  group.show_regression = function(_) {
    plot.show_regression(_);
    return this;
  };

  group.use_canvas = function(_) {
    plot.use_canvas(_);
    return this;
  };

  group.plot = function() {
    return plot;
  };

  group.on_y = function(event, cb) {
    y_axis.on(event, cb);
    return this;
  };

  group.on_plot = function(event, cb) {
    plot.on(event, cb);
    return this;
  };

  return group;
}
