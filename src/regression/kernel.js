'use strict';

// MODULES //

let phi = require( 'distributions-normal-pdf' );
let d = require( 'euclidean-distance' );
let stdev = require( 'compute-stdev' );
let isArray = require( 'validate.io-array' );
let isFunction = require( 'validate.io-function' );


// Namespace object
let ns = {};

// Collection of Kernel functions
ns.fun = {
  gaussian: function( x ) {
    return phi(x);
  },
  boxcar: function( x ) {
    return ( Math.abs( x ) <= 1 ) ? 0.5 : 0;
  },
  epanechnikov: function( x ) {
    return ( Math.abs( x ) <= 1 ) ? 0.75 * ( 1 - x*x ) : 0;
  },
  tricube: function( x ) {
    function tricubed( x ) {
      var x_abs = 1 - Math.pow( Math.abs( x ), 3 );
      return Math.pow( x_abs, 3 );
    }
    return ( Math.abs(x) <= 1 ) ? ( 70/81 ) * tricubed( x ) : 0 ;
  }
};

// calculates weight for i-th obs
function weight( kernel, bandwidth, x_0, x_i ) {
  var arg = (x_i - x_0) / bandwidth;
  return kernel( arg );
}

// calculates weight for i-th obs when p > 1
function weight_vectors( kernel, bandwidth, x_0, x_i ) {
  var arg = d( x_i, x_0 ) / bandwidth;
  return kernel( arg );
}

// sum elements of an array
function sum( arr ) {
  var ret = 0;
  for( var i = 0; i < arr.length; i++ ){
    ret += arr[ i ];
  }
  return ret;
}

// allow a function to be called with a vector instead of a single number
function vectorize( fun ) {
  return function( x ) {
    if( isArray( x ) === false ) {
      return fun( x );
    } else {
      return x.map( function( x ) {
        return fun( x );
      } );
    }
  };
}

// allow a function to be called with a 2d array instead of a single
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


// calculate optimal bandwidth according to Silverman's rule of thumb for
// kernel density estimation under Gaussian data
ns.silverman = function( x ) {
  var num = 4 * Math.pow( stdev( x ), 5 );
  var denom = 3 * x.length;
  var divisionResult = num / denom;
  return Math.pow( divisionResult, 0.2 );
};

// kernel density estimation
ns.density = function( xs, kernel, bandwidth ) {
  if ( bandwidth <= 0 ) {
    throw new RangeError( 'Bandwidth has to be a positive number.' );
  }
  if ( isFunction( kernel ) === false ) {
    throw new TypeError( 'Kernel function has to be supplied.' );
  }
  bandwidth = bandwidth || 0.5;
  var _xs = xs;
  var n = xs.length;
  var weight_fun = weight.bind( null, kernel, bandwidth );

  var kernel_smoother = function( x ) {
    var weights = _xs.map( function( x_i ) {
      return weight_fun( x, x_i );
    } );
    var num = sum( weights );
    var denom = n * bandwidth;
    return num / denom;
  };

  return vectorize( kernel_smoother );
};

// kernel regression smoothing, returns function which can be evaluated at
// different values of x
ns.regression = function( xs, ys, kernel, bandwidth ){
  bandwidth = bandwidth || 0.5;
  if ( bandwidth < 0 ) {
    throw new RangeError( 'Bandwidth has to be a positive number.' );
  }
  if ( !ys ) {
    throw new TypeError( 'Numeric y must be supplied. For density estimation' +
      'use .density() function' );
  }
  if( isFunction(kernel) === false ) {
    throw new TypeError( 'Kernel function has to be supplied.' );
  }

  var _xs = xs;
  var _ys = ys;
  var weight_fun = weight.bind( null, kernel, bandwidth );

  var kernel_smoother = function( x ) {
    var weights = _xs.map( function( x_i ) {
      return weight_fun( x, x_i );
    });
    var num = sum( weights.map( function( w, i ) {
      return w * _ys[i];
    } ) );
    var denom = sum( weights );
    return num / denom;
  };
  return vectorize( kernel_smoother );
};

// similar to .regression(), but for the case of multiple predictors.
ns.multipleRegression = function( Xs, ys, kernel, bandwidth ) {
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
  var _Xs = Xs;
  var _ys = ys;
  var _p  = Xs[0].length;
  var weight_fun = weight_vectors.bind( null, kernel, bandwidth );

  var kernel_smoother = function( x,y ) {
    if( isArray(x) === false || x.length !== _p ) {
      throw new TypeError( 'Argument has to be array of length ' + _p );
    }

    var weights = _Xs.map( function( x_i ) {
      return weight_fun( x, x_i );
    } );
    var num = sum( weights.map( function( w, i ) {
      return w * _ys[i];
    } ) );
    var denom = sum( weights );

    return num / denom;


  };

  return matrixize( kernel_smoother );
};

ns.ImultipleRegression = function( Xs, ys, kernel, bandwidth ) {
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
  var _Xs = Xs;
  var _ys = ys;
  var _p  = Xs[0].length;
  var weight_fun = weight.bind( null, kernel, bandwidth );

  var kernel_smoother = function( y ) {

    // Write Inverse Kernel Smoother Here
    //console.log("y",y);




    let arr = [];
    for (let ii = 0; ii < y.length; ii++) {
      let weights = _ys.map(function (y_i) {
        //console.log(y_i);
        //console.log(y[ii]);
        return weight_fun(y[ii], y_i);
      });
      //console.log("Weight",weights);
      var denom = sum(weights);

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
};

ns.averageStd = function( Xs, ys, kernel, bandwidth ) {
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
  var _Xs = Xs;
  var _ys = ys;
  var _p  = Xs[0].length;
  var weight_fun = weight.bind( null, kernel, bandwidth );

  var kernel_smoother = function( y,x ) {

    //let y = yx[0];
    //let x = yx[1];
    //console.log("YX = ",yx)
    //console.log("Y = ",y,"X = ", x);
    let arr = [];
    for (let ii = 0; ii < y.length; ii++) {
      let weights = _ys.map(function (y_i) {

        return weight_fun(y[ii], y_i);
      });
      //console.log("Weight",weights);
      var denom = sum(weights);

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
};
// EXPORTS //

module.exports = ns;

/*
let ks = require('kernel-smooth');
//require('kernel-smooth');
var phi = require( 'distributions-normal-pdf' );
var d = require( 'euclidean-distance' );
var stdev = require( 'compute-stdev' );
var isArray = require( 'validate.io-array' );
var isFunction = require( 'validate.io-function' );
console.log(ks);
function weight( kernel, bandwidth, x_0, x_i ) {
    var arg = (x_i - x_0) / bandwidth;
    return kernel( arg );
}

// calculates weight for i-th obs when p > 1
function weight_vectors( kernel, bandwidth, x_0, x_i ) {
    var arg = d( x_i, x_0 ) / bandwidth;
    return kernel( arg );
}

// sum elements of an array
function sum( arr ) {
    var ret = 0;
    for( var i = 0; i < arr.length; i++ ){
        ret += arr[ i ];
    }
    return ret;
}

// allow a function to be called with a vector instead of a single number
function vectorize( fun ) {
    return function( x ) {
        if( isArray( x ) === false ) {
            return fun( x );
        } else {
            return x.map( function( x ) {
                return fun( x );
            } );
        }
    };
}

// allow a function to be called with a 2d array instead of a single
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

ks.ImultipleRegression = function( Xs, ys, kernel, bandwidth ) {
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
    var _Xs = Xs;
    var _ys = ys;
    var _p  = Xs[0].length;
    var weight_fun = weight.bind( null, kernel, bandwidth );

    var kernel_smoother = function( y ) {

        // Write Inverse Kernel Smoother Here
        //console.log("y",y);




        let arr = [];
        for (let ii = 0; ii < y.length; ii++) {
            let weights = _ys.map(function (y_i) {
                //console.log(y_i);
                //console.log(y[ii]);
                return weight_fun(y[ii], y_i);
            });
            //console.log("Weight",weights);
            var denom = sum(weights);

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
};

module.exports = ks;
*/