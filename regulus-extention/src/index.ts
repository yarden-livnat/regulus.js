import {
  ILayoutRestorer, JupyterLab, JupyterLabPlugin
} from '@jupyterlab/application';

import {
  Dialog, ICommandPalette, IMainMenu, InstanceTracker,
  showDialog
} from '@jupyterlab/apputils';

import {
  IEditorServices
} from '@jupyterlab/codeeditor';

import {
  PageConfig
} from '@jupyterlab/coreutils';

import {
  IRegulusTracker, RegulusPanel
} from 'regulus';

import {
  ILauncher
} from '@jupyterlab/launcher';

import {
  find
} from '@phosphor/algorithm';

import {
  ReadonlyJSONObject
} from '@phosphor/coreutils';

import {
  Menu
} from '@phosphor/widgets';


namespace CommandIDs {
  export
  const create = 'regulus:create';

  export
  const run = 'regulus:run';

  export
  const changeKernel = 'regulus:change-kernel';

  export
  const closeAndShutdown = 'regulus:close-and-shutdown';
};

export
const trackerPlugin:JuypterLabPlugin<IRegulusTracker> = {
  id: 'regulus-tracker',
  provides: IRegulusTracker,
  requires: [
    IMainMenu,
    ICommandPalette,
    RegulusPanel.IContentFactory,
    ILayoutRestorer
  ],
  optional: [ILauncher],
  activate: activateRegulus,
  autoStart: true
};

export
const contentFactoryPlugin: JupyterLabPlugin<RegulusPanel.IContentFactory> = {
  id: 'regulus-renderer',
  provides: RegulusPanel.IContentFactory,
  // requires: [IEditorServices],
  autoStart: true,
  activate: (app: JupyterLab) => {
    return new RegulusPanel.ContentFactory({});
  }
};

const plugins: JupyterLabPlugin<any>[] = [contentFactoryPlugin, trackerPlugin];
export default plugins;

function activateConsole(app: JupyterLab, mainMenu: IMainMenu, palette: ICommandPalette, contentFactory: RegulusPanel.IContentFactory,  restorer: ILayoutRestorer, launcher: ILauncher | null): IRegulusTracker {
  let manager = app.serviceManager;
  let { commands, shell } = app;
  let category = 'Regulus';
  let command: string;
  let menu = new Menu({ commands });

  const tracker = new InstanceTracker<RegulusPanel>({ namespace: 'regulus' });

  // Handle state restoration.
  restorer.restore(tracker, {
    command: CommandIDs.open,
    args: panel => ({
      path: panel.regulus.session.path,
      name: panel.regulus.session.name
    }),
    name: panel => panel.regulus.session.path,
    when: manager.ready
  });

  tracker.currentChanged.connect(() => {
    if (tracker.size <= 1) {
      commands.notifyCommandChanged(CommandIDs.interrupt);
    }
  });

  let callback = (cwd: string, name: string) => {
    return createRegulus{ basePath: cwd, kernelPreference: { name } });
  };

  if (launcher) {
    manager.ready.then(() => {
      const specs = manager.specs;
      if (!specs) {
        return;
      }
      let baseUrl = PageConfig.getBaseUrl();
      for (let name in specs.kernelspecs) {
        let displayName = specs.kernelspecs[name].display_name;
        let rank = name === specs.default ? 0 : Infinity;
        let kernelIconUrl = specs.kernelspecs[name].resources['logo-64x64'];
        if (kernelIconUrl) {
          let index = kernelIconUrl.indexOf('kernelspecs');
          kernelIconUrl = baseUrl + kernelIconUrl.slice(index);
        }
        launcher.add({
          displayName,
          category: 'Regulus',
          name,
          iconClass: 'jp-RegulusIcon',
          callback,
          rank,
          kernelIconUrl
        });
      }
    });
  }

  menu.title.label = category;

  function createRegulus(options: Partial<RegulusPanel.IOptions>): Promise<RegulusPanel> {
    return manager.ready.then(() => {
      let panel = new RegulusPanel({
        manager,
        contentFactory,
        ...options
      });

      // Add the console panel to the tracker.
      tracker.add(panel);
      shell.addToMainArea(panel);
      shell.activateById(panel.id);
      return panel;
    });
  }

  function hasWidget(): boolean {
    return tracker.currentWidget !== null;
  }

  command = CommandIDs.open;
  commands.addCommand(command, {
    execute: (args: Partial<RegulusPanel.IOptions>) => {
      let path = args['path'];
      let widget = tracker.find(value => {
        return value.regulus.session.path === path;
      });
      if (widget) {
        shell.activateById(widget.id);
      } else {
        return manager.ready.then(() => {
          let model = find(manager.sessions.running(), item => {
            return item.path === path;
          });
          if (model) {
            return createRegulus(args);
          }
          return Promise.reject(`No running regulus for path: ${path}`);
        });
      }
    },
  });

  command = CommandIDs.create;
  commands.addCommand(command, {
    label: 'Start Regulus',
    execute: (args: Partial<RegulusPanel.IOptions>) => {
      let basePath = args.basePath || '.';
      return createRegulus({ basePath, ...args });
    }
  });
  palette.addItem({ command, category });


  // menu.addItem({ command: CommandIDs.run });
  // menu.addItem({ type: 'separator' });
  // menu.addItem({ command: CommandIDs.changeKernel });
  // menu.addItem({ type: 'separator' });
  // menu.addItem({ command: CommandIDs.closeAndShutdown });

  mainMenu.addMenu(menu, {rank: 50});

  // app.contextMenu.addItem({command: CommandIDs.restart, selector: '.jp-Regulus'});

  return tracker;
}
