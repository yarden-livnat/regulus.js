import 'kernel-smooth';
import isArray from 'validate.io-array';
import isFunction from 'validate.io-function';

export {fun} from 'kernel-smooth';

// from kernel-smooth (not exported)

function weight( kernel, bandwidth, x_0, x_i ) {
  return kernel( (x_i - x_0) / bandwidth );
}

// calculates weight for i-th obs when p > 1
function weight_vectors( kernel, bandwidth, x_0, x_i ) {
  return kernel(d(x_i, x_0) / bandwidth);
}

function sum(vec) {
  let s = 0;
  for (let v of vec) s += v;
  return s;
}

// p-dimensional vector
function matrixize( fun ) {
  return function( X ) {
    if ( isArray( X ) === true ) {
      if ( isArray(X[0]) === false ) {
        return fun( X );
      } else {
        return X.map( function( x_row ) {
          return fun( x_row );
        } );
      }
    } else {
      throw new TypeError( 'Parameter expects array' );
    }
  };
}

export function inverseMultipleRegression( Xs, ys, kernel, bandwidth ) {
  if ( bandwidth <= 0 ) {
    throw new RangeError( 'Bandwidth has to be a positive number.' );
  }
  if ( !ys ) {
    throw new TypeError('Numeric y must be supplied. For density estimation' +
      'use .density() function' );
  }
  if ( isFunction(kernel) === false ) {
    throw new TypeError( 'Kernel function has to be supplied.' );
  }
  if ( isArray(Xs) === false || isArray(Xs[0]) === false ) {
    throw new TypeError( 'Xs has to be a two-dimensional array' );
  }

  bandwidth = bandwidth || 0.5;
  let _Xs = Xs;
  let _ys = ys;
  let _p  = Xs[0].length;
  let weight_fun = weight.bind( null, kernel, bandwidth );

  let kernel_smoother = function( y ) {

    // Write Inverse Kernel Smoother Here
    //console.log("y",y);

    let arr = [];
    for (let ii = 0; ii < y.length; ii++) {
      let weights = _ys.map(function (y_i) {
        return weight_fun(y[ii], y_i);
      });
      let denom = sum(weights);

      let curarr = [];
      for(let jj = 0;jj<_Xs[0].length;jj++){
        curarr.push(sum(weights.map(function (w, i) {
          return w * _Xs[i][jj];
        })) / denom)

      }
      arr.push(curarr);
    }

    return arr;

  };

  return matrixize( kernel_smoother );
}

export function averageStd( Xs, ys, kernel, bandwidth ) {
  if ( bandwidth <= 0 ) {
    throw new RangeError( 'Bandwidth has to be a positive number.' );
  }
  if ( !ys ) {
    throw new TypeError('Numeric y must be supplied. For density estimation' +
      'use .density() function' );
  }
  if ( isFunction(kernel) === false ) {
    throw new TypeError( 'Kernel function has to be supplied.' );
  }
  if ( isArray(Xs) === false || isArray(Xs[0]) === false ) {
    throw new TypeError( 'Xs has to be a two-dimensional array' );
  }

  bandwidth = bandwidth || 0.5;
  let _Xs = Xs;
  let _ys = ys;
  let _p  = Xs[0].length;
  let weight_fun = weight.bind( null, kernel, bandwidth );

  let kernel_smoother = function( y,x ) {

    let arr = [];
    for (let ii = 0; ii < y.length; ii++) {
      let weights = _ys.map(function (y_i) {
        return weight_fun(y[ii], y_i);
      });
      let denom = sum(weights);

      let curarr = [];
      for(let jj = 0;jj<_Xs[0].length;jj++){
        curarr.push(Math.sqrt(sum(weights.map(function (w, i) {
          return w * (Math.pow((x[ii][jj]-_Xs[i][jj]),2));
        })) / denom))

      }
      arr.push(curarr);
    }
    return arr;
  };

  return kernel_smoother;//matrixize( kernel_smoother );
}

export function linspace(a, b, n) {
  if (typeof n === "undefined") n = Math.max(Math.round(b - a) + 1, 1);
  if (n < 2) {
    return n === 1 ? [a] : [];
  }
  let i, ret = Array(n);
  n--;
  for (i = n; i >= 0; i--) {
    ret[i] = (i * b + (n - i) * a) / n;
  }
  return ret;
}