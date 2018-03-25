import * as d3 from "d3";


export default function Similarity() {

  let el;
  let tree = null;
  let value = 0.5;
  let dispatch = d3.dispatch('filtered');

  function update() {
     if (!tree) return;
      visit(tree);

      function visit(node) {
        if (node.parent) {
          let c = node.model.linear_reg.coeff;
          let p = node.parent.model.linear_reg.coeff;

          if (c.norm === undefined) c.norm = norm(c);
          if (p.norm === undefined) p.norm = norm(p);

          node.similarity = dot(c,p)/(c.norm * p.norm);
          console.log('similarity:', node.id, node.similarity);
        }
        for (let child of node.children)
          visit(child);
      }

      function norm(vec) {
        return Math.sqrt(vec.reduce( (a,v) => a + v*v, 0));
      }

      function dot(v1, v2) {
        let d = 0;
        for (let i=0; i<v1.length; i++) d += v1[i]*v2[i];
        return d;
      }
  }

  function filter(selection) {
    el = selection.append('div')
      .attr('class', 'similarity');

    el.append('label').text('Correlation');
    el.append('input')
      .attr('type', 'checkbox');
    el.append('input')
      .attr('type', 'range')
      .attr('min', 0)
      .attr('max', 1)
      .attr('step', 0.01)
      .on('input', function() {
        if (!tree) return;
        value = +this.value;
        dispatch.call('filter',this, 'filter.similarity', value);
      });
  }

  filter.data = function(_) {
    tree = _;
    update();
  };

  filter.on = function(event, cb) {
    dispatch.on(event, cb);
    return this;
  };

  return filter;
}