import os
from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "GURK_Music_Quiz.settings")
app = Celery("GURK_Music_Quiz")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()