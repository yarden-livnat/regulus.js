import * as d3 from 'd3';

export default function dropdown(selector, name, items, func) {
  let menu = d3.select(selector)
    .classed('dropdown', true);

  menu.append('button')
    .attr('class', 'drop-btn')
    .text(name);

  menu.append('div')
    .attr('class', 'dropdown-content')
    .selectAll('div')
    .data(items)
    .enter()
    .append('div')
    .attr('class', 'dropdown-item')
    .on('click', func)
    .text(d => d.label);
}