import * as d3 from 'd3';

export default function Slider() {
  let margin = {top: 15, right: 10, bottom: 0, left: 10};
  let width = 250 - margin.left - margin.right;
  let height = 35 - margin.top - margin.bottom;

  let range = [0, width];
  let name = 'x axis';
  let brush = d3.brushX().extent([[0, -10], [width, 0]])
    .on('brush', brushed)
    .on('end', brush_ended)
    .on('start', brush_started);

  let dispatch = d3.dispatch('change');

  function brushed(d) {
    let range = d3.event.selection.map(d.scale.invert);
    dispatch.call('change', this, d, range);
  }

  function brush_ended() {
  }

  function brush_started() {
  }

  function slider(selection) {
    selection.each( function(d, i) {
      console.log(this, d, i);
      let s = d3.select(this).selectAll('svg')
        .data([d]);

      let svg = s.enter()
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      svg.append('g')
        .attr('class', 'x axis');

      svg.append('g')
        .attr('class', 'brush');

      svg.append('text')
        .attr('class', 'label')
        .attr('transform', `translate(${width / 2},${height + margin.top + 20})`)
        .style('text-anchor', 'middle');
      //   .text('Persistence');

      let scale = d.type === 'log' ? d3.scaleLog() : d3.scaleLinear();
      scale.domain(d.domain).range([0, width]).clamp(true).nice();
      d.scale = scale;

      let all = svg.merge(s);

      all.select('.axis')
        .call(d3.axisBottom(scale).ticks(d.ticks.n, d.ticks.format));

      all.select('.brush')
        .call(brush)
        // .call(brush.move, d.selection.map(scale))
      ;
    });
  }

  slider.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };

  return slider;
}