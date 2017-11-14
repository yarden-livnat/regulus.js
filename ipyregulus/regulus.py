""" Core Regulus
"""

from traitlets import (
    observe, default,
    HasTraits, Unicode, Dict, Instance, List, Int, Set, Bytes,  Container,
    Undefined)
from ipykernel.comm import Comm

from ._version import version_info, __version__, __protocol_version__
from .decorators import traceback

class LoggerTrait(HasTraits):
    """Adds the current application logger """
    log = Instance('logging.Logger')
    @default('log')
    def _log_default(self):
        from traitlets import log
        return log.get_logger()

class Regulus(LoggerTrait):
    comm = Instance('ipykernel.comm.Comm', allow_none=True)

    @staticmethod
    def on_comm_opened(comm, msg):
        self.log.warning('R on comm opened. id={id}'.format(id=comm.comm_id))
        print('Regulus on comm open', comm, msg)

        version = msg.get('metadata', {}).get('version', '')
        self.log.warning('verson {}'.format(version))
        if version.split('.')[0] != PROTOCOL_VERSION_MAJOR:
            raise ValueError("Incompatible widget protocol versions: received version {}, expected version {}".format(version, __protocol_version__))
        # data = msg['content']['data']
        # state = data['state']

        # widget = widget_class(comm=comm)
        # widget.set_state(state)

    def __init__(self, **kwargs):
        super(Regulus, self).__init__(**kwargs)
        print('new Regulus')
        self.open()


    def __del__(self):
        self.close()


    def open(self):
        if self.comm is None:
            opts = dict(target_name="jupyter.regulus",
                        data={},
                        metadata={'version': __protocol_version__}
                        )
            self.comm = Comm(**opts)
            print('open comm id:', self.comm.comm_id)
            self.comm.on_msg(self._handle_msg)


    def close(self):
        if self.comm is not None:
            self.comm.close()
            self.comm = None

    def send(self, content, buffers=None):
        """Send a custom msg"""
        self.log.warning('R send: {}'.format(content))
        self._send({"method": "custom", "content": content}, buffers=buffers)

    # def on_msg(self, callback, remove=False):
    #     """(Un)Register a custom msg receive callback"""
    #     self._msg_callbacks.register_callback(callback, remove=remove)


    @observe('comm')
    def _comm_changed(self, change):
        self.log.warning('** R comm changed {}'.format(change))
        self.comm.on_msg(self._handle_msg)


    def _send(self, msg, buffers=None):
        if self.comm is not None and self.comm.kernel is not None:
            self.comm.send(data=msg, bufferes=buffers)


    def debug(self, msg):
        with open('debug.log', 'a') as f:
            f.write('debug:')
            f.write(msg)

    # Event handlers
    @traceback
    def _handle_msg(self, msg):
        """Called when a msg is received from the front-end"""
        self.log.warning('** R receieved msg: {}. Sending echo back'.format(msg))
        self.send("echo");
        data = msg['content']['data']
        method = data['method']
