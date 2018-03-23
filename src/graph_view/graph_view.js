import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";


import template from './graph_view.html';
import './style.css';


export function GraphView() {
  let root = null;
  let msc = null;

  function resize() {

  }
  function view(selection) {
    root = selection;
    root.html(template);

    resize();
  }
}