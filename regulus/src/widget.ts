import {
  Panel, PanelLayout, Widget
} from '@phosphor/widgets';

import {
  IClientSession
} from '@jupyterlab/apputils';

// import {
//   KernelMessage
// } from '@jupyterlab/services';

import {
  Message
} from '@phosphor/messaging';

const REGULUS_CLASS = 'jp-Regulus';
const CONTENT_CLASS = 'jp-Regulus-content';

export
class Regulus extends Widget {
  constructor(options: Regulus.IOptions) {
    super();
    this.addClass(REGULUS_CLASS);
    console.log('Regulus widget');

    this.contentFactory = (
      options.contentFactory || Regulus.defaultContentFactory
    );

    this.session = options.session;
    this._content = new Panel();
    this._content.addClass(CONTENT_CLASS);

    let layout = this.layout = new PanelLayout();
    layout.addWidget(this._content);

    this._onKernelChanged();
    this.session.kernelChanged.connect(this._onKernelChanged, this);
  }

  dispose() {
    // Do nothing if already disposed.
    if (this.isDisposed) {
      return;
    }
    super.dispose();
  }

  readonly contentFactory: Regulus.IContentFactory;
  readonly session: IClientSession;

  private _content: Panel;

  protected onAfterAttach(msg: Message): void {
    console.log("widget: onAfterAttach:", msg);
  }

  protected onBeforeDetach(msg: Message): void {
    console.log("widget: onBeforeDetach:", msg);
  }

  protected onActivateMessage(msg: Message): void {
    console.log("widget: onActivateMessage:", msg);
  }

  protected onUpdateRequest(msg: Message): void {
    console.log("widget: onUpdateRequest:", msg);
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
      console.log('kernel changed:', kernel.info);
    });
  }
}

export
namespace Regulus {

  export
  interface IOptions {
    contentFactory: IContentFactory;
    session: IClientSession;
  }

  export
  interface IContentFactory {}

  export
  class ContentFactory implements IContentFactory {
    constructor(options: ContentFactory.IOptions = {}) {
    }
  }

  export
  namespace ContentFactory {
    export
    interface IOptions {}
  }

  export
  const defaultContentFactory: IContentFactory = new ContentFactory();
}

// namespace Private {}
