import os
from celery import Celery
from django.conf import settings
from contextlib import contextmanager
from django.core.cache import cache
import logging
import time

# first, we set the default DJANGO_SETTINGS_MODULE environment variable for the celery command-line program:
# You don’t need this line,
# but it saves you from always passing in the settings module to the celery program.
# It must always come before creating the app instances, as is what we do next:
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Angizeh_2.settings')

# This is our instance of the library,
# you can have many instances but there’s probably no reason for that when using Django.
app = Celery('Angizeh_2')

# We also add the Django settings module as a configuration source for Celery.
# This means that you don’t have to use multiple configuration files,
# and instead configure Celery directly from the Django settings
# all Celery configuration options must be specified in uppercase instead of lowercase,
# and start with CELERY_, so for example:
# the task_always_eager setting becomes CELERY_TASK_ALWAYS_EAGER
app.config_from_object('django.conf:settings', namespace='CELERY')

# Next, a common practice for reusable apps is to define all tasks in a separate tasks.py module,
# and Celery does have a way to auto-discover these modules
# With the line below Celery will automatically discover tasks from all of your installed apps,
# following the tasks.py convention:
# - app1/
#     - tasks.py
#     - models.py
# - app2/
#     - tasks.py
#     - models.py
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)
logger = logging.getLogger('django')


@app.task(bind=True)
def debug_task(self):
    print(f'Request:{self.request!r}')


@contextmanager
def memcache_lock(lock_id, timeout):
    timeout_at = time.monotonic() + timeout - 3
    status = cache.add(lock_id, "lock", timeout=timeout)  # cache.add fails if the key already exists
    try:
        yield status
    finally:
        if time.monotonic() < timeout_at and status:
            cache.delete(lock_id)

