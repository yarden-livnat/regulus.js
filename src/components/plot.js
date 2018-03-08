import * as d3 from 'd3'

export default function () {
    let margin = {top: 8, right: 10, bottom: 2, left: 10},
      width = 200 - margin.left - margin.right,
      height = 100 - margin.top - margin.bottom;

    let sx, sy;
    // let sx = d3.scaleLinear().range([0, width]).domain([0, 100]);
    // let sy = d3.scaleLinear().range([height, 0]).domain([0, 500]);
    let x = d => d.x;
    let y = d => d.y;

    // let line = d3.line()
    //   .x(d => sx(x(d)))
    //   .y(d => sy(y(d)));

    function plot(selection) {
      let line = d3.line()
        .x(d => sx.get(this)(x(d)))
        .y(d => sy.get(this)(y(d)));

      selection.selectAll('path').attr('d', d => line(d));
    }

    plot.create = function(selection) {
      selection.append('svg')
        .attr('class', 'plot')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
        .append('path')
        .attr('class', 'line');
    };

    plot.size = function(_) {
      if (!arguments.length) return [width, height];
      [width, height] = _;
      return this;
    };

    plot.sx = function(_) {
      sx = _;
      return this;
    };

    plot.sy = function(_) {
      sy = _;
      return this;
    };

    return plot;
  }