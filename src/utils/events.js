import * as d3 from "d3";

export function ensure_single(listner) {
  let timer = null;

  return function(d) {
    let self = this;
    if (timer) {
      timer.stop();
      timer = null;
    } else {
      let clone=  JSON.parse(JSON.stringify(d3.event));
      timer = d3.timeout( () => {
        timer = null;
        d3.customEvent(clone, listner, self, [d]);
      }, 250);
    }
  }
}

export function on_hover(listner, delay=250) {
  let timer = null;

  return function(d) {
    let self = this, clone = JSON.parse(JSON.stringify(d3.event));

    timer = d3.timeout( () => {
      timer = null;
      d3.customEvent(clone, listner, self, [d, true]);
    }, delay);

    d3.select(this).on('mouseleave.hover', function(d) {
      if (timer) { timer.stop(); timer = null;}
      else { listner.apply(this, [d, false]); }
      d3.select(this).on('mouseleave.hover', null);
    });
  }
}