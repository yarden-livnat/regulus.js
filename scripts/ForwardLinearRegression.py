from scipy import linalg
import numpy as np


class ForwardLinearRegression:
    """ A wrapper class to scipy's least squares solution that can be
        used to fit a linear model
    """
    def __init__(self, X, y, w=None):
        """ Constructor that fits a linear model to optionally weighted
            input data
            @ In, X, a matrix of input samples
            @ In, y, a vector of output responses corresponding to the
                input samples
            @ In, w, an optional  vector of weights corresponding to the
                input samples
        """
        self.training_data = np.hstack(X, y)
        self.weights = w

        Xw = np.ones((X.shape[0], X.shape[1]+1))
        Xw[:, 1:] = X
        Xw = Xw * np.sqrt(w)[:, None]
        yw = y * np.sqrt(w)
        results = linalg.lstsq(Xw, yw)[0]
        self.intercept = results[0]
        self.coefficients = results[1:]
        self.r_squared = None

    def apply(self, X):
        """ Applies the linear model to a set of incoming data
            @ In, X, a matrix of data to predict
            @ Out, a vector of predicted values
        """
        return X.dot(self.coefficients) + self.intercept

    def compute_R_squared(self):
        """ Returns the coefficient of determination for the data fit
            to this object and caches it locally to this object
        """
        if self.r_squared is not None:
            return self.r_squared

        yHat = self.apply(self.training_data[:, :-1])
        self.r_squared = sum(np.sqrt((yHat-self.training_data[:, -1])**2))

        return self.r_squared

    def __str__(self):
        return ','.join(map(str, self.coefficients))
