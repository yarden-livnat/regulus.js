import * as d3 from "d3";
// import {Plot} from "./index";

export default function Group() {
  // let plot = Plot();
  let sy;

  let move = d3.transition().duration(1500);
  let opacity = d3.transition().duration(1500);

  function group(selection) {
    selection
      .each(function(d, i) {
        let g = d3.select(this);
        g.transition(move)
          .style('left', `${i * 120}px`)
          .transition(opacity)
          .style('opacity', 1);
        g.select('.header').text(d => d.id);

        // let plots = g.select('.plots').selectAll('.plot').data(d.partition.data);
        // plots.enter()
        //   .call(plot.create)
        //   .merge(plots)
        //   .each( function(d, i) {
        //     sy.set(this, d3.scaleLinear().range([plot_height]).domain(extents.y[i]));
        //   })
        //   .call(plot);
      });
  }

  group.create = function(selection) {
    selection
      .attr('class', 'group')
      .style('left', (d, i)=> `${i*120}px`)
      .style('opacity', 0);
    selection.append('div').attr('class', 'header');
    selection.append('div').attr('class', 'plots');
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
