"""Shared Flask extension singletons.

The Limiter lives here (unbound to any app) so route modules can apply
per-endpoint limits with the ``@limiter.limit(...)`` decorator at route
definition. The post-registration ``limiter.limit(...)(app.view_functions[...])``
pattern does NOT take effect in flask-limiter 4.1.1, so decorating at the route
is the only reliable way to tighten a specific endpoint below the global limit.
"""

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

# Bound to the app later via limiter.init_app(app) in app.create_app().
# default_limits is the global per-IP ceiling; per-endpoint decorators override
# it downward at the route. Real client IP comes from ProxyFix (see app.py).
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["60 per minute"],
    storage_uri="memory://",
)
