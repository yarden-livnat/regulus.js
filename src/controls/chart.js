import * as d3 from 'd3'

import {ensure_single, on_hover} from "../utils";

export default function Chart(){
    // let plot = Plot();
    let sy;
    let el = null;
    let tree = null;
    let nodes = [];
    /*
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
    */
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

    let dispatch = d3.dispatch('highlight', 'select', 'edit');
    console.log("Inside Chart")

    let format_lvl = d3.format('3.2'), format_id = d3.format('3d');

    function collect_nodes(node, list) {
        list.push(node);
        for (let child of node.children) {
            collect_nodes(child, list)
        }
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

    function render(){
        d3.select("#persistence_chart").append("text").text("d","PC");
        d3.select("#size_chart").append("text").text("d","SC");

        console.log("render function")
    }

    function api(_) {
        el = (typeof _ === 'string') && d3.select(_) || _;
        return api;
    }

    api.data = function (root) {
        tree = root;
        //console.log("allnodes", root.descendants());
        nodes = [];
        collect_nodes(root, nodes);
        nodes = nodes.sort( (a, b) => b.lvl - a.lvl || a.id - b.id);
        console.log("nodes", nodes)
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

    //return api;

    return api;//group;
}