import {mean} from 'd3';

export function intersect(a, b) {
  let f = Math.max(a.from, b.from);
  let t = Math.min(a.from + a.length, b.from + b.length);

  return [f, t];
}

export function pearson(a, b) {
  init(a);
  init(b);

  let r = 0, n = a.length;
  for (let i=0; i<n; i++) {
    r += a[i] * b[i];
  }
  r = r/((n-1) * a.ss * b.ss);
  return r;

  function init(vec) {
    if (vec.mean) return;
    vec.mean = mean(vec);
    let ss = 0;
    let n = vec.len;
    for (let i=0; i<n; i++) {
      let d = vec[i] - a.mean;
      vec[i] = d;
      ss += d * d;
    }
    a.ss = Math.sqrt(ss - (n-1));
  }
}