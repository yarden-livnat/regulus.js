# Regulus
Visual analytics of high-dimensional data using a topology based approach.
Regulus support both Morse and Morse-Smale complexes.


## Installation
### Server
Regulus uses [Bottle](http://bottlepy.org) python server, which can installed via
`pip install bottle` or `conda install bottle -c conda-forge`.

### Client
Install the [yarn](https://yarnpkg.com) package manager. e.g. `conda install yarn -c conda-forge`.
 
- Run `yarn install` in the regulus root directory. It will locally install all the required Javascript packages.
- Run `yarn build` to build the Javascript code.
- During development, use `yarn watch` to continuously rebuild Regulus you save files.


## Data

Regulus works with high-dimensional data where the first d-dimensions are independent variables
(dimensions) and the rest of dependent variables (measures).

- **todo: \[expand]**: convert csv file to a regulus json file
- **todo: \[expand]**: compute Morse- or Morse-Smale complexes
- **todo: \[expand]**: compute various statistic such as linear regression and inverser regression

### Data sampling

Regulus can sample the domain to create additional data points during the analysis process. There are
two main approaches,

#### 1. Interpolation of existing data points
TBD

#### 2. Running a user simulation program
Currently, Regulus only support running a local [cyclus](http://fuelcycle.org) for a specific scenario.

## Running
#### Server:

`cd server; python server.py -d <path-to-data-directory>`

You can also set an environment variable `REGULUS_DATA_DIR` to point at the data directory.

#### Client
Point your browser to `localhost:8081`

Regulus automatically save and reload the layout configuration.
- `localhost:8081/?noload` prevents loading of previous layout
- `localhost:8081/?nosave` prevents saving the layout during this run
- `localhost:8081/?noload&nosave` prevents both

