
import numpy as np
import os


def generateres(X):
    x1 = X[:,0]
    x2 = X[:,1]
    x3 = X[:,2]
    x4 = X[:,3]
    Y = evaluate1(evaluate2(evaluate(x1,x2)*evaluate1(x3,x4)+evaluate3(x2,x3),x1),evaluate4(x2+x3,x4))

    return get_out(X,Y/(np.min(Y)+1))

def get_out(X,Y):
    return np.column_stack((X, Y))

def evaluate(x,y):
    return (np.cos(0.7*(x+y))-(y-x))**2 + 0.1*(x+y)**2

def evaluate1(x,y):
    return (1.5 - x + x*y)**2 + (2.25 - x + x*y*y)**2 + (2.625 - x + x*y*y*y)**2

def evaluate2(x,y):
    return np.sin(x+y) + (x-y)**2 - 1.5*x + 2.5*y + 1.

def evaluate3(x,y):
    first = 1. + (x + y + 1.)**2 * (19. - 14.*x + 3.*x*x - 14.*y + 6.*x*y + 3.*y*y)
    second = 30. + (2.*x - 3.*y)**2 * (18. - 32.*x + 12.*x*x + 48.*y - 36.*x*y + 27.*y*y)
    return first*second

def evaluate4(x,y):
    beale = (1.5 - x + x*y)**2 + (2.25 - x + x*y*y)**2 + (2.625 - x + x*y*y*y)**2
    return -1.0*beale

def savefile(out,sim_dir, sim_out):

    if not os.path.exists(sim_dir):
        os.makedirs(sim_dir)
    np.savetxt(sim_dir +'/'+ sim_out, out, header='X1,X2,X3,X4,Y', delimiter=",", comments='')

def load_input(input):
    my_data = np.asarray(input)

    return my_data
