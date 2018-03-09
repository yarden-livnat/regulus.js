import * as d3 from "d3";
// import {Plot} from "./index";
import template from './group.html';

let GROUP_WIDTH = 200;

export default function Group() {
  // let plot = Plot();
  let sy;
  let dims = [];
  let measure = "";

  let x = d3.local();
  let y = d3.local();

  let move = d3.transition().duration(1500);
  let opacity = d3.transition().duration(1500);

  function loc(i) {
    return `${i*GROUP_WIDTH}px`;
  }

  function name(d) {
    return name.alias && `${d.id}: ${d.name}` || `${d.id}`;
  }

  function group(selection) {
    selection
      .each(function(d, i) {
        let g = d3.select(this);
        g.transition(move)
          .style('left', loc(i))   // left or top
          // .style('top', loc(i))
          .transition(opacity)
          .style('opacity', 1);

        g.select('.header .name').text(d => name(d));

        let plots = g.select('.plots').selectAll('.plot').data(dims);
        plots.enter()
          .append('div')
          .classed('plot', true)
        //   .call(plot.create)
          .merge(plots)
          .text(d => `${d}x${measure}`);
        //   .each( function(d, i) {
        //     sy.set(this, d3.scaleLinear().range([plot_height]).domain(extents.y[i]));
        //   })
        //   .call(plot);
      });
  }

  group.create = function(selection) {
    selection
      .attr('class', 'group')
      .style('left', (d, i)=> loc(i))
      .style('opacity', 0);
    selection.html(template);
    // let header = selection.append('div')
    //   .attr('class', 'header');
    // header.append('')
    // selection.append('div').attr('class', 'plots');
  };

  group.dims = function(_) {
    dims = _;
    return this;
  };

  group.measure = function(_) {
    measure = _;
    return this;
  };

  // group.sx = function(_) {
  //   plot.sx(_);
  //   return this;
  // };
  //
  // group.sy = function(_) {
  //   sy = _;
  //   plot.sy(_);
  //   return this;
  // };

  return group;
}
