import os
import pathlib
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')
django.setup()
from django.contrib.auth.models import User
from attendance.models import Student

users = ['testuser1', 'testuser2', 'testuser3']
print('--- Students ---')
for u in users:
    try:
        user = User.objects.get(username=u)
        try:
            s = user.student
            print(u, 'photo.name=', repr(s.photo.name), 'photo.path=', getattr(s.photo, 'path', None))
            if getattr(s.photo, 'path', None):
                print(' path exists?', os.path.exists(s.photo.path))
        except Student.DoesNotExist:
            print(u, '-> No Student profile')
    except User.DoesNotExist:
        print(u, '-> No User')

p = pathlib.Path('media')
print('\nmedia exists:', p.exists())
print('media listing:')
for x in sorted(p.rglob('*')):
    print(' ', x)
