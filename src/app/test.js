import * as d3 from 'd3';

function view(a, from, to) {

  let iterable = {};

  iterable[Symbol.iterator] = function*() {
    for (let i=from; i<to; i++)
      yield a[i];
  };

  iterable.length = to -from;

  return iterable;

}



let data = [1,2,3,4,5,6,7];

let v = view(data, 2, 5);

for (let i of view(data, 1,3)) {
  console.log(i);
}

for (let i of v) {
  console.log(i);
}

for (let i of v ) {
  console.log(i);
}


d3.select('#test')
  .selectAll('.li')
  .data(v)
  .enter()
  .append('li')
  .text( d => d);

// function* fibonacci() {
//   let fn1 = 0;
//   let fn2 = 1;
//   while (true) {
//     let current = fn1;
//     fn1 = fn2;
//     fn2 = current + fn1;
//     let reset = yield current;
//     if (reset) {
//       fn1 = 0;
//       fn2 = 1;
//     }
//   }
// }
//
// let sequence = fibonacci();
// console.log(sequence.next().value);     // 0
// console.log(sequence.next().value);     // 1
// console.log(sequence.next().value);     // 1
// console.log(sequence.next().value);     // 2
// console.log(sequence.next().value);     // 3
// console.log(sequence.next().value);     // 5
// console.log(sequence.next().value);     // 8
// console.log(sequence.next(true).value); // 0
// console.log(sequence.next().value);     // 1
// console.log(sequence.next().value);     // 1
// console.log(sequence.next().value);