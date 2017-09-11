import {
  ClientSession, IClientSession
} from '@jupyterlab/apputils';

import {
  ServiceManager
} from '@jupyterlab/services';

import {
  uuid
} from '@jupyterlab/coreutils';

import {
  Token
} from '@phosphor/coreutils';

import {
  Message
} from '@phosphor/messaging';

import {
  Panel
} from '@phosphor/widgets';

import {
  Regulus
} from './widget'

/**
 * The class name added to regulus panels.
 */
const PANEL_CLASS = 'jp-RegulusPanel';
const ICON_CLASS = 'jp-RegulusIcon';

/**
 * Regulus main panel
 */
export
class RegulusPanel extends Panel {
  constructor(options: RegulusPanel.IOptions) {
    super();
    this.addClass(PANEL_CLASS);

    let {
      path, basePath, name, manager
    } = options;

    let contentFactory = this.contentFactory = (
        options.contentFactory || RegulusPanel.defaultContentFactory
      );

    let count = Private.count++;
    if (!path) {
      path = `${basePath || ''}/regulus-${count}-${uuid()}`;
    }

    let session = this._session = new ClientSession({
      manager: manager.sessions,
      path,
      name: name || `Regulus ${count}`,
      type: 'regulus',
      kernelPreference: options.kernelPreference
    });

    this.regulus = contentFactory.createRegulus({
      session, contentFactory
    });

    this.addWidget(this.regulus);

    session.ready.then(() => {
      console.log('session ready');
      this._updateTitle();
    });

    this._manager = manager;
    // session.kernelChanged.connect(this._updateTitle, this);

    this.title.icon = ICON_CLASS;
    this.title.closable = true;
    this.id = `regulus-${count}`;
  }

  readonly contentFactory: RegulusPanel.IContentFactory;
  readonly regulus: Regulus;

  get session(): IClientSession {
    return this._session;
  }

  dispose(): void {
    this.regulus.dispose();
    super.dispose();
  }

  protected onAfterAttach(msg: Message): void {
    console.log('panel:onAfterAttach:', msg);
  }

  protected onActivateRequest(msg: Message): void {
    console.log('panel:onActivateRequest:', msg);
  }

  protected onCloseRequest(msg: Message): void {
    console.log('panel:onCloseRequest', msg);
    super.onCloseRequest(msg);
    this.dispose();
  }

  private _updateTitle(): void {
    console.log('_updateTitle');
  }

  private _manager: ServiceManager.IManager;
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
  const IContentFactory = new Token<IContentFactory>('jupyter.services.regulus.content-factory');
}

namespace Private {
  export
  let count = 1;
}
