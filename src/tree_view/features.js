import * as d3 from 'd3';

import {AttrRangeFilter, RangeAttrRangeFilter} from "../model/attr_filter";
import {and} from '../model/filter';
import Slider from '../components/slider'

import template from './feature.html';
import './feature.css';
import * as chromatic from "d3-scale-chromatic";

let version='1';
let format= d3.format('.3f');

export default function Features() {
  let filter = and();
  let slider = Slider();
  let features = [];

  let dispatch = d3.dispatch('show', 'update', 'color_by');

  add_fitness_feature();
  add_parent_feature();
  add_sibling_feature();
  add_minmax_feature();
  add_no_cmap();

  if (localStorage.getItem('tree_view.version') === version) {
    features.forEach(f => {
      if (f.interface) {
        let selection = localStorage.getItem(`feature.${f.name}.selection`);
        f.selection = selection !== "undefined" && JSON.parse(selection) || f.domain;
        f.active = localStorage.getItem(`feature.${f.name}.active`) === 'on';
        f.filter2.active(f.active);
        f.filter2.range(f.selection);
      }
    });
  } else {
    localStorage.setItem('tree_view.version', version);
  }



  features.forEach(f => f.interface && filter.add(f.filter2));

  function add_fitness_feature() {
    let name = 'fitness';
    let domain = [0.8, 1];
    let cmap = ["#3e926e", "#f2f2f2", "#9271e2"];
    let colorScale = d3.scaleSequential(d3.interpolateRgbBasis(cmap)).domain(domain);

    features.push({
      id: 0, name: name, label: 'fitness',
      domain: domain,
      cmp: (a, b) => a > b,
      filter2: AttrRangeFilter(name, domain),
      active: false,
      cmap: cmap,
      colorScale: colorScale,
      color: p => colorScale(p.model[name]),
      ticks:{n: 4, format:'.2f'},
      interface: true
    });
  }

  function add_parent_feature() {
    let name = 'parent_similarity';
    let domain = [-1, 1];
    let cmap = ["#4472a5", "#f2f2f2", "#d73c4a"];
    let colorScale = d3.scaleSequential(d3.interpolateRgbBasis(cmap)).domain(domain);

    features.push({
      id: 1, name: name, label: 'parent similarity',
      domain: domain,
      cmp: (a, b) => a < b,
      filter2: AttrRangeFilter(name, domain),
      active: false,
      cmap: cmap,
      colorScale: colorScale,
      color: p => colorScale(p.model[name]),
      ticks:{n: 4, format:'.2f'},
      interface: true
    });
  }

  function add_sibling_feature() {
    let name = 'sibling_similarity';
    let domain = [-1, 1];
    let cmap = ["#4472a5", "#f2f2f2", "#d73c4a"];
    let colorScale = d3.scaleSequential(d3.interpolateRgbBasis(cmap)).domain(domain);

    features.push({
      id: 2, name: name, label: 'sibling similarity',
      domain: domain,
      cmp: (a, b) => a < b,
      filter2: AttrRangeFilter(name, domain),
      active: false,
      cmap: cmap,
      colorScale: colorScale,
      color: p => colorScale(p.model[name]),
      ticks:{n: 4, format:'.2f'},
      interface: true
    });
  }

  function add_minmax_feature() {
    let name = 'minmax';
    let domain = [0, 1];
    let cmap = chromatic['interpolateRdYlBu'];
    // let colorScale = d3.scaleSequential(cmap).domain(domain);
    let colorScale = d3.scaleLinear().domain(domain).range(['#bce2fe', /*'#fffebe',*/ '#fd666e']);

    features.push({
      id: 3, name: name, label: 'min max',
      domain: domain,
      cmp: (a, b) => a < b,
      filter2: RangeAttrRangeFilter(name, domain),
      active: false,
      cmap: cmap,
      colorScale: colorScale,
      color: p => colorScale(p),
      ticks:{n: 4, format:'.2f'},
      interface: true
    });
  }

  function add_no_cmap() {
    let name = 'no_cmap';

    features.push({
      id: 4, name: name, label: 'No Colors',
      color: p => 'white',
      interface: false
    });
  }

  function api(selection) {
    let d3features = d3.select('.filtering_view')
      .selectAll('.feature')
      .data(features.filter(f => f.interface))
      .enter()
        .append('div')
        .html(template);

    d3features.select('.feature-name').text(d => d.label);

    d3features.select('.feature-active')
      .property('checked', d => d.active)
      .on('change', activate_filter);

    d3features.select('.feature-slider2')
      .call(slider);

    slider.on('change', update_feature);

    // d3features.select('.feature-cmap')
    //   .style('background-image', d => `linear-gradient(to right, ${d.cmap.join()}`);


    let idx = +localStorage.getItem('feature.color_by') || 0;
    d3.select('.filtering_view .feature-color')
      .on('change', update_color_by)
      .selectAll('option')
      .data(features)
      .enter()
      .append('option')
      .attr('value', d => d.id)
      .property('selected', d => +d.id === idx)
      .text(d => d.label);

    let show = localStorage.getItem('feature.show_opt');
    d3.select('.filtering_view').selectAll('input[name="show-nodes')
      .property('checked', function() { return this.value === show;})
      .on('change', function() {
        dispatch.call('show', this, this.value);
        // tree.show(this.value);
        localStorage.setItem('feature.show_opt', this.value);
      });


    dispatch.call('color_by', this, features[idx]);
  }

  function update_feature(feature, range) {
    let section = d3.select(this.parentNode.parentNode.parentNode.parentNode);

    feature.filter2.range(range);
    section.select('.feature-value').text(`[${format(range[0])}, ${format(range[1])}]`);

    // tree.update();
    localStorage.setItem(`feature.${feature.name}.selection`, JSON.stringify(feature.selection));
    dispatch.call('update');
  }


  function activate_filter(feature) {
    feature.active = d3.select(this).property('checked');
    feature.filter2.active(feature.active);
    // tree.update();
    localStorage.setItem(`feature.${feature.name}.active`, feature.active ? 'on' : 'off');
    dispatch.call('update');
  }

  function update_color_by() {
    let feature = features[+this.value];
    // tree.color_by(feature);
    localStorage.setItem('feature.color_by', feature.id);
    dispatch.call('color_by', this, feature)
  }

  api.update = function(range) {
    let mmf = features.find(f => f.name === 'minmax');
    mmf.domain =  [range[0], range[1]];
    mmf.selection = mmf.domain.concat();
    mmf.colorScale.domain(mmf.domain);
    mmf.filter2.range(mmf.domain);

    d3.selectAll('.feature-slider2')
      .call(slider);
  };

  api.filter = function() {
    return filter;
  };

  api.feature = function(idx) {
    return features[idx];
  };

  api.on = function(event, cb) {
    dispatch.on(event, cb);
  };

  return api;
}