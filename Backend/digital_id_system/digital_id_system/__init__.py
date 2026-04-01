# This will make sure the app is always imported when
# Django starts so that shared_task will use this app.
from __future__ import absolute_import, unicode_literals

# Celery app import (optional - can be enabled if celery.py is in this package)
# from .celery import app as celery_app
# __all__ = ('celery_app',)
