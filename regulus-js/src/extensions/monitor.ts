import {
  JupyterLab
} from '@jupyterlab/application';

import {
  ReadonlyJSONObject
} from '@phosphor/coreutils';

import {
  IDisposable, DisposableDelegate
} from '@phosphor/disposable'

import {
  DocumentRegistry
} from '@jupyterlab/docregistry';

import { CommandIDs } from './commands';

import {
  Kernel, KernelMessage
} from '@jupyterlab/services';

export
const REGULUS_COMM_TARGET_NAME = 'jupyter.regulus';

export
class Monitor implements IDisposable {
  constructor(app: JupyterLab, context: DocumentRegistry.IContext<DocumentRegistry.IModel>) {
    console.log('new Monitor');
    this._context = context;
    this._app = app;

    context.session.kernelChanged.connect( (server, kernel) => this.newKernel(kernel));
    if (context.session.kernel)
      this.newKernel(context.session.kernel);
  }

  newKernel(kernel: Kernel.IKernelConnection) {
    if (this._commRegistration)
      this._commRegistration.dispose();

    if (!kernel) return;

    console.log('monitor new kernel. register onCommOpen');
    this._commRegistration = kernel.registerCommTarget(REGULUS_COMM_TARGET_NAME, (comm, msg) => this.onCommOpen(comm, msg));
  }

  onCommOpen(comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) {
    console.log('comm opened', comm, msg);
    const opts: ReadonlyJSONObject = {
      path: this._context.path,
      preferredLanguage: this._context.model.defaultKernelLanguage,
      commId: comm.commId
    };

    this._app.commands.execute(CommandIDs.attach, opts);
  }

  get isDisposed(): boolean {
    return this._context === null;
  }

  dispose(): void {
    console.log('Monitor disposed');
    if (this.isDisposed) return;

    if (this._commRegistration)
      this._commRegistration.dispose();

    this._context = null;
  }

  private _commRegistration: IDisposable;
  private _context : DocumentRegistry.IContext<DocumentRegistry.IModel>;
  private _app: JupyterLab;
}
