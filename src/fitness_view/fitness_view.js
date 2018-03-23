import * as d3 from 'd3';
import {publish, subscribe} from "../utils/pubsub";

import template from './fitness_view.html';
import './style.css';


export default function FitnessView() {
  let root = null;


  function resize() {
  }

  function view(selection) {
    root = selection;
    root.html(template);

    resize();
  }

  view.set_size = function(w, h) {
  };

  return view;
}