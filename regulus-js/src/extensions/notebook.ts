import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
   ICommandPalette, IMainMenu, InstanceTracker
} from '@jupyterlab/apputils';

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import {
  INotebookTracker, NotebookPanel, INotebookModel
} from '@jupyterlab/notebook';

import {
  Token, JSONExt, ReadonlyJSONObject
} from '@phosphor/coreutils';

import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable';

import {CommandIDs} from './commands';

import { Monitor } from './monitor';


/*
 * Monitor extensions
 */

export
interface IRegulusMonitorExtension extends DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {
}
//
// export
// const notebookMonitorPlugin: JupyterLabPlugin<IRegulusMonitorExtension> = {
//   id: 'jupyter.extensions.regulus.notebook.monitor',
//   activate: activateMonitorExtension,
//   autoStart: true
// };
//
//
// function activateMonitorExtension(app:JupyterLab): IRegulusMonitorExtension {
//   console.log('activate monitor extension');
//   let extension = new RegulusMonitorExtension(app);
//   app.docRegistry.addWidgetExtension('Notebook', extension);
//   return extension;
// }

class RegulusMonitorExtension implements IRegulusMonitorExtension {
  constructor(app: JupyterLab) {
    this._app = app;
  }

  createNew(nb: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    let monitor = new Monitor(this._app, context);
    return new DisposableDelegate( () => monitor.dispose() );
  }

  private _app: JupyterLab;
}


/*
 * Notebook command extension
 */

export
const notebookExtension : JupyterLabPlugin<void> = {
  id: 'jupyter.services.extension.regulus.notebook.command',
  autoStart: true,
  requires: [ICommandPalette, INotebookTracker],
  activate: activateNotebookExtension
};

function activateNotebookExtension(app:JupyterLab, palette: ICommandPalette, notebookTracker: INotebookTracker) {
  console.log('activateNotebookExtension');

  let extension = new RegulusMonitorExtension(app);
  app.docRegistry.addWidgetExtension('Notebook', extension);

  let {commands} = app;
  let command = 'notebook:attach_regulus';

  commands.addCommand(command, {
    label: 'Attach Regulus',
    execute: args => {
      const nb = getCurrent(args);
      const current = notebookTracker.currentWidget;

      if (!current || !nb) return;

      const options: ReadonlyJSONObject = {
        path: nb.context.path,
        preferredLanguage: nb.context.model.defaultKernelLanguage,
        activate: args['activate']
      }
      return commands.execute(CommandIDs.attach, options);
    },
    isEnabled: hasWidget
  });

  palette.addItem({
    category: 'Cycle',
    command: command
  });

  function getCurrent(args: ReadonlyJSONObject): NotebookPanel | null {
    const nb = notebookTracker.currentWidget
    const activate = args['activate'] !== false;

    if (activate && nb) {
      app.shell.activateById(nb.id);
    }
    return nb;
  }

  function hasWidget(): boolean {
    return notebookTracker.currentWidget !== null;
  }
}
