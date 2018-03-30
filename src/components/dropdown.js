import * as d3 from 'd3';

export default function dropdown(_name, cb) {
  let name = _name;
  let items = [];

  function menu(selection) {
    selection.classed('dropdown', true);

    selection.selectAll('.drop-btn').data([name])
      .enter()
      .append('button')
        .attr('class', 'drop-btn')
        .text(d => d);

    let content = selection.selectAll('.dropdown-content').data([name]);

    let entries = content.enter()
        .append('div')
        .attr('class', 'dropdown-content')
        .merge(content)
        .selectAll('div')
        .data(items);

    entries
      .enter()
      .append('div')
        .attr('class', 'dropdown-item')
        .on('click', cb)
      .merge(entries)
        .text(d => d.label);

    entries.exit().remove();
  }

  menu.items = function(_) {
    items = _;
    return this;
  };

  return menu;

}
