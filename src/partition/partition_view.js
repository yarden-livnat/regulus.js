import * as d3 from 'd3';
import {publish, subscribe} from '../utils/pubsub';
import {on_hover} from "../utils";
import template from './partition_view.html';
import './style.css';


let root = null;
let current = null;

export function setup(el) {
  root = typeof el === 'string' && d3.select(el) || el;
  root.classed('partition_view', true);
  root.html(template);

  root.on('mouseenter', d => current && publish('partition.highlight', current, true));
  root.on('mouseleave',  d => current && publish('partition.highlight', current, false));

  root.select('#partition_alias')
    .property('disabled', true)
    .on('change', alias_changed)
    .on('input', d => console.log('input', d));

  root.select('#partition_notes')
    .property('disabled', true)
    .on('change', notes_changed)
    .on('input', d => console.log('input', d));

  subscribe('partition.selected', partition_selected);
  subscribe('partition.edit', partition_selected);
}

function alias_changed() {
  current.alias = this.value;
}

function notes_changed() {
  current.notes = this.value;
}

function partition_selected(topic, partition, selected=true) {
  current = selected && partition || null;

  root.select('#partition_id')
    .text(current && current.id || "");

  root.select('#partition_alias')
    .property('value', current && current.alias || "")
    .attr('disabled', current ? null : true);

  root.select('#partition_notes')
    .property('value', current && current.notes || "")
    .attr('disabled', current ? null : true);

}