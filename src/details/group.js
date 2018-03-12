import * as d3 from "d3";
import Plot from "./plot";
import YAxis from './y_axis';
import template from './group.html';

let GROUP_OFFSET = 0;
let GROUP_SIZE = 120;
let PLOT_HEIGHT = 100;
let PLOT_WIDTH = 100;

let DURATION = 1000;

export default function Group() {
  let dims = [];
  let measure = null;
  let y_axis = YAxis();
  let sy = d3.scaleLinear().range([100, 0]);

  let yScale = d3.scaleLinear().range([PLOT_HEIGHT, 0]);

  let x = d3.local();
  let area = d3.local();
  let line = d3.local();
  let plot = Plot().x(x).line(line).area(area);

  function loc(i) {
    return `${GROUP_OFFSET + i * GROUP_SIZE}px`;
  }

  function group(selection, all) {
    selection
      .transition().duration(DURATION)
      .style('top', (d, i) => loc(i))
      .style('opacity', 1);

    let t0 = performance.now();
    selection
      .each(function(d, i) {
        let g = d3.select(this);
        g.select('.header .id').text(d => `id: ${d.id}`);
        g.select('.header .name').text(d => d.name);
        g.select('.header .size').text(d => `${d.pts.length} pts`);

        g.select('.measure .name').text(measure.name);
        g.select('.measure .y_axis').call(y_axis);

        let plots = g.select('.plots').selectAll('.plot').data(dims);
        let list = plots.enter()
          .append('svg')
          .call(plot.create);
        if (all)
          list = list.merge(plots);
          // .merge(plots)
        list
          .each(function (dim, i) {
            let sx = d3.scaleLinear().range([0, PLOT_WIDTH]).domain(dim.extent);
            x.set(this, pt => sx(pt[dim.name]));


            let mi = dims.length;
            line.set(this, d3.line()
              .x(pt => sx(pt[i]))
              .y(pt => sy(pt[mi])));

            area.set(this, d3.area()
              .y0((p) => sy(p.pt[mi]))
              .y1((p) => sy(p.pt[mi]))
              .x0((p) => sx(p.pt[i] - p.std[i]/2))
              .x1((p) => sx(p.pt[i] + p.std[i]/2)));
          })
          .datum(d)
          .call(plot);
      });
    let t1 = performance.now();
    // console.log(`details group render: ${t1-t0} msec`);
  }

  group.create = function(selection) {
    let t0 = performance.now();
    selection
      .attr('class', 'group')
      .style('top', (d, i)=> loc(i))
      .style('opacity', 0);
    selection.html(template);

    selection.select('.measure').selectAll('.y_axis').call(y_axis.create);
    let t1 = performance.now();
    // console.log(`details group create: ${t1-t0} msec`);
  };

  group.remove = function(selection) {
    selection
      .transition().duration(DURATION)
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

  group.on = function(event, cb) {
    y_axis.on(event, cb);
    return this;
  };

  return group;
}
