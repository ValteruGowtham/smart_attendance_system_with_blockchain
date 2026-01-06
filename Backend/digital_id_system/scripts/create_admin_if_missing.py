import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','digital_id_system.settings')
django.setup()
from django.contrib.auth.models import User

supers = User.objects.filter(is_superuser=True)
if supers.exists():
    print('Superuser(s) already exist:')
    for u in supers:
        print('-', u.username, u.email)
else:
    username = 'admin'
    email = 'admin@example.com'
    password = 'admin@123'
    if User.objects.filter(username=username).exists():
        print('Username `admin` exists but is not a superuser. Promoting user to superuser...')
        u = User.objects.get(username=username)
        u.is_superuser = True
        u.is_staff = True
        u.set_password(password)
        u.email = email
        u.save()
        print('Updated existing user to superuser:', u.username)
    else:
        User.objects.create_superuser(username, email, password)
        print('Created superuser: admin / admin@123')

print('Done')
