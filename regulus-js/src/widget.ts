import {
  Panel, PanelLayout, Widget
} from '@phosphor/widgets';

import {
  IClientSession
} from '@jupyterlab/apputils';

import {
  IDisposable
} from '@phosphor/disposable';

import {
  Message
} from '@phosphor/messaging';

import {
  Kernel, KernelMessage
} from '@jupyterlab/services';

const REGULUS_CLASS = 'jp-Regulus';
const CONTENT_CLASS = 'jp-Regulus-content';

export
const PROTOCOL_VERSION = '1.0.0';

export
const PROTOCOL_MAJOR_VERSION = PROTOCOL_VERSION.split('.', 1)[0];

export
const COMM_TARGET_NAME = 'jupyter.regulus';

export
class Regulus extends Widget {
  readonly _session: IClientSession;
  private _content: Panel;
  private _request : Kernel.IFuture;
  private _comm: Kernel.IComm;
  private _commId: string;
  private _commRegistration: IDisposable;

  constructor(options: Regulus.IOptions) {
    super();
    this.addClass(REGULUS_CLASS);
    console.log('new Regulus widget');

    this._session = options.session;
    // this._commId = options.commId;

    this._content = new Panel();
    this._content.addClass(CONTENT_CLASS);

    let layout = this.layout = new PanelLayout();
    layout.addWidget(this._content);

    this.newKernel();
    this._session.kernelChanged.connect(this.newKernel, this);
  }

  dispose() {
    if (this.isDisposed) return;
    if (this._request) this._request.dispose();
    this._request = null;

    super.dispose();
  }

  get session() {
    return this._session;
  }

  get request(): Kernel.IFuture {
    return this._request;
  }

  set request(future : Kernel.IFuture) {
    if (this._request == future) return;
    if (this._request) this._request.dispose();
    this._request = future;
  }

  get comm(): Kernel.IComm {
    return this._comm;
  }

  get onMsg(): (msg: KernelMessage.ICommMsgMsg) => void {
    return this._comm.onMsg;
  }

  set on_msg( cb: (msg: KernelMessage.ICommMsgMsg) => void) {
    this._comm.onMsg = cb;
  }

  private newKernel(id = null): void {
    let kernel = this._session.kernel;
    if (!kernel) return;

    if (this._commRegistration) {
      console.log('commRegistration dispose');
      this._commRegistration.dispose();
    }

    kernel.ready.then(() => {
      if (this.isDisposed || !kernel || !kernel.info) {
        return;
      }

      this._commRegistration = kernel.registerCommTarget(COMM_TARGET_NAME,
        (comm, msg) => this.on_comm_opened(comm, msg));

      this.connect_to_comm();
      this._comm.open({src: 'regulus'}, {version: PROTOCOL_MAJOR_VERSION});
      this._comm.send({cmd: 'echo', text:'test'});
    });
  }

  private on_comm_opened(comm: Kernel.IComm, msg: KernelMessage.ICommOpenMsg) {
    console.log('comm opened', comm, msg);
    this._comm = comm;
  }

  private connect_to_comm() {
    this._comm = this._session.kernel.connectToComm(COMM_TARGET_NAME);
    this._comm.onMsg =  (msg: KernelMessage.ICommMsgMsg) => console.log('comm received msg:', msg);
    console.log('comm.id', this._comm.commId);
  }

  // returns a request (IFuture) object to allow attaching other listeners
  // default listeners are attached by default
  // Note: request is not stored in regulus._request
  private execute(code: string) : Kernel.IFuture {
    let content: KernelMessage.IExecuteRequest = {
      code,
      stop_on_error: true
    };
    let request = this._session.kernel.requestExecute(content, false);
    request.onIOPub = msg => this.onIOPub(msg);
    request.onReply = msg => this.onReply(msg);
    request.onStdin = msg => this.onInputRequest(msg);
    return request;
  }

  private exec(code: string): Promise<KernelMessage.IExecuteReplyMsg> {
    if (!this._session.kernel) {
      console.log('exec: no session kernel');
      return Promise.resolve(void 0);
    }

    let content: KernelMessage.IExecuteRequest = {
      code,
      stop_on_error: true
    };

    let request = this._request = this._session.kernel.requestExecute(content, false);
    request.onIOPub = msg => this.onIOPub(msg);
    request.onReply = msg => this.onReply(msg);
    request.onStdin = msg => this.onInputRequest(msg);
    return request.done as Promise<KernelMessage.IExecuteReplyMsg>;
  }

  private onIOPub(msg : KernelMessage.IIOPubMessage): void {
    // console.log('Regulus:IOPub:', msg.header.msg_type, msg);
  }

  private onReply(msg: KernelMessage.IShellMessage): void {
    console.log('Regulus:Reply:', msg);
  }

  private onInputRequest(msg: KernelMessage.IStdinMessage): void {
    console.log('Regulus:Stdio:', msg);
  }
}

export
namespace Regulus {

  export
  interface IOptions {
    session: IClientSession,
    commId?: string
  }
}
