

export function AttrFilter(a=null, r=null) {
  let attr = a;
  let range = r;
  let active = a && r;

  function filter(pt) {
    if (!active) return true;
    let v = pt[attr];
    return range[0] <= v && v <= range[1];
  }

  filter.attr = function(_) {
    if (!arguments.length) return attr;
    attr = _;
    return this;
  };

  filter.range = function(_) {
    if (!arguments.length) return range;
    range = _;
    active = range && range.length === 2;
    return this;
  };

  filter.active = function(_) {
    if (!arguments.length) return active;
    active = _;
    return this;
  };

  return filter;
}