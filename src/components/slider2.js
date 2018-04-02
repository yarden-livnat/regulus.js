import * as d3 from 'd3';
import './slider.scss';

export default function Slider() {
  let margin = {top: 15, right: 10, bottom: 0, left: 10};
  let width = 1;
  let height = 1;

  let range = [0, width];
  let name = 'x axis';
  let brush = d3.brushX().extent([[0, -8], [width, 0]])
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

  function linear_gradient(svg) {
    let defs = svg.select('defs');

    let g = defs
      .append('linearGradient')
      .attr('id', d => `slider-gradient-${d.id}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    g.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', d => d.colorScale(d.domain[0]))
      .attr('opacity', 1);

    g.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', d => d.colorScale((d.domain[0]+d.domain[1])/2))
      .attr('opacity', 1);

    g.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', d => d.colorScale(d.domain[1]))
      .attr('opacity', 1);
  }

  function slider(selection) {
    selection.each( function(d, i) {
      let svg = d3.select(this);

      width = parseInt(svg.style('width')) - margin.left - margin.right;
      height = parseInt(svg.style('height')) - margin.top - margin.bottom;

      if (isNaN(width) || isNaN(height))
        return;

      let g = svg.selectAll('g')
        .data([1]).enter()
        .append('g')
          .attr('transform', `translate(${margin.left},${margin.top})`);

      g.append('rect');

      g.append('g')
        .attr('class', 'x axis');

      g.append('g')
        .attr('class', 'brush');

      g.append('text')
        .attr('class', 'label')
        .attr('transform', `translate(${width / 2},${height + margin.top + 20})`)
        .style('text-anchor', 'middle');

      let scale = d.type === 'log' ? d3.scaleLog() : d3.scaleLinear();
      scale.domain(d.domain).range([0, width]).clamp(true).nice();
      d.scale = scale;

      svg.select('.axis')
        .call(d3.axisBottom(scale).ticks(d.ticks.n, d.ticks.format));

      linear_gradient(svg);

      svg.select('rect')
        .attr('y', -10)
        .attr('width', width)
        .attr('height', 10)
        .attr('fill', `url(#slider-gradient-${d.id})`);

      brush.extent([[0, -10], [width, 1]]);
      svg.select('.brush')
        .call(brush);

      try {
        if (d.selection) {
          svg.select('.brush')
            .call(brush.move, d.selection.map(scale))
          ;
        }
      } catch(e) {
        // console.log(e);
      }
    });
  }

  slider.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };

  return slider;
}