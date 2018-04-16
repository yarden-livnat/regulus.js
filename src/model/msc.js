import Partition from "./partition";

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
  constructor(_, shared, name) {

    this.name = name;//shared.name;
    this.version = shared.version;
    this.shared = shared;
    this.parms = _.params;
    this.pts_idx = _.pts_idx;
    this.pts = shared.pts;

    this.attrs = shared.attrs;
    this.dims = shared.dims;
    this.measures = shared.measures;

    this.partitions = _.partitions.map(p => new Partition(p, this));
    this.tree = build_tree(this.partitions);
    //Change
    this.measure = shared.measures.find( m => m.name === this.name);

    this.minmax = this.partitions[0].minmax;
  }

  get root() { return this.tree; }

  measure_by_name(name) { return this.measures.find(m => m.name === name); }
}