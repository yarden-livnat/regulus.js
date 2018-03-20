# Regulus
Topology based visual analytics of high-dimensional data using Morse-Smale complexes


## Installation
### server 
Regulus uses [Bottle](http://bottlepy.org) python server. It can installed using 
`pip install bottle` or `conda install bottle -c conda-forge`.

### client
Regulus uses the [yarn](https://yarnpkg.com) package manager. e.g. `conda install yarn -c conda-forge`.
 
- run `yarn install` in the regulus root directory, which will locally install all the required Javascript packages.  
- run `yarn build` to build the Javascript code. 
- Use `yarn watch` during development which will run the build process 
whenever any file in the src directory is saved.

<!---
## Post processing data
The data (.csv) file is a collection of n-d points.

Use scripts/post.py to parse data file.
`python scripts/post.py -d dims --all --name <name your data> <path-to-data file`
- '-d dims': indicates the first <dims> columns are dimensions (input variables) and the rest of
the columns are measures (output variables). The default is all but the last one.
- '--all': process all measures
- '-c col': process only the measure on column <col>
- '-m name': process only the measure named <name>
Use `python post.py --help` to see all options
-->

## Running
- Run the server in the `server/` directory `python server.py -d <path-to-data-directory>`. 
You can also set an environment variable `REGULUS_DATA_DIR` to point at the data directory.
- Point your browser to localhost:8081

