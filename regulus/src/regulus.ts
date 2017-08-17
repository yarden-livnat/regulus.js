import {
  IClientSession
} from '@jupyterlab/apputils';

// import {
//   KernelMessage
// } from '@jupyterlab/services';

import {
  Message
} from '@phosphor/messaging';

// import {
//   ISignal, Signal
// } from '@phosphor/signaling';

import {
  Widget
} from '@phosphor/widgets';


const REGULUS_CLASS = 'jp-Regulus';


export
class Regulus extends Widget {
  constructor(options: Regulus.IOptions) {
    super();
    this.addClass(REGULUS_CLASS);
    console.log('Regulus')

    let contentFactory = this.contentFactory = (
      options.contentFactory || Regulus.defaultContentFactory
    );
    let modelFactory = this.modelFactory = (
      options.modelFactory || Regulus.defaultModelFactory
    );

    this.session = options.session;

    this._onKernelChanged();
    this.session.kernelChanged.connect(this._onKernelChanged, this);
  }

  readonly contentFactory: Regulus.IContentFactory;
  readonly modelFactory: Regulus.IModelFactory;

  readonly session: IClientSession;

  dispose() {
    // Do nothing if already disposed.
    if (this.isDisposed) {
      return;
    }
    super.dispose();
  }

  protected onAfterAttach(msg: Message): void {
  }

  protected onBeforeDetach(msg: Message): void {
  }

  protected onActivateRequest(msg: Message): void {
    this.update();
  }

  private _onKernelChanged(): void {
    let kernel = this.session.kernel;
    if (!kernel) {
      return;
    }
    kernel.ready.then(() => {
      if (this.isDisposed || !kernel || !kernel.info) {
        return;
      }
      // this._handleInfo(kernel.info);
    });
  }
}

export
namespace Regulus {

  export
  interface IOptions {
    contentFactory: IContentFactory;
    modelFactory?: IModelFactory;
    session: IClientSession;
  }

  export
  interface IContentFactory {}

  export
  class ContentFactory implements IContentFactory {
  }


  export
  namespace ContentFactory {

    export
    interface IOptions {}
  }

  export
  const defaultContentFactory: IContentFactory = new ContentFactory();

  export
  interface IModelFactory {
  }

  export
  class ModelFactory {
    constractor(options: IModelFactoryOptions = {}) {}
  }

  export
    interface IModelFactoryOptions {}

  export
  const defaultModelFactory = new ModelFactory();
}

namespace Private {}
