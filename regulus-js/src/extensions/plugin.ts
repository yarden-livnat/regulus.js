import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
   ICommandPalette, IMainMenu, InstanceTracker
} from '@jupyterlab/apputils';

import {
  Token, JSONExt, ReadonlyJSONObject
} from '@phosphor/coreutils';


import {CommandIDs} from './commands';

import { RegulusPanel } from '../panel';


export
interface IRegulusExtension {}

export
const RegulusExtension = new Token<IRegulusExtension>('jupyter.extension.regulus');

export
const regulusExtension: JupyterLabPlugin<void> = {
  id: RegulusExtension.name, //'jupyter.services.regulus',
  autoStart: true,
  requires: [ ICommandPalette, ILayoutRestorer],
  activate: activateRegulus
};


function activateRegulus(app: JupyterLab, palette: ICommandPalette, restorer: ILayoutRestorer) {
  let manager = app.serviceManager;
  let category = 'Regulus';
  let command: string;

  let widget: RegulusPanel;

  const tracker = new InstanceTracker<RegulusPanel>({namespace: 'cycle'});

  restorer.restore(tracker, {
    command: CommandIDs.open,
    args: (panel) => ({
      path: panel.regulus.session.path,
      name: panel.regulus.session.name
    }),
    name: panel => panel.regulus.session.path,
    when: manager.ready
  });

  tracker.currentChanged.connect(() => {
    if (tracker.size <= 1) {
      console.log('regulus tracker changed. COMMENTED OUT. size.', tracker.size);
      // commands.notifyCommandChanged(CommandIDs.interrupt);
    }
  });

  app.commands.addCommand(CommandIDs.open, {
    label: 'Regulus',
    execute: (args) => {
      console.log('new regulus. args', args);
      let path = args.path;
      let widget = tracker.find( value => value.regulus.session.path == path);

      if (widget) {
        app.shell.activateById(widget.id);
      } else {
        return createRegulus(args);
      }
    }
  });

  app.commands.addCommand(CommandIDs.attach, {
    label: 'Regulus attach',
    execute: args => {
      console.log('regulus attach', args);
      let path = args.path;
      let widget = tracker.find( value => value.regulus.session.path == path);
      if (widget) {
        console.log('attached regulus found');
        app.shell.activateById(widget.id);
      } else {
        console.log('no regulus found. create a new one');
        let basePath = args.basePath || '.';
        return createRegulus({ basePath, ...args});
      }
    }
  });

  palette.addItem({
    category: 'Cycle',
    command: CommandIDs.open
  });

  function createRegulus( options) : Promise<RegulusPanel> {
    return manager.ready.then( () => {
      let panel = new RegulusPanel({
        manager,
        ...options
      });

      tracker.add(panel);
      app.shell.addToMainArea(panel);
      app.shell.activateById(panel.id);
      return panel;
    });
  }
}
