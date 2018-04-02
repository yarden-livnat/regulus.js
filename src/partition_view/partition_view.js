import * as d3 from 'd3';
import {pubsub} from '../utils/pubsub';
import {Model} from '../model/model';
import BoxPlot from '../components/boxplot';

import template from './partition_view.html';
import './style.scss';

export function PartitionView(container_, state_) {
  let container = container_;
  // let state = state_;
  let name = state_.componentName;
  let root = null;
  let highlight = null;
  let selected = null;
  let current = null;
  let timer = null;
  let measure = null;
  let shared_msc = null;
  let format = d3.format('.2g');
  let format_f = d3.format('.3f');
  let listeners = new Map();

  let box_plot = BoxPlot()
    .width(100)
    .height(10)
    .tickFormat(d3.format('.2s'));

  let {publish, subscribe, unsubscribe} = pubsub();

  let model = Model();
  shared_msc = model.shared_msc;

  root = d3.select(container.getElement()[0]);
  root.html(template);

  root.select('.partition_alias')
    .property('disabled', true)
    .on('change', alias_changed)
    .on('input', alias_changed);

  root.select('.partition_notes')
    .property('disabled', true)
    .on('change', notes_changed)
    .on('input', notes_changed);

  register();


  function register() {
    container.on('resize', () => resize());
    container.on('destroy', () => on_close());
    container.on('open', () => on_open);

    container.on('close', () => console.log(name, ': close'));
    container.on('config', () => console.log(name, ': config'));
    container.on('hide', () => console.log(name, ': hide'));
    container.on('show', () => console.log(name, ': show'));

    // monitor('data.pts', (topic, data) => reset(data));
    monitor('data.shared_msc', (topic, data) => reset(data));
    monitor('partition.highlight', (topic, partition, show) => highlight_partition(partition, show));
    monitor('partition.selected', (topic, partition, show) => select_partition(partition, show));
  }

  function monitor(topic, cb) {
    listeners.set(topic, subscribe(topic, cb));
  }

  function on_close() {
    for (let [topic, listener] of listeners) {
      unsubscribe(topic, listener);
    }
    listeners = new Map();
  }

  function resize() {
    let h = parseInt(root.select('.pv_info').style('height'));

    root.select('.pv_scroll')
      .style('max-height', `${container.height - h}px`)
      .style('max-width', `${container.width}px`);

    if (shared_msc) show_partition(false);
  }

  function on_open() {
    reset(shared_msc);
  }

  function reset(_) {
    shared_msc = _;
    selected = null;
    highlight = null;
    measure = null;

    root.select('.pv_dataset').text(shared_msc && shared_msc.name || '');
    show_partition(true);
  }

  function alias_changed() {
    current.alias = this.value;
  }

  function notes_changed() {
    current.notes = this.value;
  }


  function select_partition(partition, show) {
    selected = show && partition || null;
    current = selected || highlight;
    show_partition()
  }

  function highlight_partition(partition, show) {
    if (!show) {
      timer = d3.timeout(() => {
        highlight = null;
        show_partition();
      }, 250);
    } else {
      if (timer) {
        timer.stop();
        timer = null;
      }
      highlight = partition;
      show_partition();
    }
  }


  function show_partition(init = false) {
    current = highlight || selected || (shared_msc && shared_msc.as_partition);
    if (!current) return;

    root.select('.pv_id')
      .classed('selected', current === selected)
      .classed('highlight', current === highlight)
      .text(current && current.id || "");

    root.select('.pv_name')
      .property('value', current && current.alias || "")
      .attr('disabled', current ? null : true);

    root.select('.pv_size')
      .text(current && current.size || '');

    root.select('.pv_min')
      .text(current && current.minmax && !isNaN(current.minmax[0]) ? d3.format('.2s')(current.minmax[0]) : '');

    root.select('.pv_max')
      .text(current && current.minmax && !isNaN(current.minmax[1]) ? d3.format('.2s')(current.minmax[1]) : '');

    root.select('.pv_fitness')
      .text(current && current.model && format_f(current.model.fitness));

    root.select('.pv_parent_similarity')
      .text(current && current.model && format_f(current.model.parent_similarity));

    root.select('.pv_sibling_similarity')
      .text(current && current.model && format_f(current.model.sibling_similarity));

    root.select('.pv_notes')
      .property('value', current && current.notes || "")
      .attr('disabled', current ? null : true);

    let stat = current && Array.from(current.statistics.values()) || [];

    let all = stat.sort( (a, b) => a.type === b.type ? (a.name < b.name ? -1 : 1) : a.type === 'dim' ? -1 : 1);
    show(all);

    if (init && shared_msc) {
      if (shared_msc.measures.length === 1)
        select_measure(shared_msc.measures[0]);
      else {
        let name = localStorage.getItem(`partition_view.${shared_msc.name}.measure`);
        select_measure(shared_msc.measures.find(d => d.name === name));
      }
    }
  }

  function show( data ) {
    if (!data) return;

    let ndims = data.reduce( (a, v) => v.type === 'dim' ? a+1 : a, 0);

    root.select('.pv_stat_grid.pv_measure')
      .style('grid-row', ndims+2);

    let labels = root.select('.pv_stat_grid').selectAll('.pv_label')
      .data(data);

    labels.enter()
      .append('div')
      .attr('class', 'pv_label')
      .merge(labels)
      .style('grid-row', (d, i) => d.type === 'dim' ? i+2 : i+3)
      .classed('pv_measure', d => d.type === 'measure')
      .on('click', select_measure)
      .text(d => d.name);
    labels.exit().remove();

    let boxes = root.select('.pv_stat_grid').selectAll('.pv_box')
      .data(data);

    let new_boxes = boxes.enter()
      .append('svg')
      .attr('class', 'pv_box');

    new_boxes
      .append('g');

    new_boxes
      .merge(boxes)
      .style('grid-row', (d, i) => d.type === 'dim' ? i+2 : i+3)
      .call(box_plot);

    boxes.exit().remove();
  }

  function select_measure(d) {
    if (!d || measure === d || d.type !== 'measure') return;

    measure = d;
    root.selectAll('.pv_measure')
      .classed('selected', d => d.name === measure.name);
    selected = highlight = null;

    localStorage.setItem(`partition_view.${shared_msc.name}.measure`, d.name);
    publish('data.msc', shared_msc.msc(d.name));
  }

}
