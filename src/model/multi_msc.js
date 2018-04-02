import * as d3 from 'd3-array';

import {MSC} from './msc';
import Partition from "./partition";


export class MultiMSC {
  constructor(_) {
    this.name = _.name;
    this.version = _.version;
    this.notes = _.notes;
    this.measure = null;

    let attr = _.dims.concat(_.measures);
    this.pts = _.pts.map((pt, id) => { let p = {id}; pt.forEach((v, i) => p[attr[i]] = v); return p;});

    this.ndims = _.dims.length;

    this.dims = _.dims.map(name => ({
      name,
      type: 'dim',
      extent: d3.extent(this.pts, pt => pt[name])
    }), this).sort( (a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

    this.measures = _.measures.map(name => ({
      name,
      type: 'measure',
      extent: d3.extent(this.pts, pt => pt[name])
    }), this).sort( (a,b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);

    this.attrs = this.dims.concat(this.measures);

    // this.tree = [];
    this.mscs = new Map();
    for (let d of _.mscs) {
      this.mscs.set(d.name, new MSC(d, this));
    }

    this.as_partition = new Partition( {
      id: 'ALL',
      lvl: 1,
      pts: this.pts,
      minmax_idx: [0, 1],
      span: [0, this.pts.length-1],
      parent: null,
      children: []
    }, this);
  }

  msc(name) { return this.mscs.get(name); }

  measure_by_name(name) {
    return this.measures.find(m => m.name === name);
  }
}