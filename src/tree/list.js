import * as d3 from 'd3'

import {ensure_single, on_hover} from "../utils";

export default function List() {
  let width = 300, height = 300;
  let el = null;
  let tree = null;
  let nodes = [];
  let dispatch = d3.dispatch('highlight', 'select', 'edit');

  let format_lvl = d3.format('3.2'), format_id = d3.format('3d');

  function collect_nodes(node, list) {
    list.push(node);
    for (let child of node.children) {
      collect_nodes(child, list)
    }
  }

  /*
   * node rendering functions
   */

  function render_partition(p) {
    return `${format_lvl(p.lvl)} id: ${format_id(p.id)} size:${p.pts_idx[1]-p.pts_idx[0] + (p.extrema && p.extrema.length || 0)}`;
  }


  function highlight(d, on) {
    // d3.select(this).classed('highlight', on);
    dispatch.call('highlight', this, d, on);
  }

  function select(d) {
    d.selected = !d.selected;
    d3.select(this).classed('selected', d.selected);
    dispatch.call('select', this, d, d.selected);
  }

  function edit(d) {
    dispatch.call('edit', this, d);
  }

  function render() {
    let items = el.selectAll('li').data(nodes, d => d.id);

    items.enter()
      .append('li')
      .append('label')
        .classed('node', true)
        .on('mouseover', on_hover(highlight, 100))
        .on('click', ensure_single(select))
        .on('dblclick', edit)
      .merge(items)
        .text(render_partition);

    items.exit().remove();
  }


  function capture_single(selection) {
    let timer = null, orig=null;
    let listener = selection.on('click');

    selection.on('click', function (d) {
      let self = this;
      if (timer) {
        timer.stop();
        timer = null;
      } else {
        orig = JSON.parse(JSON.stringify(d3.event));
        timer = d3.timeout( () => {
          timer = null;
          d3.customEvent(orig, listener, self, [d]);
        }, 250);
      }
      d3.event.stopPropagation();
    });
  }


  function api(_) {
    el = (typeof _ === 'string') && d3.select(_) || _;
    return api;
  }

  api.data = function (root) {
    tree = root;
    nodes = [];
    collect_nodes(root, nodes);
    nodes = nodes.sort( (a, b) => b.lvl - a.lvl || a.id - b.id);
    render();
    return this;
  };

  api.highlight = function(node, on) {
    let n = el.selectAll('li label').data([node], d => d.id);
    n.classed('highlight', on);
  };

  api.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };

  return api;
}