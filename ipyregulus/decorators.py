
from IPython import get_ipython

def traceback(method):
    """decorator for showing tracebacks in IPython"""
    def m(self, *args, **kwargs):
        try:
            return(method(self, *args, **kwargs))
        except Exception as e:
            ip = get_ipython()
            if ip is None:
                self.log.warning("Exception in widget method %s: %s", method, e, exc_info=True)
            else:
                ip.showtraceback()
    return m
