#!/usr/bin/env python
import os, django, sys
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')
django.setup()
from attendance.models import Student
students = Student.objects.filter(branch='CSE', year='3', section='A')
print(f'Found {students.count()} students:')
for s in students:
    print(f'  {s.registration_id}: {s.first_name} {s.last_name}')