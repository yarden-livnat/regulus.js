// import {
//   Kernel, KernelMessage
// } from '@jupyterlab/services';

// import {
//   each
// } from '@phosphor/algorithm';

import {
  Token
} from '@phosphor/coreutils';

import {
  Message
} from '@phosphor/messaging';

// import {
//   ISignal, Signal
// } from '@phosphor/signaling';

import {
  PanelLayout, Widget
} from '@phosphor/widgets';

import {
  IClientSession, ClientSession, Toolbar
} from '@jupyterlab/apputils';

import {
  uuid
} from '@jupyterlab/coreutils';

import {
  ServiceManager
} from '@jupyterlab/services';

import {
  Regulus
} from './regulus'

/**
 * The class name added to regulus panels.
 */
const PANEL_CLASS = 'jp-RegulusPanel';
const PANEL_TOOLBAR_CLASS = 'jp-RegulusPanel-toolbar';

/**
 * Regulus main panel
 */
export
class RegulusPanel extends Widget {
  constructor(options: RegulusPanel.IOptions) {
    super();
    this.addClass(PANEL_CLASS);

    let {
      path, basePath, name, manager, modelFactory
    } = options;

    let contentFactory = this.contentFactory = (
      options.contentFactory || RegulusPanel.defaultContentFactory
    );

    if (!path) {
      path = `${basePath || ''}/regulus-${uuid()}`;
    }

    let session = this._session = new ClientSession({
      manager: manager.sessions,
      path,
      name: name || 'Regulus',
      type: 'regulus',
      kernelPreference: options.kernelPreference
    });

    this.regulus = contentFactory.createRegulus({
      session,
      contentFactory,
      modelFactory
    });

    let layout = this.layout = new PanelLayout;

    let toolbar = new Toolbar();
    toolbar.addClass(PANEL_TOOLBAR_CLASS);

    layout.addWidget(toolbar);
    layout.addWidget(this.regulus);

    session.ready.then(() => {
      this._connected = new Date();
    });

    this._manager = manager;
    this.id = 'regulus';
  }

  readonly contentFactory: RegulusPanel.IContentFactory;

  readonly regulus: Regulus;

  get session(): IClientSession {
    return this._session;
  }

  protected onAfterAttach(msg: Message): void {
    this._session.initialize();
  }

  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.dispose();
  }

  get toolbar(): Toolbar<Widget> {
    return (this.layout as PanelLayout).widgets[0] as Toolbar<Widget>;
  }

  dispose(): void {
    this.regulus.dispose();
    super.dispose();
  }

  private _manager: ServiceManager.IManager;
  private _connected: Date | null = null;
  private _session: ClientSession;
}

export
namespace RegulusPanel {

  export
  interface IOptions {
    contentFactory: IContentFactory;
    manager: ServiceManager.IManager;
    path?: string;
    basePath?: string;
    name?: string;
    kernelPreference?: IClientSession.IKernelPreference;
    modelFactory?: Regulus.IModelFactory;
  }

  export
  interface IContentFactory extends Regulus.IContentFactory {
    createRegulus(options: Regulus.IOptions): Regulus;
  }

  export
  class ContentFactory extends Regulus.ContentFactory implements IContentFactory {
    createRegulus(options: Regulus.IOptions): Regulus {
      return new Regulus(options);
    }
  }

  export
  namespace ContentFactory {
    export
    interface IOptions extends Regulus.ContentFactory.IOptions {}
  }

  export
  const defaultContentFactory: IContentFactory = new ContentFactory();

  export
  const IContentFactory = new Token<IContentFactory>('regulus.content-factory');
}

namespace Private {

}
