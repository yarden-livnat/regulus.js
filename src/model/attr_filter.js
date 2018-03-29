

export function AttrRangeFilter(a=null, r=null, auto_=false) {
  let attr = a;
  let range = r;
  let active = a && r && r[0] < r[1];
  let auto = auto_;

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
    range = _ && _.concat();
    active = auto ? range && range[0] < range[1] : active;
    return this;
  };

  filter.active = function(_) {
    if (!arguments.length) return active;
    active = _;
    return this;
  };

  filter.valid = function() {
    return range && range[0] < range[1];
  };

  return filter;
}

export function RangeAttrRangeFilter(a=null, r=null) {
  let attr = a;
  let range = r;
  let active = a && r && r[0] <= r[1];

  function filter(pt) {
    if (!active) return true;
    let v = pt[attr];
    return range[0] <= v[1] && v[0] <= range[1];
  }

  filter.attr = function(_) {
    if (!arguments.length) return attr;
    attr = _;
    return this;
  };

  filter.range = function(_) {
    if (!arguments.length) return range;
    range = _.concat();
    // active = range && range[0] < range[1];
    return this;
  };

  filter.active = function(_) {
    if (!arguments.length) return active;
    active = _;
    return this;
  };

  return filter;
}
export function AttrValueFilter(a=null, v=null, c= (a,b) => a< b) {
  let attr = a;
  let value = v;
  let cmp = c;
  let active = a && v !== null;

  function filter(pt) {
    if (!active) return true;
    let v = pt[attr];
    return  cmp(v, value);
  }

  filter.attr = function(_) {
    if (!arguments.length) return attr;
    attr = _;
    return this;
  };

  filter.value = function(_) {
    if (!arguments.length) return value;
    value = _;
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
  let xf = AttrRangeFilter(x, xr, true);
  let yf = AttrRangeFilter(y, yr, true);
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