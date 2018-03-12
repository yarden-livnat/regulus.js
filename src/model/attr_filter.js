

export default function AttrFilter() {
  let attr = null;
  let range = null;
  let active = false;

  function filter(pt) {
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