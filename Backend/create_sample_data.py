#!/usr/bin/env python
"""
Script to create sample faculty and student users for testing
"""
import os
import django
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')

# Setup Django
django.setup()

from django.contrib.auth.models import User
from attendance.models import Faculty, Student, Course

def create_sample_users():
    print("Creating sample users...")

    # Create faculty user
    faculty_user = User.objects.create_user(
        username='faculty1',
        email='faculty@example.com',
        password='faculty123',
        first_name='John',
        last_name='Doe'
    )

    faculty = Faculty.objects.create(
        user=faculty_user,
        uid='FAC001',
        first_name='John',
        last_name='Doe',
        email='faculty@example.com',
        phone='1234567890'
    )

    print(f"Created faculty: {faculty}")

    # Create multiple student users
    students_data = [
        {'username': 'student1', 'reg_id': 'STU001', 'first': 'Jane', 'last': 'Smith'},
        {'username': 'student2', 'reg_id': 'STU002', 'first': 'Mike', 'last': 'Johnson'},
        {'username': 'student3', 'reg_id': 'STU003', 'first': 'Sarah', 'last': 'Williams'},
        {'username': 'student4', 'reg_id': 'STU004', 'first': 'David', 'last': 'Brown'},
        {'username': 'student5', 'reg_id': 'STU005', 'first': 'Emma', 'last': 'Davis'},
        {'username': 'student6', 'reg_id': 'STU006', 'first': 'Chris', 'last': 'Miller'},
        {'username': 'student7', 'reg_id': 'STU007', 'first': 'Lisa', 'last': 'Wilson'},
        {'username': 'student8', 'reg_id': 'STU008', 'first': 'Tom', 'last': 'Moore'},
        {'username': 'student9', 'reg_id': 'STU009', 'first': 'Anna', 'last': 'Taylor'},
        {'username': 'student10', 'reg_id': 'STU010', 'first': 'James', 'last': 'Anderson'},
    ]

    students = []
    for student_data in students_data:
        student_user = User.objects.create_user(
            username=student_data['username'],
            email=f"{student_data['username']}@example.com",
            password='student123',
            first_name=student_data['first'],
            last_name=student_data['last']
        )

        student = Student.objects.create(
            user=student_user,
            registration_id=student_data['reg_id'],
            first_name=student_data['first'],
            last_name=student_data['last'],
            email=f"{student_data['username']}@example.com",
            branch='CSE',
            year='3',
            section='A'
        )

        students.append(student)
        print(f"Created student: {student}")

    # Create a course
    course = Course.objects.create(
        course_code='CS101',
        course_name='Computer Science 101',
        faculty=faculty,
        branch='CSE',
        year='3',
        section='A',
        semester='Fall',
        academic_year='2024-25'
    )

    print(f"Created course: {course}")

    print("Sample data created successfully!")
    print("\nLogin credentials:")
    print("Faculty: faculty1 / faculty123")
    print("Students: student1-student10 / student123")
    print("Superuser: superadmin / password123")

if __name__ == '__main__':
    create_sample_users()