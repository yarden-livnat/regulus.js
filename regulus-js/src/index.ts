import {
  JupyterLabPlugin
} from '@jupyterlab/application';

export * from './panel';
export * from './widget';

import {regulusExtension} from './extensions/plugin';
import {notebookExtension} from './extensions/notebook';

const plugins: JupyterLabPlugin<any>[] = [regulusExtension, notebookExtension];

export default plugins;
