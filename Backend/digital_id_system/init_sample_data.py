#!/usr/bin/env python
"""
Smart Attendance System - Data Initialization Script
Run this script to populate the database with sample data for demonstration.
"""

import os
import django
import secrets
from datetime import date, time

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')
django.setup()

from django.contrib.auth.models import User
from attendance.models import Student, Faculty, Attendance

def create_sample_data():
    print("🚀 Initializing Smart Attendance System with sample data...")

    # Create admin user
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@university.edu',
            password='admin123!',
            first_name='System',
            last_name='Administrator'
        )
        print("✅ Created admin user: admin / admin123!")

    # Create sample faculty
    faculty_data = [
        {'uid': 'FAC001', 'first_name': 'Dr. Sarah', 'last_name': 'Johnson', 'email': 'sarah@university.edu'},
        {'uid': 'FAC002', 'first_name': 'Prof. Michael', 'last_name': 'Chen', 'email': 'michael@university.edu'},
        {'uid': 'FAC003', 'first_name': 'Dr. Emily', 'last_name': 'Davis', 'email': 'emily@university.edu'},
    ]

    for data in faculty_data:
        if not User.objects.filter(username=data['uid']).exists():
            # Generate secure password
            password = secrets.token_urlsafe(12)

            user = User.objects.create_user(
                username=data['uid'],
                password=password,
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email']
            )

            faculty = Faculty.objects.create(
                user=user,
                uid=data['uid'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'],
                phone=f"+1-555-{data['uid'][-3:]}",
                department='Computer Science',
                designation='Assistant Professor'
            )
            print(f"✅ Created faculty: {data['first_name']} {data['last_name']} (Password: {password})")

    # Create sample students
    student_data = [
        {'reg_id': 'CS2024001', 'first_name': 'Alice', 'last_name': 'Smith', 'branch': 'CSE', 'year': '3', 'section': 'A'},
        {'reg_id': 'CS2024002', 'first_name': 'Bob', 'last_name': 'Johnson', 'branch': 'CSE', 'year': '3', 'section': 'A'},
        {'reg_id': 'CS2024003', 'first_name': 'Charlie', 'last_name': 'Brown', 'branch': 'CSE', 'year': '3', 'section': 'A'},
        {'reg_id': 'CS2024004', 'first_name': 'Diana', 'last_name': 'Wilson', 'branch': 'CSE', 'year': '3', 'section': 'B'},
        {'reg_id': 'CS2024005', 'first_name': 'Eve', 'last_name': 'Davis', 'branch': 'CSE', 'year': '3', 'section': 'B'},
        {'reg_id': 'CS2024006', 'first_name': 'Frank', 'last_name': 'Miller', 'branch': 'CSE', 'year': '3', 'section': 'B'},
        {'reg_id': 'IT2024001', 'first_name': 'Grace', 'last_name': 'Taylor', 'branch': 'IT', 'year': '3', 'section': 'A'},
        {'reg_id': 'IT2024002', 'first_name': 'Henry', 'last_name': 'Anderson', 'branch': 'IT', 'year': '3', 'section': 'A'},
        {'reg_id': 'IT2024003', 'first_name': 'Ivy', 'last_name': 'Thomas', 'branch': 'IT', 'year': '3', 'section': 'A'},
    ]

    faculty_obj = Faculty.objects.first()  # Get first faculty for sample attendance

    for data in student_data:
        if not User.objects.filter(username=data['reg_id']).exists():
            # Generate secure password
            password = secrets.token_urlsafe(12)

            user = User.objects.create_user(
                username=data['reg_id'],
                password=password,
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=f"{data['reg_id'].lower()}@university.edu"
            )

            student = Student.objects.create(
                user=user,
                registration_id=data['reg_id'],
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=user.email,
                branch=data['branch'],
                year=data['year'],
                section=data['section']
            )

            # Create sample attendance records
            if faculty_obj:
                Attendance.objects.create(
                    faculty=faculty_obj,
                    student=student,
                    date=date.today(),
                    time=time(9, 0),  # 9:00 AM
                    branch=data['branch'],
                    year=data['year'],
                    section=data['section'],
                    period='1',
                    status='Present' if int(data['reg_id'][-1]) % 2 == 0 else 'Absent'
                )

            print(f"✅ Created student: {data['first_name']} {data['last_name']} (ID: {data['reg_id']}, Password: {password})")

    print("\n🎉 Sample data initialization completed!")
    print("\n📊 System Statistics:")
    print(f"   • Total Users: {User.objects.count()}")
    print(f"   • Students: {Student.objects.count()}")
    print(f"   • Faculty: {Faculty.objects.count()}")
    print(f"   • Attendance Records: {Attendance.objects.count()}")
    print("\n🔐 Login Credentials:")
    print("   Admin: admin / admin123!")
    print("   Faculty: Check console output above for individual passwords")
    print("   Students: Check console output above for individual passwords")
    print("\n🚀 Ready for demonstration!")

if __name__ == '__main__':
    create_sample_data()