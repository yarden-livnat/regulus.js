import os
from IPython import get_ipython
from traitlets import log
from ._version import version_info, __version__, __protocol_version__

from .regulus import *

def on_comm_opened(comm, msg):
    log.get_logger().error('on comm open')
    log.get_logger().warning('on comm opened id={} comm={} msg={}'.format(comm.comm_id, comm, msg))


def register_extension():
    print('regulus register extention')
    ip = get_ipython()
    if ip is None or not hasattr(ip, 'kernel'):
        return

    kernel = ip.kernel
    kernel.comm_manager.register_target('jupyter.regulus', Regulus.on_comm_opened)
    # kernel.comm_manager.register_target('jupyter.regulus', on_comm_opened)


print('regulus module loaded')
log.get_logger().warning('log testing')
register_extension()
