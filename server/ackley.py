import random
import math
import numpy as np
import scipy
import copy

def ackley(_x):
    x = copy.deepcopy(_x)
    a = 20
    b = 0.2
    c = math.pi*2
    if isinstance(x,np.ndarray) and x.ndim > 1:
        d = x.shape[1]
    else:
        d = len(x)
    for i in range(d):
        x[i] = x[i]*3 - 1.5

    summand1 = 0
    summand2 = 0
    for i in range(d):
        summand1 += x[i]**2
        summand2 += np.cos(c*x[i])
    eps = 0
    for i in range(d):
        eps += 1e-3*x[i]
    return -a*np.exp(-b*np.sqrt(summand1/float(d))) - np.exp(summand2/float(d)) #+eps