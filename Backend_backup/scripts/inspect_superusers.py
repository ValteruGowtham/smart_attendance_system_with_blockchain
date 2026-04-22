import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','digital_id_system.settings')
django.setup()
from django.contrib.auth.models import User

supers = User.objects.filter(is_superuser=True)
print('Found', supers.count(), 'superuser(s)')
for u in supers:
    print('-', u.username, u.email)
