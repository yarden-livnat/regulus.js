import {
  ClientSession, IClientSession
} from '@jupyterlab/apputils';

import {
  ServiceManager
} from '@jupyterlab/services';

import {
  PathExt, uuid
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

import '../style/index.css';


const PANEL_CLASS = 'cycle-RegulusPanel';
const ICON_CLASS = 'cyclus-RegulusIcon';

let count = 0;

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

    let n = count++;

    if (!path) {
      path = `${basePath || ''}/regulus-${n}-${uuid()}`;
    }

    let session = this._session = new ClientSession({
      manager: manager.sessions,
      path,
      name: name || `Regulus ${n}`,
      type: 'regulus',
      kernelPreference: options.kernelPreference
    });

    this.regulus = new Regulus( { session, commId: options.commId });
    this.addWidget(this.regulus);

    session.ready.then(() => {
      this._updateTitle();
    });

    this._manager = manager;
    session.kernelChanged.connect(this._updateTitle, this);
    session.propertyChanged.connect(this._updateTitle, this);

    this.title.icon = ICON_CLASS;
    this.title.closable = true;
    this.id = `regulus-${n}`;
  }

  readonly regulus: Regulus;

  get session(): IClientSession {
    return this._session;
  }

  dispose(): void {
    this.regulus.dispose();
    super.dispose();
  }

  protected onAfterAttach(msg: Message): void {
    this._session.initialize();
  }

  protected onActivateRequest(msg: Message): void {
  }

  protected onCloseRequest(msg: Message): void {
    super.onCloseRequest(msg);
    this.dispose();
  }

  private _updateTitle(): void {
    let session = this.regulus.session;
    let caption = (
      `Name: ${session.name}\n` +
      `Path: ${PathExt.dirname(session.path)}\n` +
      `Kernel: ${session.kernelDisplayName}`
    );

    this.title.label = `Regulus:${session.name}`;
    this.title.caption = caption;
  }

  private _manager: ServiceManager.IManager;
  private _session: ClientSession;
}

export
namespace RegulusPanel {

  export
  interface IOptions  extends Regulus.IOptions {
    manager?: ServiceManager.IManager;
    path?: string;
    basePath?: string;
    name?: string;
    kernelPreference?: IClientSession.IKernelPreference;
  }

}
