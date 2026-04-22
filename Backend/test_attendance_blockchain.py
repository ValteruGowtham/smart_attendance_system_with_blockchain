#!/usr/bin/env python
"""
Test script to simulate attendance marking and blockchain storage
"""
import os
import django
import sys
from datetime import date, time

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'digital_id_system.settings')

# Setup Django
django.setup()

from attendance.models import Attendance, Faculty, Student, Course
from blockchain.blockchain_operations import AttendanceBlockchainStorage

def test_blockchain_storage():
    print("Testing blockchain storage for attendance...")

    # Get the sample data we created
    faculty = Faculty.objects.get(uid='FAC001')
    student = Student.objects.get(registration_id='STU001')
    course = Course.objects.get(course_code='CS101')

    print(f"Faculty: {faculty}")
    print(f"Student: {student}")
    print(f"Course: {course}")

    # Create an attendance record
    attendance = Attendance.objects.create(
        faculty=faculty,
        student=student,
        course=course,
        date=date.today(),
        time=time(10, 0),  # 10:00 AM
        branch='CSE',
        year='3',
        section='A',
        period='1',
        status='Present'
    )

    print(f"Created attendance record: {attendance}")

    # Now try to store on blockchain
    try:
        storage = AttendanceBlockchainStorage()
        tx_hash = storage.store_attendance_on_blockchain(
            student_reg_id=student.registration_id,
            course_id=course.course_code,
            date_str=str(attendance.date),
            time_str=str(attendance.time)
        )

        print(f"✅ Successfully stored on blockchain!")
        print(f"Transaction hash: {tx_hash}")

        # Update the attendance record with the transaction hash
        attendance.blockchain_tx = tx_hash
        attendance.save()

        print(f"Updated attendance record with blockchain transaction hash")

        # Try to verify the record using verifyHash
        hash_value = storage.generate_attendance_hash(
            student_reg_id=student.registration_id,
            course_id=course.course_code,
            date_str=str(attendance.date),
            time_str=str(attendance.time)
        )

        print(f"Generated hash: {hash_value}")

        # Check if hash exists
        try:
            exists = storage.manager.contract.functions.hashExists(hash_value).call()
            print(f"✅ Hash exists on blockchain: {exists}")
        except Exception as e:
            print(f"❌ Error checking hash existence: {e}")

        # Try to verify hash
        try:
            is_valid = storage.manager.contract.functions.verifyHash(hash_value).call()
            print(f"✅ Hash verification: {'Valid' if is_valid else 'Invalid'}")
        except Exception as e:
            print(f"❌ Error verifying hash: {e}")

        # Get total records
        try:
            total = storage.manager.contract.functions.getTotalRecords().call()
            print(f"Total records on blockchain: {total}")
        except Exception as e:
            print(f"❌ Error getting total records: {e}")

    except Exception as e:
        print(f"❌ Blockchain storage failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    test_blockchain_storage()