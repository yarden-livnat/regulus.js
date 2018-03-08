import * as d3 from 'd3';
import {Plot, Group} from '../components';
import './style.css';

let root;


function generate() {
  let data = [];
  for (let i=0; i<10; i++)  {
    data.push({x:i*10, y:Math.random()*30});
  }
  return data;
}

export function setup() {
  root = d3.select('#details');

  let plot_width = 100, plot_height = 50;

  // let sx = d3.scaleLinear().range([0, plot_width]);
  // let sy = d3.scaleLinear().range([plot_height, 0]).domain([0, 100]);

  let x = d => d.x;
  let y = d => d.y;

  let sx = d3.local();
  let sy = d3.local();

  let group = Group().sx(sx).sy(sy);

  let partitions = [];
  let extents = {};

    // {title: 'Group 1', data: [ generate(), generate(), generate()]},
    // {title: 'Group 2', data: [ generate(), generate(), generate()]}
    // ];


  add({id: 'Partition 1', data: [ generate(), generate(), generate()]});
  render(partitions);

  function add(partition) {

    let entry = {
      partition: partition,
      x_extent: partition.data.map(pts => d3.extent(pts, x))
        .reduce( (res, value) => [Math.min(res[0], value[0]), Math.max(res[1], value[1])], [Number.MAX_VALUE, Number.MIN_VALUE]),
      y_extent: partition.data.map(pts => d3.extent(pts, y))
    };

    partitions.push(entry);
    extents = compute_extents();
  }

  function compute_extents() {
    let xe = [d3.min( partitions, p => p.x_extent[0]), d3.max( partitions, p => p.x_extent[1])];

    let ye = null;
    for(let p of partitions) {
      if (ye == null) ye = p.y_extent.concat();
      else {
        for (let i=0; i<ye.length; i++) {
          let e = p.y_extent[i];
          ye = [Math.min(ye[0], e[0]), Math.max(ye[1], e[1])]
        }
      }
    }
    return {x:xe, y:ye};
  }


  function render(data) {
    let groups = root.selectAll('.group')
      .data(data, d => d.id);
    groups.enter()
      .call(group.create)
      .merge(groups)
      .each( function(d, i) {
        sx.set(this, d3.scaleLinear().range([0, plot_width]).domain(extents.x));
      })
      .call(group);
    groups.exit().call(group.remove);
  }


}