import * as d3 from 'd3';


export default function Chart() {
  let margin = {top: 20, right: 20, bottom: 30, left: 50},
    width = 150 - margin.left - margin.right,
    height = 120 - margin.top - margin.bottom;

  function chart(selection)
  {
    let svg = selection.enter()
      .append('svg')
        .classed('chart', true)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    svg.append('path').attr('class', 'line');

    svg.append("g")
        .attr('class', 'x axis')
        .attr("transform", `translate(0,${height})`)
      .append('text')
        .attr('class', 'label')
        .attr("transform", `translate(${width/2}, 25)`)
        .style('text-anchor', 'middle')
        .text('Persistence level');

    svg.append('g')
      .attr('class', 'y axis')
      .append("text")
        .attr('class', 'label')
        .attr("transform", "rotate(-90)")
        .attr("y",  margin.right - margin.left)
        .attr("dx", -height / 2)
        .style("text-anchor", "middle")
        .text("Num of partitions");

    let g = svg.merge(selection)
      .each(function (d, i) {
        d.sx.range([0, width]);
        d.sy.range([height, 0]);

        let line = d3.line()
          .x(p => d.sx(p[0]))
          .y(p=>d.sy(p[1]))
          .curve(d3.curveStepAfter);

        let g = d3.select(this);
        g.select('.x').call(d3.axisBottom(d.sx));
        g.select('.y').call(d3.axisLeft(d.sy));
        g.select('path').attr('d', p => line(p.curve));
      });

    return chart;
  }

  chart.width = function (_) {
    if (!arguments.length) return width;
    width = _;
    return this;
  };

  chart.height = function (_) {
    if (!arguments.length) return height;
    height = _;
    return this;
  };

  return chart;
}