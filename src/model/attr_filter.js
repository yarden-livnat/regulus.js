

export function AttrFilter(a=null, r=null) {
  let attr = a;
  let range = r;
  let active = a && r && r[0] < r[1];

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
    active = range && range[0] < range[1];
    return this;
  };

  filter.active = function(_) {
    if (!arguments.length) return active;
    active = _;
    return this;
  };

  return filter;
}

export function XYFilter(pts, x, y, xr=null, yr=null) {
  let xf = AttrFilter(x, xr);
  let yf = AttrFilter(y, yr);
  let domain = new Set(pts);
  let active = true;

  function filter(pt) {
    return !active || (domain.has(pt) && xf(pt) && yf(pt));
  }

  filter.xr = function(_) {
    xf.range(_);
    active = xf.active() && yf.active();
    return this;
  };

  filter.yr = function(_) {
    yf.range(_);
    active = xf.active() && yf.active();
    return this;
  };

  filter.active = function(_) {
    if (!arguments.length) return active;
    active = _;
    return this;
  };

  return filter;
}