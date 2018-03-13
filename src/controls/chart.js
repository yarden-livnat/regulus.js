import * as d3 from 'd3'

import {ensure_single, on_hover} from "../utils";
import DrawChart from "./drawchart";
import FetchInfo from "./fetchinfo";
export default function Chart(){

    let el = null;
    let tree = null;
    let nodes = [];

    let dispatch = d3.dispatch('highlight', 'select', 'edit');
    //console.log("Inside Chart")

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

    function create(pchart,schart){
        //console.log("render function");

        console.log(pchart, schart);
        let pc = d3.select("#persistence_chart")//.append("text").text("d","PC");
        let sc = d3.select("#size_chart")//.append("text").text("d","SC");

        //let x = d3.local();
        //let area = d3.local();
        //let line = d3.local();
        let chart1 = DrawChart().createline(pchart);//.x(x).line(line).area(area);
        let chart2 = DrawChart().createline(schart);//.x(x).line(line).area(area);

        pc.call(chart1.create);
        sc.call(chart2.create);

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
        let [pchart,schart] = FetchInfo(nodes);
        create(pchart, schart);
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

    return api;//group;
}