# Regulus
Topology based visual analytics of high-dimensional data using Morse-Smale complexes


## Installation
- Install yarn
- `yarn install`
- `yarn build` or use `yarn watch` during development

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

## Running
- Run the server `python server.p -d <path-to-data-directory>`
- Point your browser to localhost:8081

