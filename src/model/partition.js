import * as d3 from 'd3';
import {inverseMultipleRegression, averageStd, linspace, fun as kernel, subLinearSpace} from '../regression/regression';

let default_bandwidth = 0.1;


export default class Partition {
  constructor(data, msc) {
    this.id = data.id;
    this.lvl = data.lvl;
    this.minmax_idx = data.minmax_idx;
    this.minmax = [msc.pts[data.minmax_idx[0]][msc.name], msc.pts[data.minmax_idx[1]][msc.name]];
    this.pts_idx = data.pts_idx;

    this.parent = data.parent;
    this.children = data.children;

    this.msc = msc;

    this.alias = null;
    this.notes = null;

    this.size = this.pts_idx[1]-this.pts_idx[0];
    this._pts = null;
    this._reg_curve = null;
  }

  get pts() {
    if (!this._pts) {
      let pts = [];
      let msc_pts = this.msc.pts;
      let msc_idx = this.msc.pts_idx;
      let to = this.pts_idx[1];
      for (let i = this.pts_idx[0]; i < to; i++) {
        pts.push(msc_pts[msc_idx[i]]);
      }

      // consider adding the min and max pts
      this._pts = pts;
    }
    return this._pts;
  }

  get regression_curve() {
    if (!this._reg_curve) {
      let current_measure = this.msc.measure_by_name(this.msc.name);

      // todo: consider adding the min/max points
      //       maybe only if they are not too dissimilar from the rest of the points
      let dims = this.pts.map( pt => this.msc.dims.map( d => pt[d.name] ));
      let measure = this.pts.map( pt => pt[current_measure.name]);

      let extent = current_measure.extent;
      let bandwidth = default_bandwidth * (extent[1] - extent[0]);

      let py = subLinearSpace(this.minmax, extent, 100);
      let hat = inverseMultipleRegression(dims, measure, kernel.gaussian, bandwidth);
      let px = hat(py);

      let hat2 = averageStd(dims, measure, kernel.gaussian, bandwidth);
      let std = hat2(py, px);

      let curve = [];
      for (let i=0; i<py.length; i++) {
        curve.push(px[i].concat([py[i]]));
      }
      curve.columns = dims.map(d => d.name).concat(current_measure.name);

      this._reg_curve = {curve, std};
    }
    return this._reg_curve;
  }
}