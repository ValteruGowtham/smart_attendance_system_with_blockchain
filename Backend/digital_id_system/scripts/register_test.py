import os
import django
from django.core.files.uploadedfile import SimpleUploadedFile

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')
django.setup()
from django.test import Client

client = Client()
photo = SimpleUploadedFile('photo.jpg', b'\x00\x01', content_type='image/jpeg')
resp = client.post('/register/', {'username': 'testuser5', 'email': 't5@example.com', 'password': 'testpass123', 'roll_no': 'R005'}, FILES={'photo': photo})
print('status', resp.status_code)
from django.contrib.auth.models import User
print('created user testuser5:', User.objects.filter(username='testuser5').exists())

import pathlib
p = pathlib.Path('media')
print('media exists:', p.exists())
print('media listing:')
for x in sorted(p.rglob('*')):
    print(' ', x)
