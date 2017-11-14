import {
  Token
} from '@phosphor/coreutils';

import {
  IInstanceTracker
} from '@jupyterlab/apputils';

import {
  RegulusPanel
} from './';


/* tslint:disable */
/**
 * The console tracker token.
 */
export
const IRegulusTracker = new Token<IRegulusTracker>('jupyter.services.regulus');
/* tslint:enable */


/**
 * A class that tracks regulus widgets.
 */
export
interface IRegulusTracker extends IInstanceTracker<RegulusPanel> {}
