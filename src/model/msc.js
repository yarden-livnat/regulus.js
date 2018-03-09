import * as d3 from 'd3-array';

function build_tree(partitions){
  let map = new Map();
  let root = null;

  if (partitions.length === 0) return root;
  root = partitions[0];

  for (let partition of partitions) {
    if (partition.lvl > root.lvl) root = partition;
    map.set(partition.id, partition);
  }

  visit(root, map);
  return root;

  function visit(node) {
    node.children = node.children.map(child => map.get(child));
    for (let child of node.children) {
      child.parent = node;
      visit(child);
    }
  }
}

export class MSC {
  constructor() {
    this.name = "";
    this.pts = [];
    this.tree = [];
    this.partitions = [];

    this.ndims = 0;
    this.attr = [];
    this.dims = [];
    this.measure = "";
    this.minmax = [];
  }

  samples(pts, ndims) {
    this.pts = pts;
    let n = pts.columns.length;
    this.attrs = pts.columns;
    this.dims = pts.columns.slice(0, ndims);
    this.measure = pts.columns.slice(ndims);

    this.minmax = this.attrs.map(name => ({
      name: name,
      minmax: d3.extent(pts, entry => entry[name])
    }));

    return this;
  }

  partition_pts(partition) {
    if (!partition.pts) {
      let ppts = [];
      for (let i = partition.pts_idx[0]; i < partition.pts_idx[1]; i++) {
        ppts.push(this.pts[this.pts_idx[i]]);
      }
      // consider adding the min/max points
      partition.pts = ppts;
    }
    return partition.pts;
  }

  set msc(_) {
    this.name = _.name;
    this.partitions = _.partitions;
    this.pts_idx = _.pts;
    this.tree = build_tree(this.partitions);

    return this;
  }

}