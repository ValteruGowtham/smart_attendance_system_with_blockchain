"""
Seed script to populate the database with demo students, faculty, and courses.
Run with: venv\Scripts\python manage.py shell < attendance\seed_data.py
"""
import os
import sys
import django

# Setup Django if not already
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')
django.setup()

from django.contrib.auth.models import User
from attendance.models import Student, Faculty, Course

print("=" * 60)
print("  Smart Attendance — Seed Data Script")
print("=" * 60)

# ──────────────────────────────────────────────────────────────
# FACULTY
# ──────────────────────────────────────────────────────────────
faculty_data = [
    {'uid': 'FAC001', 'first': 'Rajesh',   'last': 'Kumar',    'email': 'rajesh.kumar@college.edu',    'phone': '9876543210'},
    {'uid': 'FAC002', 'first': 'Sunita',   'last': 'Sharma',   'email': 'sunita.sharma@college.edu',   'phone': '9876543211'},
    {'uid': 'FAC003', 'first': 'Amit',     'last': 'Patel',    'email': 'amit.patel@college.edu',      'phone': '9876543212'},
    {'uid': 'FAC004', 'first': 'Deepa',    'last': 'Nair',     'email': 'deepa.nair@college.edu',      'phone': '9876543213'},
]

created_faculty = []
for fd in faculty_data:
    if Faculty.objects.filter(uid=fd['uid']).exists():
        fac = Faculty.objects.get(uid=fd['uid'])
        print(f"  [OK] Faculty already exists: {fac}")
        created_faculty.append(fac)
        continue

    user = User.objects.create_user(
        username=fd['uid'],
        password=fd['uid'],
        first_name=fd['first'],
        last_name=fd['last'],
        email=fd['email'],
    )
    fac = Faculty.objects.create(
        user=user,
        uid=fd['uid'],
        first_name=fd['first'],
        last_name=fd['last'],
        email=fd['email'],
        phone=fd['phone'],
    )
    print(f"  + Created faculty: {fac}")
    created_faculty.append(fac)

print()

# ──────────────────────────────────────────────────────────────
# STUDENTS  (normal general names, 2 batches: CSE-2-A and CSE-3-B)
# ──────────────────────────────────────────────────────────────
students_data = [
    # CSE · Year 2 · Section A
    {'reg': 'CSE2021001', 'first': 'Aarav',     'last': 'Mehta',     'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021002', 'first': 'Ananya',    'last': 'Reddy',     'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021003', 'first': 'Rohan',     'last': 'Sharma',    'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021004', 'first': 'Priya',     'last': 'Gupta',     'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021005', 'first': 'Vikram',    'last': 'Singh',     'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021006', 'first': 'Sneha',     'last': 'Iyer',      'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021007', 'first': 'Arjun',     'last': 'Verma',     'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021008', 'first': 'Kavya',     'last': 'Nair',      'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021009', 'first': 'Rahul',     'last': 'Patel',     'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021010', 'first': 'Meera',     'last': 'Joshi',     'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021011', 'first': 'Dev',       'last': 'Chauhan',   'branch': 'CSE', 'year': '2', 'section': 'A'},
    {'reg': 'CSE2021012', 'first': 'Ishita',    'last': 'Kapoor',    'branch': 'CSE', 'year': '2', 'section': 'A'},

    # CSE · Year 3 · Section B
    {'reg': 'CSE2020001', 'first': 'Aditya',    'last': 'Rao',       'branch': 'CSE', 'year': '3', 'section': 'B'},
    {'reg': 'CSE2020002', 'first': 'Riya',      'last': 'Desai',     'branch': 'CSE', 'year': '3', 'section': 'B'},
    {'reg': 'CSE2020003', 'first': 'Karthik',   'last': 'Menon',     'branch': 'CSE', 'year': '3', 'section': 'B'},
    {'reg': 'CSE2020004', 'first': 'Nisha',     'last': 'Agarwal',   'branch': 'CSE', 'year': '3', 'section': 'B'},
    {'reg': 'CSE2020005', 'first': 'Sanjay',    'last': 'Mishra',    'branch': 'CSE', 'year': '3', 'section': 'B'},
    {'reg': 'CSE2020006', 'first': 'Pooja',     'last': 'Kulkarni',  'branch': 'CSE', 'year': '3', 'section': 'B'},
    {'reg': 'CSE2020007', 'first': 'Manish',    'last': 'Tiwari',    'branch': 'CSE', 'year': '3', 'section': 'B'},
    {'reg': 'CSE2020008', 'first': 'Divya',     'last': 'Pandey',    'branch': 'CSE', 'year': '3', 'section': 'B'},
    {'reg': 'CSE2020009', 'first': 'Suresh',    'last': 'Yadav',     'branch': 'CSE', 'year': '3', 'section': 'B'},
    {'reg': 'CSE2020010', 'first': 'Anjali',    'last': 'Bhat',      'branch': 'CSE', 'year': '3', 'section': 'B'},

    # ECE · Year 2 · Section A
    {'reg': 'ECE2021001', 'first': 'Nikhil',    'last': 'Saxena',    'branch': 'ECE', 'year': '2', 'section': 'A'},
    {'reg': 'ECE2021002', 'first': 'Shruti',    'last': 'Malhotra',  'branch': 'ECE', 'year': '2', 'section': 'A'},
    {'reg': 'ECE2021003', 'first': 'Varun',     'last': 'Chopra',    'branch': 'ECE', 'year': '2', 'section': 'A'},
    {'reg': 'ECE2021004', 'first': 'Neha',      'last': 'Bansal',    'branch': 'ECE', 'year': '2', 'section': 'A'},
    {'reg': 'ECE2021005', 'first': 'Kunal',     'last': 'Jain',      'branch': 'ECE', 'year': '2', 'section': 'A'},
    {'reg': 'ECE2021006', 'first': 'Swati',     'last': 'Srivastava','branch': 'ECE', 'year': '2', 'section': 'A'},
]

created_students = {'CSE-2-A': [], 'CSE-3-B': [], 'ECE-2-A': []}

for sd in students_data:
    group_key = f"{sd['branch']}-{sd['year']}-{sd['section']}"

    if Student.objects.filter(registration_id=sd['reg']).exists():
        stu = Student.objects.get(registration_id=sd['reg'])
        print(f"  [OK] Student already exists: {stu}")
        created_students[group_key].append(stu)
        continue

    user = User.objects.create_user(
        username=sd['reg'],
        password=sd['reg'],   # password = registration ID for demo
        first_name=sd['first'],
        last_name=sd['last'],
        email=f"{sd['reg'].lower()}@student.college.edu",
    )
    stu = Student.objects.create(
        user=user,
        registration_id=sd['reg'],
        first_name=sd['first'],
        last_name=sd['last'],
        email=user.email,
        branch=sd['branch'],
        year=sd['year'],
        section=sd['section'],
    )
    print(f"  + Created student: {stu}")
    created_students[group_key].append(stu)

print()

# ──────────────────────────────────────────────────────────────
# COURSES
# ──────────────────────────────────────────────────────────────
courses_data = [
    {
        'code': 'CS301', 'name': 'Data Structures',
        'faculty_uid': 'FAC001', 'branch': 'CSE', 'year': '2', 'section': 'A',
        'semester': '3', 'academic_year': '2025-26',
        'student_group': 'CSE-2-A',
    },
    {
        'code': 'CS302', 'name': 'Database Management Systems',
        'faculty_uid': 'FAC002', 'branch': 'CSE', 'year': '2', 'section': 'A',
        'semester': '3', 'academic_year': '2025-26',
        'student_group': 'CSE-2-A',
    },
    {
        'code': 'CS501', 'name': 'Machine Learning',
        'faculty_uid': 'FAC001', 'branch': 'CSE', 'year': '3', 'section': 'B',
        'semester': '5', 'academic_year': '2025-26',
        'student_group': 'CSE-3-B',
    },
    {
        'code': 'CS502', 'name': 'Computer Networks',
        'faculty_uid': 'FAC003', 'branch': 'CSE', 'year': '3', 'section': 'B',
        'semester': '5', 'academic_year': '2025-26',
        'student_group': 'CSE-3-B',
    },
    {
        'code': 'EC301', 'name': 'Signals and Systems',
        'faculty_uid': 'FAC004', 'branch': 'ECE', 'year': '2', 'section': 'A',
        'semester': '3', 'academic_year': '2025-26',
        'student_group': 'ECE-2-A',
    },
    {
        'code': 'MA201', 'name': 'Engineering Mathematics III',
        'faculty_uid': 'FAC002', 'branch': 'CSE', 'year': '2', 'section': 'A',
        'semester': '3', 'academic_year': '2025-26',
        'student_group': 'CSE-2-A',
    },
]

for cd in courses_data:
    if Course.objects.filter(course_code=cd['code']).exists():
        course = Course.objects.get(course_code=cd['code'])
        print(f"  [OK] Course already exists: {course}")
        continue

    fac = Faculty.objects.get(uid=cd['faculty_uid'])
    course = Course.objects.create(
        course_code=cd['code'],
        course_name=cd['name'],
        faculty=fac,
        branch=cd['branch'],
        year=cd['year'],
        section=cd['section'],
        semester=cd['semester'],
        academic_year=cd['academic_year'],
    )
    # Enroll students
    group_students = created_students.get(cd['student_group'], [])
    if group_students:
        course.students.add(*group_students)
    print(f"  + Created course: {course}  ({len(group_students)} students enrolled)")

print()

# ──────────────────────────────────────────────────────────────
# SAMPLE ATTENDANCE RECORDS
# ──────────────────────────────────────────────────────────────
from attendance.models import Attendance
from datetime import date, time, timedelta
import random

# Generate attendance for the last 14 days for CSE-2-A students with CS301
try:
    ds_course = Course.objects.get(course_code='CS301')
    ds_faculty = ds_course.faculty
    ds_students = list(ds_course.students.all())
    today = date.today()

    att_count = 0
    for day_offset in range(14, 0, -1):
        att_date = today - timedelta(days=day_offset)
        # Skip weekends
        if att_date.weekday() >= 5:
            continue
        for stu in ds_students:
            # 80% chance present
            status = 'Present' if random.random() < 0.80 else 'Absent'
            if not Attendance.objects.filter(
                faculty=ds_faculty, student=stu, date=att_date,
                course=ds_course, period='1'
            ).exists():
                Attendance.objects.create(
                    faculty=ds_faculty,
                    student=stu,
                    course=ds_course,
                    date=att_date,
                    time=time(9, 30),
                    branch=stu.branch,
                    year=stu.year,
                    section=stu.section,
                    period='1',
                    status=status,
                )
                att_count += 1

    print(f"  + Created {att_count} attendance records for CS301 (Data Structures)")
except Exception as e:
    print(f"  ✗ Error creating attendance records: {e}")

# Generate attendance for CS502
try:
    cn_course = Course.objects.get(course_code='CS502')
    cn_faculty = cn_course.faculty
    cn_students = list(cn_course.students.all())

    att_count = 0
    for day_offset in range(14, 0, -1):
        att_date = today - timedelta(days=day_offset)
        if att_date.weekday() >= 5:
            continue
        for stu in cn_students:
            status = 'Present' if random.random() < 0.75 else 'Absent'
            if not Attendance.objects.filter(
                faculty=cn_faculty, student=stu, date=att_date,
                course=cn_course, period='3'
            ).exists():
                Attendance.objects.create(
                    faculty=cn_faculty,
                    student=stu,
                    course=cn_course,
                    date=att_date,
                    time=time(11, 0),
                    branch=stu.branch,
                    year=stu.year,
                    section=stu.section,
                    period='3',
                    status=status,
                )
                att_count += 1

    print(f"  + Created {att_count} attendance records for CS502 (Computer Networks)")
except Exception as e:
    print(f"  ✗ Error creating attendance records: {e}")

print()
print("=" * 60)
print("  Seed complete!")
print()
print("  Demo Logins:")
print("  ─────────────")
print("  Admin:   admin / admin")
print("  Faculty: FAC001 / FAC001  (Rajesh Kumar)")
print("  Student: CSE2021001 / CSE2021001  (Aarav Mehta)")
print("=" * 60)
